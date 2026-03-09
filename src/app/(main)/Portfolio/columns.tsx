'use client';

import { portfolioCoin } from "@/app/types/coin";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

function fmtAmount(val: string) {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("en-US", { maximumFractionDigits: 8 });
}

function fmtWorth(val: string) {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const columns: ColumnDef<portfolioCoin>[] = [
  {
    id: "rank",
    header: "#",
    cell: (props) => (
      <span className="text-muted-foreground text-sm font-medium">
        {props.row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: "symbol",
    header: "Asset",
    cell: (props) => {
      const sym = props.getValue() as string;
      const ticker = sym.replace(/USDT$/i, "").replace("/", "");
      return (
        <div className="flex items-center gap-3">
          <Image
            src={`../Coin-icons/${ticker.toLowerCase()}.svg`}
            alt={ticker}
            width={32}
            height={32}
            className="rounded-full"
            onError={() => {}}
          />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[14px]">{ticker || sym}</span>
            <span className="text-muted-foreground text-[12px]">{sym}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Holdings",
    cell: (props) => (
      <span className="font-medium text-[14px]">
        {fmtAmount(props.getValue() as string)}
      </span>
    ),
  },
  {
    accessorKey: "CurrentWorth",
    header: "Current Value",
    cell: (props) => (
      <span className="font-semibold text-[14px]">
        {fmtWorth(props.getValue() as string)}
      </span>
    ),
  },
];
