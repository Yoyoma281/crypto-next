"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Router from "next/navigation";
import { Navbar } from "./navbar";
import { links } from "../data/links";
import { Coins, Grid, BarChart2, TrendingUp, Bitcoin, Percent } from "lucide-react";

export default function TopBarStats() {
  const stats = [
    { label: "Coins", value: "12,345", icon: Coins },
    { label: "Markets", value: "6,789", icon: Grid },
    { label: "Market Cap", value: "$1.23T", icon: BarChart2 },
    { label: "24h Vol", value: "$67.1B", icon: TrendingUp },
    { label: "BTC Dominance", value: "51.2%", icon: Bitcoin },
    { label: "Change", value: "18.9%", icon: Percent },
  ];
  const router = Router.useRouter();

  const RedirectPortfolio = () => router.push(`/Portfolio`);

  return (
    <div className="sticky top-0 w-full px-3 py-1 border-b border-border text-xs text-muted-foreground bg-site-bg z-50">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Stats */}
        <div className="flex items-center gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center gap-1">
                <Icon className="h-4 w-4 text-crypto-orange" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navbar */}
        <Navbar links={links} />

        {/* Buttons & Avatar */}
        <div className="flex items-center gap-2">
          <Button onClick={RedirectPortfolio} className="text-xs px-2 py-1 font-mono bg-crypto-dark-blue">Portfolio</Button>
          <Button className="text-xs px-2 py-1 bg-crypto-dark-blue">Login</Button>
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>DC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
