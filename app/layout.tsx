import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { CosmicBackground } from "@/components/cosmic-background";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astra",
  description: "A calm futuristic personal life operating system.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CosmicBackground />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
