type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

export function isMissingTableError(error: SupabaseErrorLike | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    (message.includes("schema cache") && message.includes("could not find the table"))
  );
}

export function getDatabaseSetupMessage(tableName: string) {
  return `Astra could not find the ${tableName} table in Supabase. Apply the Supabase migrations, then retry this step.`;
}
