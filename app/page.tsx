"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Shield, ArrowRight, Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FlowAnimationCard } from "@/components/ui/FlowAnimationCard";
import { Sparkles } from "@/components/sparkles";
import Earth from "@/components/globe";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedBeam, Circle, Icons } from "@/components/ui/animated-beam";
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
    { name: "Alice", username: "@alice", body: "Sync is insanely fast! Never going back.", img: "bg-primary-orange" },
    { name: "Bob", username: "@bob", body: "Finally a tool that doesn't use the cloud.", img: "bg-blue-500" },
    { name: "Charlie", username: "@charlie", body: "The P2P transfers are magical.", img: "bg-green-500" },
    { name: "Diana", username: "@diana", body: "Beautiful UI and it just works.", img: "bg-purple-500" },
    { name: "Eve", username: "@eve", body: "I love the end-to-end encryption.", img: "bg-pink-500" },
    { name: "Frank", username: "@frank", body: "No size limits? Count me in.", img: "bg-yellow-500" },
  ];
  const firstRow = reviews.slice(0, reviews.length / 2);
  const secondRow = reviews.slice(reviews.length / 2);

  return (
    <div className="relative min-h-screen overflow-hidden bg-indigo-black">
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
        <section ref={heroRef} className="relative z-10 pt-20 pb-20 px-6 w-full text-center">
          {/* Sparkles Title Effect */}
          <div className="absolute inset-0 w-full h-[600px] overflow-hidden mask-[radial-gradient(50%_50%,white,transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#FF7A1A,transparent_90%)] before:opacity-30">
            <Sparkles density={400} size={1.4} direction="top" color="#FF7A1A" className="absolute inset-x-0 top-0 h-full w-full mask-[radial-gradient(50%_50%,white,transparent_85%)]" />
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center gap-8 mt-12 max-w-5xl mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-primary-orange/10 border border-primary-orange/20 text-primary-orange backdrop-blur-md shadow-[0_0_20px_rgba(255,122,26,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-orange animate-pulse" />
                Real-time · No cloud · Secure Peer-to-Peer
              </span>
            </motion.div>

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
                    <div className={`rounded-full w-8 h-8 ${review.img}`}></div>
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
                    <div className={`rounded-full w-8 h-8 ${review.img}`}></div>
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

        {/* CTA */}
        <section className="relative z-10 py-32 px-6 max-w-4xl mx-auto text-center">
          <GlassCard className="p-20" glow glowColor="primary">
            <h2 className="text-5xl font-extrabold mb-6 tracking-tight">Ready to <span className="text-primary-orange">Sync?</span></h2>
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
        </section>
      </AnimatePresence>
    </div>
  );
}
