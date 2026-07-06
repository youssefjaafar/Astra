import { redirect } from "next/navigation";

import { TimeOrbitModule } from "@/components/astra/time";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function TimePage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_time", todayStart.toISOString())
    .order("start_time", { ascending: true });

  return <TimeOrbitModule initialBlocks={data ?? []} initialError={error?.message ?? null} userId={user.id} />;
}
