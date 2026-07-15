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
  title: "QuickDrop — Instant File & Text Sharing",
  description:
    "Share files and text instantly between your phone and laptop via QR code. No cables, no cloud upload. Real-time, secure, and blazing fast.",
  keywords: ["file sharing", "QR code", "instant transfer", "local sharing", "quickdrop"],
  openGraph: {
    title: "QuickDrop — Instant File & Text Sharing",
    description: "Share files and text instantly between your phone and laptop via QR code.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
