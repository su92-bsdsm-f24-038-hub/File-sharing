"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Shield, ArrowRight, Lock, Phone } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FlowAnimationCard } from "@/components/ui/FlowAnimationCard";
import { Sparkles } from "@/components/sparkles";
import Earth from "@/components/globe";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedBeam, Circle, Icons } from "@/components/ui/animated-beam";
import { Logo } from "@/components/Logo";
import Image from "next/image";

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  // Animated Beam refs
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

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

  const reviews = [
    { name: "React", username: "@reactjs", body: "The library for web and native user interfaces.", img: "text-[#61DAFB]", icon: "⚛️" },
    { name: "Next.js", username: "@nextjs", body: "The React Framework for the Web.", img: "text-white", icon: "▲" },
    { name: "Tailwind CSS", username: "@tailwindcss", body: "Rapidly build modern websites without ever leaving your HTML.", img: "text-[#38B2AC]", icon: "🌊" },
    { name: "Framer Motion", username: "@framer", body: "A production-ready motion library for React.", img: "text-[#E90265]", icon: "✨" },
    { name: "GSAP", username: "@gsap", body: "Professional-grade animation for the modern web.", img: "text-[#88CE02]", icon: "🟢" },
    { name: "Lucide", username: "@lucide", body: "Beautiful & consistent icons.", img: "text-red-500", icon: "🎨" },
  ];
  const firstRow = reviews.slice(0, reviews.length / 2);
  const secondRow = reviews.slice(reviews.length / 2);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#09090B] to-[#09090B]">
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
          className="fixed top-6 left-0 right-0 mx-auto z-50 flex items-center gap-12 px-6 py-3 w-max bg-[#111111] rounded-full border border-white/5 shadow-2xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo className="w-14 h-14" />
          </div>

          {/* Links (Center) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
            <Link href="/pricing" className="hover:text-white transition-colors flex items-center gap-1">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors">
              Go to App
            </Link>
          </div>

          {/* CTA (Right) */}
          <div>
            <Link href="/signup">
              <MagneticButton intensity={0.1}>
                <Button size="sm" className="bg-white hover:bg-neutral-200 text-black rounded-full px-6 py-4 font-bold shadow-md flex items-center gap-2 border-0">
                  Get Started
                </Button>
              </MagneticButton>
            </Link>
          </div>
        </motion.nav>

        {/* Hero */}
        <section ref={heroRef} className="relative z-10 pt-20 pb-20 px-6 w-full text-center">
          {/* Simple Gradient Glow */}
          <div className="absolute inset-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,#FF7A1A30,transparent_60%)] pointer-events-none"></div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center gap-8 mt-12 max-w-5xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.05]">
              <motion.span className="inline-block">Drop anything.</motion.span>
              <br />
              <motion.span className="text-primary-orange inline-block">Instantly.</motion.span>
            </h1>

            <motion.p className="max-w-2xl text-lg md:text-xl text-neutral-400 leading-relaxed">
              Scan a QR code to pair your phone with your laptop in seconds. Send files, links, and text back and forth — no cables, no cloud upload, no friction.
            </motion.p>

            {/* Globe */}
            <div className="relative mt-8">
              <Earth />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 font-bold text-xl text-white">Global Reach</div>
            </div>

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

        {/* Features Bento Grid + Animated Beam */}
        <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
          <motion.div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold mb-6 tracking-tight">Built for Speed & Privacy</h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Everything you need to move data securely without relying on third-party cloud servers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[220px]">
            {/* Bento Card 1 with Animated Beam */}
            <div className="md:col-span-2 md:row-span-2">
              <GlassCard className="h-full p-10 flex flex-col relative overflow-hidden group" glow glowColor="primary">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-orange/20 rounded-full blur-[100px]" />
                
                <h3 className="text-3xl font-bold mb-4 z-10 tracking-tight">Peer-to-Peer Transfer</h3>
                <p className="text-neutral-400 text-lg leading-relaxed max-w-md z-10 mb-8">
                  Direct connection between devices using WebRTC and WebSockets.
                </p>

                {/* Animated Beam Integration */}
                <div className="relative flex w-full max-w-[500px] mx-auto items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-10" ref={containerRef}>
                  <div className="flex h-full w-full flex-col items-stretch justify-between gap-10 z-10">
                    <div className="flex flex-row items-center justify-between">
                      <Circle ref={div1Ref}><Icons.typescript /></Circle>
                      <Circle ref={div5Ref}><Icons.tailwindcss /></Circle>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <Circle ref={div2Ref}><Icons.framer /></Circle>
                      <Circle ref={div4Ref} className="h-16 w-16 bg-black"><Icons.logo /></Circle>
                      <Circle ref={div6Ref}><Icons.gsap /></Circle>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <Circle ref={div3Ref}><Icons.nextjs /></Circle>
                      <Circle ref={div7Ref}><Icons.reactjs /></Circle>
                    </div>
                  </div>

                  <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div4Ref} curvature={-75} endYOffset={-10} dotted gradientStartColor="#FF7A1A" gradientStopColor="#FF9A3D" />
                  <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div4Ref} dotted gradientStartColor="#FF7A1A" gradientStopColor="#FF9A3D" />
                  <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div4Ref} curvature={75} endYOffset={10} dotted gradientStartColor="#FF7A1A" gradientStopColor="#FF9A3D" />
                  <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div4Ref} curvature={-75} endYOffset={-10} reverse gradientStartColor="#FF7A1A" gradientStopColor="#FF9A3D" dotted />
                  <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div4Ref} reverse dotted gradientStartColor="#FF7A1A" gradientStopColor="#FF9A3D" />
                  <AnimatedBeam containerRef={containerRef} fromRef={div7Ref} toRef={div4Ref} curvature={75} endYOffset={10} reverse dotted gradientStartColor="#FF7A1A" gradientStopColor="#FF9A3D" />
                </div>
              </GlassCard>
            </div>

            <div className="md:col-span-1 md:row-span-1">
              <GlassCard className="h-full p-8 flex flex-col group" glowColor="cyan">
                <div className="w-12 h-12 rounded-2xl bg-[#111217] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-6 h-6 text-cyan-accent" />
                </div>
                <h3 className="font-semibold text-xl mb-2 tracking-tight">No Cloud Storage</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Data flows directly peer-to-peer. Nothing is ever saved to a disk.
                </p>
              </GlassCard>
            </div>

            <div className="md:col-span-1 md:row-span-1">
              <GlassCard className="h-full p-8 flex flex-col group" glowColor="emerald">
                <div className="w-12 h-12 rounded-2xl bg-[#111217] border border-white/10 flex items-center justify-center mb-4 group-hover:-rotate-12 transition-transform duration-500">
                  <Lock className="w-6 h-6 text-emerald-accent" />
                </div>
                <h3 className="font-semibold text-xl mb-2 tracking-tight">Secure Rooms</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Cryptographic UUIDs + 4-digit PINs ensure only you can access your session.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Marquee Section */}
        <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto overflow-hidden">
          <h2 className="text-4xl font-extrabold mb-10 text-center tracking-tight">Loved by users worldwide</h2>
          <div className="relative flex flex-col items-center justify-center">
            <Marquee pauseOnHover className="[--duration:20s]">
              {firstRow.map((review) => (
                <figure key={review.username} className="relative w-64 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                  <div className="flex flex-row items-center gap-2">
                    <div className={`flex items-center justify-center rounded-full w-8 h-8 text-xl bg-black ${review.img}`}>{review.icon}</div>
                    <div className="flex flex-col">
                      <figcaption className="text-sm font-medium text-white">{review.name}</figcaption>
                      <p className="text-xs font-medium text-neutral-400">{review.username}</p>
                    </div>
                  </div>
                  <blockquote className="mt-2 text-sm text-neutral-300">{review.body}</blockquote>
                </figure>
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:20s]">
              {secondRow.map((review) => (
                <figure key={review.username} className="relative w-64 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                  <div className="flex flex-row items-center gap-2">
                    <div className={`flex items-center justify-center rounded-full w-8 h-8 text-xl bg-black ${review.img}`}>{review.icon}</div>
                    <div className="flex flex-col">
                      <figcaption className="text-sm font-medium text-white">{review.name}</figcaption>
                      <p className="text-xs font-medium text-neutral-400">{review.username}</p>
                    </div>
                  </div>
                  <blockquote className="mt-2 text-sm text-neutral-300">{review.body}</blockquote>
                </figure>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-indigo-black to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-indigo-black to-transparent"></div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-[#09090B] pt-16 pb-8 px-6 mt-20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <Logo className="w-24 h-24 -ml-2" />
              </div>
              <p className="text-neutral-400 text-sm max-w-xs text-center md:text-left">
                Secure, peer-to-peer file sharing directly from your browser. No limits, no cloud.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-12 md:gap-24 text-center md:text-left">
              <div className="flex flex-col gap-3">
                <h4 className="text-white font-semibold mb-2">Product</h4>
                <Link href="/join" className="text-neutral-400 hover:text-white transition-colors text-sm">Enter Code</Link>
                <Link href="/login" className="text-neutral-400 hover:text-white transition-colors text-sm">Sign In</Link>
                <Link href="/signup" className="text-neutral-400 hover:text-white transition-colors text-sm">Get Started</Link>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-white font-semibold mb-2">Legal</h4>
                <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
                <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors text-sm">Contact Us</Link>
              </div>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-xs">
              © {new Date().getFullYear()} Sync. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/su92-bsdsm-f24-038-hub/File-sharing" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors">
                GitHub Repository
              </a>
            </div>
          </div>
        </footer>
      </AnimatePresence>
    </div>
  );
}
