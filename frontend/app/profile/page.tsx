"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User, Lock, Building, Loader2, Save, Globe, MapPin, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [customerSize, setCustomerSize] = useState("");
  const [turnover, setTurnover] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.profile.get();
      setCompanyName(data.company_name || "");
      setWebsite(data.website || "");
      setCity(data.city || "");
      setCountry(data.country || "");
      setCustomerSize(data.customer_size || "");
      setTurnover(data.turnover || "");
    } catch (err: any) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }

    setIsSavingProfile(true);
    try {
      await api.profile.update({
        company_name: companyName,
        website: website || null,
        city: city || null,
        country: country || null,
        customer_size: customerSize || null,
        turnover: turnover || null,
      });
      toast.success("Profile updated successfully!");
      // Optionally update session store if company_name changes, but standard refresh will do
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.profile.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orbit-purple" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your company details and account security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        {[
          { id: "company", label: "Company Details", icon: Building2 },
          { id: "security", label: "Security", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 px-1 transition-all",
                activeTab === tab.id
                  ? "border-orbit-purple text-orbit-purple"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="pt-4">
        {/* Tab 1: Company Details */}
        {activeTab === "company" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Country
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Customer Size
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                      value={customerSize}
                      onChange={(e) => setCustomerSize(e.target.value)}
                    >
                      <option value="">Select Size</option>
                      <option value="<1k">&lt;1k</option>
                      <option value="1k-10k">1k-10k</option>
                      <option value="10k-100k">10k-100k</option>
                      <option value="100k+">100k+</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Annual Turnover
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $1M - $5M"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                      value={turnover}
                      onChange={(e) => setTurnover(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-orbit-purple hover:bg-orbit-purple/80 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Security */}
        {activeTab === "security" && (
          <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-colors border border-slate-700 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
