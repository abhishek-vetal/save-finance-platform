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
import { CalendarIcon, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { createTransactions, updateTransaction } from "@/actions/transactions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import ReceiptScanner from "./receipt-scanner";

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"], { required_error: "Type is required" }),
    amount: z.coerce.number().min(0.01, "Amount is required"),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    date: z.coerce.date({ required_error: "Date is required" }),
    description: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  // use to provide error when A->B = ~A V B fails 
  .refine((data) => !data.isRecurring || Boolean(data.recurringInterval), {
    message: "Recurring interval is required for recurring transactions",
    path: ["recurringInterval"],
  });

export default function AddTransactionsForm({
  accounts = [],
  categories = [],
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const defaultAccountId =
    accounts.find((ac) => ac.isDefault)?.id || accounts[0]?.id || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    // prevents fields with errors from re-validating on every keystroke or change 
    // after an initial submit attempt 
    reValidateMode: "onSubmit",
    defaultValues:
      editMode && initialData
        ? {
          type: initialData.type,
          amount: initialData.amount,
          description: initialData.description || "",
          accountId: initialData.accountId,
          category: initialData.category,
          date: new Date(initialData.date),
          isRecurring: initialData.isRecurring || false,
          ...(initialData.recurringInterval && {
            recurringInterval: initialData.recurringInterval,
          }),
        }
        : {
          type: "EXPENSE",
          amount: "",
          description: "",
          accountId: defaultAccountId,
          category: "",
          date: new Date(),
          isRecurring: false,
        },
  });

  const {
    data: transactionResult,
    loading: transactionLoading,
    fn: transactionFn,
  } = useFetch(editMode ? updateTransaction : createTransactions);

  const type = watch("type");
  const accountId = watch("accountId");
  const category = watch("category");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const recurringInterval = watch("recurringInterval");

  // filtered categories based on the income or expense
  const filteredCategoriesForIncomeOrExpense = categories.filter((c) => c.type === type);

  // when type is changed old category will not match with new type so handle that
  const handleTypeChange = (newType) => {
    setValue("type", newType);
    // Reset category if it doesn't belong to the newly selected type
    const isValidCategory = categories.some(
      (c) => c.name === category && c.type === newType
    );
    if (!isValidCategory) {
      setValue("category", "");
    }
  };

  const onSubmit = (formData) => {
    if (editMode) {
      transactionFn(initialData.id, formData);
    } else {
      transactionFn(formData);
    }
  };

  useEffect(() => {
    if (transactionResult && !transactionLoading) {
      if (!transactionResult.success) {
        toast.error(
          transactionResult.error ||
          (editMode
            ? "Failed to update transaction"
            : "Failed to create transaction"),
        );
        return;
      }

      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully",
      );
      // I don't want to see the previous transaction data after reset in editMode so I will not reset 
      // transaction data in editMode
      if (!editMode) reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const handleScanComplete = (scannedData) => {
    if (scannedData?.data) {
      if (scannedData.data.amount) {
        setValue("amount", scannedData.data.amount.toString(), {
          shouldValidate: true, // Runs schema validation immediately
        });
      }
      if (scannedData.data.date) {
        setValue("date", new Date(scannedData.data.date), {
          shouldValidate: true,
        });
      }
      if (scannedData.data.description) {
        setValue("description", scannedData.data.description, {
          shouldValidate: true,
        });
      }
      if (scannedData.data.category) {
        setValue("category", scannedData.data.category, {
          shouldValidate: true,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6">
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Transaction Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Type</label>
        <Select value={type} onValueChange={(value) => handleTypeChange(value)}>
          <SelectTrigger className="h-11 w-full rounded-xl bg-muted/30">
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

      {/* Amount and Account */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            {...register("amount")}
            placeholder="0.00"
            step="0.01"
            // prevent accidental scrolling values on <input type="number"> fields
            onWheel={(e) => e.currentTarget.blur()}
            className="h-11 rounded-xl bg-muted/30 tabular-nums"
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            value={accountId}
            onValueChange={(value) => setValue("accountId", value, { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 w-full rounded-xl bg-muted/30">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (₹
                    {account.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    )
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button
                    variant="ghost"
                    className="mt-2 w-full justify-start rounded-xl text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <div className="mr-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
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
          value={category}
          onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
        >
          <SelectTrigger className="h-11 w-full rounded-xl bg-muted/30">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {filteredCategoriesForIncomeOrExpense.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
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
        <Popover open={calendarOpen} onOpenChange={(value) => setCalendarOpen(value)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-[50%] rounded-xl bg-muted/30 pl-3 text-left font-normal"
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(val) => {
                setValue("date", val, { shouldValidate: true });
                setCalendarOpen(false);
              }}
              disabled={(calendarDay) =>
                calendarDay > new Date() || calendarDay < new Date("1900-01-01")
              }
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
          placeholder="Enter description (optional)"
          {...register("description")}
          className="h-11 rounded-xl bg-muted/30"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Switch */}
      <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-5">
        <div className="flex flex-col gap-1">
          <label className="text-base font-semibold">Recurring Transaction</label>
          <p className="text-sm text-muted-foreground">
            Set up a repeating automated transaction
          </p>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => {
            setValue("isRecurring", checked, { shouldValidate: true });
            if (!checked) {
              setValue("recurringInterval", undefined, { shouldValidate: true });
            }
          }}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            value={recurringInterval}
            onValueChange={(value) =>
              setValue("recurringInterval", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl bg-muted/30">
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
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>{editMode ? "Updating..." : "Creating..."}</span>
            </div>
          ) : (
            <span>{editMode ? "Update Transaction" : "Create Transaction"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}