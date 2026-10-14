"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function HighlightsSection({ statsData }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="container mx-auto mt-6 sm:mt-8 lg:mt-10 mb-14 sm:mb-18 lg:mb-20 px-4 md:px-6"
    >
      <div
        className={cn(
          "rounded-2xl border border-border/40 bg-muted/30 dark:bg-muted/15 py-7 sm:py-8 px-4 sm:px-6 shadow-sm transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 lg:divide-x lg:divide-border/40">
          {statsData.map((item, index) => (
            <div
              key={index}
              style={{ transitionDelay: `${index * 80 + 100}ms` }}
              className={cn(
                "group flex flex-col items-center text-center px-3 sm:px-4 lg:px-6 cursor-default transition-all duration-600 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-muted/60 dark:bg-muted/30 border border-border/40 text-muted-foreground/60 dark:text-muted-foreground/50 flex items-center justify-center mb-3 transition-colors duration-200 group-hover:text-emerald-600 dark:group-hover:text-[#10B981]">
                {item.icon}
              </div>

              <h3 className="text-base font-semibold text-foreground tracking-tight transition-colors duration-200">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
