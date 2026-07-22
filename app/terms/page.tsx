import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui/GlassCard";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-8 relative overflow-hidden">
      <div className="w-full max-w-3xl relative z-10 pt-10">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Logo className="w-14 h-14" />
          </Link>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-neutral-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <GlassCard className="p-8 md:p-12 text-neutral-300 leading-relaxed" glow glowColor="primary">
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing and using Sync, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Use License</h2>
          <p className="mb-6">
            Permission is granted to temporarily use Sync for personal, non-commercial transitory viewing only.
            This is the grant of a license, not a transfer of title.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Disclaimer</h2>
          <p className="mb-6">
            The materials on Sync's website are provided on an 'as is' basis. Sync makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Limitations</h2>
          <p className="mb-6">
            In no event shall Sync or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sync's website.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
