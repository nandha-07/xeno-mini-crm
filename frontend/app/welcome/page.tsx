"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  MessagesSquare,
  Target,
  Activity,
  Bot,
  FileSearch,
  LogOut,
  Trash2,
  Loader2,
} from "lucide-react";
import { getSession, clearSession, setSession, type Session } from "@/lib/auth";
import { api } from "@/lib/api";

const FEATURES = [
  {
    icon: Target,
    title: "Segments in Plain English",
    desc: "Type “high spenders who went quiet for 60 days” — our AI turns it into a live audience instantly. No SQL, no filters to learn.",
    accent: "from-orbit-purple/20 to-purple-600/5 border-purple-800/30",
    iconColor: "text-orbit-purple",
  },
  {
    icon: MessagesSquare,
    title: "1:1 Personalized Messaging",
    desc: "Every customer gets a unique message referencing their name, last product, and habits — written by AI at send time, across WhatsApp, SMS, Email & RCS.",
    accent: "from-indigo-600/20 to-orbit-blue/5 border-indigo-800/30",
    iconColor: "text-orbit-blue",
  },
  {
    icon: BrainCircuit,
    title: "Churn Prediction Built-In",
    desc: "Every customer is scored on Recency, Frequency & Monetary value automatically. Know who’s about to leave before they do.",
    accent: "from-fuchsia-600/20 to-fuchsia-600/5 border-fuchsia-800/30",
    iconColor: "text-orbit-purple",
  },
  {
    icon: Bot,
    title: "An AI Copilot That Acts",
    desc: "Describe your goal in chat — the Copilot finds the audience, writes the copy, builds the campaign, and launches it with your confirmation.",
    accent: "from-violet-600/20 to-violet-600/5 border-violet-800/30",
    iconColor: "text-violet-400",
  },
  {
    icon: Activity,
    title: "Live Delivery Tracking",
    desc: "Watch every message move from sent → delivered → opened → clicked in real time, with an AI-written post-mortem when the campaign completes.",
    accent: "from-teal-600/20 to-teal-600/5 border-teal-800/30",
    iconColor: "text-orbit-teal",
  },
  {
    icon: FileSearch,
    title: "Upload Any Data Format",
    desc: "Our import agent reads your CSV — whatever the column names — maps it to our schema with AI, and visualizes your raw data instantly.",
    accent: "from-sky-600/20 to-sky-600/5 border-sky-800/30",
    iconColor: "text-sky-400",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [session, setSessionState] = useState<Session | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgPassword, setOrgPassword] = useState("");
  const [orgLoginError, setOrgLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

  const handleDeleteOrg = async (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete "${org.company_name}" (${org.org_id})?\n\nThis permanently removes the organization and ALL of its customers, orders, segments, and campaigns. This cannot be undone.`
      )
    )
      return;
    setDeletingOrgId(org.id);
    try {
      await api.auth.deleteOrganization(org.id);
      setOrgs((prev) => prev.filter((o) => o.id !== org.id));
      if (selectedOrgId === org.org_id) setSelectedOrgId(null);
    } catch (err: any) {
      alert(err?.message || "Failed to delete organization");
    } finally {
      setDeletingOrgId(null);
    }
  };

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSessionState(s);

    if (s.role === "admin") {
      api.auth.organizations().then(setOrgs).catch(console.error);
    }
  }, [router]);

  if (!session) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] bg-purple-700/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[5%] w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orbit-purple to-orbit-blue flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Xeno Mini CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Signed in as <span className="text-purple-300 font-semibold">{session.company_name}</span>
            {session.org_id && (
              <code className="ml-2 text-xs bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">
                {session.org_id}
              </code>
            )}
          </span>
          <button
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative max-w-6xl mx-auto px-8 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-800/40 bg-purple-950/30 text-purple-300 text-xs font-semibold tracking-wide uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" /> AI-Native CRM for D2C Brands
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Welcome to{" "}
          </span>
          <span className="bg-gradient-to-r from-orbit-purple via-fuchsia-400 to-orbit-blue bg-clip-text text-transparent">
            Xeno Mini CRM
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Your brand. Your shoppers. One AI that connects them. Xeno Mini CRM decides{" "}
          <span className="text-slate-200 font-medium">who to talk to</span>,{" "}
          <span className="text-slate-200 font-medium">what to say</span>, and{" "}
          <span className="text-slate-200 font-medium">how well it worked</span> — so your team can
          focus on the brand, not the busywork.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="group mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orbit-purple to-orbit-blue hover:shadow-[0_0_40px_rgba(168,85,247,0.45)] text-white text-base font-bold shadow-xl transition-all duration-300"
        >
          Enter Your Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Feature grid */}
      <div className="relative max-w-6xl mx-auto px-8 pb-20">
        <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] mb-8">
          What makes Xeno Mini CRM special
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border bg-gradient-to-b p-6 ${f.accent} hover:translate-y-[-3px] transition-transform duration-300`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center mb-4">
                  <Icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom stats strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          {[
            { v: "4", l: "Messaging Channels" },
            { v: "< 15 min", l: "Data to First Campaign" },
            { v: "100%", l: "Messages Personalized" },
            { v: "0", l: "SQL Queries Needed" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orbit-purple to-orbit-blue bg-clip-text text-transparent">
                {s.v}
              </div>
              <div className="text-xs text-slate-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Admin Orgs section */}
        {session.role === "admin" && orgs.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-800">
            <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] mb-8">
              Registered Organizations
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {orgs.map((org) => {
                const isSelected = selectedOrgId === org.org_id;

                return (
                  <div 
                    key={org.id} 
                    className={`relative rounded-2xl border bg-slate-900/50 p-6 transition-all duration-300 overflow-hidden group ${
                      isSelected 
                        ? 'border-orbit-blue/50 ring-1 ring-orbit-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                        : 'border-slate-800 hover:bg-slate-800 cursor-pointer hover:-translate-y-1'
                    }`}
                    onClick={() => {
                      if (!isSelected) {
                        setSelectedOrgId(org.org_id);
                        setOrgPassword("");
                        setOrgLoginError("");
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-orbit-purple font-mono">{org.org_id}</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Delete organization"
                          onClick={(e) => handleDeleteOrg(e, org)}
                          disabled={deletingOrgId === org.id}
                          className="text-slate-600 hover:text-rose-400 transition-colors disabled:opacity-50"
                        >
                          {deletingOrgId === org.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        {!isSelected && (
                          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-orbit-blue group-hover:translate-x-1 transition-all" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{org.company_name}</h3>
                    <p className="text-sm text-slate-400">
                      {org.city && org.country ? `${org.city}, ${org.country}` : "Location not specified"}
                    </p>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-slate-800 animate-slideUp cursor-default" onClick={e => e.stopPropagation()}>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          setIsLoggingIn(true);
                          setOrgLoginError("");
                          try {
                            const res = await api.auth.orgLogin(org.org_id, orgPassword);
                            setSession({
                              role: res.role,
                              org_id: res.org_id,
                              company_name: res.company_name,
                              city: res.city,
                              country: res.country,
                              website: res.website
                            });
                            router.replace("/dashboard");
                          } catch (err: any) {
                            setOrgLoginError(err.message || "Invalid password");
                          } finally {
                            setIsLoggingIn(false);
                          }
                        }}>
                          <div className="flex flex-col gap-2">
                            <input 
                              type="password" 
                              autoFocus
                              placeholder="Enter org password..." 
                              value={orgPassword}
                              onChange={e => setOrgPassword(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orbit-blue placeholder:text-slate-600"
                            />
                            {orgLoginError && <span className="text-xs text-rose-500 font-medium">{orgLoginError}</span>}
                            <div className="flex gap-2 mt-1">
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrgId(null);
                                }}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-700 bg-transparent text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                disabled={!orgPassword || isLoggingIn}
                                className="flex-1 px-3 py-2 rounded-lg bg-orbit-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-1"
                              >
                                {isLoggingIn ? "Wait..." : <>Login <ArrowRight className="w-3 h-3" /></>}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
