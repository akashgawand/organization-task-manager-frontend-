"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authService } from "@/app/services/authServices";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
  Activity,
  Users,
  Briefcase,
  Layers,
  BarChart4
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { user } = await authService.login(
          formData.email,
          formData.password,
        );
        // Redirect based on role
        if (user.role === "super_admin") router.push("/dashboard/super-admin");
        else if (user.role === "admin") router.push("/dashboard/admin");
        else if (user.role === "team_lead") router.push("/dashboard/team-lead");
        else if (user.role === "senior_developer")
          router.push("/dashboard/senior-developer");
        else router.push("/dashboard/employee");
      } else {
        await authService.register(
          formData.name,
          formData.email,
          formData.password,
        );
        setMode("signin"); // Await login after signup
        alert("Account created! Please sign in.");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-[rgb(var(--color-accent))]/30 bg-[rgb(var(--color-background))]">

      {/* Left 70% Showcase Area (Hidden on small screens) */}
      <div className="hidden lg:flex w-[70%] relative flex-col justify-between overflow-hidden bg-[rgb(var(--color-surface))] border-r border-[rgb(var(--color-border))]">

        {/* Decorative Ambient Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_40%,#000_20%,transparent_100%)] pointer-events-none z-0"></div>
        <div className="absolute top-[-15%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-[rgb(var(--color-accent))]/5 mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[rgb(var(--color-accent-hover))]/5 mix-blend-screen opacity-30 animate-pulse" style={{ animationDuration: '6s' }} />

        {/* Top Header Logo */}
        <div className="relative z-10 px-12 pt-10">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="relative w-16 h-16 drop-shadow-xl group-hover:scale-105 transition-transform duration-500 ease-out">
              <Image src="/logo.png" alt="Apex Quants Logo" fill className="object-contain" priority sizes="64px" />
            </div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--color-text-primary))] to-[rgb(var(--color-text-secondary))] tracking-tight">
              ApexQuants
            </h1>
          </Link>
        </div>

        {/* Center Hero Marketing Text */}
        <div className="relative z-10 px-12 lg:px-20 max-w-5xl mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--color-accent))]/10 border border-[rgb(var(--color-accent))]/20 mb-6 drop-shadow-sm">
            <Shield className="w-4 h-4 text-[rgb(var(--color-accent))]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-accent))]">Institutional-Grade Workflow</span>
          </div>

          <h2 className="text-5xl xl:text-7xl font-bold text-[rgb(var(--color-text-primary))] leading-[1.1] tracking-tight mb-8 drop-shadow-md">
            Unify Your Tasks.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-hover))]">Accelerate Output.</span>
          </h2>

          <p className="text-lg xl:text-xl text-[rgb(var(--color-text-secondary))] max-w-2xl leading-relaxed font-medium">
            Elevate organizational productivity with an enterprise-ready project management ecosystem. Align teams, optimize resources, and generate powerful insights in real-time.
          </p>
        </div>

        {/* Bottom Feature Grid / Floating Cards */}
        <div className="relative z-10 px-12 lg:px-20 pb-16 mt-16 pb-20">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { icon: Layers, title: "Structured Projects", desc: "Organize work intuitively." },
              { icon: Users, title: "Team Collaboration", desc: "Assign seamlessly." },
              { icon: BarChart4, title: "Live Analytics", desc: "Track organizational trends." },
              { icon: Activity, title: "Performance Metrics", desc: "Monitor output daily." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-[rgb(var(--color-background))]/60 border border-[rgb(var(--color-border))] rounded-2xl p-5 hover:border-[rgb(var(--color-accent))]/30 transition-colors shadow-xl shadow-[rgb(var(--color-foreground))]/5 group">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                </div>
                <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] mb-1">{feature.title}</h3>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right 30% Auth Form Area */}
      <div className="w-full lg:w-[30%] min-w-[400px] flex flex-col justify-center relative bg-[rgb(var(--color-background))]">

        {/* Mobile Header Logo (Visible only when left side is hidden) */}
        <div className="lg:hidden absolute top-8 w-full flex justify-center">
          <Link href="/" className="inline-flex flex-col items-center justify-center group">
            <div className="relative w-16 h-16 mb-2 drop-shadow-xl">
              <Image src="/logo.png" alt="Apex Quants Logo" fill className="object-contain" priority sizes="64px" />
            </div>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto p-8 animate-in fade-in slide-in-from-right-8 duration-500 delay-150">

          <div className="mb-8">
            <h2 className="text-3xl font-black text-[rgb(var(--color-text-primary))] tracking-tight mb-2">
              {mode === "signin" ? "Login" : "Register"}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">
              {mode === "signin"
                ? "Enter your credentials to continue."
                : "Create an account to start managing tasks."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase ml-1 block">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase ml-1 block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase ml-1 block">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative cursor-pointer w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-[rgb(var(--color-surface))] bg-[rgb(var(--color-foreground))] hover:bg-[rgb(var(--color-foreground))]/90 shadow-lg shadow-[rgb(var(--color-foreground))]/10 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-md"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[rgb(var(--color-surface))]/30 border-t-[rgb(var(--color-surface))] rounded-full animate-spin relative z-10" />
                ) : (
                  <>
                    <span className="relative z-10 tracking-wide">
                      {mode === "signin" ? "Sign In Securely" : "Create Account"}
                    </span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>

            {/* <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setFormData({ name: "", email: "", password: "" });
                }}
                className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors focus:outline-none cursor-pointer hover:underline"
              >
                {mode === "signin" ? "Don't have an account? Register" : "Already have an account? Sign in"}
              </button>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}
