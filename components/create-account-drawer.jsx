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
import { Loader2 } from "lucide-react";

// Step 1 — Define validation rules with Zod
const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"], { required_error: "Type is required" }),
  balance: z.coerce.number().min(0, "Balance cannot be negative"),
  isDefault: z.boolean().default(false),
});

export default function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);

  // Step 2 — Setup React Hook Form with Zod resolver
  const {
    register, // connects inputs to form
    handleSubmit, // validates then submits
    formState: { errors }, // errors
    setValue, // manually set a value (for Select, Switch)
    watch, // watch current values
    reset, // reset form after submit
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: 0.0,
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    loading: createAccountLoading,
    error,
    fn: createAccountFn,
  } = useFetch(createAccount);

  // Step 3 — Handle form submission
  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="mx-auto max-w-xl border-none bg-background">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-2xl font-bold tracking-tight">
            Create New Account
          </DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Add a new account to manage your finances
          </p>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-4 pb-5 pt-2"
        >
          {/* Account Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Account Name</label>

            <Input
              {...register("name")}
              placeholder="e.g. Main Account"
              autoComplete="off"
              className="h-11 rounded-xl bg-muted/30"
            />

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Account Type</label>
            <Select
              onValueChange={(value) => setValue("type", value)}
              defaultValue="CURRENT"
            >
              <SelectTrigger className="h-11 w-full rounded-xl bg-muted/30">
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

          {/* Balance */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Initial Balance</label>

            <Input
              {...register("balance")}
              type="number"
              placeholder="0.00"
              step="0.01"
              autoComplete="off"
              onWheel={(e) => e.currentTarget.blur()}
              className="h-11 rounded-xl bg-muted/30"
            />

            {errors.balance && (
              <p className="text-xs text-red-500">{errors.balance.message}</p>
            )}
          </div>

          {/* Default Account */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Set as Default</label>

              <p className="text-xs text-muted-foreground">
                This account will be selected by default for transactions
              </p>
            </div>
            <Switch
              onCheckedChange={(checked) => setValue("isDefault", checked)}
              checked={watch("isDefault")}
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <DrawerClose asChild>
              <Button variant="outline" className="h-11 rounded-xl">
                Cancel
              </Button>
            </DrawerClose>

            <Button
              type="submit"
              disabled={createAccountLoading}
              className="h-11 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg"
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
      </DrawerContent>
    </Drawer>
  );
}
