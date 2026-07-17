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
