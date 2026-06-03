"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    const serializedAccounts = accounts.map((account) =>
      serializeTransaction(account),
    );

    return serializedAccounts;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createAccount(data) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const balance = parseFloat(data.balance);
    if (isNaN(balance)) throw new Error("Invalid balance amount");

    const exisingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      exisingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAccount = await db.account.create({
      data: {
        ...data,
        balance: balance,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(newAccount);

    // use to fetch new values.
    revalidatePath("/dashboard");
    return { success: true, account: serializedAccount };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map((t) => serializeTransaction(t));
}

export async function deleteUserAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User not found");

    // SECURITY CHECK: Verify this account actually belongs to this user
    const account = await db.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("Account not found");
    if (account.userId !== user.id)
      throw new Error("You do not have permission to delete this account");

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          accountId,
        },
      });

      await tx.account.delete({
        where: {
          id: accountId,
        },
      });
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error.message);
    throw new Error(error.message);
  }
}
