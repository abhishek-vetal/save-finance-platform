"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { UserPlus, Landmark, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const STEP_DURATION = 1500;

const STEPS_DATA = [
  {
    id: "01",
    stepNum: "01",
    stepTitle: "Create Account",
    mobileLabel: "Create Account",
    icon: UserPlus,
  },
  {
    id: "02",
    stepNum: "02",
    stepTitle: "Connect or Add Account",
    mobileLabel: "Connect or Add Account",
    icon: Landmark,
  },
  {
    id: "03",
    stepNum: "03",
    stepTitle: "Manage Finances",
    mobileLabel: "Manage Finances",
    icon: BarChart3,
  },
];

function subscribeReducedMotion(callback) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function subscribeVisibility(callback) {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getVisibilitySnapshot() {
  if (typeof document === "undefined") return true;
  return !document.hidden;
}

function getVisibilityServerSnapshot() {
  return true;
}

export default function HowItWorksSection() {
  const { ref: sectionRef, isVisible: isSectionVisible } = useScrollReveal({ threshold: 0.15 });
  const [activeStep, setActiveStep] = useState("01");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const isPageVisible = useSyncExternalStore(
    subscribeVisibility,
    getVisibilitySnapshot,
    getVisibilityServerSnapshot
  );

  // Automatic 1.5-second step cycling
  useEffect(() => {
    if (
      isHovered ||
      isFocused ||
      prefersReducedMotion ||
      !isPageVisible
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setActiveStep((current) => {
        const currentIndex = STEPS_DATA.findIndex((s) => s.id === current);
        const nextIndex = (currentIndex + 1) % STEPS_DATA.length;
        return STEPS_DATA[nextIndex].id;
      });
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [
    activeStep,
    isHovered,
    isFocused,
    prefersReducedMotion,
    isPageVisible,
  ]);

  const handleManualSelect = useCallback((id) => {
    setActiveStep(id);
  }, []);

  const handleKeyDown = (e, currentIndex) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % STEPS_DATA.length;
      handleManualSelect(STEPS_DATA[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + STEPS_DATA.length) % STEPS_DATA.length;
      handleManualSelect(STEPS_DATA[prevIndex].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleManualSelect(STEPS_DATA[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      handleManualSelect(STEPS_DATA[STEPS_DATA.length - 1].id);
    }
  };

  // Progress width along the connecting line (0% for step 01, 50% for step 02, 100% for step 03)
  const progressWidth =
    activeStep === "01" ? "0%" : activeStep === "02" ? "50%" : "100%";

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="w-full my-[5px] py-20 sm:py-24 lg:py-28 transition-colors duration-300"
    >
      <div className="mx-auto w-full max-w-[1240px] xl:max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Subtitle with entrance animation */}
        <div
          className={cn(
            "text-center max-w-2xl mx-auto transition-all duration-600 ease-out",
            isSectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          )}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-[#111827] dark:text-[#F4F5F7] leading-tight">
            How It Works
          </h2>
          <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-[#64748B] dark:text-[#A0A8B5] leading-relaxed">
            Get started in minutes and bring your financial activity into one place.
          </p>
        </div>

        {/* Minimal Connected Stepper with Automatic Cycling & Hover Pause */}
        <div
          className="mt-12 sm:mt-14 max-w-3xl xl:max-w-4xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsFocused(false);
            }
          }}
        >
          {/* Desktop/Tablet Horizontal Stepper with Connecting Line */}
          <div className="hidden sm:block relative">
            {/* Horizontal Connecting Line with entrance draw from left to right */}
            <div
              className={cn(
                "absolute top-6 left-[16.67%] right-[16.67%] h-[1.5px] bg-[#E2E8F0] dark:bg-[#29313D] -z-0 overflow-hidden transition-all duration-700 ease-out",
                isSectionVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 origin-left"
              )}
              aria-hidden="true"
            >
              <div
                className="h-full bg-gradient-to-r from-[#059669] to-[#10B981] dark:from-[#65D6AC] dark:to-[#34D399] transition-all duration-300 ease-in-out"
                style={{ width: progressWidth }}
              />
            </div>

            <div
              className="grid grid-cols-3 gap-4 relative z-10"
              role="tablist"
              aria-label="Workflow Steps"
            >
              {STEPS_DATA.map((step, idx) => {
                const isSelected = activeStep === step.id;
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    id={`step-tab-${step.id}`}
                    aria-selected={isSelected}
                    onClick={() => handleManualSelect(step.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    style={{ transitionDelay: isSectionVisible ? `${idx * 100 + 150}ms` : "0ms" }}
                    className={cn(
                      "group relative flex flex-col items-center text-center py-2 px-3 rounded-lg transition-all duration-500 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#65D6AC] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0E13]",
                      isSectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                  >
                    {/* Node with Icon and Step Number */}
                    <div className="relative">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out",
                          isSelected
                            ? "bg-[#059669] dark:bg-[#65D6AC] text-white dark:text-[#0B0E13] shadow-sm ring-4 ring-[#ECFDF5] dark:ring-[#65D6AC]/20"
                            : "bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5] group-hover:border-[#059669]/40 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 h-[22px] w-[22px] rounded-full flex items-center justify-center text-[10.5px] font-bold font-sans tabular-nums ring-2 ring-white dark:ring-[#080B0F] shadow-xs transition-all duration-300 ease-in-out",
                          isSelected
                            ? "bg-[#111827] dark:bg-white text-white dark:text-[#0B0E13]"
                            : "bg-[#F8FAFC] dark:bg-[#161D27] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#2A3442] group-hover:border-[#059669]/40 group-hover:text-[#059669] dark:group-hover:text-[#65D6AC]"
                        )}
                      >
                        {step.stepNum}
                      </span>
                    </div>

                    {/* Step Title */}
                    <span
                      className={cn(
                        "mt-3 text-[13.5px] md:text-[14px] lg:text-[14.5px] font-semibold tracking-tight leading-snug text-center transition-colors duration-300 sm:whitespace-nowrap",
                        isSelected
                          ? "text-[#111827] dark:text-[#F4F5F7]"
                          : "text-[#64748B] dark:text-[#A0A8B5] group-hover:text-[#111827] dark:group-hover:text-[#F4F5F7]"
                      )}
                    >
                      {step.stepTitle}
                    </span>

                    {/* Active Accent Underline */}
                    <div
                      className={cn(
                        "mt-2.5 h-[2.5px] rounded-full transition-all duration-300 ease-in-out",
                        isSelected
                          ? "w-10 sm:w-12 bg-[#059669] dark:bg-[#65D6AC] opacity-100"
                          : "w-0 bg-transparent opacity-0"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Horizontal Stepper */}
          <div className="sm:hidden relative">
            {/* Horizontal line behind mobile icons with entrance draw */}
            <div
              className={cn(
                "absolute top-5 left-[16.67%] right-[16.67%] h-[1.5px] bg-[#E2E8F0] dark:bg-[#29313D] -z-0 overflow-hidden transition-all duration-700 ease-out",
                isSectionVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 origin-left"
              )}
              aria-hidden="true"
            >
              <div
                className="h-full bg-gradient-to-r from-[#059669] to-[#10B981] dark:from-[#65D6AC] dark:to-[#34D399] transition-all duration-300 ease-in-out"
                style={{ width: progressWidth }}
              />
            </div>

            <div
              className="grid grid-cols-3 gap-2 relative z-10"
              role="tablist"
              aria-label="Workflow Steps"
            >
              {STEPS_DATA.map((step, idx) => {
                const isSelected = activeStep === step.id;
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    id={`mobile-step-tab-${step.id}`}
                    aria-selected={isSelected}
                    onClick={() => handleManualSelect(step.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    style={{ transitionDelay: isSectionVisible ? `${idx * 100 + 150}ms` : "0ms" }}
                    className={cn(
                      "group relative flex flex-col items-center text-center py-1.5 px-1 rounded-lg transition-all duration-500 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
                      isSectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    )}
                  >
                    {/* Mobile Node with Icon and Step Number */}
                    <div className="relative">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out",
                          isSelected
                            ? "bg-[#059669] dark:bg-[#65D6AC] text-white dark:text-[#0B0E13] shadow-xs ring-2 ring-[#ECFDF5] dark:ring-[#65D6AC]/20"
                            : "bg-white dark:bg-[#11161E] border border-[#E2E8F0] dark:border-[#29313D] text-[#64748B] dark:text-[#A0A8B5]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[9.5px] font-bold font-sans tabular-nums ring-2 ring-white dark:ring-[#080B0F] shadow-xs transition-all duration-300 ease-in-out",
                          isSelected
                            ? "bg-[#111827] dark:bg-white text-white dark:text-[#0B0E13]"
                            : "bg-[#F8FAFC] dark:bg-[#161D27] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#2A3442]"
                        )}
                      >
                        {step.stepNum}
                      </span>
                    </div>

                    {/* Mobile Label */}
                    <span
                      className={cn(
                        "mt-2 text-[11px] font-semibold leading-tight text-center transition-colors duration-300",
                        isSelected
                          ? "text-[#111827] dark:text-[#F4F5F7]"
                          : "text-[#64748B] dark:text-[#A0A8B5]"
                      )}
                    >
                      {step.mobileLabel}
                    </span>

                    {/* Mobile Active Underline */}
                    <div
                      className={cn(
                        "mt-1.5 h-[2px] rounded-full transition-all duration-300 ease-in-out",
                        isSelected
                          ? "w-8 bg-[#059669] dark:bg-[#65D6AC] opacity-100"
                          : "w-0 bg-transparent opacity-0"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessible live region for screen readers */}
          <div aria-live="polite" className="sr-only">
            Active step: {STEPS_DATA.find((s) => s.id === activeStep)?.stepNum} -{" "}
            {STEPS_DATA.find((s) => s.id === activeStep)?.stepTitle}
          </div>
        </div>
      </div>
    </section>
  );
}
