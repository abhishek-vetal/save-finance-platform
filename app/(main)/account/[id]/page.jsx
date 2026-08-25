import { getAccountWithTransactions } from "@/actions/account";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import TransactionTable from "../_components/transaction-table";
import AccountChart from "../_components/account-chart";

// [id] is a dynamic route segment in the Next.js App Router. 
// It allows the same page to handle different account IDs from the URL. 
// For example, /account/123 and /account/456 both use the same [id]/page.js, 
// but the page receives a different params.id

export default async function AccountsPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  // ...account means account is the object which contains the remaining keys from accountData
  const { transactions, ...account } = accountData;

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight capitalize md:text-5xl gradient">
            {account.name}
          </h1>

          <p className="mt-2 text-sm tex  t-muted-foreground">
            {`${account.type} account`}
          </p>
        </div>

        <div className="rounded-3xl bg-card px-6 py-4 shadow-sm text-right">
          <p className="text-2xl font-bold md:text-3xl tabular-nums">
            ₹{account.balance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart */}
      <Suspense
        fallback={
          <div className="overflow-hidden rounded-full">
            <BarLoader color="#8b5cf6" width={"100%"} />
          </div>
        }
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Table */}
      <Suspense
        fallback={
          <div className="overflow-hidden rounded-full">
            <BarLoader color="#8b5cf6" width={"100%"} />
          </div>
        }
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
