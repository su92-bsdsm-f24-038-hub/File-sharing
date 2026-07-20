"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Zap, ArrowLeft, CheckCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setAuthError(null);
    try {
      await resetPassword(data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setAuthError(
        msg.includes("user-not-found")
          ? "No account found with this email."
          : `Failed to send reset email: ${msg || "Unknown error"}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-5%] left-[25%] w-[400px] h-[400px] rounded-full bg-primary-orange/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Logo className="w-14 h-14" />
          </Link>
        </div>

        <GlassCard className="p-8" glow glowColor="primary">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-2xl font-bold mb-2">Reset password</h1>
                <p className="text-sm text-neutral-400 mb-8">
                  Enter your email and we&apos;ll send you a reset link via Firebase.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                  <Input
                    id="reset-email"
                    type="email"
                    label="Email address"
                    placeholder="you@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register("email")}
                  />

                  {authError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                    >
                      {authError}
                    </motion.p>
                  )}

                  <Button type="submit" className="w-full mt-2 bg-gradient-to-r from-primary-orange to-glow-orange hover:shadow-[0_0_20px_rgba(255,122,26,0.3)] border-0" loading={isSubmitting}>
                    Send Reset Email
                  </Button>
                </form>

                <div className="mt-6 flex justify-center">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sign in
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold mb-3">Check your inbox</h2>
                <p className="text-sm text-neutral-400 mb-2">
                  If an account exists, a password reset link was sent to:
                </p>
                <p className="text-sm font-semibold text-primary-orange mb-8">{sentEmail}</p>
                <p className="text-xs text-neutral-500 mb-8 max-w-sm">
                  The link will expire in 1 hour. Check your spam folder if you don&apos;t see it. Note: Firebase may not send an email if the account doesn&apos;t exist due to Email Enumeration Protection.
                </p>

                <div className="flex flex-col items-center gap-3 w-full">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setSent(false);
                      setSentEmail("");
                    }}
                  >
                    Resend email
                  </Button>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-white/5">
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
}
