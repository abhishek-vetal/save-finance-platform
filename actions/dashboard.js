// "use server" marks the module as server-side code, so the functions can execute on the server 
// and safely perform operations such as database access.
"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache"; 

// We are doing serialization to convert complex database objects into standard JavaScript numbers 
// because Next.js cannot pass complex objects directly from the server to the client frontend.
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

// get all the transactions of the logged in user
export async function getUserTransactions() {
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

// get all the accounts of the user along with _count for transactions
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
      orderBy: { createdAt: "desc"},
      // this is used to include the information about the other tables since Account contain the 
      // transactions Transaction[] in schemas then I can use it to find the _count
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

// delete the account of the user after getting the accountId
export async function deleteUserAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });
    if (!user) throw new Error("User not found");

    // SECURITY CHECK: Verify this account actually belongs to this user
    const account = await db.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("Account not found");
    if (account.userId !== user.id)
      throw new Error("You do not have permission to delete this account");

    // this is the database transaction 
    // In database terminology, a "transaction" is an all-or-nothing wrapper.
    // Prisma guarantees that either both deletions succeed, or neither do.
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

    // Clear the saved cache for the /dashboard page, it means update the UI
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error.message);
    throw new Error(error.message);
  }
}

// creating account by taking the data object (contains balance, isDefault)
export async function createAccount(data) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // using parseFloat because of string problem
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