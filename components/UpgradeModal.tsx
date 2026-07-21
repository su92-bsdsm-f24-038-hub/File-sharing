"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, ExternalLink, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

const GUMROAD_URL = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ?? "#";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  popupBlocked: boolean;
}

export function UpgradeModal({ isOpen, onClose, popupBlocked }: UpgradeModalProps) {
  const { user } = useAuth();
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim() || !user) return;
    setError(null);
    setLoading(true);
    try {
      const token = await user.getIdToken(true); // force refresh
      const res = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: licenseKey.trim(), token }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        // Force-refresh token so custom claim plan:pro is picked up immediately
        await auth.currentUser?.getIdToken(true);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1800);
      } else {
        setError(data.error ?? "Invalid license key. Please check and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="relative w-full max-w-md bg-[#15171D] border border-primary-orange/30 rounded-[24px] shadow-[0_0_60px_rgba(255,122,26,0.15)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-orange/10 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111217]">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-primary-orange fill-primary-orange" />
                Unlock Sync Pro
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="relative p-6 flex flex-col gap-5">
              {/* Popup-blocked banner — prominent, not fine print */}
              {popupBlocked ? (
                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                  <ExternalLink className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-amber-300 font-medium mb-1">Popup was blocked by your browser</p>
                    <a
                      href={GUMROAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors"
                    >
                      Open Gumroad to complete your purchase →
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <ExternalLink className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-neutral-400">
                    Complete your purchase in the new tab. Once you receive your license key by email, enter it below to unlock Pro.{" "}
                    <a
                      href={GUMROAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-orange hover:underline"
                    >
                      Didn&apos;t get a tab? Open Gumroad again
                    </a>
                  </p>
                </div>
              )}

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <Input
                  id="license-key"
                  type="text"
                  label="License Key"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  icon={<Key className="w-4 h-4" />}
                  autoFocus
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                  >
                    {error}
                  </motion.p>
                )}

                {success && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Pro unlocked! 🎉 Reloading…
                  </motion.p>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!licenseKey.trim() || success}
                  className="w-full bg-gradient-to-r from-primary-orange to-glow-orange border-0 text-white shadow-[0_0_20px_rgba(255,122,26,0.3)]"
                >
                  Verify &amp; Unlock
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
