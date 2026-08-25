import { scanReceipt } from "@/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import useFetch from "@/hooks/use-fetch";
import imageCompression from "browser-image-compression";
import { Camera, Receipt } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    data: scannedData,
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Make sure they actually uploaded an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      event.target.value = "";
      return;
    }

    try {
      // Options to compress image below 1.5MB and max dimension 1920px
      // Serverless payload limits --> maximum sizes allowed for data sent to or returned by serverless function
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // FormData API used to package a binary file so it can be sent over the network
      // to your server or Server Action
      const formData = new FormData();

      // Adds the compressed file to this container under the key name "receipt".
      formData.append("receipt", compressedFile);

      await scanReceiptFn(formData);
    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Failed to process image compression");
    }
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      if (!scannedData.success) {
        toast.error("Failed to process image");
        return;
      }
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border">
            <Receipt className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none">
              Smart Receipt Scanner
            </h3>

            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Upload a receipt and let AI extract amount, date, and category
              automatically.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                AI Powered
              </span>

              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                Fast
              </span>

              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                Expense Only
              </span>

              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                Auto Category
              </span>
            </div>
          </div>
        </div>

        <Input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleReceiptScan}
        />

        <Button
          type="button"
          size="sm"
          className="w-full sm:w-auto rounded-lg px-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanReceiptLoading}
        >
          {scanReceiptLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Upload Receipt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}