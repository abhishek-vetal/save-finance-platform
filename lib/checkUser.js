import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/prisma";

// if user logged in then it will check if user is present in database if not it will add user to database
export default async function checkUser() {
  try {
    //currentUser() gives you the actual Clerk user information.
    const user = await currentUser();

    if (!user) {
      console.log("User not found!");
      return null;
    }

    const databaseUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (databaseUser) {
      return databaseUser;
    }

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: user.fullName,
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
      },
    });

    return newUser;
  } catch (err) {
    console.error("Error in checkUser:", err.message);
    return null;
  }
}
