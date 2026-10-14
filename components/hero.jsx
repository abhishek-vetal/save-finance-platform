"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const COUNT_NUMBERS = [
  { num: "1", delay: "0s" },
  { num: "2", delay: "1.15s" },
  { num: "3", delay: "2.3s" },
  { num: "4", delay: "3.45s" },
  { num: "5", delay: "4.6s" },
];

export default function Hero() {
  return (
    <section className="w-full overflow-x-clip">
      <div className="mx-auto w-full max-w-[1240px] xl:max-w-[1300px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-6 sm:pb-8 lg:pb-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8 xl:gap-12">
          {/* Left column: deliberate headline typography, description, CTA */}
          <div className="w-full lg:w-[56%] xl:w-[56%] flex flex-col items-start text-left z-10 shrink-0">
            <h1 className="text-4xl sm:text-5xl md:text-[58px] lg:text-[64px] xl:text-[72px] font-bold tracking-tight text-foreground dark:text-white leading-[1.05] animate-hero-fade-in">
              Your money.
              <br />
              <span className="text-[#059669] dark:text-[#10B981]">
                In focus.
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-[20px] leading-relaxed text-muted-foreground max-w-[500px] animate-hero-fade-in [animation-delay:100ms]">
              Track spending, manage budgets, and understand your financial habits
              in one place.
            </p>

            <div className="mt-7 sm:mt-8 flex items-center animate-hero-fade-in [animation-delay:200ms]">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-[52px] px-8 rounded-xl text-base sm:text-[17px] font-semibold bg-foreground text-background hover:bg-foreground/90 gap-2.5 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column: prominent, centered mascot visual with holographic counting */}
          <div className="w-full lg:w-[44%] xl:w-[44%] flex items-center justify-center relative animate-hero-fade-in [animation-delay:150ms]">
            <div className="relative w-full max-w-[280px] sm:max-w-[330px] md:max-w-[370px] lg:max-w-[410px] xl:max-w-[440px] flex items-center justify-center translate-y-2 sm:translate-y-3 lg:translate-y-4 lg:-translate-x-4 xl:-translate-x-6">
              {/* Subtle ambient teal/emerald glow for brand separation */}
              <div
                className="absolute w-[80%] h-[80%] top-[10%] left-[10%] bg-emerald-500/[0.08] dark:bg-emerald-500/[0.14] rounded-full blur-3xl pointer-events-none -z-10"
                aria-hidden="true"
              />

              {/* Floating wrapper ensuring mascot and floating holographic numbers stay synchronized */}
              <div className="relative w-full flex items-center justify-center animate-float">
                <Image
                  src="/banner.png"
                  alt="SAVE Mascot Assistant"
                  width={1132}
                  height={1389}
                  priority
                  className="w-full h-auto object-contain select-none transition-transform duration-300 hover:scale-[1.015]"
                />

                {/* Subtle holographic calculation numbers emerging from above robot head */}
                <div
                  className="absolute top-[2%] left-[46%] pointer-events-none"
                  aria-hidden="true"
                >
                  {COUNT_NUMBERS.map(({ num, delay }) => (
                    <span
                      key={num}
                      style={{ animationDelay: delay }}
                      className="animate-hologram-number absolute top-0 left-0 font-mono text-[13px] sm:text-[15px] font-bold text-cyan-600 dark:text-cyan-300 select-none pointer-events-none drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] dark:drop-shadow-[0_0_12px_rgba(34,211,238,0.95)] tracking-wider"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
