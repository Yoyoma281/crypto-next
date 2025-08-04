'use client';

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CoinTableRow } from "@/app/types/coin";
import Sparkline from "@/app/components/sparkline";

const sparkData = [
    100, 102, 101, 105, 110, 108, 112,
    115, 113, 117, 132, 118, 119, 121.1,
    123, 122, 124, 125, 123, 105, 126.9,
    128, 127, 130, 129, 111, 101
]

export const columns: ColumnDef<CoinTableRow>[] = [
    {
        accessorKey: "symbol",
        header: "Symbol",
        cell: (props) =>
            <div className="flex items-center gap-2">
                <Image
                    src={`../Coin-icons/${(props.getValue() as string).replace("USDT", "").toLowerCase()}.svg`}
                    alt={props.getValue() as string}
                    width={30}
                    height={30}
                />
                {props.getValue() as string}
            </div>
    },
    {
        accessorKey: "lastPrice",
        header: "Latest Price",
        cell: (props) => <div>{formatPrice(props.getValue() as string)}</div>,
    },
    {
        accessorKey: "priceChange",
        header: "Price Change",
        cell: (props) => <div>{formatPrice(props.getValue() as string)}</div>,
    },
    {
        accessorKey: "priceChangePercent",
        header: "Price Change Percent",
        cell: (props) => <div>{props.getValue() as string}</div>,
    },
    {
        accessorKey: "weightedAvgPrice",
        header: "Weighted Average Price",
        cell: (props) => <div>{formatPrice(props.getValue() as string)}</div>,
    },
    {
        accessorKey: "prevClosePrice",
        header: "Previous Close Price",
        cell: (props) => <div>{formatPrice(props.getValue() as string)}</div>,
    },
    {
        accessorKey: "data",
        header: "7 days change",
        cell: () => <div>
            <Sparkline data={sparkData} />
        </div>
    }
];