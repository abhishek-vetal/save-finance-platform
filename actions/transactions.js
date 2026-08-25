"use server";

// import aj from "@/lib/arcjet";
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { subHours } from "date-fns";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_NEW });

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// used to get the transaction based on the provided transaction id 
export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

// update transaction --> update account balance (newBalance - oldBalance), update the transaction 
// updated next recurring date if the transaction is recurring
export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        userId: user.id,
        id
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const updatedTransaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(updatedTransaction) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// create transactions with rate limiting of 20 transactions/hour
export async function createTransactions(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // Arcjet Tranasactions rate limiting not using cause plan upgrade required.

    // request() is used to extract the details from the req
    // const req = await request()

    // const decision = await aj.protect(req, { userId, requested: 1 });

    // if (decision.isDenied()) {
    //   console.log("hello")
    //   if (decision.reason.isRateLimit()) {
    //     const { resetTime } = decision.reason;
    //     const minutesLeft = Math.ceil((resetTime.getTime() - Date.now()) / 60000);
    //     throw new Error(`Rate limit exceeded. Please try again in ${minutesLeft} minutes.`);
    //   }
    //   throw new Error("Request blocked for security reasons.");
    // }

    const MAX_REQUESTS = 20;
    const oneHourAgo = subHours(new Date(), 1);

    const recentTransactionsCount = await db.transaction.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentTransactionsCount >= MAX_REQUESTS) {
      throw new Error("Rate limit exceeded. Maximum 20 transactions per hour.");
    }

    // transaction creation
    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setDate(date.getDate() + 30);
      break;
    case "YEARLY":
      date.setDate(date.getDate() + 365);
      break;
  }

  return date;
}

export async function scanReceipt(formData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Extract the file from the FormData
    const file = formData.get("receipt");
    if (!file) throw new Error("No file provided");

    // 2. THE GEMINI DOCS METHOD: Convert File to Buffer to Base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Please provide all fields use your thinking to provide the category if not mentioned in the image. Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: file.type,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const rawText = response.text;
      const receiptData = JSON.parse(rawText);

      // Catch the "empty object" fallback
      if (Object.keys(receiptData).length === 0) {
        throw new Error("Could not recognize this image as a valid receipt.");
      }

      return {
        success: true,
        data: {
          // If amount exists, parse it. Otherwise, return null so the form stays empty.
          amount: receiptData.amount ? parseFloat(receiptData.amount) : null,

          // Only create a Date object if Gemini actually found a date
          date: receiptData.date ? new Date(receiptData.date) : null,

          description: receiptData.description || "",
          category: receiptData.category || "other-expense"
        },
      };
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      return {
        success: false,
        error: "Failed to extract data from this receipt.",
      };
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return { success: false, error: error.message };
  }
}