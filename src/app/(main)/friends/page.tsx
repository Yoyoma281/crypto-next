import { fetchUserSafe } from "@/app/data/services";
import FriendsAuthRequired from "./FriendsAuthRequired";
import FriendsClient from "./FriendsClient";

export default async function FriendsPage() {
  const user = await fetchUserSafe();
  if (!user) {
    return <FriendsAuthRequired />;
  }
  return <FriendsClient />;
}
