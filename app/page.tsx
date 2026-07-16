"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Zap, Shield, QrCode, ArrowRight,
  Smartphone, Laptop, Lock
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { FlowAnimationCard } from "@/components/ui/FlowAnimationCard";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-indigo-black">
      {/* Cursor Follow Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        animate={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
        }}
      />

      {/* Animated Gradient Mesh (Background) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary-start/10 blur-[120px] animate-blob" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-accent/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-primary-end/10 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <AnimatePresence>
        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-start to-primary-end flex items-center justify-center glow-primary">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">QuickDrop</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/join">
              <Button variant="ghost" size="sm" className="text-primary-start">Enter Code</Button>
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
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="relative z-10 flex flex-col items-center gap-8 mt-12"
          >
            {/* The Signature Animation Component */}
            <motion.div variants={fadeUp} className="w-full max-w-3xl mx-auto">
              <FlowAnimationCard />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-emerald-accent/10 border border-emerald-accent/20 text-emerald-accent backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-pulse" />
                Real-time · No cloud · Secure Peer-to-Peer
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <motion.span
                initial="off"
                whileInView="on"
                viewport={{ once: true }}
                variants={{ off: {}, on: { transition: { staggerChildren: 0.1 } } }}
                className="inline-block"
              >
                {"Drop anything.".split(" ").map((word, i) => (
                  <motion.span key={`title1-${i}`} variants={{ off: { opacity: 0, x: -20 }, on: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="inline-block mr-4">
                    {word}
                  </motion.span>
                ))}
              </motion.span>
              <br />
              <motion.span
                initial="off"
                whileInView="on"
                viewport={{ once: true }}
                variants={{ off: {}, on: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
                className="text-gradient inline-block"
              >
                {"Instantly.".split(" ").map((word, i) => (
                  <motion.span key={`title2-${i}`} variants={{ off: { opacity: 0, x: -20 }, on: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="inline-block mr-4">
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </h1>

            <motion.p
              initial="off"
              whileInView="on"
              viewport={{ once: true }}
              variants={{ off: {}, on: { transition: { staggerChildren: 0.02, delayChildren: 0.4 } } }}
              className="max-w-xl text-lg text-neutral-400 leading-relaxed backdrop-blur-sm"
            >
              {"Scan a QR code to pair your phone with your laptop in seconds. Send files, links, and text back and forth — no cables, no cloud upload, no friction.".split(" ").map((word, i) => (
                <motion.span key={`desc-${i}`} variants={{ off: { opacity: 0, y: 10 }, on: { opacity: 1, y: 0 } }} className="inline-block mr-1.5">
                  {word}
                </motion.span>
              ))}
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
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Built for Speed & Privacy</h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              Everything you need to move data securely without relying on third-party cloud servers.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 auto-rows-[200px]"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Bento Card 1 (Large 2x2 highlight) */}
            <motion.div variants={fadeUp} className="md:col-span-2 md:row-span-2">
              <GlassCard className="h-full p-8 flex flex-col relative overflow-hidden" hover glowColor="primary">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-start/10 rounded-full blur-[80px]" />
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-6 z-10">
                  <Zap className="w-6 h-6 text-primary-start" />
                </div>
                <h3 className="text-2xl font-bold mb-3 z-10">Real-time Binary Transfer</h3>
                <p className="text-neutral-400 leading-relaxed max-w-md z-10">
                  Files travel as raw binary chunks over WebSockets, skipping base64 encoding entirely. 
                  This makes transfers 33% smaller and significantly faster than traditional methods.
                </p>
                
                <div className="mt-auto w-full z-10 flex items-center justify-center">
                  <FlowAnimationCard className="w-full max-w-md scale-90 opacity-80" />
                </div>
              </GlassCard>
            </motion.div>

            {/* Bento Card 2 */}
            <motion.div variants={fadeUp} className="md:col-span-1 md:row-span-1">
              <GlassCard className="h-full p-6 flex flex-col" hover glowColor="cyan">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-cyan-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Cloud Storage</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Data flows directly peer-to-peer. Nothing is ever saved to a disk.
                </p>
              </GlassCard>
            </motion.div>

            {/* Bento Card 3 */}
            <motion.div variants={fadeUp} className="md:col-span-1 md:row-span-1">
              <GlassCard className="h-full p-6 flex flex-col" hover glowColor="emerald">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5 text-emerald-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure Rooms</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Cryptographic UUIDs + 4-digit PINs ensure only you can access your session.
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="relative z-10 py-24 px-6 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-16" glow glowColor="primary">
              <h2 className="text-4xl font-extrabold mb-4">
                Ready to <span className="text-gradient">QuickDrop?</span>
              </h2>
              <p className="text-neutral-400 mb-8 max-w-md mx-auto">
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
        <footer className="relative z-10 border-t border-white/5 py-8 px-6 mt-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-start to-primary-end flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm">QuickDrop</span>
            </div>
            <p className="text-xs text-neutral-600">
              Local-only · No data leaves your machine · Built with Next.js + Socket.IO
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <Link href="/login" className="hover:text-cyan-accent transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-primary-end transition-colors">Sign Up</Link>
            </div>
          </div>
        </footer>
      </AnimatePresence>
    </div>
  );
}
