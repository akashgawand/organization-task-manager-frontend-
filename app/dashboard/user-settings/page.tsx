"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import { userService } from "@/app/services/userServices";
import { authService } from "@/app/services/authServices";
import { Shield, KeyRound, Mail, Save, User as UserIcon, Monitor, Edit, Eye, EyeOff, Loader2 } from "lucide-react";
import Avatar from "@/components/shared/Avatar";

export default function UserSettingsPage() {
    const { user } = useAuth();

    // State for Personal Info
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            // Bypass SSR hydration mismatch by explicitly grabbing real token ID on mount
            const currentUser = authService.getCurrentUser();
            if (currentUser?.id) {
                try {
                    const data = await userService.getUserById(currentUser.id);
                    if (data) {
                        setName(data.name || "");
                        setEmail(data.email || "");
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };

        fetchUserData();
    }, []);

    // State for Security
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Toggle state for passwords
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Loading states
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSavingProfile(true);
            await userService.updateOwnProfile({
                name,
                email,
                phone
            });
            toast.success("Profile updated successfully!");

            // Instantly sync TopNav and permissions context via event bus
            authService.updateCurrentUser({ name, email });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }

        try {
            setIsUpdatingPassword(true);
            await userService.updateOwnPassword({
                currentPassword,
                newPassword
            });
            toast.success("Password updated successfully!");

            // Clear fields on success
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent))]/70 flex items-center justify-center shadow-lg shadow-[rgb(var(--color-accent))]/20">
                            <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--color-text-primary))]">
                                Account Settings
                            </h1>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-0.5">
                                Manage your personal profile, security, and preferences.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-[rgb(var(--color-surface))] rounded-3xl border border-[rgb(var(--color-border))] shadow-lg shadow-[rgb(var(--color-foreground))]/5 overflow-hidden transition-all duration-300 relative">

                        {/* Banner Background */}
                        <div className="h-32 bg-gradient-to-r from-[rgb(var(--color-accent))] via-[rgb(var(--color-accent-hover))] to-[rgba(var(--color-accent-hover),0.6)] relative overflow-hidden">
                            {/* Decorative bubbles */}
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-10 translate-y-1/3 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
                        </div>

                        <div className="px-6 sm:px-10 pb-8 sm:pb-10 relative">
                            {/* Avatar & Header */}
                            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 sm:-mt-16 mb-8">
                                <div className="relative inline-block group">
                                    <div className="p-1.5 bg-[rgb(var(--color-surface))] rounded-2xl shadow-md inline-block relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-xl border border-[rgb(var(--color-border))] relative">
                                            <Avatar name={name || "User"} avatar={user?.avatar} size="lg" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-[2px]">
                                                <Edit className="w-6 h-6 text-white mb-1" />
                                                <span className="text-white text-xs font-medium">Change</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 pb-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">
                                                {name}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-[rgba(var(--color-accent),0.1)] text-[rgb(var(--color-accent))] border border-[rgba(var(--color-accent),0.2)]">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    {user?.role.replace(/_/g, " ") || "Member"}
                                                </span>
                                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[rgb(var(--color-text-tertiary))]"></span>
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <Mail className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                                    {email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgb(var(--color-border))] to-transparent mb-8"></div>

                            <form onSubmit={handleSaveProfile} className="max-w-3xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-[rgba(var(--color-accent),0.1)] flex items-center justify-center text-[rgb(var(--color-accent))]">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-[rgb(var(--color-text-primary))]">
                                            Personal Information
                                        </h3>
                                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">Update your profile details and public contact information.</p>
                                    </div>
                                </div>

                                <div className="bg-[rgb(var(--color-background))] rounded-2xl border border-[rgb(var(--color-border))] p-6 sm:p-8 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-semibold text-[rgb(var(--color-text-secondary))]">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <UserIcon className="h-4 w-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-semibold text-[rgb(var(--color-text-secondary))]">Email Address</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Mail className="h-4 w-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        {/* <div className="space-y-1.5 sm:col-span-2">
                                            <label className="block text-sm font-semibold text-[rgb(var(--color-text-secondary))]">Phone Number</label>
                                            <div className="relative group sm:w-1/2">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <Monitor className="h-4 w-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                                                    placeholder="Your phone number"
                                                />
                                            </div>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSavingProfile}
                                        className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] shadow-md shadow-[rgb(var(--color-accent))]/20 hover:shadow-lg hover:shadow-[rgb(var(--color-accent))]/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSavingProfile ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {isSavingProfile ? "Saving..." : "Save Profile Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-[rgb(var(--color-surface))] rounded-2xl border border-[rgb(var(--color-border))] shadow-sm overflow-hidden transition-all duration-300 hover:border-[rgb(var(--color-border-hover))]">
                        <div className="p-6 sm:p-8 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-[rgba(var(--color-surface-hover),0.5)] to-transparent">
                            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[rgb(var(--color-success))]" />
                                Security & Password
                            </h3>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                                Ensure your account is using a long, random password to stay secure.
                            </p>
                        </div>

                        <div className="p-6 sm:p-8">
                            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-3xl">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-[rgb(var(--color-text-secondary))]">Current Password</label>
                                    <div className="relative group lg:w-2/3">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <KeyRound className="h-4 w-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                                        </div>
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full pl-10 pr-11 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors z-10"
                                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:w-2/3">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-[rgb(var(--color-text-secondary))]">New Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <KeyRound className="h-4 w-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                                            </div>
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-10 pr-11 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors z-10"
                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-[rgb(var(--color-text-secondary))]">Confirm Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <KeyRound className="h-4 w-4 text-[rgb(var(--color-text-tertiary))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-11 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] transition-all duration-200 shadow-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors z-10"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-start">
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                        className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[rgb(var(--color-surface))] bg-[rgb(var(--color-foreground))] hover:bg-[rgb(var(--color-foreground))]/90 shadow-md shadow-[rgb(var(--color-foreground))]/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isUpdatingPassword ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <KeyRound className="w-4 h-4" />
                                        )}
                                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
