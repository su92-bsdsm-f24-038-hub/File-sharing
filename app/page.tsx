"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Zap, Shield, ArrowRight, Lock
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FlowAnimationCard } from "@/components/ui/FlowAnimationCard";

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Scroll progress bar
    gsap.to(scrollProgressRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      }
    });

    // Hero fade/scale/blur out on scroll
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        opacity: 0,
        scale: 0.9,
        filter: "blur(10px)",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div 
        ref={scrollProgressRef} 
        className="fixed top-0 left-0 h-1 w-full bg-gradient-to-r from-primary-orange to-glow-orange origin-left scale-x-0 z-50 shadow-[0_0_10px_rgba(255,122,26,0.8)]"
      />

      <AnimatePresence>
        {/* Navbar */}
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto backdrop-blur-xl border-b border-white/5 bg-[#09090B]/50 rounded-b-3xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-glow-orange rounded-xl flex items-center justify-center shadow-lg shadow-primary-orange/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white relative">
              Sync
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-primary-orange to-glow-orange rounded-full"></span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/join">
              <Button variant="ghost" size="sm" className="text-primary-orange hover:text-glow-orange hover:bg-white/5">Enter Code</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:bg-white/5">Sign In</Button>
            </Link>
            <Link href="/signup">
              <MagneticButton intensity={0.1}>
                <Button size="sm" className="bg-primary-orange hover:bg-glow-orange text-white shadow-[0_0_15px_rgba(255,122,26,0.4)] border-0">Get Started</Button>
              </MagneticButton>
            </Link>
          </div>
        </motion.nav>

        {/* Hero */}
        <section ref={heroRef} className="relative z-10 pt-20 pb-32 px-6 max-w-5xl mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center gap-8 mt-12"
          >
            {/* Flow SVG wrapper with orange glow */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-3xl mx-auto relative"
            >
              <div className="absolute inset-0 bg-primary-orange/10 blur-[100px] rounded-full" />
              <FlowAnimationCard />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-emerald-accent/10 border border-emerald-accent/20 text-emerald-accent backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-pulse" />
                Real-time · No cloud · Secure Peer-to-Peer
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.05]">
              <motion.span
                initial="off"
                whileInView="on"
                viewport={{ once: true }}
                variants={{ off: {}, on: { transition: { staggerChildren: 0.1 } } }}
                className="inline-block"
              >
                {"Drop anything.".split(" ").map((word, i) => (
                  <motion.span key={`title1-${i}`} variants={{ off: { opacity: 0, y: 40, rotateX: 90 }, on: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 200, damping: 20 } } }} className="inline-block mr-4 origin-bottom">
                    {word}
                  </motion.span>
                ))}
              </motion.span>
              <br />
              <motion.span
                initial="off"
                whileInView="on"
                viewport={{ once: true }}
                variants={{ off: {}, on: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
                className="text-gradient inline-block"
              >
                {"Instantly.".split(" ").map((word, i) => (
                  <motion.span key={`title2-${i}`} variants={{ off: { opacity: 0, scale: 0.8, filter: "blur(10px)" }, on: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 200, damping: 20 } } }} className="inline-block mr-4">
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </h1>

            <motion.p
              initial="off"
              whileInView="on"
              viewport={{ once: true }}
              variants={{ off: {}, on: { transition: { staggerChildren: 0.02, delayChildren: 0.6 } } }}
              className="max-w-2xl text-lg md:text-xl text-neutral-400 leading-relaxed"
            >
              {"Scan a QR code to pair your phone with your laptop in seconds. Send files, links, and text back and forth — no cables, no cloud upload, no friction.".split(" ").map((word, i) => (
                <motion.span key={`desc-${i}`} variants={{ off: { opacity: 0, filter: "blur(4px)" }, on: { opacity: 1, filter: "blur(0px)" } }} className="inline-block mr-1.5">
                  {word}
                </motion.span>
              ))}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row items-center gap-6 mt-4"
            >
              <Link href="/signup">
                <MagneticButton intensity={0.15}>
                  <Button size="lg" className="bg-gradient-to-r from-primary-orange to-glow-orange hover:opacity-90 border-0 shadow-[0_0_30px_rgba(255,122,26,0.3)] text-white h-14 px-8 text-lg" icon={<ArrowRight className="w-5 h-5" />}>
                    Start Sharing Free
                  </Button>
                </MagneticButton>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-extrabold mb-6 tracking-tight">Built for Speed & Privacy</h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Everything you need to move data securely without relying on third-party cloud servers.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[220px]"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Bento Card 1 (Large 2x2 highlight) */}
            <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0 } } }} className="md:col-span-2 md:row-span-2">
              <GlassCard className="h-full p-10 flex flex-col relative overflow-hidden group" hover glow glowColor="primary">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-orange/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-[#111217] border border-white/10 flex items-center justify-center mb-6 z-10 group-hover:rotate-12 transition-transform duration-500">
                  <Zap className="w-7 h-7 text-primary-orange" />
                </div>
                <h3 className="text-3xl font-bold mb-4 z-10 tracking-tight">Real-time Binary Transfer</h3>
                <p className="text-neutral-400 text-lg leading-relaxed max-w-md z-10">
                  Files travel as raw binary chunks over WebSockets, skipping base64 encoding entirely. 
                  This makes transfers significantly faster than traditional methods.
                </p>
              </GlassCard>
            </motion.div>

            {/* Bento Card 2 */}
            <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0 } } }} className="md:col-span-1 md:row-span-1">
              <GlassCard className="h-full p-8 flex flex-col group" hover glowColor="cyan">
                <div className="w-12 h-12 rounded-2xl bg-[#111217] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-6 h-6 text-cyan-accent" />
                </div>
                <h3 className="font-semibold text-xl mb-2 tracking-tight">No Cloud Storage</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Data flows directly peer-to-peer. Nothing is ever saved to a disk.
                </p>
              </GlassCard>
            </motion.div>

            {/* Bento Card 3 */}
            <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0 } } }} className="md:col-span-1 md:row-span-1">
              <GlassCard className="h-full p-8 flex flex-col group" hover glowColor="emerald">
                <div className="w-12 h-12 rounded-2xl bg-[#111217] border border-white/10 flex items-center justify-center mb-4 group-hover:-rotate-12 transition-transform duration-500">
                  <Lock className="w-6 h-6 text-emerald-accent" />
                </div>
                <h3 className="font-semibold text-xl mb-2 tracking-tight">Secure Rooms</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Cryptographic UUIDs + 4-digit PINs ensure only you can access your session.
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="relative z-10 py-32 px-6 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <GlassCard className="p-20" glow glowColor="primary">
              <h2 className="text-5xl font-extrabold mb-6 tracking-tight">
                Ready to <span className="text-gradient">Sync?</span>
              </h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
                Create a free account, generate your first room, and share something in under 30 seconds.
              </p>
              <Link href="/signup">
                <MagneticButton intensity={0.2}>
                  <Button size="lg" className="bg-primary-orange hover:bg-glow-orange border-0 shadow-[0_0_40px_rgba(255,122,26,0.4)] text-white h-16 px-10 text-lg rounded-2xl" icon={<ArrowRight className="w-6 h-6" />}>
                    Create Free Account
                  </Button>
                </MagneticButton>
              </Link>
            </GlassCard>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-12 px-6 mt-12 bg-[#09090B]/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-orange to-glow-orange flex items-center justify-center shadow-[0_0_15px_rgba(255,122,26,0.3)]">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Sync</span>
            </div>
            <p className="text-sm text-neutral-500">
              Local-only · No data leaves your machine · Built with Next.js + Socket.IO
            </p>
            <div className="flex items-center gap-6 text-sm text-neutral-400 font-medium">
              <Link href="/login" className="hover:text-primary-orange transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-glow-orange transition-colors">Sign Up</Link>
            </div>
          </div>
        </footer>
      </AnimatePresence>
    </div>
  );
}
