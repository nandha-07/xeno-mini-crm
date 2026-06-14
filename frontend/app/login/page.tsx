"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Loader2,
  Copy,
  CheckCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { useGoogleLogin } from "@react-oauth/google";

type Tab = "organization" | "admin";
type Mode = "signin" | "signup";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-200 text-sm focus:outline-none focus:border-orbit-purple focus:bg-slate-900 placeholder:text-slate-600 transition-all";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("organization");
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);

  // Org sign-in
  const [orgId, setOrgId] = useState("");
  const [orgPassword, setOrgPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [turnover, setTurnover] = useState("");
  const [generatedOrgId, setGeneratedOrgId] = useState<string | null>(null);

  // Admin
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const handleOrgSignin = async () => {
    if (!orgId.trim() || !orgPassword) return toast.error("Enter your Org ID and password.");
    setBusy(true);
    try {
      const res = await api.auth.orgLogin(orgId.trim(), orgPassword);
      setSession(res);
      toast.success(`Welcome back, ${res.company_name}!`);
      router.push("/welcome");
    } catch (e: any) {
      toast.error(e.message ?? "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleOrgSignup = async () => {
    if (!companyName.trim()) return toast.error("Company name is required.");
    if (!email.trim() || !email.includes("@")) return toast.error("A valid email is required.");
    if (signupPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    setBusy(true);
    try {
      const res = await api.auth.orgSignup({
        company_name: companyName.trim(),
        email: email.trim(),
        customer_size: companySize || "1k-10k",
        turnover: turnover || null,
        city: city.trim() || null,
        country: country.trim() || null,
        website: null,
        password: signupPassword,
      });
      setGeneratedOrgId(res.org_id);
      toast.success("Organization registered!");
    } catch (e: any) {
      toast.error(e.message ?? "Signup failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleAdminLogin = async () => {
    setBusy(true);
    try {
      const res = await api.auth.adminLogin(adminUser, adminPass);
      setSession(res);
      toast.success("Admin authenticated.");
      router.push("/welcome");
    } catch (e: any) {
      toast.error(e.message ?? "Invalid admin credentials.");
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setBusy(true);
      try {
        const res = await api.auth.googleLogin(tokenResponse.access_token);
        setSession(res);
        toast.success(`Welcome, ${res.company_name}!`);
        router.push("/welcome");
      } catch (e: any) {
        toast.error(e.message ?? "Google login failed.");
      } finally {
        setBusy(false);
      }
    },
    onError: () => toast.error("Google authentication failed"),
  });

  const copyOrgId = () => {
    if (generatedOrgId) {
      navigator.clipboard.writeText(generatedOrgId);
      toast.success("Org ID copied!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090b] via-[#0f172a] to-[#020617] relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orbit-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orbit-blue/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="text-center z-10 mb-8 animate-slideUp">
        <Link href="/" className="inline-flex flex-col items-center hover:opacity-80 transition-opacity">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
            Xeno
          </h1>
          <span className="text-slate-300 font-medium tracking-widest text-sm uppercase">mini CRM</span>
        </Link>
        <p className="text-slate-500 text-sm mt-4 tracking-wide">Your brand. Your shoppers. One AI that connects them.</p>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#0b101e]/80 backdrop-blur-md rounded-3xl border border-slate-800/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-6 animate-slideUp" style={{ animationDelay: "0.1s" }}>
        
        {/* Top Tab Toggle */}
        <div className="flex bg-[#0f172a] rounded-2xl p-1.5 border border-slate-800 mb-6">
          <button
            onClick={() => setTab("organization")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2",
              tab === "organization" 
                ? "bg-gradient-to-r from-orbit-purple to-orbit-blue text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Building2 className="w-4 h-4" />
            Organization
          </button>
          <button
            onClick={() => setTab("admin")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2",
              tab === "admin" 
                ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </button>
        </div>

        {tab === "organization" ? (
          <div>
            {!generatedOrgId ? (
              <>
                {/* Sign In / Sign Up Sub-tabs */}
                <div className="flex items-center gap-6 mb-6 px-2 border-b border-slate-800/80">
                  <button
                    onClick={() => setMode("signin")}
                    className={cn(
                      "pb-3 text-sm font-semibold transition-colors border-b-2",
                      mode === "signin" ? "border-orbit-purple text-orbit-purple" : "border-transparent text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={cn(
                      "pb-3 text-sm font-semibold transition-colors border-b-2",
                      mode === "signup" ? "border-orbit-purple text-orbit-purple" : "border-transparent text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Sign Up
                  </button>
                </div>

                {mode === "signin" ? (
                  <div className="space-y-4 animate-slideUp" key="signin">
                    <div>
                      <label className={labelCls}>ORG ID OR EMAIL</label>
                      <input
                        className={cn(inputCls, "font-mono")}
                        placeholder="ORB-XXXXXX or email@acme.com"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>PASSWORD</label>
                      <input
                        type="password"
                        className={inputCls}
                        placeholder="••••••••"
                        value={orgPassword}
                        onChange={(e) => setOrgPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleOrgSignin()}
                      />
                    </div>
                    <button
                      onClick={handleOrgSignin}
                      disabled={busy}
                      className="w-full py-3.5 mt-2 bg-gradient-to-r from-orbit-purple to-orbit-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                      Sign In
                    </button>
                    
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800/80"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                        <span className="bg-[#0b101e] px-4 text-slate-600">OR</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => googleLogin()}
                      disabled={busy}
                      className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 disabled:opacity-50 border border-slate-700"
                    >
                      <div className="bg-white p-1 rounded">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      Sign in with Google
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-slideUp" key="signup">
                    <div>
                      <label className={labelCls}>COMPANY NAME *</label>
                      <input
                        className={inputCls}
                        placeholder="Acme Beauty Pvt Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>EMAIL ADDRESS *</label>
                      <input
                        className={inputCls}
                        type="email"
                        placeholder="founder@acme.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>CITY (Optional)</label>
                        <input
                          className={inputCls}
                          placeholder="E.g. Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>COUNTRY (Optional)</label>
                        <input
                          className={inputCls}
                          placeholder="E.g. India"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>COMPANY SIZE (Optional)</label>
                        <select
                          className={cn(inputCls, "appearance-none")}
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option value="1-10">1-10 Employees</option>
                          <option value="11-50">11-50 Employees</option>
                          <option value="51-200">51-200 Employees</option>
                          <option value="201-500">201-500 Employees</option>
                          <option value="500+">500+ Employees</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>ANNUAL TURNOVER (Optional)</label>
                        <select
                          className={cn(inputCls, "appearance-none")}
                          value={turnover}
                          onChange={(e) => setTurnover(e.target.value)}
                        >
                          <option value="">Select...</option>
                          <option value="< $1M">&lt; $1M</option>
                          <option value="$1M - $5M">$1M - $5M</option>
                          <option value="$5M - $20M">$5M - $20M</option>
                          <option value="$20M+">$20M+</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>PASSWORD *</label>
                      <input
                        type="password"
                        className={inputCls}
                        placeholder="Min 6 chars"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleOrgSignup}
                      disabled={busy}
                      className="w-full py-3.5 mt-2 bg-gradient-to-r from-orbit-purple to-orbit-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                      Create Organization
                    </button>
                    
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800/80"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                        <span className="bg-[#0b101e] px-4 text-slate-600">OR</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => googleLogin()}
                      disabled={busy}
                      className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 disabled:opacity-50 border border-slate-700"
                    >
                      <div className="bg-white p-1 rounded">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      Sign up with Google
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 animate-slideUp">
                <CheckCircle className="w-16 h-16 text-orbit-teal mx-auto mb-6" />
                <h3 className="text-white font-bold text-2xl mb-2">Organization Created!</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  This is your unique <span className="text-orbit-purple font-semibold">Org ID</span> — you will use it to sign in. Save it somewhere secure.
                </p>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <code className="text-2xl font-mono font-bold text-purple-300 bg-slate-950 border border-purple-900/40 px-6 py-4 rounded-xl tracking-widest shadow-inner">
                    {generatedOrgId}
                  </code>
                  <button
                    onClick={copyOrgId}
                    className="p-4 rounded-xl border border-slate-700 hover:border-orbit-purple hover:bg-orbit-purple/10 text-slate-400 hover:text-orbit-purple transition-all"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setMode("signin");
                    setOrgId(generatedOrgId);
                    setGeneratedOrgId(null);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orbit-purple to-orbit-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                >
                  Continue to Sign In <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5 animate-slideUp" key="admin">
            <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl flex items-start gap-3 mb-6">
              <Lock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-amber-500/90 text-xs font-medium leading-relaxed">
                Platform administrator access. Organization data tools and global settings.
              </p>
            </div>

            <div>
              <label className={labelCls}>USERNAME</label>
              <input
                className={inputCls}
                placeholder="admin"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>PASSWORD</label>
              <input
                type="password"
                className={inputCls}
                placeholder="••••••"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
            </div>
            <button
              onClick={handleAdminLogin}
              disabled={busy}
              className="w-full py-3.5 mt-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(217,119,6,0.2)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Admin Sign In
            </button>
          </div>
        )}
      </div>

      <p className="mt-12 text-slate-600 text-xs tracking-wide z-10 animate-slideUp" style={{ animationDelay: "0.2s" }}>
        Xeno Mini CRM · Built for D2C brands
      </p>
    </div>
  );
}
