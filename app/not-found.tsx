"use client";

import { useRouter } from "next/navigation";
import { MoveLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative selection:bg-[rgb(var(--color-accent))]/30">

            {/* Decorative Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                {/* Subtle Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]"></div>
                {/* Glow Spheres */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgb(var(--color-accent))]/10 rounded-full blur-[100px] mix-blend-screen -z-10 opacity-70 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-[rgb(var(--color-accent-hover))]/10 rounded-full blur-[120px] mix-blend-screen -z-10 opacity-60 animate-pulse" style={{ animationDuration: '5s' }}></div>
            </div>

            <div className="max-w-md w-full flex flex-col items-center text-center space-y-10 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Animated Icon Container */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Outer Dashed Orbit */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-[rgb(var(--color-border))] opacity-50 animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 rounded-full border border-dashed border-[rgb(var(--color-accent))]/30 opacity-70 animate-[spin_15s_linear_infinite_reverse]"></div>

                    {/* Glowing Core */}
                    <div className="absolute inset-0 bg-[rgb(var(--color-accent))]/5 rounded-full blur-2xl animate-pulse"></div>

                    {/* Center Icon */}
                    <div className="relative z-10 w-24 h-24 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-full shadow-xl shadow-[rgb(var(--color-foreground))]/5 flex items-center justify-center animate-[bounce_3s_ease-in-out_infinite]">
                        <FileQuestion className="w-12 h-12 text-[rgb(var(--color-accent))] drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[rgb(var(--color-text-primary))] to-[rgb(var(--color-text-secondary))] tracking-tighter drop-shadow-sm">
                        404
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">
                        Looks like you&apos;re lost
                    </h2>
                    <p className="text-base text-[rgb(var(--color-text-secondary))] max-w-[18rem] sm:max-w-sm mx-auto leading-relaxed">
                        We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or you may have mistyped the address.
                    </p>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                    <button
                        onClick={() => router.back()}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[rgb(var(--color-text-primary))] text-[rgb(var(--color-background))] font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        <MoveLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform duration-300 relative z-10" />
                        <span className="relative z-10 tracking-wide">Go Back</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
