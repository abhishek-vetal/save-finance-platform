"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";

// use to get the users monthly budget and total monthly expense
export async function getBudgetAndTotalExpense() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const budget = await db.budget.findUnique({
      where: { userId: user.id },
    });

    // aggregate performs database-level aggregation such as sum, count, average, minimum, or maximum
    const totalExpense = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      totalExpense: totalExpense._sum.amount?.toNumber() || 0,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// using this to update the budget and create new budget if not present
export async function updateBudget(updateAmount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // authenticating the input budget on the server side as well
    if (typeof updateAmount !== "number" || updateAmount < 0) {
      throw new Error("Invalid budget amount");
    }

    // to update a budget if it exists or create it if it does not exist in Prisma, use the upsert method
    const upsertBudget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount: updateAmount, lastAlertSent: null },
      create: {
        userId: user.id,
        amount: updateAmount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...upsertBudget, amount: upsertBudget.amount.toNumber() },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
