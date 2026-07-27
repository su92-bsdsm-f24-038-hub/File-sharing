import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-indigo-black relative overflow-hidden w-full">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] rounded-full bg-primary-orange/5 blur-[120px] animate-blob" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-glow-orange/5 blur-[120px] animate-blob animation-delay-2000" />
      </div>

      {/* Header Skeleton */}
      <header className="relative z-10 border-b border-white/5 px-6 py-4 bg-[#09090B]/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="w-32 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-40 h-9 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-24 h-9 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 w-full text-left">
        {/* Title Skeleton */}
        <div className="mb-10">
          <div className="w-48 h-10 bg-white/5 rounded-xl animate-pulse mb-3" />
          <div className="max-w-96 w-full h-5 bg-white/5 rounded-xl animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Panel Skeleton */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <GlassCard className="p-8">
              <div className="w-full h-8 bg-white/5 rounded-xl animate-pulse mb-6" />
              <div className="w-full h-[200px] bg-white/5 rounded-[24px] animate-pulse mb-8" />
              <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
            </GlassCard>
            <GlassCard className="p-6">
              <LoadingSkeleton lines={4} />
            </GlassCard>
          </div>

          {/* Right Panel Skeleton */}
          <div className="lg:col-span-3">
            <GlassCard className="h-[700px] p-6 flex flex-col">
              <div className="w-40 h-8 bg-white/5 rounded-xl animate-pulse mb-6" />
              <div className="flex-1">
                <LoadingSkeleton lines={8} />
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
