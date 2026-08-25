import { getUserAccounts } from "@/actions/dashboard";
import AddTransactionsForm from "../_components/transaction-form";
import { defaultCategories } from "@/data/categories";
import { getTransaction } from "@/actions/transactions";

// params used for dynamic routing
// searchParams represents the query string parameters appended after the ? symbol
export default async function AddTransactions({ searchParams }) {
  const accounts = await getUserAccounts();

  const editId = (await searchParams)?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="container mx-auto px-10 md:px-30 lg:px-70">
      <h1 className="text-5xl font-extrabold tracking-tight gradient">
        {`${editId ? "Update" : "Add"} Transaction`}
      </h1>

      <AddTransactionsForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
