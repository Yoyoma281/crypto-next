'use client';

import React from 'react';

type NewsTickerProps = {
    headlines: string[];
    speed?: number; // in seconds
};

export default function NewsTicker({ headlines, speed = 30 }: NewsTickerProps) {
    const newsText = headlines.join(' • ') + ' • '; // Repeatable headline loop

    return (
        <div className="relative w-full overflow-hidden bg-gray-100 h-10">
            {/* Fading edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-gray-100 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-gray-100 to-transparent z-10" />

            {/* Scrolling text */}
            <div
                className="absolute whitespace-nowrap text-sm text-gray-800 animate-marquee"
                style={{
                    animationDuration: `${speed}s`,
                }}
            >
                {newsText.repeat(2)}
            </div>
        </div>
    );
}
