"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PlaidLinkButton({ className, label, variant = "default" }) {
  const [linkToken, setLinkToken] = useState(null);
  const [hasPlaidAccount, setHasPlaidAccount] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const router = useRouter();

  // get a fresh Link Token from our backend when the component loads.
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", { method: "POST" });

        if (!response.ok) {
          throw new Error("Failed to create Plaid link token");
        }

        const data = await response.json();
        setLinkToken(data.link_token);

        if (typeof data.hasPlaidAccount === "boolean") {
          setHasPlaidAccount(data.hasPlaidAccount);
        }
      } catch (error) {
        console.error("Error fetching Plaid link token:", error);
        toast.error("Unable to initialize bank connection");
      }
    };

    fetchLinkToken();
  }, []);

  // the user finishes connecting their bank in Plaid → Plaid gives us a public_token 
  // → we send that token to our backend → backend finishes the bank connection
  const onSuccess = useCallback(async (public_token) => {

    if (!public_token) {
      toast.error("Plaid did not return a public token");
      return;
    }

    setIsLinking(true);

    try {
      // send the public token to our backend.
      const response = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Bank account connected and transactions synced!");
        setHasPlaidAccount(true);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to connect bank account");
      }
    } catch (error) {
      console.error("Error exchanging Plaid public token:", error);
      toast.error("Failed to connect bank account");
    } finally {
      setIsLinking(false);
    }
  }, [router]);

  // open is a function used to open Plaid Link
  // ready tells you whether Plaid Link is ready to be opened
  const { open, ready, error: plaidError } = usePlaidLink({ token: linkToken, onSuccess });

  // plaid link failed to load
  useEffect(() => {
    if (plaidError) {
      console.error("Plaid Link failed to load:", plaidError);
      toast.error("Unable to load Plaid bank connection");
    }
  }, [plaidError]);

  const isLoading = isLinking || !ready || !linkToken;
  const buttonText = label || (hasPlaidAccount ? "Connect Another Bank" : "Connect Bank");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            onClick={() => open()}
            disabled={isLoading}
            className={`h-9 px-3.5 gap-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 ${className || ""}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">{isLinking ? "Connecting..." : "Loading..."}</span>
              </>
            ) : (
              <>
                <Landmark className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{buttonText}</span>
              </>
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={6}
          className="flex flex-col gap-2 p-3 bg-popover text-popover-foreground border border-border shadow-md rounded-lg max-w-65 text-left"
        >
          <div className="text-xs font-semibold text-foreground">Sandbox Test Credentials</div>

          <p className="text-[11px] text-muted-foreground leading-snug">
            Select any institution (for example, Chase) and enter:
          </p>

          <div className="w-full space-y-1 text-xs">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[11px] text-muted-foreground">Username</span>
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] font-medium text-foreground">user_good</code>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-[11px] text-muted-foreground">Password</span>
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] font-medium text-foreground">pass_good</code>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-[11px] text-muted-foreground">SMS / OTP</span>
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] font-medium text-foreground">1234</code>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}