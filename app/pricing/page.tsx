"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-20 px-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary-orange/20 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10 flex flex-col items-center"
      >
        <Link href="/" className="mb-8">
          <Logo className="w-16 h-16" />
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight text-white">
          Simple, Transparent Pricing
        </h1>
        <p className="text-neutral-400 text-center max-w-xl mb-16">
          Choose the plan that fits your sharing needs. No hidden fees, cancel anytime.
        </p>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Free Tier */}
          <div className="bg-[#111217]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col relative overflow-hidden shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <p className="text-neutral-500 text-sm mb-6">Perfect for quick, one-off file transfers.</p>
            <div className="text-4xl font-black text-white mb-8">$0<span className="text-lg text-neutral-500 font-normal">/mo</span></div>
            
            <div className="flex-1 flex flex-col gap-4 mb-8">
              <FeatureItem included>1 active room at a time</FeatureItem>
              <FeatureItem included>Max 2 devices per room</FeatureItem>
              <FeatureItem included>50MB file size limit</FeatureItem>
              <FeatureItem included>5-minute session expiry</FeatureItem>
              <FeatureItem included>Voice notes up to 30s</FeatureItem>
              <FeatureItem included>End-to-End Encryption</FeatureItem>
              
              <div className="h-px bg-white/10 my-2" />
              
              <FeatureItem included={false}>Draw-on-image markup</FeatureItem>
              <FeatureItem included={false}>Sound-based (ultrasonic) pairing</FeatureItem>
              <FeatureItem included={false}>"Send to Last Device"</FeatureItem>
              <FeatureItem included={false}>Transfer reactions</FeatureItem>
              <FeatureItem included={false}>Session accent themes</FeatureItem>
              <FeatureItem included={false}>Video/ZIP inline preview</FeatureItem>
              <FeatureItem included={false}>Self-destruct timer</FeatureItem>
            </div>

            <Button
              variant="secondary"
              className="w-full h-12 rounded-xl bg-white/5 text-neutral-300"
              disabled={user && !isPro}
              onClick={() => router.push(user ? "/dashboard" : "/signup")}
            >
              {user && !isPro ? "Current Plan" : "Get Started for Free"}
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-[#111217]/80 backdrop-blur-xl border border-primary-orange/50 rounded-[32px] p-8 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(255,122,26,0.15)] transform md:-translate-y-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-orange/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 bg-primary-orange text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-[32px]">MOST POPULAR</div>
            
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              Sync Pro <Star className="w-5 h-5 text-primary-orange fill-primary-orange" />
            </h3>
            <p className="text-neutral-400 text-sm mb-6">For power users who need advanced sharing tools.</p>
            <div className="text-4xl font-black text-white mb-8">$9.99<span className="text-lg text-neutral-500 font-normal">/mo</span></div>
            
            <div className="flex-1 flex flex-col gap-4 mb-8">
              <FeatureItem included>Unlimited active rooms</FeatureItem>
              <FeatureItem included>Up to 4 devices per room</FeatureItem>
              <FeatureItem included>200MB file size limit</FeatureItem>
              <FeatureItem included>30-minute session expiry</FeatureItem>
              <FeatureItem included>Unlimited voice note length</FeatureItem>
              <FeatureItem included>End-to-End Encryption</FeatureItem>
              
              <div className="h-px bg-white/10 my-2" />
              
              <FeatureItem included>Draw-on-image markup tool</FeatureItem>
              <FeatureItem included>Sound-based (ultrasonic) pairing</FeatureItem>
              <FeatureItem included>"Send to Last Device"</FeatureItem>
              <FeatureItem included>Transfer reactions (all emojis)</FeatureItem>
              <FeatureItem included>Session accent themes</FeatureItem>
              <FeatureItem included>Video/ZIP inline preview</FeatureItem>
              <FeatureItem included>Self-destruct timer per item</FeatureItem>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-orange to-glow-orange shadow-[0_0_20px_rgba(255,122,26,0.3)] hover:shadow-[0_0_30px_rgba(255,122,26,0.5)] border-0 text-white"
              onClick={handleUpgrade}
              loading={loading}
              disabled={isPro}
            >
              {isPro ? "Pro Active" : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ included, children }: { included: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-start gap-3 text-sm ${included ? "text-neutral-200" : "text-neutral-600"}`}>
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${included ? "bg-primary-orange/20 text-primary-orange" : "bg-white/5 text-neutral-600"}`}>
        {included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span>{children}</span>
    </div>
  );
}
