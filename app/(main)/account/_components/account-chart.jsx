"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

// Custom Tooltip 
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {
    return (
      <div className="rounded-xl border bg-background p-4 shadow-xl">
        <p className="mb-2 text-sm font-bold">{label}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {entry.name}
                </span>
              </div>    
              <span className="text-sm font-bold tabular-nums">
                ₹{Number(entry.value).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    
    // subtract (days - 1) to get the exact range
    const startDate = range.days
      ? startOfDay(subDays(now, range.days - 1))
      : startOfDay(new Date(0));

    const filteredTransactions = transactions.filter((t) => {
      // used endOfDay so that will consider the transaction till last millisecond of today
      return new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now);
    });

    const groupedTransactionIncomeAndExpense = filteredTransactions.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");

      if (!acc[date]) {
        acc[date] = { date, Income: 0, Expense: 0 };
      }

      transaction.type === "INCOME"
        ? (acc[date].Income += transaction.amount)
        : (acc[date].Expense += transaction.amount);

      return acc;
    }, {});
    
    // since transactions are in descending order I just reverse the result 
    // I can also sort from based on the date in desc order
    // return Object.values(groupedTransactionIncomeAndExpense).reverse();

    return Object.values(groupedTransactionIncomeAndExpense).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, day) => {
        acc.Income += day.Income;
        acc.Expense += day.Expense;

        return acc;
      },{ Income: 0, Expense: 0 });
  }, [filteredData]);

  const netTotal = useMemo(() => {
    return totals.Income - totals.Expense;
  }, [totals]);

  return (
    <Card className="rounded-3xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Transaction Overview
          </CardTitle>

          <CardDescription className="mt-1 text-sm text-muted-foreground">
            Income vs expenses across selected period
          </CardDescription>
        </div>

        <CardAction>
          <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value)}
          >
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
        {/* Statistics cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm">
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-green-500/10 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>

                <p className="mt-2 text-xl font-bold text-green-500 tabular-nums">
                  ₹{totals.Income.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10">
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm">
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-red-500/10 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expense</p>

                <p className="mt-2 text-xl font-bold text-red-500 tabular-nums">
                  ₹{totals.Expense.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm">
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>

                <p
                  className={`mt-2 text-xl font-bold tabular-nums ${
                    netTotal >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ₹{netTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-lg font-bold">₹</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full min-h-75">
          <ResponsiveContainer width="100%" height={310}>
            <BarChart
              data={filteredData}
              margin={{
                top: 20,
                right: 10,
                left: -20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />

              <XAxis
                dataKey="date"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `₹${value.toLocaleString("en-IN")}`
                }
                width={80}
              />

              {/* CustomTooltip */}
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "rgba(255,255,255,0.03)",
                }}
              />

              <Legend />

              <Bar dataKey="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />

              <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}