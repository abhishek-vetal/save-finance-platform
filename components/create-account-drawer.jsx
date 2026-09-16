"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { toast } from "sonner";
import PlaidLinkButton from "@/components/plaid-link-button";

// define validation rules with zod
const accountSchema = z.object({
  name: z.string().min(1, "Name is required and cannot be empty"),
  type: z.enum(["CURRENT", "SAVINGS"], { required_error: "Type is required" }),
  // z.coerce.number() is useful because form input values generally arrive as strings
  // "5000" get coerced into 5000 then .min(0) prevents negative balances
  balance: z.coerce.number().min(0, "Balance cannot be negative"),
  isDefault: z.boolean().default(false),
});

export default function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);

  // setup react hook form with zod resolver
  const {
    register, // connects inputs to form
    handleSubmit, // validates with zod then submits else error
    formState: { errors }, // provide the errors which we provided in the zod validation schema
    watch, // watch current values
    setValue, // manually set a value (for Select, Switch) 
    reset, // reset form after submit
  } = useForm({
    // we are telling react hook form Use this Zod schema when validating the form.
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: 0,
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    loading: createAccountLoading,
    error,
    fn: createAccountFn,
  } = useFetch(createAccount);

  // handle form submission
  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      if(!newAccount.success) {
        toast.error(error.message || "Failed to create account");
        return ;
      }
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount]);

  return (
    <Drawer open={open} onOpenChange={(value) => setOpen(value)}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-w-lg mx-auto border border-border bg-card shadow-2xl max-h-[85vh] rounded-t-2xl">
        <div className="overflow-y-auto w-full max-h-[85vh]">
          <DrawerHeader className="pb-2 text-center sm:text-left px-6 pt-4">
            <DrawerTitle className="text-xl font-bold tracking-tight text-foreground">
              Create New Account
            </DrawerTitle>
            <p className="text-xs text-muted-foreground">
              Add a new account to manage your finances
            </p>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-6 pb-6 pt-1"
          >
            {/* plaid auto-sync banner */}
            <div className="rounded-xl border border-border bg-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Fast Auto-Sync</h4>
                <p className="text-[11px] text-muted-foreground">Connect your bank with Plaid to auto-import accounts & transactions</p>
              </div>
              <PlaidLinkButton className="text-xs whitespace-nowrap h-8 px-3 shrink-0" />
            </div>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                Or create manually
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* account name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Account Name</label>

              <Input
                {...register("name")}
                placeholder="e.g. Main Account"
                autoComplete="off"
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              />

              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* account type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Account Type</label>
              <Select
                defaultValue="CURRENT"
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>

              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* balance */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Initial Balance</label>

              <Input
                {...register("balance")}
                type="number"
                placeholder="0.00"
                step="0.01"
                autoComplete="off"
                onWheel={(e) => e.currentTarget.blur()}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              />

              {errors.balance && (
                <p className="text-xs text-red-500">{errors.balance.message}</p>
              )}
            </div>

            {/* default account */}
            <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border p-3.5">
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold text-foreground">Set as Default</label>

                <p className="text-[11px] text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
            </div>

            {/* buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <DrawerClose asChild>
                <Button variant="outline" className="h-10 rounded-lg">
                  Cancel
                </Button>
              </DrawerClose>

              <Button
                type="submit"
                disabled={createAccountLoading}
                className="h-10 rounded-lg"
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
