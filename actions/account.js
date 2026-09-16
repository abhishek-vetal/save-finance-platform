"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { defaultCategories } from "@/data/categories";

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

    // first, unset any existing default account
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

    // then set the new default account
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

// helper to find all category ids matching a search term including subcategories
function getMatchingCategoryIds(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return [];

  const matched = new Set();
  for (const cat of defaultCategories) {
    if (
      cat.id.toLowerCase().includes(term) ||
      cat.name.toLowerCase().includes(term)
    ) {
      matched.add(cat.id);
    }
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        if (sub.toLowerCase().includes(term)) {
          matched.add(cat.id);
        }
      }
    }
  }
  return Array.from(matched);
}

// use to get the account information along with paginated transactions and total count
export async function getAccountWithTransactions(accountId, params = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.max(1, parseInt(params.limit) || 8);
    const search = params.search ? params.search.trim() : "";
    const type = params.type || "";
    const recurring = params.recurring || "";
    const sortBy = params.sortBy || "date";
    const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";
    const sortColumn = ["date", "amount", "category"].includes(sortBy)
      ? sortBy
      : "date";

    // build where clause for filtering transactions in the database
    const where = {
      accountId,
      userId: user.id,
    };

    if (type === "INCOME" || type === "EXPENSE") {
      where.type = type;
    }

    if (recurring === "recurring") {
      where.isRecurring = true;
    } else if (recurring === "non-recurring") {
      where.isRecurring = false;
    }

    if (search) {
      const searchNum = Number(search.replace(/[^0-9.]/g, ""));
      const isNum = !isNaN(searchNum) && search.trim() !== "";
      const upperTerm = search.trim().toUpperCase();
      const isType = upperTerm === "INCOME" || upperTerm === "EXPENSE";
      const isRecurringKeyword = upperTerm === "RECURRING";
      const isOneTimeKeyword =
        upperTerm === "NON-RECURRING" ||
        upperTerm === "ONE-TIME" ||
        upperTerm === "ONETIME";
      const isInterval = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(
        upperTerm,
      );
      const isYear = /^\d{4}$/.test(search.trim());
      const matchedCategoryIds = getMatchingCategoryIds(search);

      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        {
          category: {
            contains: search.replace(/\s+/g, "-"),
            mode: "insensitive",
          },
        },
        ...(matchedCategoryIds.length > 0
          ? [{ category: { in: matchedCategoryIds } }]
          : []),
        ...(isNum ? [{ amount: { equals: searchNum } }] : []),
        ...(isType ? [{ type: upperTerm }] : []),
        ...(isRecurringKeyword ? [{ isRecurring: true }] : []),
        ...(isOneTimeKeyword ? [{ isRecurring: false }] : []),
        ...(isInterval ? [{ recurringInterval: upperTerm }] : []),
        ...(isYear
          ? [
              {
                date: {
                  gte: new Date(`${search.trim()}-01-01T00:00:00.000Z`),
                  lte: new Date(`${search.trim()}-12-31T23:59:59.999Z`),
                },
              },
            ]
          : []),
      ];
    }

    // fetch account, filtered count, and exactly 8 transactions for current page concurrently
    const [account, totalCount, transactions] = await Promise.all([
      db.account.findUnique({
        where: {
          id: accountId,
          userId: user.id,
        },
        include: {
          _count: {
            select: { transactions: true },
          },
        },
      }),
      db.transaction.count({ where }),
      db.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortColumn]: sortOrder },
      }),
    ]);

    if (!account) return null;

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return {
      ...serializeTransaction(account),
      transactions: transactions.map((transaction) => {
        return serializeTransaction(transaction);
      }),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// fetch strictly paginated transactions for the table independently
export async function getAccountTransactions({
  accountId,
  page = 1,
  limit = 8,
  search = "",
  type = "",
  recurring = "",
  sortBy = "date",
  sortOrder = "desc",
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const currentPage = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.max(1, parseInt(limit) || 8);
    const searchTerm = search ? String(search).trim() : "";
    const order = sortOrder === "asc" ? "asc" : "desc";
    const sortColumn = ["date", "amount", "category"].includes(sortBy)
      ? sortBy
      : "date";

    const where = {
      accountId,
      userId: user.id,
    };

    if (type === "INCOME" || type === "EXPENSE") {
      where.type = type;
    }

    if (recurring === "recurring") {
      where.isRecurring = true;
    } else if (recurring === "non-recurring") {
      where.isRecurring = false;
    }

    if (searchTerm) {
      const searchNum = Number(searchTerm.replace(/[^0-9.]/g, ""));
      const isNum = !isNaN(searchNum) && searchTerm !== "";
      const upperTerm = searchTerm.toUpperCase();
      const isType = upperTerm === "INCOME" || upperTerm === "EXPENSE";
      const isRecurringKeyword = upperTerm === "RECURRING";
      const isOneTimeKeyword =
        upperTerm === "NON-RECURRING" ||
        upperTerm === "ONE-TIME" ||
        upperTerm === "ONETIME";
      const isInterval = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(
        upperTerm,
      );
      const isYear = /^\d{4}$/.test(searchTerm);
      const matchedCategoryIds = getMatchingCategoryIds(searchTerm);

      where.OR = [
        { description: { contains: searchTerm, mode: "insensitive" } },
        { category: { contains: searchTerm, mode: "insensitive" } },
        {
          category: {
            contains: searchTerm.replace(/\s+/g, "-"),
            mode: "insensitive",
          },
        },
        ...(matchedCategoryIds.length > 0
          ? [{ category: { in: matchedCategoryIds } }]
          : []),
        ...(isNum ? [{ amount: { equals: searchNum } }] : []),
        ...(isType ? [{ type: upperTerm }] : []),
        ...(isRecurringKeyword ? [{ isRecurring: true }] : []),
        ...(isOneTimeKeyword ? [{ isRecurring: false }] : []),
        ...(isInterval ? [{ recurringInterval: upperTerm }] : []),
        ...(isYear
          ? [
              {
                date: {
                  gte: new Date(`${searchTerm}-01-01T00:00:00.000Z`),
                  lte: new Date(`${searchTerm}-12-31T23:59:59.999Z`),
                },
              },
            ]
          : []),
      ];
    }

    const [totalCount, transactions] = await Promise.all([
      db.transaction.count({ where }),
      db.transaction.findMany({
        where,
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortColumn]: order },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      success: true,
      transactions: transactions.map((transaction) => {
        return serializeTransaction(transaction);
      }),
      pagination: {
        totalCount,
        totalPages,
        currentPage: currentPage,
        limit: pageSize,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// fetch transactions for the chart based on the requested date range
export async function getAccountChartData(accountId, range = "1M") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const now = new Date();
    const rangeConfig = {
      "7D": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      ALL: null,
    };

    const days = rangeConfig[range] !== undefined ? rangeConfig[range] : 30;

    const where = {
      accountId,
      userId: user.id,
    };

    if (days !== null) {
      const startDate = startOfDay(subDays(now, days - 1));
      where.date = {
        gte: startDate,
        lte: endOfDay(now),
      };
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return transactions.map((transaction) => serializeTransaction(transaction));
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
      // delete transactions
      await tx.transaction.deleteMany({
        where: {
          userId: user.id,
          id: { in: transactionIds }
        }
      });

      // update balance
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

export async function syncPlaidAccountTransactions(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const { syncPlaidTransactionsForAccount } = await import("@/lib/plaid/sync-transaction");
    const result = await syncPlaidTransactionsForAccount(accountId, user.id);

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);
    return { success: true, count: result.count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function syncAllPlaidAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const plaidAccounts = await db.account.findMany({
      where: {
        userId: user.id,
        plaidAccessToken: { not: null },
      },
    });

    if (!plaidAccounts.length) {
      return { success: true, count: 0 };
    }

    // call only unique plaid accounts
    const uniqueItems = new Map();
    for (const acc of plaidAccounts) {
      if (acc.plaidItemId && !uniqueItems.has(acc.plaidItemId)) {
        uniqueItems.set(acc.plaidItemId, acc.id);
      }
    }

    const { syncPlaidTransactionsForAccount } = await import("@/lib/plaid/sync-transaction");

    let totalSynced = 0;
    for (const accId of uniqueItems.values()) {
      try {
        const result = await syncPlaidTransactionsForAccount(accId, user.id);
        totalSynced += result.count || 0;
      } catch (err) {
        console.error(`Error syncing institution account ${accId}:`, err.message);
      }
    }

    revalidatePath("/dashboard");
    return { success: true, count: totalSynced };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
