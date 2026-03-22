import { redirect } from "next/navigation";
import { use } from "react";

type Props = { params: Promise<{ symbol: string }> };

export default function TradePage({ params }: Props) {
  const { symbol } = use(params);
  redirect(`/coin/${symbol.toUpperCase()}?tab=trade`);
}
