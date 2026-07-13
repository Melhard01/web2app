import type { Metadata } from "next";
import "./globals.css";
import { FunnelProvider } from "@/lib/funnel/store";
import { APP } from "@/lib/config";
import { fraunces, interTight, jetbrainsMono } from "@/lib/fonts";
import { SiteFooter } from "@/components/ui/SiteFooter";

export const metadata: Metadata = {
  title: `${APP.name} — ${APP.tagline}`,
  description: APP.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} overflow-x-hidden`}
    >
      <body className="min-h-screen bg-canvas font-sans text-body antialiased">
        <FunnelProvider>
          {children}
          <SiteFooter />
        </FunnelProvider>
      </body>
    </html>
  );
}
