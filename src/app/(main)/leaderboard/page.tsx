import { fetchLeaderboard, fetchUserSafe } from "@/app/data/services";
import LeaderboardAuthRequired from "./LeaderboardAuthRequired";
import LeaderboardContent from "./LeaderboardContent";

export default async function LeaderboardPage() {
  const user = await fetchUserSafe();
  if (!user) {
    return <LeaderboardAuthRequired />;
  }

  const { leaderboard } = await fetchLeaderboard();

  return <LeaderboardContent leaderboard={leaderboard ?? []} />;
}
