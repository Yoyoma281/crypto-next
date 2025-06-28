'use client';

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CoinPortfolioData } from "@/app/types/coin";


export const columns: ColumnDef<CoinPortfolioData>[] = [
    {
        accessorKey: "symbol",,
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
        accessorKey: "amount",
        header: "amount",
        cell: (props) => <div>{props.getValue() as string}</div>,
    },
    {
        accessorKey: "priceChange",
        header: "priceChange",
        cell: (props) => <div>{formatPrice(props.getValue() as string)}</div>,
    },
    {
        accessorKey: "lastPrice",
        header: "lastPrice",
        cell: (props) => <div>{formatPrice(props.getValue() as string)}</div>,
    },
    {
        accessorKey: "totalValue",
        header: "totalValue",
        cell: (props) => <div>{formatPrice(props.getValue() as string)}</div>,
    },
];