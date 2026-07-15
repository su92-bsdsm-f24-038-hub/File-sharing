"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, Shield, Wifi, QrCode, ArrowRight,
  Smartphone, Laptop, FileText, Lock, Clock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-fuchsia-900/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">QuickDrop</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/join">
            <Button variant="ghost" size="sm" className="text-purple-400">Enter Code</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-8"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Real-time · No cloud · No account on mobile
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]"
          >
            Drop anything.
            <br />
            <span className="text-gradient">Instantly.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-lg text-neutral-400 leading-relaxed"
          >
            Scan a QR code to pair your phone with your laptop in seconds. Send
            files, links, and text back and forth — no cables, no cloud upload,
            no friction.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <Link href="/signup">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Start Sharing Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Animated hero illustration */}
          <motion.div
            variants={fadeUp}
            className="relative mt-8 w-full max-w-2xl"
          >
            <GlassCard className="p-8 glow-purple" glow>
              <div className="flex items-center justify-center gap-12">
                {/* Laptop */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                    <Laptop className="w-9 h-9 text-purple-400" />
                  </div>
                  <span className="text-xs text-neutral-500">Your Laptop</span>
                </div>

                {/* Animated connection */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-500"
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-purple-500/60 font-mono">WebSocket</span>
                </div>

                {/* Phone */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-fuchsia-400" />
                  </div>
                  <span className="text-xs text-neutral-500">Your Phone</span>
                </div>
              </div>

              {/* QR mockup */}
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-3 bg-white/[0.04] border border-purple-500/15 rounded-2xl px-5 py-3">
                  <QrCode className="w-8 h-8 text-purple-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-200">Scan QR to pair</span>
                    <span className="text-xs text-neutral-600">Opens in mobile browser</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How it Works</h2>
          <p className="text-neutral-500 max-w-md mx-auto">
            Three steps. No app install required on mobile.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: <QrCode className="w-6 h-6 text-purple-400" />,
              title: "Generate a Room",
              desc: "Sign in on your laptop and click 'New Session'. A QR code appears instantly with a secure room ID.",
            },
            {
              step: "02",
              icon: <Smartphone className="w-6 h-6 text-fuchsia-400" />,
              title: "Scan on Your Phone",
              desc: "Open your camera and scan the QR. No app download — it opens in your mobile browser automatically.",
            },
            {
              step: "03",
              icon: <FileText className="w-6 h-6 text-emerald-400" />,
              title: "Send & Receive",
              desc: "Drop files (up to 50 MB), send text or links. Both devices can send. Files transfer in real-time binary chunks.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <GlassCard className="p-7 h-full" hover>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="text-4xl font-black text-white/5 leading-none">
                      {item.step}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Built for Speed & Privacy</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5 text-yellow-400" />,
              title: "Binary WebSocket Transfer",
              desc: "Files travel as raw binary chunks, not base64 — 33% smaller, faster transfers.",
            },
            {
              icon: <Lock className="w-5 h-5 text-purple-400" />,
              title: "Cryptographic Room IDs",
              desc: "UUID v4 room IDs with a 4-digit PIN. Max 2 devices per room. Third join attempts are rejected.",
            },
            {
              icon: <Clock className="w-5 h-5 text-blue-400" />,
              title: "Auto-Expiring Sessions",
              desc: "Rooms self-destruct after 5 minutes of inactivity. All data is in-memory — nothing persists.",
            },
            {
              icon: <Shield className="w-5 h-5 text-emerald-400" />,
              title: "No Cloud Storage",
              desc: "Files never leave your local network. Transfers happen peer-to-peer via your local WebSocket server.",
            },
            {
              icon: <Wifi className="w-5 h-5 text-fuchsia-400" />,
              title: "Live Progress Tracking",
              desc: "Real progress bars driven by actual chunk acknowledgment — not fake timers.",
            },
            {
              icon: <Smartphone className="w-5 h-5 text-sky-400" />,
              title: "Mobile-First UI",
              desc: "The join page is optimized for phone screens. No pinch-to-zoom, no tiny buttons.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="p-6" hover>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlassCard className="p-16" glow>
            <h2 className="text-4xl font-extrabold mb-4">
              Ready to <span className="text-gradient">QuickDrop?</span>
            </h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              Create a free account, generate your first room, and share something in under 30 seconds.
            </p>
            <Link href="/signup">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Create Free Account
              </Button>
            </Link>
          </GlassCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm">QuickDrop</span>
          </div>
          <p className="text-xs text-neutral-700">
            Local-only · No data leaves your machine · Built with Next.js + Socket.IO
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-700">
            <Link href="/login" className="hover:text-neutral-400 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-neutral-400 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
