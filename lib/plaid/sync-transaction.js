import db from "@/lib/prisma";
import { plaidClient } from "@/lib/plaid";

// helper to map Plaid's personal_finance_category
// to internal save category ids
function mapPlaidCategory(primaryPlaidCategory, isIncome) {
  if (!primaryPlaidCategory) {
    return "other-expense";
  }

  const category = primaryPlaidCategory.toUpperCase();

  if (isIncome) {
    if (category.includes("INCOME_PAYROLL")) {
      return "salary";
    }

    if (category.includes("INCOME_INVESTMENT")) {
      return "investments";
    }

    return "other-income";
  }

  if (category.includes("FOOD_AND_DRINK")) {
    return "food";
  }

  if (category.includes("GENERAL_MERCHANDISE")) {
    return "shopping";
  }

  if (category.includes("GROCERIES")) {
    return "groceries";
  }

  if (category.includes("TRANSPORTATION")) {
    return "transportation";
  }

  if (category.includes("RENT_AND_UTILITIES")) {
    return "utilities";
  }

  if (category.includes("TRAVEL")) {
    return "travel";
  }

  if (category.includes("ENTERTAINMENT")) {
    return "entertainment";
  }

  if (category.includes("PERSONAL_CARE")) {
    return "personal";
  }

  if (category.includes("MEDICAL")) {
    return "healthcare";
  }

  if (category.includes("EDUCATION")) {
    return "education";
  }

  if (category.includes("INSURANCE")) {
    return "insurance";
  }

  if (category.includes("BANK_FEES")) {
    return "bills";
  }

  return "other-expense";
}

export async function syncPlaidTransactionsForAccount(accountId, userId) {
  // make sure this save account belongs to the authenticated user
  // and is connected to Plaid
  const account = await db.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!account || !account.plaidAccessToken) {
    throw new Error("Account is not linked to Plaid");
  }

  // fetch all save accounts belonging to the same Plaid item
  // this allows transactions from the item to be mapped to
  // the correct save account
  const relatedAccounts = await db.account.findMany({
    where: {
      userId,
      plaidItemId: account.plaidItemId,
    },
  });

  // map: Plaid account id -> save account
  const plaidAccountsMap = new Map();

  for (const acc of relatedAccounts) {
    if (acc.plaidAccountId) {
      plaidAccountsMap.set(acc.plaidAccountId, acc);
    }
  }

  // first sync: no cursor
  // future syncs: use the cursor saved from the previous sync
  let cursor = account.plaidCursor || undefined;

  const added = [];
  const modified = [];
  const removed = [];

  // plaid can return multiple pages of updates
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: account.plaidAccessToken,
        cursor,
        count: 500,
        options: { include_original_description: true },
      });

      const data = response.data;

      if (Array.isArray(data.added)) {
        added.push(...data.added);
      }

      if (Array.isArray(data.modified)) {
        modified.push(...data.modified);
      }

      if (Array.isArray(data.removed)) {
        removed.push(...data.removed);
      }

      cursor = data.next_cursor;
      hasMore = data.has_more;
    }
  } catch (error) {
    console.error(
      "Error syncing Plaid transactions:",
      error?.response?.data || error.message,
    );
  }

  let syncedCount = 0;

  // apply all database changes atomically
  await db.$transaction(
    async (tx) => {
      // add new transactions

      const plaidAccountBalanceChanges = new Map();

      for (const transaction of added) {
        if (!transaction.transaction_id) continue;

        // find the correct save account using Plaid's account_id with fallback to current account
        const targetAccount =
          (transaction.account_id && plaidAccountsMap.get(transaction.account_id)) || account;

        // plaid convention:
        // positive amount = money leaving account
        // negative amount = money entering account
        const isIncome = transaction.amount < 0;
        const type = isIncome ? "INCOME" : "EXPENSE";
        const amount = Math.abs(transaction.amount);

        // use Plaid's modern personal finance category
        const category = mapPlaidCategory(
          transaction.personal_finance_category?.primary,
          isIncome,
        );

        const description =
          transaction.name || transaction.original_description || "Plaid Bank Transaction";

        const date = transaction.date
          ? new Date(transaction.date)
          : transaction.authorized_date
            ? new Date(transaction.authorized_date)
            : new Date();

        // check if transaction already exists in database
        const existingTx = await tx.transaction.findUnique({
          where: { plaidTransactionId: transaction.transaction_id },
        });

        // only adjust balance and synced count for new transactions
        if (!existingTx) {
          const currentBalance =
            plaidAccountBalanceChanges.get(targetAccount.id) || 0;

          plaidAccountBalanceChanges.set(
            targetAccount.id,
            currentBalance + (isIncome ? amount : -amount),
          );

          syncedCount++;
        }

        // create if it doesn't exist, otherwise update it
        await tx.transaction.upsert({
          where: { plaidTransactionId: transaction.transaction_id },
          update: {
            accountId: targetAccount.id,
            userId: targetAccount.userId,
            amount,
            description,
            date,
            category,
            type,
          },
          create: {
            userId: targetAccount.userId,
            accountId: targetAccount.id,
            amount,
            description,
            date,
            category,
            type,
            plaidTransactionId: transaction.transaction_id,
          },
        });
      }

      // update each affected account balance once
      for (const [accId, balanceChange] of plaidAccountBalanceChanges.entries()) {
        if (balanceChange !== 0) {
          await tx.account.update({
            where: { id: accId },
            data: {
              balance: { increment: balanceChange },
            },
          });
        }
      }

      // update modified transactions

      for (const transaction of modified) {
        if (!transaction.transaction_id) continue;

        const targetAccount =
          plaidAccountsMap.get(transaction.account_id) || null;

        if (!targetAccount) continue;

        const isIncome = transaction.amount < 0;
        const type = isIncome ? "INCOME" : "EXPENSE";
        const amount = Math.abs(transaction.amount);

        const category = mapPlaidCategory(
          transaction.personal_finance_category?.primary,
          isIncome,
        );

        const description =
          transaction.name || "Plaid Bank Transaction";

        const date = transaction.date
          ? new Date(transaction.date)
          : transaction.authorized_date
            ? new Date(transaction.authorized_date)
            : new Date();

        await tx.transaction.upsert({
          where: { plaidTransactionId: transaction.transaction_id },
          update: {
            accountId: targetAccount.id,
            userId: targetAccount.userId,
            amount,
            description,
            date,
            category,
            type,
          },
          create: {
            userId: targetAccount.userId,
            accountId: targetAccount.id,
            amount,
            description,
            date,
            category,
            type,
            plaidTransactionId: transaction.transaction_id,
          },
        });

        syncedCount++;
      }

      // remove transactions

      for (const transaction of removed) {
        if (!transaction.transaction_id) continue;

        await tx.transaction.delete({
          where: {
            plaidTransactionId: transaction.transaction_id,
          },
        });

        syncedCount++;
      }

      // save new cursor

      // the cursor belongs to the Plaid item,
      // so keep it synchronized across all save
      // accounts belonging to this item
      await tx.account.updateMany({
        where: {
          userId: account.userId,
          plaidItemId: account.plaidItemId,
        },
        data: {
          plaidCursor: cursor || null,
        },
      });
    },
    {
      timeout: 30000,
    },
  );

  return {
    success: true,
    count: syncedCount,
    added: added.length,
    modified: modified.length,
    removed: removed.length,
  };
}