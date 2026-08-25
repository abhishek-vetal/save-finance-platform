import db from "@/lib/prisma";
import { inngest } from "./client";
import {
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { Resend } from "resend";
import EmailTemplate from "@/emails/template";
import { GoogleGenAI } from "@google/genai";

// We use step in Inngest to break background jobs into smaller, checkpointed units of work so that 
// previously completed actions are not re-run when failures happen

// Recurring transactions automation.
// this will happen second --> Process recurring transaction
export const processRecurringTransactions = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
    triggers: { event: "transaction.recurring.process" },
  },
  async ({ event, step }) => {
    // 1. Validate event data
    if (!event?.data?.id || !event?.data?.userId) {
      console.error("Invalid event data", event);
      return { error: "Missing required event data" };
    }

    // 2. Fetch the transaction AND RETURN IT from the step so we can use it below
    const transaction = await step.run("fetch-transaction", async () => {
      return await db.transaction.findUnique({
        where: {
          id: event.data.id, // Fixed: matching the payload key
          userId: event.data.userId,
        },
        include: { account: true },
      });
    });

    // 3. Early validation checks with distinct status messages
    if (!transaction) {
      return { message: "Transaction not found" };
    }

    if (!isTransactionDue(transaction)) {
      return { message: "Transaction is not due yet" };
    }

    // 4. Database updates MUST be inside a step.run() in Inngest!
    await step.run("process-database-updates", async () => {
      await db.$transaction(async (tx) => {
        // A. Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // B. Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -Number(transaction.amount)
            : Number(transaction.amount);

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // C. Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval,
            ),
          },
        });
      });
    });

    return { success: true };
  },
);

// this will happen first --> Triggerring recurring transaction with events.
export const triggerRecurringTransaction = inngest.createFunction(
  {
    id: "trigger-recurring-transaction",
    // timezone Asia/Kolkata runs every day at exactly 12:00 AM (midnight) Indian Standard Time
    triggers: { cron: "TZ=Asia/Kolkata 0 0 * * *" },
  },
  async ({ step }) => {

    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            nextRecurringDate: { lte: new Date() }
          },
        });
      },
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => {
        return {
          name: "transaction.recurring.process",
          data: {
            id: transaction.id,
            userId: transaction.userId,
          },
        };
      });

      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  },
);

// checking the budget alert to send the email.
export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alert",
    triggers: { cron: "TZ=Asia/Kolkata 0 */6 * * *" },
  },
  async ({ step }) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // 1. Fetch budgets along with the user's default account info in ONE shot
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: true,
        },
      });
    });

    // 2. Loop safely through budgets
    for (const budget of budgets) {
      // Fetch Aggregated Expenses for this specific user
      const totalExpense = await step.run(
        `calculate-monthly-total-expense-${budget.userId}`,
        async () => {
          return await db.transaction.aggregate({
            where: {
              userId: budget.userId,
              type: "EXPENSE",
              date: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
            _sum: {
              amount: true,
            },
          });
        },
      );

      const expenseAmount = totalExpense._sum.amount?.toNumber() || 0;
      const budgetAmount = budget.amount.toNumber();

      const percentageUsed = (expenseAmount / budgetAmount) * 100;
      const lastAlertSent = budget.lastAlertSent;

      // Check threshold
      if (percentageUsed >= 80) {
        // Skip if an alert went out earlier this month
        if (lastAlertSent && isSameMonth(new Date(lastAlertSent), now)) {
          continue;
        }

        // 3. Send Email (Kept completely FLAT, no nesting!)
        await step.run(`send-budget-alert-${budget.userId}`, async () => {
          const resend = new Resend(process.env.RESEND_API_KEY);

          const { error } = await resend.emails.send({
            from: "Finance App <onboarding@resend.dev>",
            to: [budget.user.email],
            subject: `Budget alert: ${percentageUsed.toFixed(0)}% used`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount,
                totalExpenses: expenseAmount,
                accountName: budget.user.name,
                dashboardUrl: "http://localhost:3000/dashboard",
              },
            }),
          });

          if (error) {
            throw new Error(error.message);
          }
        });

        // 4. Update budget alert state sequentially (NOT nested)
        await step.run(`update-budget-alert-${budget.id}`, async () => {
          return await db.budget.update({
            where: { id: budget.id }, // Target by budget ID rather than userId for safety
            data: { lastAlertSent: now },
          });
        });
      }
    }
  },
);

// Monthly Report
export const generateMonthlyReport = inngest.createFunction(
  {
    id: "generate-monthly-report",
    // runs at 12:00 AM (midnight) on the 1st day of every month
    triggers: { cron: "TZ=Asia/Kolkata 0 0 1 * *" }
  },
  async ({ step }) => {

    const users = await step.run("fetch-all-users", async () => {
      return await db.user.findMany(); 
    });

    for (const user of users) {
      await step.run(`generate-monthly-report-${user.id}`, async () => {
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const fullMonthName = format(lastMonth, "MMMM");

        const stats = await getUsersMonthlyStats(user.id, lastMonth);

        // Generate AI insights
        const insights = await generateFinancialInsights(stats, fullMonthName);

        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
          from: "Finance App <onboarding@resend.dev>",
          to: [user.email],
          subject: `Your Monthly Financial Report: ${fullMonthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: fullMonthName,
              insights,
              dashboardUrl: "http://localhost:3000/dashboard",
            },
          }),
        });

        if (error) {
          throw new Error(error.message);
        }
      });
    }

    return { processed: users.length };
  },
);

const getUsersMonthlyStats = async (userId, month) => {
  const startDate = startOfMonth(month);
  const endDate = endOfMonth(month);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    },
  );
};

const generateFinancialInsights = async (stats, month) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_NEW });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}
    - Transactions Count: ${stats.transactionCount}

    Format the response ONLY as a raw JSON array of strings.
    Example: ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text;
    const insights = JSON.parse(rawText); // Renamed for clarity

    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
};

// this checks whether the transaction is due or not 
function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setDate(next.getDate() + 30);
      break;
    case "YEARLY":
      next.setDate(next.getDate() + 365);
      break;
  }
  return next;
}
