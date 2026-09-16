// creates the HTTP handlers needed to connect Inngest with my Next.js application and registers 
// the functions that Inngest can execute.
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
// forces a Next.js page, layout, or route handler to render dynamically on every incoming request 
// instead of being cached at build time
export const dynamic = "force-dynamic";
import {
  checkBudgetAlerts,
  generateMonthlyReport,
  processRecurringTransactions,
  triggerRecurringTransaction,
  autoSyncPlaidTransactions,
} from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts,
    processRecurringTransactions,
    triggerRecurringTransaction,
    generateMonthlyReport,
    autoSyncPlaidTransactions,
  ],
});
