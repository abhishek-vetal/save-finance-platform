"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncPlaidAccountTransactions, syncAllPlaidAccounts } from "@/actions/account";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SyncPlaidButton({ accountId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = accountId
        ? await syncPlaidAccountTransactions(accountId)
        : await syncAllPlaidAccounts();

      if (res.success) {
        if (res.count > 0) {
          toast.success(`Synced ${res.count} new transaction(s) from Plaid!`);
        } else {
          toast.info("Accounts are already up-to-date. No new transactions found.");
        }
        // fetch the latest server-side data so the UI reflects those changes
        router.refresh(); 
      } else {
        toast.error(res.error || "Failed to sync transactions");
      }
    } catch (err) {
      toast.error(err.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={loading}
      className="h-9 px-3.5 gap-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs sm:text-sm font-medium shadow-none transition-colors duration-150"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      <span>{loading ? "Syncing..." : accountId ? "Sync Plaid" : "Sync All Banks"}</span>
    </Button>
  );
}
