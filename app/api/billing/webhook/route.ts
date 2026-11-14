import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const eventSource = request.headers.get("x-event-source") || "stripe";
  const body = await request.json();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Handle Paystack Webhooks
    if (eventSource === "paystack" || body.event) {
      const event = body;
      
      if (event.event === "charge.success" || event.event === "subscription.create") {
        const email = event.data.customer?.email || event.data.email;
        const subscriptionCode = event.data.subscription_code || event.data.plan?.plan_code;

        if (email) {
          await client.query(
            `UPDATE subscriptions s
             SET status = 'active', 
                 paystack_subscription_code = COALESCE($1, paystack_subscription_code), 
                 current_period_end = NOW() + INTERVAL '1 month'
             FROM organizations o
             WHERE s.organization_id = o.id AND o.owner_id IN (SELECT id FROM users WHERE email = $2)`,
            [subscriptionCode, email]
          );
        }
      } else if (event.event === "invoice.payment_failed" || event.event === "subscription.disable") {
        const email = event.data.customer?.email;
        if (email) {
          await client.query(
            `UPDATE subscriptions s
             SET status = 'past_due'
             FROM organizations o
             WHERE s.organization_id = o.id AND o.owner_id IN (SELECT id FROM users WHERE email = $1)`,
            [email]
          );
        }
      }
    } 
    // 2. Handle Stripe Webhooks
    else {
      const event = body;

      if (event.type === "invoice.payment_succeeded") {
        const subscriptionId = event.data.object.subscription;
        const periodEnd = event.data.object.lines?.data?.[0]?.period?.end || Math.floor(Date.now() / 1000) + 2592000;

        await client.query(
          `UPDATE subscriptions 
           SET status = 'active', current_period_end = TO_TIMESTAMP($1) 
           WHERE stripe_subscription_id = $2`,
          [periodEnd, subscriptionId]
        );
      } else if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
        const subscriptionId = event.data.object.subscription || event.data.object.id;
        const newStatus = event.type === "customer.subscription.deleted" ? "canceled" : "past_due";

        await client.query(
          `UPDATE subscriptions 
           SET status = $1 
           WHERE stripe_subscription_id = $2`,
          [newStatus, subscriptionId]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Billing webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}