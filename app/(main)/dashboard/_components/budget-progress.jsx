"use client";

import { updateBudget } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function BudgetProgress({ initialBudget, currentExpenses = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState(initialBudget?.amount || 0);
  const [input, setInput] = useState(initialBudget?.amount?.toString() || "");

  const {
    data: updateBudgetData,
    loading: updateBudgetLoading,
    fn: updateBudgetFn,
    error,
  } = useFetch(updateBudget);

  const handleBudget = async () => {
    const amount = parseFloat(input);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid positive budget");
      return;
    }
    await updateBudgetFn(amount);
  };

  useEffect(() => {
    // 1. Wait until we actually have a response from the server
    if (updateBudgetData) {
      if (!updateBudgetData.success) {
        toast.error(updateBudgetData.error || "Failed to update budget");
        console.error("Budget Update Failure:", updateBudgetData.error);
        return;
      }

      setIsEditing(false);
      setBudget(updateBudgetData.data.amount);
      toast.success("Budget updated successfully");
    }
  }, [updateBudgetData]);

  // Reset input if user cancels editing mid-way
  const handleCancel = () => {
    setIsEditing(false);
    setInput(budget.toString());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBudget();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const percentage = budget ? (currentExpenses / budget) * 100 : 0;

  return (
    <Card className="w-full rounded-3xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Monthly Budget</CardTitle>

            <CardDescription className="text-sm">
              {budget > 0 ? (
                <span className="text-muted-foreground">
                  ₹{currentExpenses.toFixed(2)} of ₹{Number(budget).toFixed(2)}{" "}
                  spent
                </span>
              ) : (
                "Set a monthly target to track expenses"
              )}
            </CardDescription>
          </div>

          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBudget}
                  variant="ghost"
                  size="icon"
                  disabled={updateBudgetLoading}
                  className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 transition-all hover:scale-105 hover:bg-green-500/20"
                >
                  {updateBudgetLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  )}
                </Button>

                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="icon"
                  disabled={updateBudgetLoading}
                  className="h-9 w-9 rounded-xl bg-red-500/10 text-red-500 transition-all hover:scale-105 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-9 w-9 rounded-xl text-muted-foreground transition-all hover:scale-105"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <Input
            placeholder="Enter budget amount"
            type="number"
            disabled={updateBudgetLoading}
            value={input}
            autoFocus
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-xl"
          />
        ) : (
          <>
            <Progress
              value={percentage > 100 ? 100 : percentage}
              className={`h-3 rounded-full bg-muted [&>div]:transition-all [&>div]:duration-700 ${
                percentage >= 90
                  ? "[&>div]:bg-red-500"
                  : percentage >= 75
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-green-500"
              }`}
            />

            <div className="mt-3 flex justify-between px-1 text-xs font-medium text-muted-foreground">
              <span>
                {percentage > 100
                  ? "Budget exceeded"
                  : `${percentage.toFixed(1)}% used`}
              </span>

              {budget > 0 && (
                <span>
                  {percentage > 100
                    ? `₹${(currentExpenses - budget).toFixed(2)} over limit`
                    : `₹${(budget - currentExpenses).toFixed(2)} remaining`}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
