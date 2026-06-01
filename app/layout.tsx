import type { Metadata } from "next";
import Script from "next/script";

import { AppShell } from "@/components/layout/AppShell";
import { CosmicBackground } from "@/components/cosmic-background";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astra",
  description: "A calm futuristic personal life operating system.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="astra-extension-hydration-guard" strategy="beforeInteractive">
          {`
            (() => {
              const shouldRemove = (name) =>
                name === "bis_skin_checked" ||
                name === "bis_register" ||
                name.startsWith("__processed_");

              const clean = (node) => {
                if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
                for (const attribute of Array.from(node.attributes)) {
                  if (shouldRemove(attribute.name)) {
                    node.removeAttribute(attribute.name);
                  }
                }
              };

              const cleanTree = () => {
                clean(document.documentElement);
                clean(document.body);
                for (const element of document.querySelectorAll("[bis_skin_checked], [bis_register]")) {
                  clean(element);
                }
                for (const element of document.querySelectorAll("*")) {
                  for (const attribute of Array.from(element.attributes)) {
                    if (shouldRemove(attribute.name)) {
                      element.removeAttribute(attribute.name);
                    }
                  }
                }
              };

              cleanTree();

              const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                  if (mutation.type === "attributes" && mutation.attributeName && shouldRemove(mutation.attributeName)) {
                    mutation.target.removeAttribute(mutation.attributeName);
                  }
                  for (const node of mutation.addedNodes) {
                    clean(node);
                    if (node.querySelectorAll) {
                      for (const child of node.querySelectorAll("*")) {
                        clean(child);
                      }
                    }
                  }
                }
              });

              observer.observe(document.documentElement, {
                attributes: true,
                childList: true,
                subtree: true,
              });

              window.addEventListener("load", () => {
                cleanTree();
                window.setTimeout(() => observer.disconnect(), 2000);
              });
            })();
          `}
        </Script>
        <CosmicBackground />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
