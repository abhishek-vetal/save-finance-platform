import { plaidClient } from "@/lib/plaid";
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // get the user with the IDs of the plaidAccounts
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: {
          where: {
            plaidAccessToken: { not: null },
          },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // hasPlaidAccount == 0 -->   button shows connect bank else connect another account
    const hasPlaidAccount = user.accounts.length > 0;

    // here Plaid send transaction webhook notifications
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const request = {
      user: {
        client_user_id: user.id,
      },
      client_name: "SAVE App",
      products: ["auth", "transactions"],
      country_codes: ["US"],
      language: "en",
      ...(appUrl
        ? { webhook: `${appUrl}/api/plaid/webhook` }
        : {}),
    };

    const response = await plaidClient.linkTokenCreate(request);

    // server actions can return serializable JavaScript values directly, 
    // while route handlers need to return an HTTP Response such as NextResponse.json()

    // this is used to provide the created link token to the front-end
    return NextResponse.json({
      ...response.data,
      hasPlaidAccount,
    });
  } catch (error) {
    console.error("Error creating Plaid link token:", error);

    return new NextResponse(
      "Failed to create link token",
      { status: 500 },
    );
  }
}