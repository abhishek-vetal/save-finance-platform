// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
export const dynamic = "force-dynamic";
import {
  checkBudgetAlerts,
  generateMonthlyReport,
  processRecurringTransactions,
  triggerRecurringTransaction,
} from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts,
    processRecurringTransactions,
    triggerRecurringTransaction,
    generateMonthlyReport,
  ],
});
