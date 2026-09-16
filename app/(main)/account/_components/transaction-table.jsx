"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  deleteBulkTransactions,
  getAccountTransactions,
} from "@/actions/account";
import { categoryColors } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export default function TransactionTable({
  accountId,
  initialTransactions = [],
  initialPagination = {},
}) {
  const router = useRouter();
  const isFirstSearch = useRef(true);

  const [transactions, setTransactions] = useState(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);

  const [selectIDs, setSelectIDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // keep unified filters ref as single source of truth across renders
  const filtersRef = useRef({
    search: "",
    type: "",
    recurring: "",
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
  });

  const {
    data: deleteTransactionsData,
    loading: deleteTransactionsLoading,
    fn: deleteTransactionsFn,
    error: deleteError,
  } = useFetch(deleteBulkTransactions);

  // sync initial data from parent if props change
  useEffect(() => {
    setTransactions(initialTransactions);
    setPagination(initialPagination);
  }, [initialTransactions, initialPagination]);

  // execute transaction queries using latest merged filter parameters
  const fetchData = useCallback(
    async (overrideParams = {}) => {
      if (!accountId) return;

      const params = { ...filtersRef.current, ...overrideParams };
      filtersRef.current = params;
      setLoading(true);

      try {
        const res = await getAccountTransactions({
          accountId,
          page: params.page,
          limit: 8,
          search: params.search,
          type: params.type,
          recurring: params.recurring,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        });

        if (res.success) {
          setTransactions(res.transactions);
          setPagination(res.pagination);
          setSelectIDs([]);
        } else {
          toast.error(res.error || "Failed to fetch transactions");
        }
      } catch (err) {
        toast.error(err.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    },
    [accountId],
  );

  // debounce search input without firing on initial component mount
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchData({ search: searchTerm, page: 1 });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]);

  // used to confirm when we are deleting the transactions
  const handleDeleteWithConfirmation = async (idsToDelete) => {
    if (idsToDelete.length === 0) return;

    const count = idsToDelete.length;
    const confirmDelete = window.confirm(
      count > 1
        ? `Are you sure you want to delete ${count} transactions? This action cannot be undone.`
        : "Are you sure you want to delete this transaction? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    await deleteTransactionsFn(idsToDelete);
  };

  useEffect(() => {
    if (deleteTransactionsData && !deleteTransactionsLoading) {
      toast.success("Transactions deleted successfully");
      setSelectIDs([]);
      fetchData();
    }
  }, [deleteTransactionsData, deleteTransactionsLoading, fetchData]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError?.message || "Transaction deletion failed");
    }
  }, [deleteError]);

  // clearing all the filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSortConfig({
      key: "date",
      direction: "desc",
    });
    fetchData({
      search: "",
      type: "",
      recurring: "",
      sortBy: "date",
      sortOrder: "desc",
      page: 1,
    });
  };

  // handle type filter change
  const handleTypeChange = (value) => {
    const newType = value === "ALL" ? "" : value;
    setTypeFilter(newType);
    fetchData({ type: newType, page: 1 });
  };

  // handle recurring filter change
  const handleRecurringChange = (value) => {
    const newRecurring = value === "ALL" ? "" : value;
    setRecurringFilter(newRecurring);
    fetchData({ recurring: newRecurring, page: 1 });
  };

  // handle sort column and direction change
  const handleSortConfig = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
    fetchData({ sortBy: key, sortOrder: direction, page: 1 });
  };

  // handle pagination page change
  const handlePageChange = (newPage) => {
    fetchData({ page: newPage });
  };

  // if id present then remove it from selectIDs state else add it in
  const handleCheckbox = (id) => {
    setSelectIDs((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // when checked is true select all 8 items on the current page
  const handleAllCheckbox = () => {
    setSelectIDs((current) =>
      current.length === transactions.length && transactions.length > 0
        ? []
        : transactions.map((t) => t.id),
    );
  };

  const currentPage = pagination?.currentPage || filtersRef.current.page || 1;
  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const totalCount = pagination?.totalCount || 0;
  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(typeFilter) ||
    Boolean(recurringFilter) ||
    sortConfig.key !== "date" ||
    sortConfig.direction !== "desc";

  return (
    <div className="flex flex-col gap-5">
      {/* filters & actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 min-w-70">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions by category or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl bg-muted/30 pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilter || "ALL"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="h-11 w-36 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter || "ALL"}
            onValueChange={handleRecurringChange}
          >
            <SelectTrigger className="h-11 w-44 rounded-xl">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Transactions</SelectItem>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectIDs.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => handleDeleteWithConfirmation(selectIDs)}
              className="h-11 rounded-lg"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Selected ({selectIDs.length})
            </Button>
          )}

          {(hasActiveFilters || selectIDs.length > 0) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg"
                    onClick={clearAllFilters}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear Filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={
                    selectIDs.length === transactions.length &&
                    transactions.length > 0
                  }
                  onCheckedChange={handleAllCheckbox}
                />
              </TableHead>

              {/* date column */}
              <TableHead
                className="w-32 cursor-pointer select-none"
                onClick={() => handleSortConfig("date")}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortConfig.key === "date" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-foreground" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-foreground" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-40" />
                  )}
                </div>
              </TableHead>

              <TableHead className="min-w-50">Description</TableHead>

              {/* category column */}
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSortConfig("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  {sortConfig.key === "category" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-foreground" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-foreground" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-40" />
                  )}
                </div>
              </TableHead>

              {/* amount column */}
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSortConfig("amount")}
              >
                <div className="flex items-center justify-end gap-1">
                  Amount
                  {sortConfig.key === "amount" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-foreground" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-foreground" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-40" />
                  )}
                </div>
              </TableHead>

              <TableHead>Recurring</TableHead>
              <TableHead className="w-12 pr-4" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selectIDs.includes(transaction.id)}
                      onCheckedChange={() => handleCheckbox(transaction.id)}
                    />
                  </TableCell>

                  <TableCell className="tabular-nums font-medium text-muted-foreground">
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>

                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="block max-w-60 truncate text-left font-medium">
                          {transaction.description || "No description"}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{transaction.description || "No description"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* category */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            categoryColors?.[transaction.category] || "#94a3b8",
                        }}
                      />
                      <span className="capitalize text-sm font-medium">
                        {transaction.category}
                      </span>
                    </div>
                  </TableCell>

                  {/* formatted rupee amount */}
                  <TableCell
                    className={`text-right font-bold tabular-nums ${transaction.type === "EXPENSE"
                      ? "text-red-500"
                      : "text-green-500"
                      }`}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}₹
                    {Number(transaction.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>

                  {/* recurring status */}
                  <TableCell>
                    <TooltipProvider>
                      {transaction.isRecurring ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="secondary"
                              className="gap-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            >
                              <RefreshCcw className="h-3 w-3" />
                              {RECURRING_INTERVALS[
                                transaction.recurringInterval
                              ] || "Recurring"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div>Next Date:</div>
                              <div className="font-semibold">
                                {transaction.nextRecurringDate
                                  ? format(
                                    new Date(transaction.nextRecurringDate),
                                    "PP",
                                  )
                                  : "N/A"}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge variant="outline" className="gap-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          One-time
                        </Badge>
                      )}
                    </TooltipProvider>
                  </TableCell>

                  {/* row actions dropdown */}
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transactions/create?edit=${transaction.id}`,
                            )
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDeleteWithConfirmation([transaction.id])}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            className="rounded-lg"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <Button
            variant="outline"
            className="rounded-lg"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}