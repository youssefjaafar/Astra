import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Initialize Astra"
      title="Create your cockpit"
      subtitle="Set up secure access, then calibrate your life systems."
      footer={
        <>
          Already initialized?{" "}
          <Link className="text-cyan-200 transition hover:text-cyan-100" href="/login">
            Enter Command Center
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
