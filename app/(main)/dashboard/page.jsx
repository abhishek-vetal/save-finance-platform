import { getUserTransactions, getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Plus } from "lucide-react";
import AccountCard from "./_components/account-card";
import BudgetProgress from "./_components/budget-progress";
import { getBudgetAndTotalExpense } from "@/actions/budget";
import { Card, CardContent } from "@/components/ui/card";
import DashboardOverview from "./_components/dashboard-overview";
import SyncPlaidButton from "@/components/sync-plaid-button";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const accounts = await getUserAccounts();
  const transactions = await getUserTransactions();
  const budgetAndExpenseData = await getBudgetAndTotalExpense();

  const plaidAccount = accounts.find((a) => a.plaidAccessToken);

  return (
    <div className="mt-10 flex flex-col gap-12">
      {/* budget alert section */}
      <BudgetProgress
        monthlyBudget={budgetAndExpenseData?.budget}
        currentMonthExpenses={budgetAndExpenseData?.totalExpense || 0}
      />

      {/* overview section */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* accounts section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Accounts</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage and monitor all your financial accounts
            </p>
          </div>

          <div className="flex items-center gap-3">
            {plaidAccount && (
              <SyncPlaidButton />
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* add account card */}
          <CreateAccountDrawer>
            <Card className="cursor-pointer rounded-3xl bg-card py-14 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardContent className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="rounded-full bg-primary/10 p-4 transition-all duration-300 group-hover:scale-110">
                  <Plus className="h-8 w-8 text-primary" />
                </div>

                <p className="font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {/* existing accounts */}
          {accounts.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}
