"use client";

import { UpdateDefault } from "@/actions/account";
import { deleteUserAccount } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { ArrowDownRight, ArrowUpRight, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AccountCard({ account }) {
  const { id, name, isDefault, balance, type } = account;

  const {
    data: updatedAccount,
    loading: updateDefaultLoading,
    error,
    fn: updateDefaultFn,
  } = useFetch(UpdateDefault);

  const {
    data: deleteAccountData,
    loading: deleteAccountLoading,
    fn: deleteAccountFn,
  } = useFetch(deleteUserAccount);

  const handleToggle = async (event) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return;
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const deleteAccount = async (event, id) => {
    event.preventDefault();
    await deleteAccountFn(id);
  };

  useEffect(() => {
    if (deleteAccountData) {
      if (!deleteAccountData?.success) {
        toast.error(
          deleteAccountLoading.message || "Failed to delete user account",
        );
        return;
      }

      toast.success("Account deleted successfully");
    }
  }, [deleteAccountData, deleteAccountLoading]);

  return (
    <Link href={`/account/${id}`}>
      <Card className="group cursor-pointer rounded-3xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <CardHeader className="flex justify-between space-y-0">
          <div>
            <CardTitle className="capitalize text-lg font-bold">
              {name}
            </CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              {`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} Account`}
            </p>
          </div>

          <div
            className="flex flex-col gap-3 items-end"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Default</p>

              <Switch
                checked={isDefault}
                onClick={handleToggle}
                disabled={updateDefaultLoading}
              />
            </div>
            <div>
              <Button
                variant="destructive"
                size="sm"
                onClick={(event) => deleteAccount(event, id)}
              >
                <Trash />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            ₹{balance.toFixed(2)}
          </p>
        </CardContent>

        <CardFooter className="flex justify-between pt-2 text-sm">
          <div className="flex items-center rounded-full bg-green-500/10 px-3 py-1 text-green-500">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Income
          </div>

          <div className="flex items-center rounded-full bg-red-500/10 px-3 py-1 text-red-500">
            <ArrowDownRight className="mr-1 h-4 w-4" />
            Expense
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
