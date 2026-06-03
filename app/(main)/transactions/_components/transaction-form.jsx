"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { createTransactions, updateTransaction } from "@/actions/transactions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import ReceiptScanner from "./receipt-scanner";

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .refine((data) => !data.isRecurring || data.recurringInterval, {
    message: "Recurring interval is required for recurring transactions",
    path: ["recurringInterval"],
  });

export default function AddTransactionsForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();

  const {
    register, // Connects your HTML inputs to the form so it can track their values
    handleSubmit, // Wraps your form's submit event to check for validation errors first
    formState: {
      errors, // An object containing all the validation errors (e.g., "Email is required")
    },
    watch, // Listens to an input in real-time and updates the UI when it changes
    setValue, // Programmatically changes an input's value behind the scenes
    reset, // Clears the form back to empty or back to its default values
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    data: transactionResult,
    loading: transactionLoading,
    fn: transactionFn,
  } = useFetch(editMode ? updateTransaction : createTransactions);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    editMode
      ? transactionFn(initialData.id, formData)
      : transactionFn(formData);
  };

  useEffect(() => {
    if (transactionResult && !transactionLoading) {
      if (!transactionResult.success) {
        toast.error(
          transactionResult.error || editMode
            ? "Failed to update transaction"
            : "Failed to create transaction",
        );
        return;
      }
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully",
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, router, reset]); // Added dependencies for React safety

  const type = watch("type");
  const accountId = watch("accountId");
  const category = watch("category");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const recurringInterval = watch("recurringInterval");

  const filteredCategories = categories.filter(
    (category) => category.type === type,
  );

  const handleScanComplete = (scannedData) => {
    if (scannedData?.data) {
      setValue("amount", scannedData.data.amount.toString());
      setValue("date", new Date(scannedData.data.date));
      if (scannedData.data.description)
        setValue("description", scannedData.data.description);
      if (scannedData.data.category)
        setValue("category", scannedData.data.category);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 flex flex-col gap-6"
    >
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Type</label>

        <Select onValueChange={(value) => setValue("type", value)} value={type}>
          <SelectTrigger className="w-full h-11 rounded-xl bg-muted/30">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="INCOME">Income</SelectItem>

              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount + Account */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Amount</label>

          <Input
            type="number"
            {...register("amount")}
            placeholder="0.00"
            step="0.01"
            onWheel={(e) => e.currentTarget.blur()}
            className="h-11 rounded-xl bg-muted/30"
          />

          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Account</label>

          <Select
            onValueChange={(value) => setValue("accountId", value)}
            value={accountId}
          >
            <SelectTrigger className="w-full h-11 rounded-xl bg-muted/30">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ( ₹{parseFloat(account.balance).toFixed(2)})
                  </SelectItem>
                ))}

                <CreateAccountDrawer>
                  <Button variant="ghost" className="mt-3 w-full rounded-xl">
                    Create Account
                  </Button>
                </CreateAccountDrawer>
              </SelectGroup>
            </SelectContent>
          </Select>

          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Category</label>

        <Select
          onValueChange={(value) => setValue("category", value)}
          value={category}
        >
          <SelectTrigger className="w-full h-11 rounded-xl bg-muted/30">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.id}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Date</label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-11 rounded-xl bg-muted/30 pl-3 text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}

              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-fit p-0" align="start">
            <Calendar
              mode="single"
              onSelect={(value) => setValue("date", value)}
              selected={date}
              disabled={(calendarDay) =>
                calendarDay > new Date() || calendarDay < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Description</label>

        <Input
          placeholder="Enter description"
          {...register("description")}
          className="h-11 rounded-xl bg-muted/30"
        />

        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring */}
      <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-5">
        <div className="flex flex-col gap-1">
          <label className="text-base font-semibold">
            Recurring Transaction
          </label>

          <p className="text-sm text-muted-foreground">
            Set up a recurring schedule
          </p>
        </div>

        <Switch
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={isRecurring}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Recurring Interval</label>

          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={recurringInterval}
          >
            <SelectTrigger className="w-full h-11 rounded-xl bg-muted/30">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>

              <SelectItem value="WEEKLY">Weekly</SelectItem>

              <SelectItem value="MONTHLY">Monthly</SelectItem>

              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={transactionLoading}
          className="h-11 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg"
        >
          {transactionLoading ? (
            <>
              <Spinner data-icon="inline-start" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{editMode ? "Update Transaction" : "Create Transaction"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
