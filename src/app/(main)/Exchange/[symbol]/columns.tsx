'use client';

import { ColumnDef } from "@tanstack/react-table";
import { formatPrice } from "@/lib/utils";
import CoinIcon from "@/components/CoinIcon";
import { BinanceTrade } from "@/app/types/coin";


export const columns: ColumnDef<BinanceTrade>[] = [
    {
        accessorKey: "symbol",
        header: "Symbol",
        cell: (props) =>
            <div className="flex items-center gap-2">
                <CoinIcon ticker={(props.getValue() as string).replace("USDT", "")} size={30} />
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