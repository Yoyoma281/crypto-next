import { fetchUserSafe } from "@/app/data/services";
import HistoryAuthRequired from "./HistoryAuthRequired";
import HistoryContent from "./HistoryContent";

export default async function HistoryPage() {
  const user = await fetchUserSafe();
  if (!user) return <HistoryAuthRequired />;
  return <HistoryContent />;
}
