import { NextResponse } from "next/server";
// adjust the import path if your actions folder is located elsewhere
import { seedTransactions } from "@/actions/seed"; 

export async function GET() {
  try {
    // trigger the function from your actions file
    const result = await seedTransactions();
    
    // return the result to the browser
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}