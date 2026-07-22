import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-8 relative overflow-hidden">
      <div className="w-full max-w-3xl relative z-10 pt-10">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Logo className="w-14 h-14" />
          </Link>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-neutral-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <GlassCard className="p-8 md:p-12 text-neutral-300 leading-relaxed" glow glowColor="primary">
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
          <p className="mb-6">
            Welcome to Sync. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you as to how we look after your personal data when you visit our website.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Data We Collect</h2>
          <p className="mb-6">
            We only collect the information necessary to provide you with our file transfer services.
            This may include basic account information and technical data required for peer-to-peer connections.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. How We Use Your Data</h2>
          <p className="mb-6">
            Your files are transferred directly between devices on your local network or via WebRTC.
            We do not store your files on our servers.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Contact Us</h2>
          <p className="mb-6">
            If you have any questions about this privacy policy, please contact us at our provided contact page.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
