"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getYear } from "date-fns";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function Footer() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  const currentYear = getYear(new Date());

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: isReducedMotion ? "auto" : "smooth",
    });
  };

  if (!isLandingPage) {
    return (
      <footer className="w-full border-t border-border/40 bg-muted/40 transition-colors duration-300">
        <div className="py-8 sm:py-10 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <p>&copy; {currentYear} Save. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer
      ref={ref}
      className="w-full border-t border-slate-200/80 dark:border-[#1E2736] bg-[#F8FAFC] dark:bg-[#0B0E13] transition-colors duration-300"
    >
      <div className="w-full px-[26px] sm:px-[34px] md:px-[42px] lg:px-[50px] xl:px-[66px] pt-12 sm:pt-14 lg:pt-16 pb-8 sm:pb-10">
        {/* Main Editorial Content: Asymmetrical Two-Column Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 sm:gap-14 lg:gap-16">
          {/* Left Column: Brand & Navigation */}
          <div
            className={cn(
              "flex flex-col justify-between self-stretch shrink-0 transition-all duration-600 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {/* SAVE Brand Logo */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm"
                aria-label="Save Home"
              >
                <Image
                  src="/logo-light.png"
                  alt="Save Logo"
                  width={130}
                  height={35}
                  className="block dark:hidden h-8 sm:h-9 w-auto max-w-[130px]"
                />
                <Image
                  src="/logo-dark.png"
                  alt="Save Logo"
                  width={130}
                  height={35}
                  className="hidden dark:block h-8 sm:h-9 w-auto max-w-[130px]"
                />
              </Link>
            </div>

            {/* Clean Horizontal Navigation Links */}
            <nav
              aria-label="Footer Navigation"
              className="mt-6 sm:mt-8 flex items-center gap-6 sm:gap-8 flex-wrap"
            >
              <Link
                href="/#features"
                className="text-[14px] sm:text-[14.5px] font-medium text-[#334155] dark:text-[#CBD5E1] hover:text-[#059669] dark:hover:text-[#10B981] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-[14px] sm:text-[14.5px] font-medium text-[#334155] dark:text-[#CBD5E1] hover:text-[#059669] dark:hover:text-[#10B981] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm"
              >
                Workflow
              </Link>
              <Link
                href="/sign-in"
                className="text-[14px] sm:text-[14.5px] font-medium text-[#334155] dark:text-[#CBD5E1] hover:text-[#059669] dark:hover:text-[#10B981] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-[14px] sm:text-[14.5px] font-medium text-[#334155] dark:text-[#CBD5E1] hover:text-[#059669] dark:hover:text-[#10B981] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm"
              >
                Sign Up
              </Link>
            </nav>
          </div>

          {/* Right Column: Bold Typographic Brand Signature */}
          <div
            className={cn(
              "flex flex-col items-start lg:items-end text-left lg:text-right transition-all duration-600 ease-out delay-100 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[72px] font-bold tracking-tight text-[#111827] dark:text-[#F4F5F7] leading-[1.05]">
              Spend smarter.
              <br />
              <span className="text-[#059669] dark:text-[#10B981]">
                Save faster.
              </span>
            </h2>
          </div>
        </div>

        {/* Bottom Row: Subtle Divider, Dynamic Copyright & Back to Top */}
        <div
          className={cn(
            "mt-12 sm:mt-14 lg:mt-16 pt-6 sm:pt-8 border-t border-slate-200/80 dark:border-[#1E2736] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12.5px] sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] transition-all duration-600 ease-out delay-200 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          )}
        >
          <p>&copy; {currentYear} Save. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 self-start sm:self-auto text-[12.5px] sm:text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#059669] dark:hover:text-[#10B981] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#10B981] rounded-sm cursor-pointer"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
