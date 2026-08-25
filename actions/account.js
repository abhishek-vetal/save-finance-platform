"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = obj.balance.toNumber();
  }
  
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = obj.amount.toNumber();
  }
  
  return serialized;
};

// update the default user account first make the default account as false 
// then make the provided account as default
export async function UpdateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // First, unset any existing default account
    // here we cannot use update since it requires searching based on the @unique field
    // as well as if only one account is present then update fails 
    // since update strictly need to find the isDefault: true, therefore we use updateMany
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        userId: user.id,
        id: accountId,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// use to get the account information along with transactions and their count
export async function getAccountWithTransactions(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id
      },
      include: {
        transactions: {
          orderBy: { date: "desc" }
        },
        _count: {
          select: { transactions: true }
        }
      }
    });

    if (!account) return null;

    return {
      ...serializeTransaction(account),
      transactions: account.transactions.map((transaction) => {
        return serializeTransaction(transaction);
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteBulkTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        id: { in: transactionIds }
      }
    });

    // before deleting the transactions update the account balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change = Number(
        transaction.type === "INCOME"
          ? -transaction.amount
          : transaction.amount,
      );
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    await db.$transaction(async (tx) => {
      //Delete transactions
      await tx.transaction.deleteMany({
        where: {
          userId: user.id,
          id: { in: transactionIds }
        }
      });

      //Update balance
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges,
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
