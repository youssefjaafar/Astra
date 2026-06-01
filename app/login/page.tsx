import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Secure Access"
      title="Enter Command Center"
      subtitle="Your life systems are waiting."
      footer={
        <>
          Need a new cockpit?{" "}
          <Link className="text-cyan-200 transition hover:text-cyan-100" href="/signup">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
