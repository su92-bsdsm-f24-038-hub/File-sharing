"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

import { DashboardSkeleton } from "@/components/DashboardSkeleton";

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setAuthError(null);
    try {
      await signUp(data.name, data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setAuthError(
        msg.includes("email-already-in-use")
          ? "This email is already registered. Try signing in."
          : `Registration failed: ${msg || "Unknown error"}`
      );
    }
  };

  const handleGoogle = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      setShowSkeleton(true);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setAuthError(`Google sign-up failed: ${msg}`);
      setGoogleLoading(false);
    }
  };

  if (showSkeleton || isSubmitting) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-primary-orange/20 blur-[60px] md:blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[10%] w-[350px] h-[350px] rounded-full bg-glow-orange/15 blur-[40px] md:blur-[100px]" />
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-neutral-400 mt-1">Free forever. No credit card.</p>
        </div>

        <GlassCard className="p-8" glow glowColor="primary">
          <Button
            variant="secondary"
            className="w-full mb-6 text-primary-orange border-primary-orange/30 hover:bg-primary-orange/10"
            onClick={handleGoogle}
            loading={googleLoading}
            icon={<GoogleIcon />}
          >
            Sign up with Google
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-neutral-600">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              id="name"
              type="text"
              label="Full Name"
              placeholder="Jane Smith"
              icon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              autoComplete="name"
              {...register("name")}
            />

            <Input
              id="signup-email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              autoComplete="email"
              {...register("email")}
            />

            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-neutral-500 hover:text-primary-orange transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register("password")}
            />

            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              label="Confirm Password"
              placeholder="Repeat password"
              icon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-neutral-500 hover:text-primary-orange transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register("confirmPassword")}
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

            <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-orange hover:text-white font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
