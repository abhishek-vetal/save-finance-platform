"use client";

import React from "react";
import {
  RefreshCw,
  BarChart3,
  PieChart,
  Receipt,
  Repeat,
  ScanText,
  Landmark,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function FeaturesSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="features"
      ref={ref}
      className="w-full bg-[#F8FAFC] dark:bg-[#0B0E13] py-14 sm:py-18 lg:py-20 transition-colors duration-300"
    >
      <div className="mx-auto w-full max-w-[1240px] xl:max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div
          className={cn(
            "text-center max-w-2xl mx-auto transition-all duration-600 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          )}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-[#111827] dark:text-[#F4F5F7] leading-tight">
            Features
          </h2>
          <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-[#64748B] dark:text-[#A0A8B5] leading-relaxed">
            Everything you need to manage your finances
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* CARD 1: Automatic Bank Sync */}
          <div
            style={{ transitionDelay: isVisible ? "80ms" : "0ms" }}
            className={cn(
              "group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-[#3D4756] hover:-translate-y-[2px] motion-reduce:transform-none hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500 ease-out cursor-default",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
          >
            <div>
              {/* Header: Icon & Plaid Label */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100/80 dark:bg-[#171D27] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5] flex items-center justify-center transition-colors duration-200 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]">
                  <RefreshCw className="h-4.5 w-4.5" />
                </div>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight text-[#64748B] dark:text-[#A0A8B5] bg-slate-100/60 dark:bg-[#171D27] border border-[#E2E8F0] dark:border-[#29313D]">
                  Powered by Plaid
                </span>
              </div>

              <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#111827] dark:text-[#F4F5F7] leading-snug">
                Automatic Bank Sync
              </h3>

              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B] dark:text-[#A0A8B5]">
                Connect a supported bank account through Plaid and automatically sync eligible transactions into SAVE, reducing the need for manual transaction entry.
              </p>
            </div>

            {/* Visual Preview: Bank Connection Flow */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] dark:bg-[#171D27] border border-[#E2E8F0]/80 dark:border-[#29313D]/80 p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                {/* Bank chip */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] shrink-0">
                  <Landmark className="h-3.5 w-3.5 text-[#64748B] dark:text-[#A0A8B5]" />
                  <span className="text-[11.5px] font-medium text-[#111827] dark:text-[#F4F5F7]">Chase Checking</span>
                </div>

                {/* Animated sync indicator */}
                <span className="text-[10px] font-semibold text-[#059669] dark:text-[#65D6AC] bg-[#ECFDF5] dark:bg-[#65D6AC]/15 px-2 py-0.5 rounded-full">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#E2E8F0] dark:border-[#29313D]/80 text-[10.5px] text-[#64748B] dark:text-[#A0A8B5]">
                <span>Automated ledger sync</span>
                <span className="flex items-center gap-1 font-medium text-[#059669] dark:text-[#65D6AC]">
                  <Check className="h-3 w-3" />
                  <span>{"Live feed"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: Financial Dashboard */}
          <div
            style={{ transitionDelay: isVisible ? "160ms" : "0ms" }}
            className={cn(
              "group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-[#3D4756] hover:-translate-y-[2px] motion-reduce:transform-none hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500 ease-out cursor-default",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100/80 dark:bg-[#171D27] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5] flex items-center justify-center transition-colors duration-200 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]">
                  <BarChart3 className="h-4.5 w-4.5" />
                </div>
              </div>

              <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#111827] dark:text-[#F4F5F7] leading-snug">
                Financial Dashboard
              </h3>

              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B] dark:text-[#A0A8B5]">
                Get a clear overview of your accounts, balances, spending, and financial activity from one dashboard.
              </p>
            </div>

            {/* Visual Preview: Spending Chart Visualization */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] dark:bg-[#171D27] border border-[#E2E8F0]/80 dark:border-[#29313D]/80 p-3.5 flex flex-col justify-between h-[116px]">
              <div className="flex items-center justify-between text-[10.5px]">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#64748B] dark:text-[#A0A8B5]">Income:</span>
                  <span className="font-semibold text-[#059669] dark:text-[#65D6AC]">+$4,250</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#64748B] dark:text-[#A0A8B5]">Expense:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">-$1,850</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#64748B] dark:text-[#A0A8B5]">Net:</span>
                  <span className="font-semibold text-[#111827] dark:text-[#F4F5F7]">+$2,400</span>
                </div>
              </div>

              {/* Chart Bars */}
              <div className="flex items-end justify-between gap-2.5 pt-2 pb-1 border-b border-[#E2E8F0] dark:border-[#29313D]">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#E2E8F0] dark:bg-[#29313D] rounded-t-sm transition-all duration-700 ease-out"
                    style={{ height: isVisible ? "32px" : "0px", transitionDelay: "250ms" }}
                  />
                  <span className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5]">May</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#E2E8F0] dark:bg-[#29313D] rounded-t-sm transition-all duration-700 ease-out"
                    style={{ height: isVisible ? "44px" : "0px", transitionDelay: "300ms" }}
                  />
                  <span className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5]">Jun</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#E2E8F0] dark:bg-[#29313D] rounded-t-sm transition-all duration-700 ease-out"
                    style={{ height: isVisible ? "28px" : "0px", transitionDelay: "350ms" }}
                  />
                  <span className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5]">Jul</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#E2E8F0] dark:bg-[#29313D] rounded-t-sm transition-all duration-700 ease-out"
                    style={{ height: isVisible ? "52px" : "0px", transitionDelay: "400ms" }}
                  />
                  <span className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5]">Aug</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#059669] dark:bg-[#65D6AC] rounded-t-sm shadow-xs transition-all duration-700 ease-out"
                    style={{ height: isVisible ? "60px" : "0px", transitionDelay: "450ms" }}
                  />
                  <span className="text-[9.5px] font-semibold text-[#059669] dark:text-[#65D6AC]">Now</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Budget Management */}
          <div
            style={{ transitionDelay: isVisible ? "240ms" : "0ms" }}
            className={cn(
              "group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-[#3D4756] hover:-translate-y-[2px] motion-reduce:transform-none hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500 ease-out cursor-default",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100/80 dark:bg-[#171D27] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5] flex items-center justify-center transition-colors duration-200 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]">
                  <PieChart className="h-4.5 w-4.5" />
                </div>
              </div>

              <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#111827] dark:text-[#F4F5F7] leading-snug">
                Budget Management
              </h3>

              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B] dark:text-[#A0A8B5]">
                Set budgets, track your spending, and monitor your expenses to stay aware of your financial limits.
              </p>
            </div>

            {/* Visual Preview: Budget Progress with Champagne-Gold Accent */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] dark:bg-[#171D27] border border-[#E2E8F0]/80 dark:border-[#29313D]/80 p-3.5 flex flex-col justify-between h-[116px]">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-medium text-[#111827] dark:text-[#F4F5F7]">Monthly Budget</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] dark:bg-[#65D6AC]/15 text-[#059669] dark:text-[#65D6AC] border border-[#059669]/30 dark:border-[#65D6AC]/30">
                  72% Utilized
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#E2E8F0] dark:bg-[#29313D] h-2.5 rounded-full overflow-hidden my-auto">
                <div
                  className="h-full rounded-full bg-[#059669] dark:bg-[#65D6AC] transition-all duration-700 ease-out"
                  style={{ width: isVisible ? "72%" : "0%", transitionDelay: "350ms" }}
                />
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-[#64748B] dark:text-[#A0A8B5]">
                <span>Remaining budget healthy</span>
                <span className="font-medium text-[#111827] dark:text-[#F4F5F7]">8 days left</span>
              </div>
            </div>
          </div>

          {/* CARD 4: Transaction Tracking */}
          <div
            style={{ transitionDelay: isVisible ? "320ms" : "0ms" }}
            className={cn(
              "group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-[#3D4756] hover:-translate-y-[2px] motion-reduce:transform-none hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500 ease-out cursor-default",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100/80 dark:bg-[#171D27] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5] flex items-center justify-center transition-colors duration-200 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]">
                  <Receipt className="h-4.5 w-4.5" />
                </div>
              </div>

              <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#111827] dark:text-[#F4F5F7] leading-snug">
                Transaction Tracking
              </h3>

              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B] dark:text-[#A0A8B5]">
                Create and manage income and expense transactions with categories, descriptions, dates, and account-level tracking.
              </p>
            </div>

            {/* Visual Preview: Transaction Rows */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] dark:bg-[#171D27] border border-[#E2E8F0]/80 dark:border-[#29313D]/80 p-2.5 flex flex-col gap-2 h-[116px] justify-center">
              {/* Row 1: Expense */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D]">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px]">
                    <ArrowDownLeft className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#111827] dark:text-[#F4F5F7] leading-tight">Whole Foods</p>
                    <p className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5] leading-tight">Groceries • Today</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">-$84.20</span>
              </div>

              {/* Row 2: Income */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D]">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#ECFDF5] dark:bg-[#65D6AC]/15 text-[#059669] dark:text-[#65D6AC] flex items-center justify-center text-[10px]">
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#111827] dark:text-[#F4F5F7] leading-tight">Client Direct Deposit</p>
                    <p className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5] leading-tight">Income • Checking</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#059669] dark:text-[#65D6AC]">+$2,450.00</span>
              </div>
            </div>
          </div>

          {/* CARD 5: Recurring Transactions */}
          <div
            style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
            className={cn(
              "group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-[#3D4756] hover:-translate-y-[2px] motion-reduce:transform-none hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500 ease-out cursor-default",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100/80 dark:bg-[#171D27] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5] flex items-center justify-center transition-colors duration-200 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]">
                  <Repeat className="h-4.5 w-4.5" />
                </div>
              </div>

              <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#111827] dark:text-[#F4F5F7] leading-snug">
                Recurring Transactions
              </h3>

              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B] dark:text-[#A0A8B5]">
                Set up recurring income or expenses and manage their schedules without manually creating every transaction.
              </p>
            </div>

            {/* Visual Preview: Recurring Schedule & Calendar Timeline */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] dark:bg-[#171D27] border border-[#E2E8F0]/80 dark:border-[#29313D]/80 p-2.5 flex flex-col gap-2 h-[116px] justify-center">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#059669] dark:text-[#65D6AC]" />
                  <div>
                    <p className="text-[11px] font-medium text-[#111827] dark:text-[#F4F5F7] leading-tight">Software Subscription</p>
                    <p className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5] leading-tight">Monthly • 1st of month</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#ECFDF5] dark:bg-[#65D6AC]/15 text-[#059669] dark:text-[#65D6AC]">
                  Auto-scheduled
                </span>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#64748B] dark:text-[#A0A8B5]" />
                  <div>
                    <p className="text-[11px] font-medium text-[#111827] dark:text-[#F4F5F7] leading-tight">Gym Membership</p>
                    <p className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5] leading-tight">Monthly • Next in 14d</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#64748B] dark:text-[#A0A8B5]">Active</span>
              </div>
            </div>
          </div>

          {/* CARD 6: AI Receipt Scanning */}
          <div
            style={{ transitionDelay: isVisible ? "480ms" : "0ms" }}
            className={cn(
              "group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-[#3D4756] hover:-translate-y-[2px] motion-reduce:transform-none hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500 ease-out cursor-default",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100/80 dark:bg-[#171D27] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5] flex items-center justify-center transition-colors duration-200 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]">
                  <ScanText className="h-4.5 w-4.5" />
                </div>
              </div>

              <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#111827] dark:text-[#F4F5F7] leading-snug">
                AI Receipt Scanning
              </h3>

              <p className="mt-2 text-[14px] leading-relaxed text-[#64748B] dark:text-[#A0A8B5]">
                Scan receipts and extract relevant transaction details to make recording expenses easier.
              </p>
            </div>

            {/* Visual Preview: Receipt Outline with Extracted Fields */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] dark:bg-[#171D27] border border-[#E2E8F0]/80 dark:border-[#29313D]/80 p-3 flex items-center justify-between gap-3 h-[116px]">
              {/* Receipt slip */}
              <div className="flex-1 bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] rounded-lg p-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-dashed border-[#E2E8F0] dark:border-[#29313D] pb-1.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-[#111827] dark:text-[#F4F5F7]">Trader Joe&apos;s</span>
                  <span className="text-[9.5px] text-[#64748B] dark:text-[#A0A8B5]">Oct 12</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-[#A0A8B5]">
                  <span>Category:</span>
                  <span className="font-medium text-[#111827] dark:text-[#F4F5F7]">Groceries</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px] font-semibold text-[#111827] dark:text-[#F4F5F7] pt-1">
                  <span>Total:</span>
                  <span className="text-[#059669] dark:text-[#65D6AC]">$38.40</span>
                </div>
              </div>

              {/* Extraction badge */}
              <div className="flex flex-col items-center justify-center px-3 py-2.5 rounded-lg bg-[#ECFDF5] dark:bg-[#65D6AC]/15 border border-[#059669]/20 dark:border-[#65D6AC]/30 shrink-0 text-center">
                <span className="text-[9.5px] font-bold text-[#059669] dark:text-[#65D6AC] leading-tight">AI Parsed</span>
                <span className="text-[8.5px] text-[#059669]/80 dark:text-[#65D6AC]/80 leading-tight mt-0.5">Auto-filled</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
