import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { syncPlaidTransactionsForAccount } from "@/lib/plaid/sync-transaction";

// the public token is returned by Plaid Link after the user successfully connects a financial institution 
// my frontend receives it in the onSuccess callback and sends it to my backend, 
// where I exchange it using Plaid's itemPublicTokenExchange API for an access token and item ID

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // get the public token returned by Plaid Link
    const { public_token } = await req.json();

    if (!public_token) {
      return new NextResponse("Missing public token", { status: 400 });
    }

    // exchange the temporary public token for a Plaid access token and Item ID
    const exchangeResponse =
      await plaidClient.itemPublicTokenExchange({
        public_token,
      });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // get all bank accounts associated with this Plaid Item
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;

    // find the current SAVE user in database
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      return new NextResponse( "User not found in database", { status: 404 });
    }

    // count the user's existing SAVE accounts used to determine the default account.
    const existingAccountsCount = await db.account.count({
      where: {
        userId: user.id,
      },
    });

    // create or update all Plaid accounts inside one Prisma transaction.
    const linkedAccounts = await db.$transaction( async (tx) => {
        const savedAccounts = [];

        for (let index = 0; index < accounts.length; index++) {
          const plaidAccount = accounts[index];

          // convert Plaid account type into SAVE's account type
          const accountType =
            (plaidAccount.type === "depository" && plaidAccount.subtype === "savings")
              ? "SAVINGS"
              : "CURRENT";

          // check whether this Plaid account is already linked
          const existingAccount = await tx.account.findFirst({
            where: {
              userId: user.id,
              plaidAccountId: plaidAccount.account_id,
            },
          });

          let savedAccount;

          // not used the upsert since since condition to check the existingAccount is not unique
          if (existingAccount) {
            // update the existing SAVE account
            savedAccount = await tx.account.update({
              where: {
                id: existingAccount.id,
              },
              data: {
                name: plaidAccount.name || existingAccount.name, 
                balance: plaidAccount.balances.current ?? existingAccount.balance, 
                plaidAccessToken: accessToken,
                plaidItemId: itemId,
              },
            });
          } else {
            // first account becomes default only when the user had no accounts before this connection.
            const isDefault = existingAccountsCount === 0 && index === 0;

            // create a new SAVE account
            savedAccount = await tx.account.create({
              data: {
                userId: user.id,
                name: plaidAccount.name || "Connected Bank Account",
                type: accountType, 
                balance: plaidAccount.balances.current ?? 0,
                isDefault,
                plaidAccessToken: accessToken,
                plaidItemId: itemId,
                plaidAccountId: plaidAccount.account_id,
              },
            });
          }

          savedAccounts.push(savedAccount);
        }

        return savedAccounts;
      },
      {
        timeout: 30000,
      },
    );

    // perform the initial transaction synchronization
    // after the account database transaction has completed.
    for (const savedAccount of linkedAccounts) {
      try {
        await syncPlaidTransactionsForAccount( savedAccount.id, user.id );

        console.log( `Initial transaction sync successful for account ${savedAccount.id}` );
      } catch (syncError) {
        console.error(
          `Initial transaction sync warning for account ${savedAccount.id}:`,
          syncError.message,
        );
      }
    }

    // return success response to the frontend
    return NextResponse.json({
      success: true,
      accountCount: linkedAccounts.length,
    });
  } catch (error) {
    console.error("Error exchanging token:", error);

    return new Error(error.message || "Failed to exchange token", { status: 500 });
  }
}