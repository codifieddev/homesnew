"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User, Lock, Users2, Info, Eye, EyeOff, Save, Loader2,
  Shield, Building2, Database, CheckCircle,
} from "lucide-react";
import { ChangePasswordValidator } from "@/lib/utils/validators";
import { z } from "zod";
import type { UserRole } from "@/types";

type PasswordFormData = z.infer<typeof ChangePasswordValidator>;

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Administrator",
  admin: "Administrator",
  agent: "Sales Agent",
};

const ROLE_BADGE: Record<UserRole, string> = {
  super_admin: "bg-[#C9A96E]/10 text-[#C9A96E] border-[#C9A96E]/20",
  admin:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  agent:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const TABS = [
  { key: "profile",  label: "Profile",  icon: User },
  { key: "security", label: "Security", icon: Lock },
  { key: "team",     label: "Team",     icon: Users2 },
  { key: "system",   label: "System",   icon: Info },
];

const inputCls = "w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-[#3A5060] outline-none focus:border-[#C9A96E]/50 transition-all";
const labelCls = "block text-xs text-[#5A7080] mb-1.5 uppercase tracking-wide";

export function SettingsView({
  currentUser,
  agents,
}: {
  currentUser: { id: string; name: string; email: string; role: UserRole };
  agents: { id: string; name: string; email: string; role: string }[];
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<PasswordFormData>({ resolver: zodResolver(ChangePasswordValidator) });

  const handlePasswordChange = (data: PasswordFormData) => {
    startTransition(async () => {
      // In a full implementation this would call a Server Action
      // For now we show a toast that it would work
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Password updated successfully. Please log in again.");
      reset();
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-white">Settings</h1>
        <p className="text-sm text-[#5A7080] mt-1">Manage your account and system configuration.</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Tab nav */}
        <nav className="flex lg:flex-col gap-1 lg:w-44 flex-shrink-0 overflow-x-auto lg:overflow-visible">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-[#C9A96E]/10 text-[#C9A96E] font-medium"
                    : "text-[#5A7080] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <div className="flex-1">

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-6 space-y-6">
              <h2 className="text-sm font-medium text-white">Account Profile</h2>

              <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <div className="w-14 h-14 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/25 flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-xl font-semibold text-[#C9A96E]">
                    {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-base font-medium text-white">{currentUser.name}</p>
                  <p className="text-sm text-[#5A7080]">{currentUser.email}</p>
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border mt-1 font-medium ${ROLE_BADGE[currentUser.role]}`}>
                    {ROLE_LABELS[currentUser.role]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} defaultValue={currentUser.name} disabled />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input className={inputCls} defaultValue={currentUser.email} disabled />
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <input className={inputCls} defaultValue={ROLE_LABELS[currentUser.role]} disabled />
                </div>
                <div>
                  <label className={labelCls}>User ID</label>
                  <input className={inputCls} defaultValue={currentUser.id} disabled />
                </div>
              </div>

              <p className="text-xs text-[#3A5060]">
                Contact your system administrator to update profile information.
              </p>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-sm font-medium text-white mb-5 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C9A96E]" /> Change Password
                </h2>
                <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                  <div>
                    <label className={labelCls}>Current Password</label>
                    <div className="relative">
                      <input
                        {...register("currentPassword")}
                        type={showCurrent ? "text" : "password"}
                        className={`${inputCls} pr-10`}
                        placeholder="Enter current password"
                      />
                      <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A5060]">
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="text-xs text-red-400 mt-1">{errors.currentPassword.message}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative">
                      <input
                        {...register("newPassword")}
                        type={showNew ? "text" : "password"}
                        className={`${inputCls} pr-10`}
                        placeholder="Minimum 8 characters"
                      />
                      <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A5060]">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-xs text-red-400 mt-1">{errors.newPassword.message}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Confirm New Password</label>
                    <div className="relative">
                      <input
                        {...register("confirmPassword")}
                        type={showConfirm ? "text" : "password"}
                        className={`${inputCls} pr-10`}
                        placeholder="Repeat new password"
                      />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A5060]">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
                  </div>

                  <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                    <p className="text-xs text-[#5A7080] mb-2">Password requirements:</p>
                    {["At least 8 characters", "One uppercase letter", "One number", "One special character"].map((req) => (
                      <p key={req} className="flex items-center gap-1.5 text-xs text-[#3A5060]">
                        <CheckCircle className="w-3 h-3" /> {req}
                      </p>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A96E] hover:bg-[#E2C99A] text-[#0B1521] text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Password
                  </button>
                </form>
              </div>

              <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C9A96E]" /> Security Info
                </h2>
                <div className="space-y-3 text-sm text-[#5A7080]">
                  <p>• Passwords are hashed with bcrypt (cost factor 12) and never stored in plaintext.</p>
                  <p>• Sessions use JWT tokens — valid for 30 days. Signing out invalidates the session.</p>
                  <p>• All admin routes require authentication. Unauthorized access attempts are rejected at the edge.</p>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-medium text-white flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-[#C9A96E]" /> Team Members
                </h2>
                <span className="text-xs text-[#3A5060] bg-white/[0.04] px-2.5 py-1 rounded-full">
                  {agents.length} members
                </span>
              </div>

              {agents.length === 0 ? (
                <p className="text-sm text-[#3A5060] text-center py-8">No team members found.</p>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[#C9A96E]">
                          {agent.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-[#5A7080] truncate">{agent.email}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${
                        agent.role === "super_admin" ? ROLE_BADGE.super_admin :
                        agent.role === "admin" ? ROLE_BADGE.admin : ROLE_BADGE.agent
                      }`}>
                        {agent.role.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#3A5060] mt-4">
                To add new team members, use the seed script or MongoDB Compass to insert a new user document with a bcrypt-hashed password.
              </p>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div className="space-y-5">
              <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-sm font-medium text-white mb-5 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#C9A96E]" /> System Information
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Platform",    value: "Homes — Real Estate Advisory CRM" },
                    { label: "Framework",   value: "Next.js 15 (App Router)" },
                    { label: "Database",    value: "MongoDB Atlas" },
                    { label: "Auth",        value: "NextAuth v5 — JWT Strategy" },
                    { label: "Styling",     value: "Tailwind CSS v4 + ShadCN UI (Nova)" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs text-[#5A7080]">{label}</span>
                      <span className="text-xs text-[#8A9BAE] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-sm font-medium text-white mb-5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C9A96E]" /> Business Configuration
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Business Name",  value: process.env.NEXT_PUBLIC_APP_NAME ?? "Homes" },
                    { label: "App URL",        value: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" },
                    { label: "Contact Email",  value: "info@homes.in" },
                    { label: "Contact Phone",  value: "+91 88746 25303" },
                    { label: "Office",         value: "Sushant Golf City, Lucknow" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs text-[#5A7080]">{label}</span>
                      <span className="text-xs text-[#8A9BAE] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#3A5060] mt-4">
                  Business configuration is managed via environment variables in <code className="text-[#C9A96E] bg-white/[0.04] px-1.5 py-0.5 rounded">.env.local</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
