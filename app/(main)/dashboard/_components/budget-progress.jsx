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

export default function BudgetProgress({ monthlyBudget, currentMonthExpenses = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState(monthlyBudget?.amount || 0);
  const [input, setInput] = useState(monthlyBudget?.amount?.toString() || "");

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
    // wait until we actually have a response from the server for the first render value is undefined
    if (updateBudgetData) {
      if (!updateBudgetData.success) {
        toast.error(updateBudgetData.error || "Failed to update budget");
        return;
      }

      setIsEditing(false);
      setBudget(updateBudgetData.data.amount);
      toast.success("Budget updated successfully");
    }
  }, [updateBudgetData]);

  // reset input if user cancels editing mid-way
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

  // budget will always be 0 or > 0
  const percentage = budget ? (currentMonthExpenses / budget) * 100 : 0;

  return (
    <Card className="w-full rounded-3xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Monthly Budget</CardTitle>

            <CardDescription className="text-sm">
              {budget > 0 ? (
                <span className="text-muted-foreground tabular-nums">
                  {`₹${currentMonthExpenses.toFixed(2)} of ₹${budget.toFixed(2)} spent`}
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
                  className="h-8 w-8 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors duration-150"
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
                  className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors duration-150"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
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

            <div className="tabular-nums mt-3 flex justify-between px-1 text-xs font-medium text-muted-foreground">
              <span>
                {percentage > 100
                  ? "Budget exceeded"
                  : `${percentage.toFixed(1)}% used`}
              </span>

              {budget > 0 && (
                <span className="tabular-nums">
                  {percentage > 100
                    ? `₹${(currentMonthExpenses - budget).toFixed(2)} over limit`
                    : `₹${(budget - currentMonthExpenses).toFixed(2)} remaining`}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
