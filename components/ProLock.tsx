"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface ProLockProps {
  children: React.ReactNode;
  featureName: string;
}

export function ProLock({ children, featureName }: ProLockProps) {
  const { isPro } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <>
      <div 
        className="relative group cursor-pointer inline-block"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        <div className="opacity-50 pointer-events-none group-hover:opacity-40 transition-opacity">
          {children}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#111217] border border-white/10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
          <Lock className="w-2.5 h-2.5 text-primary-orange" />
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#111217] border border-primary-orange/30 rounded-[24px] p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-orange/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-orange/20 flex items-center justify-center mb-4 text-primary-orange">
                  <Star className="w-6 h-6 fill-primary-orange" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sync Pro Feature</h3>
                <p className="text-sm text-neutral-400 mb-6">
                  {featureName} is available exclusively on the Sync Pro plan.
                </p>
                
                <div className="flex w-full gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1 bg-white/5 text-neutral-400 border-0"
                    onClick={() => setShowModal(false)}
                  >
                    Not Now
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary-orange to-glow-orange border-0 text-white"
                    onClick={() => router.push("/pricing")}
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
