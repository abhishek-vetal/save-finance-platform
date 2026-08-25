"use client";

import { useEffect, useMemo, useState } from "react";
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

import { deleteBulkTransactions } from "@/actions/account";
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
import { BarLoader } from "react-spinners";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export default function TransactionTable({ transactions = [] }) {
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  const [selectIDs, setSelectIDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const {
    data: deleteTransactionsData,
    loading: deleteTransactionsLoading,
    fn: deleteTransactionsFn,
    error: deleteError,
  } = useFetch(deleteBulkTransactions);

  // used to confirm when we are deleting the transactions
  const handleDeleteWithConfirmation = async (selectIDs) => {
    if (selectIDs.length === 0) return;

    const count = selectIDs.length;
    const confirmDelete = window.confirm(
      count > 1
        ? `Are you sure you want to delete ${count} transactions? This action cannot be undone.`
        : "Are you sure you want to delete this transaction? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    await deleteTransactionsFn(selectIDs);
  };

  useEffect(() => {
    if (deleteTransactionsData && !deleteTransactionsLoading) {
      toast.success("Transactions deleted successfully");
      setSelectIDs([]);
    }
  }, [deleteTransactionsData, deleteTransactionsLoading]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError?.message || "Transaction deletion failed");
    }
  }, [deleteError]);

  // used for searching, filtering, sorting the transactions 
  const searchedFilteredSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchStr = searchTerm.toLowerCase();
      result = result.filter((t) => {
        const { date, description, category, amount, recurringInterval } = t;
        const displayDate = date ? format(new Date(date), "PP") : "";

        return Object.values({
          date: displayDate,
          description,
          category,
          amount,
          recurringInterval,
        }).some((value) => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchStr);
        });
      });
    }

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (recurringFilter) {
      result =
        recurringFilter === "recurring"
          ? result.filter((t) => t.isRecurring)
          : result.filter((t) => !t.isRecurring);
    }

    if (sortConfig.key) {
      result = result.sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];

        if (sortConfig.key === "date") {
          const dateA = new Date(valueA || 0);
          const dateB = new Date(valueB || 0);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        if (sortConfig.key === "amount") {
          const numA = Number(valueA) || 0;
          const numB = Number(valueB) || 0;
          return sortConfig.direction === "asc" ? numA - numB : numB - numA;
        }

        const strA = String(valueA || "");
        const strB = String(valueB || "");
        return sortConfig.direction === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [searchTerm, typeFilter, recurringFilter, sortConfig, transactions]);

  // clearing all the filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSortConfig({
      key: "date",
      direction: "desc",
    });
    setCurrentPage(1);
    setSelectIDs([]);
  };

  // if id present then remove it from selectIDs state else add it in
  const handleCheckbox = (id) => {
    setSelectIDs((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // when the checked is true then remove all items else add all the filtered transactions
  const handleAllCheckbox = () => {
    setSelectIDs((current) =>
      current.length === searchedFilteredSortedTransactions.length
        ? []
        : searchedFilteredSortedTransactions.map((t) => t.id),
    );
  };

  // this is used to handle the 
  const handleSortConfig = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === direction) {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const TRANSACTIONS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // total pages in the transaction table
  const totalPages = Math.max(
    1,
    Math.ceil(searchedFilteredSortedTransactions.length / TRANSACTIONS_PER_PAGE),
  );

  // indexes to get all transactions for the current page
  const indexOfLastItem = currentPage * TRANSACTIONS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - TRANSACTIONS_PER_PAGE;

  // transactions per page --> 0-7, 8-15, ...
  const currentPageTransactions = searchedFilteredSortedTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // pagination should not reset when selectIDs changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, recurringFilter, sortConfig]);

  return (
    <div className="flex flex-col gap-5">
      {deleteTransactionsLoading && (
        <div className="overflow-hidden rounded-full">
          <BarLoader color="#8b5cf6" width={"100%"} />
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 min-w-70">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl bg-muted/30 pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value === "ALL" ? "" : value)}
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
            value={recurringFilter}
            onValueChange={(value) =>
              setRecurringFilter(value === "ALL" ? "" : value)
            }
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
              className="h-11 rounded-xl"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Selected ({selectIDs.length})
            </Button>
          )}

          {(searchTerm ||
            typeFilter ||
            recurringFilter ||
            sortConfig.key !== "date" ||
            sortConfig.direction !== "desc" ||
            selectIDs.length > 0) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl"
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

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={
                    selectIDs.length ===
                    searchedFilteredSortedTransactions.length &&
                    searchedFilteredSortedTransactions.length > 0
                  }
                  onCheckedChange={handleAllCheckbox}
                />
              </TableHead>

              {/* Date Column */}
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

              {/* Category Column */}
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

              {/* Amount Column */}
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
            {currentPageTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              currentPageTransactions.map((transaction) => (
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

                  {/* Category */}
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

                  {/* Formatted Rupee Amount */}
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

                  {/* Recurring Status */}
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

                  {/* Row Actions Dropdown */}
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

      {/* Pagination Footer */}
      {searchedFilteredSortedTransactions.length > TRANSACTIONS_PER_PAGE && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            className="rounded-xl"
            size="sm"
            onClick={() => setCurrentPage((curr) => curr - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <Button
            variant="outline"
            className="rounded-xl"
            size="sm"
            onClick={() =>
              setCurrentPage((curr) => curr + 1)
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}