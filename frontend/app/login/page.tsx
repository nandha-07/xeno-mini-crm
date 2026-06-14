"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Building2,
  ShieldCheck,
  Loader2,
  Copy,
  CheckCircle,
  ArrowRight,
  Globe,
  MapPin,
  Users,
  Banknote,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { TypewriterText } from "@/components/TypewriterText";

type Tab = "organization" | "admin";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-200 text-sm focus:outline-none focus:border-orbit-purple focus:bg-slate-900 placeholder:text-slate-600 transition-all";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("organization");
  const [busy, setBusy] = useState(false);

  // Org sign-in
  const [orgId, setOrgId] = useState("");
  const [orgPassword, setOrgPassword] = useState("");

  // Org sign-up
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [customerSize, setCustomerSize] = useState("1k-10k");
  const [turnover, setTurnover] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (signupPassword !== confirmPassword) return toast.error("Passwords do not match.");
    setBusy(true);
    try {
      const res = await api.auth.orgSignup({
        company_name: companyName.trim(),
        email: email.trim(),
        customer_size: customerSize,
        turnover: turnover || null,
        city: city || null,
        country: country || null,
        website: website || null,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-x-hidden flex flex-col scroll-smooth">
      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orbit-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orbit-blue/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header / Toggle */}
      <div className="relative z-20 w-full p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Xeno
          </h1>
          <span className="text-slate-400 font-medium text-lg tracking-wide">mini CRM</span>
        </Link>
        
        <div className="flex bg-slate-900/60 backdrop-blur-md rounded-full p-1.5 border border-slate-800 shadow-xl">
          <button
            onClick={() => setTab("organization")}
            className={cn(
              "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2",
              tab === "organization" ? "bg-orbit-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" : "text-slate-400 hover:text-white"
            )}
          >
            <Building2 className="w-4 h-4" />
            Organization
          </button>
          <button
            onClick={() => setTab("admin")}
            className={cn(
              "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2",
              tab === "admin" ? "bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)]" : "text-slate-400 hover:text-white"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-8 pb-16 pt-8 flex flex-col lg:flex-row gap-16 lg:gap-24 items-start justify-center">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
          {tab === "organization" ? (
            <div className="space-y-10 animate-slideUp">
              <div className="min-h-[5rem]">
                <h2 className="text-4xl font-bold leading-tight text-white">
                  <TypewriterText text="Sign in for Xeno mini CRM" delay={40} />
                </h2>
                <p className="text-slate-400 mt-2 text-sm opacity-80">Enter your credentials to access your autonomous agents.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Org ID or Email</label>
                  <input
                    className={cn(inputCls, "font-mono")}
                    placeholder="ORB-XXXXXX or email@acme.com"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
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
                  className="w-full py-3.5 bg-gradient-to-r from-orbit-purple to-orbit-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  Sign In
                </button>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900 px-4 text-slate-500 rounded-full border border-slate-800">OR</span>
                  </div>
                </div>
                <button
                  onClick={() => googleLogin()}
                  disabled={busy}
                  className="w-full py-3.5 bg-white hover:bg-gray-100 text-black rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-3 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-slideUp">
              <div className="min-h-[5rem]">
                <h2 className="text-4xl font-bold leading-tight text-white">
                  <TypewriterText text="Platform Admin Login:" delay={40} />
                </h2>
                <p className="text-amber-500 mt-2 text-sm opacity-80 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Secure access restricted to authorized personnel.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Username</label>
                  <input
                    className={inputCls}
                    placeholder="admin"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
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
                  className="w-full py-3.5 mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(217,119,6,0.3)] flex items-center justify-center gap-2 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Authenticate as Admin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px h-[600px] bg-gradient-to-b from-transparent via-slate-800 to-transparent mt-12"></div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">
          {tab === "organization" ? (
            <div className="space-y-10 animate-slideUp" style={{ animationDelay: "0.1s" }}>
              <div className="min-h-[5rem]">
                <h2 className="text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  <TypewriterText text="Sign up for Xeno mini CRM" delay={40} />
                </h2>
                <p className="text-slate-400 mt-2 text-sm opacity-80">Setup your organization and connect with shoppers in seconds.</p>
              </div>

              {!generatedOrgId ? (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Company Name *</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        className={cn(inputCls, "pl-10")}
                        placeholder="Acme Beauty Pvt Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        className={cn(inputCls, "pl-10")}
                        type="email"
                        placeholder="founder@acme.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Customer Size</label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          className={cn(inputCls, "pl-10 appearance-none cursor-pointer")}
                          value={customerSize}
                          onChange={(e) => setCustomerSize(e.target.value)}
                        >
                          <option value="<1k">Under 1,000</option>
                          <option value="1k-10k">1k – 10k</option>
                          <option value="10k-100k">10k – 100k</option>
                          <option value="100k+">100k+</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Annual Turnover</label>
                      <div className="relative">
                        <Banknote className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          className={cn(inputCls, "pl-10")}
                          placeholder="₹5 Cr"
                          value={turnover}
                          onChange={(e) => setTurnover(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>City</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          className={cn(inputCls, "pl-10")}
                          placeholder="Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <input
                        className={inputCls}
                        placeholder="India"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Set Password *</label>
                      <input
                        type="password"
                        className={inputCls}
                        placeholder="Min 6 chars"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Confirm *</label>
                      <input
                        type="password"
                        className={inputCls}
                        placeholder="Repeat"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleOrgSignup}
                    disabled={busy}
                    className="w-full py-3.5 mt-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-orbit-blue" />}
                    Create Organization
                  </button>
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-slate-900 px-4 text-slate-500 rounded-full border border-slate-800">OR</span>
                    </div>
                  </div>
                  <button
                    onClick={() => googleLogin()}
                    disabled={busy}
                    className="w-full py-3.5 bg-white hover:bg-gray-100 text-black rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-3 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-orbit-teal/30 p-8 rounded-3xl text-center shadow-[0_0_40px_rgba(20,184,166,0.15)] animate-slideUp">
                  <CheckCircle className="w-16 h-16 text-orbit-teal mx-auto mb-6" />
                  <h3 className="text-white font-bold text-2xl mb-2">Organization Created!</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    This is your unique <span className="text-orbit-purple font-semibold">Org ID</span> — you will use it to sign in. Please save it somewhere secure.
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <code className="text-3xl font-mono font-bold text-purple-300 bg-slate-950 border-2 border-purple-900/40 px-6 py-4 rounded-xl tracking-widest shadow-inner">
                      {generatedOrgId}
                    </code>
                    <button
                      onClick={copyOrgId}
                      className="p-4 rounded-xl border border-slate-700 hover:border-orbit-purple hover:bg-orbit-purple/10 text-slate-400 hover:text-orbit-purple transition-all"
                    >
                      <Copy className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setOrgId(generatedOrgId);
                      setGeneratedOrgId(null);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-orbit-purple to-orbit-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                  >
                    Continue to Sign In <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10 flex flex-col justify-center h-full animate-slideUp" style={{ animationDelay: "0.2s" }}>
              <div className="min-h-[5rem]">
                <h2 className="text-3xl font-bold text-amber-500 mb-4">
                  <TypewriterText text="Why the Admin matters." delay={40} />
                </h2>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-8 border-l-4 border-amber-600 pl-4">
                A single centralized administrator securely manages multiple isolated organizations. You oversee data, platform settings, and global metrics without mixing individual CRM instances.
              </p>
              
              {/* Importance of Admin Diagram */}
              <div className="flex flex-col items-center gap-6 mt-12 opacity-90 p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(217,119,6,0.3)] text-lg border border-amber-400/30">
                  <ShieldCheck className="w-6 h-6" />
                  Orbit Platform Admin
                </div>
                
                {/* Connector lines */}
                <div className="flex flex-col items-center">
                  <div className="h-10 w-1 bg-amber-600/50 rounded-full"></div>
                  <div className="w-[300px] h-1 bg-amber-600/50 rounded-full flex justify-between relative">
                    <div className="w-1 h-6 bg-amber-600/50 absolute left-0 top-0 rounded-full"></div>
                    <div className="w-1 h-6 bg-amber-600/50 absolute left-1/2 top-0 -translate-x-1/2 rounded-full"></div>
                    <div className="w-1 h-6 bg-amber-600/50 absolute right-0 top-0 rounded-full"></div>
                  </div>
                </div>

                <div className="flex gap-6 mt-2 w-[340px] justify-between">
                  <div className="bg-slate-950 border-2 border-orbit-purple/30 text-white px-4 py-3 rounded-xl flex flex-col items-center gap-2 w-24 hover:-translate-y-1 transition-transform">
                    <Building2 className="w-5 h-5 text-orbit-purple" />
                    <span className="text-xs font-semibold">Org A</span>
                  </div>
                  <div className="bg-slate-950 border-2 border-orbit-blue/30 text-white px-4 py-3 rounded-xl flex flex-col items-center gap-2 w-24 hover:-translate-y-1 transition-transform">
                    <Building2 className="w-5 h-5 text-orbit-blue" />
                    <span className="text-xs font-semibold">Org B</span>
                  </div>
                  <div className="bg-slate-950 border-2 border-orbit-teal/30 text-white px-4 py-3 rounded-xl flex flex-col items-center gap-2 w-24 hover:-translate-y-1 transition-transform">
                    <Building2 className="w-5 h-5 text-orbit-teal" />
                    <span className="text-xs font-semibold">Org C</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
