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
  PencilIcon,
  RefreshCcw,
  Search,
  TrashIcon,
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

export default function TransactionTable({ transactions }) {
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [selectIDs, setSelectIDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const {
    data: deleteTransactionsData,
    loading: deleteTransactionsLoading,
    fn: deleteTransactionsFn,
    error,
  } = useFetch(deleteBulkTransactions);

  const handleDelete = async (ids) => {
    const confirmDelete = window.confirm(
      ids.length > 1
        ? `Are you sure you want to delete ${ids.length} transactions? This action cannot be undone.`
        : "Are you sure you want to delete this transaction? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    deleteTransactionsFn(ids);
  };

  useEffect(() => {
    if (deleteTransactionsData) {
      const count = selectIDs.length;

      if (count > 1) {
        toast.success(`${count} transactions deleted successfully`);
      } else {
        toast.success("Transaction deleted successfully");
      }

      setSelectIDs([]);
    }
  }, [deleteTransactionsData]);

  useEffect(() => {
    if (error) {
      toast.error(error?.message || "Transaction deletion failed");
    }
  }, [error]);

  const sortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      result = result.filter((t) => {
        const searchStr = searchTerm.toLowerCase();

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

    if (sortConfig.key != null) {
      result = result.sort((a, b) => {
        if (!sortConfig.key) return 0;

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

  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSortConfig({
      key: null,
      direction: "asc",
    });
    setCurrentPage(1);
    setSelectIDs([]);
  };

  const handleSelect = (id) => {
    setSelectIDs((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleSelectAll = () => {
    setSelectIDs((current) =>
      current.length === 0 ? sortedTransactions.map((t) => t.id) : [],
    );
  };

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, recurringFilter]);

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);

  const currentTransactions = sortedTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="flex flex-col gap-5">
      {deleteTransactionsLoading && (
        <div className="overflow-hidden rounded-full">
          <BarLoader color="#8b5cf6" width={"100%"} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1 min-w-75">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl bg-muted/30 pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value)}
          >
            <SelectTrigger className="h-11 w-40 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>

              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger className="h-11 w-44 rounded-xl">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>

              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectIDs.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectIDs)}
              className="rounded-xl transition-all duration-300 hover:scale-105"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Selected ({selectIDs.length})
            </Button>
          )}

          {(searchTerm ||
            typeFilter ||
            recurringFilter ||
            sortConfig.key ||
            currentPage > 1 ||
            selectIDs.length > 0) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl"
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
      <div className="overflow-hidden rounded-3xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectIDs.length === sortedTransactions.length &&
                    sortedTransactions.length > 0
                  }
                />
              </TableHead>

              {/* Date Sort */}
              <TableHead
                className="w-10 cursor-pointer select-none"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortConfig.key === "date" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>

              <TableHead className="max-w-70 w-70">Description</TableHead>

              {/* Category Sort */}
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  {sortConfig.key === "category" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>

              {/* Amount Sort */}
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end gap-1">
                  Amount
                  {sortConfig.key === "amount" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>

              <TableHead>Recurring</TableHead>

              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No Transaction Found
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell>
                    <Checkbox
                      onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectIDs.includes(transaction.id)}
                    />
                  </TableCell>

                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>

                  <TableCell className="max-w-40">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="block max-w-60 truncate">
                          {transaction.description}
                        </TooltipTrigger>

                        <TooltipContent>
                          <p>{transaction.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: categoryColors[transaction.category],
                        }}
                      />

                      <div
                        style={{
                          backgroundColor: `${
                            categoryColors[transaction.category]
                          }20`,
                        }}
                        className="rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {transaction.category}
                      </div>
                    </div>
                  </TableCell>

                  {/* Amount */}
                  <TableCell
                    className={`text-right font-bold ${
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}₹
                    {transaction.amount.toFixed(2)}
                  </TableCell>

                  {/* Recurring */}
                  <TableCell>
                    <TooltipProvider>
                      {transaction.isRecurring ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              <RefreshCcw className="mr-1 h-3 w-3" />

                              {
                                RECURRING_INTERVALS[
                                  transaction.recurringInterval
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>

                          <TooltipContent>
                            <div className="text-sm">
                              <div>Next Date:</div>

                              <div>
                                {format(
                                  new Date(transaction.nextRecurringDate),
                                  "PPP",
                                )}
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

                  {/* Actions */}
                  <TableCell className="w-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-xl">
                          ...
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transactions/create?edit=${transaction.id}`,
                            )
                          }
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete([transaction.id])}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
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

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          className="rounded-xl"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
