"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, PlusCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useEffect } from "react";
import PlaidLinkButton from "@/components/plaid-link-button";

export default function Header() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isAuthApp = !isLandingPage;

  useEffect(() => {
    if (isLandingPage && typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [isLandingPage]);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const isReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollIntoView({ behavior: isReducedMotion ? "auto" : "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="w-full px-[26px] sm:px-[34px] md:px-[42px] lg:px-[50px] xl:px-[66px]">
        <nav className="relative flex h-20 items-center justify-between">
          {/* logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (isLandingPage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center shrink-0"
          >
            <Image
              src="/logo-light.png"
              alt="Save Logo"
              width={200}
              height={54}
              priority
              className="block dark:hidden h-7 sm:h-9 w-auto"
            />
            <Image
              src="/logo-dark.png"
              alt="Save Logo"
              width={200}
              height={54}
              priority
              className="hidden dark:block h-7 sm:h-9 w-auto"
            />
          </Link>

          {/* Centered navigation links - Landing page only */}
          {isLandingPage && (
            <div className="hidden md:flex items-center gap-7 lg:gap-8 absolute left-1/2 -translate-x-1/2">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
                className="text-sm font-medium text-muted-foreground hover:text-[#059669] dark:hover:text-[#10B981] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm cursor-pointer"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, "how-it-works")}
                className="text-sm font-medium text-muted-foreground hover:text-[#059669] dark:hover:text-[#10B981] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm cursor-pointer"
              >
                Workflow
              </a>
            </div>
          )}

          {/* right section */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            <Show when="signed-in">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="h-9 px-3 sm:px-3.5 gap-2 rounded-lg text-xs sm:text-sm font-medium border-border/60 bg-background hover:bg-muted text-foreground transition-colors duration-150"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              {/* In authenticated application navigation only */}
              {isAuthApp && (
                <>
                  {/* plaid link button */}
                  <PlaidLinkButton
                    variant="outline"
                    className="border-border/60 bg-background hover:bg-muted text-foreground rounded-lg"
                  />

                  <Link href="/transactions/create">
                    <Button className="gap-2 h-9 px-3 sm:px-3.5 rounded-lg font-medium text-xs sm:text-sm transition-colors duration-150">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Add Transaction</span>
                    </Button>
                  </Link>
                </>
              )}

              <div className="flex items-center pl-1">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: "32px",
                        height: "32px",
                      },
                    },
                  }}
                />
              </div>
            </Show>

            <Show when="signed-out" treatPendingAsSignedOut>
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-200"
                >
                  Login
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button
                  size="sm"
                  className="h-9 px-3.5 sm:px-5 rounded-lg text-xs sm:text-sm font-semibold bg-[#10B981] text-[#080B0F] hover:bg-[#34D399] shadow-sm border border-transparent transition-colors duration-150"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </Show>
          </div>
        </nav>
      </div>
    </header>
  );
}