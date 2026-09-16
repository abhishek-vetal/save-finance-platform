import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { syncPlaidTransactionsForAccount } from "@/lib/plaid/sync-transaction";
import { verifyPlaidWebhook } from "@/lib/plaid/verify-webhook";

// a webhook is a server-to-server notification
// plaid sends an HTTP request to SAVE webhook endpoint when an event occurs, 
// such as transaction updates becoming available

// plaid's servers call SAVE webhook endpoint
// my browser is not responsible for triggering the webhook
export async function POST(req) {
  try {
    const rawBody = await req.text();
    const verificationHeader = req.headers.get("plaid-verification");

    // verify that the webhook request genuinely came from plaid
    const verification = await verifyPlaidWebhook(verificationHeader, rawBody);
    if (!verification.isValid) {
      console.warn(`Unauthorized Plaid webhook attempt: ${verification.error}`);
      return NextResponse.json(
        { error: "Unauthorized: Webhook verification failed" },
        { status: 401 },
      );
    }

    const body = JSON.parse(rawBody);
    const { webhook_type, webhook_code, item_id } = body;

    console.log(
      `Plaid Webhook Verified & Received: type=${webhook_type}, code=${webhook_code}, item_id=${item_id}`,
    );

    // verify that this item_id belongs to a valid user and account in our database
    if (!item_id) {
      return NextResponse.json(
        { error: "Missing item_id in webhook payload" },
        { status: 400 },
      );
    }

    const accounts = await db.account.findMany({
      where: {
        plaidItemId: item_id,
        plaidAccessToken: { not: null },
      },
    });

    if (accounts.length === 0) {
      console.warn(`Received webhook for unrecognized plaidItemId: ${item_id}`);
      return NextResponse.json({ received: true, status: "item_not_found" });
    }

    // plaid can send different types of webhook events
    // I only want this route to trigger transaction synchronization for transaction-related events
    if (webhook_type === "TRANSACTIONS" && webhook_code === "SYNC_UPDATES_AVAILABLE") {
      for (const account of accounts) {
        try {
          await syncPlaidTransactionsForAccount(account.id, account.userId);
          console.log(`Webhook auto-synced account ${account.id} successfully`);
        } catch (syncErr) {
          console.error(`Plaid Webhook sync error for account ${account.id}:`, syncErr.message);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Plaid webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}