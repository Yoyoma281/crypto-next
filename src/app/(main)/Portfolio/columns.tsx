'use client';

import { portfolioCoin } from "@/app/types/coin";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
// import { formatPrice } from "@/lib/utils";


export const columns: ColumnDef<portfolioCoin>[] = [
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
        accessorKey: "amount",
        header: "amount",
        cell: (props) => <div>{props.getValue() as string}</div>,
    },
     {
        accessorKey: "CurrentWorth",
        header: "CurrentWorth",
        cell: (props) => <div>{props.getValue() as string}</div>,
    },
   
];