"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ThemeAwareToaster() {
  const { theme } = useTheme();

  return (
    <Toaster 
      richColors 
      theme={theme} 
    />
  );
}