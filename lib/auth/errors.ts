type AuthErrorLike = {
  message?: string;
  status?: number;
  code?: string;
};

export function getAuthErrorMessage(error: AuthErrorLike | null | undefined, fallback = "Authentication failed. Please try again.") {
  const rawMessage = error?.message ?? fallback;
  const message = rawMessage.toLowerCase();

  if (message.includes("rate limit")) {
    return "Supabase is rate-limiting emails for this address. Wait a few minutes before requesting another confirmation link.";
  }

  if (message.includes("email not confirmed") || message.includes("not confirmed")) {
    return "This email is registered but not confirmed yet. Open the confirmation link from your inbox, or request a new link after the rate limit clears.";
  }

  if (message.includes("invalid login credentials")) {
    return "Those credentials did not match a confirmed Astra account. Check the email and password, and confirm the email first if this account was just created.";
  }

  if (message.includes("already registered") || message.includes("already exists")) {
    return "This email already has an Astra account. Sign in instead, or use the confirmation link if the account is still pending.";
  }

  return rawMessage;
}
