'use client';

import React from 'react';

type NewsTickerProps = {
    headlines: string[];
    speed?: number; // in seconds
};

export default function NewsTicker({ headlines, speed = 30 }: NewsTickerProps) {
    const newsText = headlines.join(' • ') + ' • '; // Repeatable headline loop

    return (
        <div className="relative w-full overflow-hidden h-10 bg-site-bg group">
            {/* Fading edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-site-bg to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-site-bg to-transparent z-10" />

            {/* Scrolling text */}
            <div
                className="inline-block whitespace-nowrap text-sm font-medium text-white animate-marquee group-hover:pause-animation"
                style={{
                    animationDuration: `${speed}s`,
                    paddingLeft: '100%',
                }}
            >
                {newsText.repeat(3)}
            </div>
        </div>
    );
}
