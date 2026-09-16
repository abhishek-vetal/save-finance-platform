import { getUserAccounts } from "@/actions/dashboard";
import AddTransactionsForm from "../_components/transaction-form";
import { defaultCategories } from "@/data/categories";
import { getTransaction } from "@/actions/transactions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AddTransactions({ searchParams }) {
  const accounts = await getUserAccounts();

  const editId = (await searchParams)?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-4 md:py-6">
      {/* back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {`${editId ? "Update" : "Add"} Transaction`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {editId
            ? "Update the details of your recorded transaction."
            : "Record a new expense or income to keep your finances organized."}
        </p>
      </div>

      <AddTransactionsForm
        key={editId || "create"}
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
