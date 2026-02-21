"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons";
import { authService } from "@/app/services/authServices";
import { UserRole } from "@/types";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Github,
  Chrome,
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

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-background))] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[rgb(var(--color-accent))] opacity-[0.03] blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 opacity-[0.03] blur-[100px]" />

      <div className="w-full max-w-md bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl border border-[rgb(var(--color-border))] overflow-hidden relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-6 hover:scale-105 transition-transform"
          >
            <Logo size={48} />
          </Link>
          <h1 className="text-2xl font-bold mb-2">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] text-sm">
            {mode === "signin"
              ? "Enter your credentials to access your workspace"
              : "Join your team and start managing tasks efficiently"}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input pl-10"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
                  Password
                </label>
                {mode === "signin" && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[rgb(var(--color-accent))] hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full group py-2.5 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgb(var(--color-border))]" />
            <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
              or continue with
            </span>
            <div className="h-px flex-1 bg-[rgb(var(--color-border))]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-secondary w-full text-xs">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </button>
            <button className="btn btn-secondary w-full text-xs">
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="font-medium text-[rgb(var(--color-accent))] hover:underline focus:outline-none"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

    
    </div>
  );
}
