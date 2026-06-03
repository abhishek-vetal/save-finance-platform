import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaPenToSquare } from "react-icons/fa6";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="px-4 md:px-6">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/logo-light.png"
              alt="Save Logo"
              width={200}
              height={50}
              className="block dark:hidden w-30 h-11"
            />
            <Image
              src="/logo-dark.png"
              alt="Save Logo"
              width={200}
              height={50}
              className="hidden dark:block w-30 h-11"
            />
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Show when="signed-in">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="gap-2 p-5 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <LuLayoutDashboard className="text-[18px]" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>

              <Link href="/transactions/create">
                <Button className="gap-2 p-5 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <FaPenToSquare className="text-[16px]" />
                  <span className="hidden md:inline">Add transactions</span>
                </Button>
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: "35px",
                      height: "35px",
                    },
                  },
                }}
              />
            </Show>

            <Show when="signed-out">
              <SignInButton>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Login
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Sign-up
                </Button>
              </SignUpButton>
            </Show>
          </div>
        </nav>
      </div>
    </header>
  );
}
