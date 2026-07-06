import { redirect } from "next/navigation";

import { TasksModule } from "@/components/astra/tasks/TasksModule";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <TasksModule
      initialError={error?.message ?? null}
      initialTasks={data ?? []}
      userId={user.id}
    />
  );
}
