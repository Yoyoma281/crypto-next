'use client';
import React, { useState } from "react";

export default function AnimatedButton() {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    // Trigger animation
    setIsAnimating(true);

    // Reset after animation ends (e.g., 1s)
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-3 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 ${
        isAnimating ? "animate-pulse" : ""
      }`}
    >
      Click Me
    </button>
  );
}
