import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-8 relative overflow-hidden">
      <div className="w-full max-w-2xl relative z-10 pt-10">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Logo className="w-14 h-14" />
          </Link>
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-neutral-400 mt-2 text-center">
            We'd love to hear from you. Get in touch with the team.
          </p>
        </div>

        <GlassCard className="p-8 md:p-12 text-neutral-300 leading-relaxed" glow glowColor="primary">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary-orange" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Email</h3>
                <p className="text-neutral-400 mb-2">Our friendly team is here to help.</p>
                <a href="mailto:support@sync.example.com" className="text-primary-orange hover:text-white transition-colors">
                  support@sync.example.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary-orange" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Office</h3>
                <p className="text-neutral-400 mb-2">Come say hello at our office HQ.</p>
                <p className="text-neutral-300">
                  123 Innovation Drive<br />
                  Tech City, TC 90210
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
