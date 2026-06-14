"use client";

import { useState, useEffect } from "react";

export function TypewriterText({ text, delay = 30, className = "" }: { text: string; delay?: number; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [index, text, delay]);

  return (
    <span className={className}>
      {displayedText}
      {index < text.length && <span className="animate-pulse border-r-2 border-orbit-purple ml-1 inline-block h-full">&nbsp;</span>}
    </span>
  );
}
