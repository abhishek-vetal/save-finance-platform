"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PlusCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import PlaidLinkButton from "@/components/plaid-link-button";

export default function Header() {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex h-16 items-center justify-between">
          {/* logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-light.png"
              alt="Save Logo"
              width={200}
              height={50}
              priority
              className="block dark:hidden w-28 h-auto"
            />
            <Image
              src="/logo-dark.png"
              alt="Save Logo"
              width={200}
              height={50}
              priority
              className="hidden dark:block w-28 h-auto"
            />
          </Link>

          {/* right section */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle />

            <Show when="signed-in">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="h-9 px-3.5 gap-2 rounded-lg text-xs sm:text-sm font-medium border-border/60 bg-background hover:bg-muted text-foreground transition-colors duration-150"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              {/* plaid link button */}
              <PlaidLinkButton
                variant="outline"
                className="border-border/60 bg-background hover:bg-muted text-foreground"
              />

              <Link href="/transactions/create">
                <Button className="gap-2 h-9 px-3.5 rounded-lg font-medium text-xs sm:text-sm transition-colors duration-150">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Transaction</span>
                </Button>
              </Link>

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

            <Show when="signed-out">
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3.5 rounded-lg text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                >
                  Login
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150"
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