"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function TopBarStats() {
  const stats = [
    { label: "Coins", value: "12,345" },
    { label: "Markets", value: "6,789" },
    { label: "Market Cap", value: "$1.23T" },
    { label: "24h Vol", value: "$67.1B" },
    { label: "BTC Dominance", value: "51.2%" },
    { label: "ETH Dominance", value: "18.9%" },
  ]

  return (
    <div className="w-full px-4 py-2 border-b border-border text-sm text-muted-foreground">
      <div className="w-full flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          {stats.map(({ label, value }) => (
            <span key={label} className="flex items-center gap-2">
              <Badge variant="default" className="px-2 py-1 text-xs rounded-md">
                {label}
              </Badge>
              <span className="font-medium">{value}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <Button className="font-mono">Login</Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>DC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
