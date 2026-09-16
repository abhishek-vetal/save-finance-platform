"use client";

import React from "react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <span className="text-2xl sm:text-[1.85rem] font-black tracking-tighter font-sans leading-none">
        <span className="bg-linear-to-br from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-300 dark:to-indigo-400 bg-clip-text text-transparent">
          S
        </span>
        <span className="bg-linear-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
          ave
        </span>
      </span>
    </div>
  );
}
