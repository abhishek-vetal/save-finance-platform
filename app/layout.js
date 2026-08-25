// This is the layout for the entire app.

import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeAwareToaster } from "@/components/theme-toaster";


// create font configuration.
const inter = Inter({ subsets: ["latin"] }); 

// Next.js uses the exported metadata object to generate the appropriate HTML metadata for the application.
export const metadata = {
  title: "Save",
  description: "One Stop Finance",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      // suppressHydrationWarning is a React prop that turns off console warning messages when the server-rendered HTML doesn’t match the client-rendered output
      suppressHydrationWarning
      // here font configuration will be applied
      className={inter.className}
      >
      {/* A provider makes certain functionality/context available to components underneath it. */}
      <ClerkProvider>
        <body className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}

            <ThemeAwareToaster />
          </ThemeProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
