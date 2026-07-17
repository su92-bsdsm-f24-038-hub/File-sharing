import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sync | Instant Local File Transfer",
  description:
    "Send files, links, and text between your devices instantly over local network. No cables, no cloud upload. Real-time, secure, and blazing fast.",
  keywords: ["file sharing", "QR code", "instant transfer", "local sharing", "sync"],
  openGraph: {
    title: "Sync | Instant Local File Transfer",
    description: "Send files, links, and text between your devices instantly over local network.",
    type: "website",
  },
};

import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { Particles } from "@/components/effects/Particles";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-indigo-black text-white antialiased min-h-screen selection:bg-primary-orange/30 selection:text-white">
        <SmoothScroll>
          <AuthProvider>
            <AuroraBackground />
            <Particles />
            <MouseGlow />
            <div className="relative z-0">
              {children}
            </div>
          </AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
