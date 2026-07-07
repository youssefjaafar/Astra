import { redirect } from "next/navigation";

import { TimeOrbitModule } from "@/components/astra/time";
import { resolveTimeZone, startOfDayInTimeZone } from "@/lib/dates";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function TimePage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profileResult = await supabase.from("profiles").select("timezone").eq("user_id", user.id).maybeSingle();
  const todayStart = startOfDayInTimeZone(new Date(), resolveTimeZone(profileResult.data?.timezone));

  const { data, error } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_time", todayStart.toISOString())
    .order("start_time", { ascending: true });

  return <TimeOrbitModule initialBlocks={data ?? []} initialError={error?.message ?? null} userId={user.id} />;
}
