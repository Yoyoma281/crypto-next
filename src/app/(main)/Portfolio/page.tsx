import { DataTable } from "@/app/components/table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { fetchPortfolio } from "@/app/data/services";

import React from "react";

export default async function Page() {
  const res = await fetchPortfolio();

  return (
    <>
      <div className="flex flex-col gap-10 items-start h-screen">
        <h1 className="text-4xl font-bold">My portfolio</h1>
        <Button className="font-mono">Add Coin</Button>
        {res ? (
          <DataTable data={res.portfolio.Coins} columns={columns} params="symbol" />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}
