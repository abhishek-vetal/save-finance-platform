import { getAccountWithTransactions, getAccountChartData } from "@/actions/account";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import TransactionTable from "../_components/transaction-table";
import AccountChart from "../_components/account-chart";
import SyncPlaidButton from "@/components/sync-plaid-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AccountsPage({ params }) {
  const { id } = await params;

  // fetch account details, initial page 1 transactions, and 30-day initial chart data
  const [accountData, initialChartTransactions] = await Promise.all([
    getAccountWithTransactions(id, { page: 1, limit: 8 }),
    getAccountChartData(id, "1M"),
  ]);

  if (!accountData) {
    notFound();
  }

  const { transactions, pagination, ...account } = accountData;

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 md:px-6 py-4 md:py-6">
      {/* back link and header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight capitalize text-foreground md:text-4xl">
                {account.name}
              </h1>
              {account.plaidAccessToken && (
                <SyncPlaidButton accountId={account.id} />
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {`${account.type} account`}
              {account.plaidAccessToken && " • Linked with Plaid"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card px-5 py-3 shadow-2xs text-left md:text-right">
            <p className="text-xs font-medium text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold md:text-3xl tabular-nums text-foreground">
              ₹{account.balance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {account._count.transactions} Transactions
            </p>
          </div>
        </div>
      </div>

      {/* chart */}
      <Suspense
        fallback={
          <div className="overflow-hidden rounded-full">
            <BarLoader color="#8b5cf6" width={"100%"} />
          </div>
        }
      >
        <AccountChart
          accountId={account.id}
          transactions={initialChartTransactions}
        />
      </Suspense>

      {/* table */}
      <Suspense
        fallback={
          <div className="overflow-hidden rounded-full">
            <BarLoader color="#8b5cf6" width={"100%"} />
          </div>
        }
      >
        <TransactionTable
          accountId={account.id}
          initialTransactions={transactions}
          initialPagination={pagination}
        />
      </Suspense>
    </div>
  );
}
