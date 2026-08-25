"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const imageRef = React.useRef(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const tilt = Math.max(0, 5 - scrolled * 0.05);

      if (imageRef.current) {
        imageRef.current.style.transform = `perspective(1000px) rotateX(${tilt}deg)`;
      }
    };

    if (imageRef.current) {
      imageRef.current.style.transform = `perspective(1000px) rotateX(15deg)`;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="container mx-auto flex flex-col items-center px-4 text-center md:px-6">
      {/* Hero title with different gradients in light/dark */}
      <h1 className="pb-3 mt-10 text-5xl font-bold tracking-tight md:text-[110px] leading-none gradient">
        Manage Your Finances <br />
        With Intelligence
      </h1>

      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
        An AI-powered financial management platform that helps you track,
        analyze, and optimize your spending with real-time insights.
      </p>

      <Link href="/dashboard">
        <Button
          size="lg"
          className="mt-8 px-8 py-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          Get Started
        </Button>
      </Link>

      {/* Hero image with glass effect */}
      <div
        ref={imageRef}
        className="hero-image-div mt-20 mx-4 overflow-hidden rounded-3xl shadow-2xl will-change-transform"
      >
        <Image
          src="/banner.png"
          alt="banner image"
          width={1300}
          height={500}
        />
      </div>
    </div>
  );
}
