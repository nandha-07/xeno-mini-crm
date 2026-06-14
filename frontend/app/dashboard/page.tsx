"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  AlertTriangle,
  Send,
  IndianRupee,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Mail,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

interface DashboardStats {
  total_customers: number;
  customers_at_risk: number;
  active_campaigns: number;
  revenue_influenced_30d: number;
  messages_delivered_30d: number;
  avg_open_rate_30d: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    const s = getSession();
    if (s?.role === "admin") {
      setCompanyName(s.admin_selected_org_name || "Platform Admin");
    } else {
      setCompanyName(s?.company_name || "");
    }

    async function loadData() {
      try {
        const [statsData, campData, rawData] = await Promise.all([
          api.analytics.overview(),
          api.campaigns.list({ limit: 5 }),
          api.analytics.rawData(),
        ]);
        
        setStats(statsData);
        setCampaigns(campData);
        setRiskDistribution(rawData.churn || []);

        // Load AI Briefing asynchronously so it doesn't block dashboard rendering
        api.strategist.analysis()
          .then(strategistData => {
            const strategy = strategistData?.strategy;
            if (strategy) {
              setAiBriefing(`${strategy.headline} ${strategy.recommendations?.[0] || ""}`);
            }
          })
          .catch(e => console.error("AI Briefing fetch failed", e));
      } catch (err: any) {
        console.error("Error loading dashboard data", err);
        setStats({
          total_customers: 0,
          customers_at_risk: 0,
          active_campaigns: 0,
          revenue_influenced_30d: 0,
          messages_delivered_30d: 0,
          avg_open_rate_30d: 0,
        });
        setCampaigns([]);
        setRiskDistribution([]);
        toast.error(err.message || "Failed to load live dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 rounded-full border-4 border-orbit-purple/20 border-t-purple-500 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Analyzing customer database...</p>
      </div>
    );
  }

  // Calculate percentages
  const riskPercent = stats && stats.total_customers > 0
    ? Math.round((stats.customers_at_risk / stats.total_customers) * 100)
    : 0;

  const totalScored = riskDistribution.reduce((sum, item) => sum + (item.customers || 0), 0);
  const getRiskPercent = (riskLevel: string) => {
    const item = riskDistribution.find((i) => i.risk === riskLevel);
    if (!item || totalScored === 0) return 0;
    return Math.round((item.customers / totalScored) * 100);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {companyName ? `Welcome ${companyName}, ` : ""}Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time D2C cohort insights and campaign tracking.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/copilot"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orbit-purple to-orbit-blue text-white font-medium rounded-lg text-sm shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Talk to Copilot
          </Link>
        </div>
      </div>

      {/* Morning AI Briefing Card */}
      <div className="p-6 rounded-xl border border-purple-900/30 bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-slate-900/30 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orbit-purple/5 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex gap-4 items-start relative z-10">
          <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center border border-orbit-purple/30">
            <Sparkles className="w-5 h-5 text-orbit-purple" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-purple-200 text-sm uppercase tracking-wider flex items-center gap-2">
              Daily AI Briefing
            </h3>
            <p className="text-slate-200 leading-relaxed text-sm">
              {aiBriefing ? aiBriefing : (
                <>
                  Your customer retention risk is stable, with{" "}
                  <strong className="text-purple-300">{stats?.customers_at_risk || 0} customers</strong> in the high/critical churn risk tier.
                  We recommend uploading your data to generate deeper AI insights.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm hover:border-slate-700 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">Total Audience</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {stats?.total_customers.toLocaleString()}
            </span>
            {stats?.total_customers && stats.total_customers > 0 ? (
              <span className="block text-xs text-orbit-teal font-medium mt-1">
                +4.2% month-on-month
              </span>
            ) : (
              <span className="block text-xs text-slate-500 font-medium mt-1">
                0% month-on-month
              </span>
            )}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">At-Risk Customers</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {stats?.customers_at_risk.toLocaleString()}
            </span>
            <span className="block text-xs text-amber-400 font-medium mt-1">
              {riskPercent}% of total audience
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">Active Campaigns</span>
            <Send className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {stats?.active_campaigns}
            </span>
            <span className="block text-xs text-blue-400 font-medium mt-1">
              Currently executing
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">30d Influenced Value</span>
            <IndianRupee className="w-5 h-5 text-orbit-teal" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              ₹{stats?.revenue_influenced_30d.toLocaleString()}
            </span>
            <span className="block text-xs text-orbit-teal font-medium mt-1">
              Direct checkout attributed
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Recent Campaigns</h3>
              <Link
                href="/campaigns"
                className="text-xs text-orbit-purple hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
              >
                View all campaigns
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No campaigns found.</p>
              ) : (
                campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-sm">{camp.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full capitalize">
                          {camp.channel}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">
                        Sent: {camp.total_sent?.toLocaleString() ?? 0} recipients
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {camp.status === "running" ? (
                        <span className="px-2 py-1 rounded bg-blue-950 text-blue-400 font-medium text-xs border border-blue-900/50 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                          Running
                        </span>
                      ) : camp.status === "completed" ? (
                        <span className="px-2 py-1 rounded bg-teal-950 text-orbit-teal font-medium text-xs border border-teal-900/50">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-slate-950 text-slate-400 font-medium text-xs border border-slate-800">
                          Draft
                        </span>
                      )}
                      <Link
                        href={`/campaigns/${camp.id}`}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Churn & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20">
            <h3 className="font-bold text-lg text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/copilot"
                className="flex items-center gap-3 p-3 rounded-lg border border-purple-900/30 hover:bg-purple-950/20 transition-all text-left text-sm"
              >
                <Zap className="w-5 h-5 text-orbit-purple" />
                <div>
                  <span className="block font-semibold text-slate-200">AI Campaign Copilot</span>
                  <span className="text-xs text-slate-500">Launch a campaign autonomously</span>
                </div>
              </Link>

              <Link
                href="/segments"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 hover:bg-slate-900/40 transition-all text-left text-sm"
              >
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <span className="block font-semibold text-slate-200">Segment Builder</span>
                  <span className="text-xs text-slate-500">Query and preview target cohorts</span>
                </div>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 hover:bg-slate-900/40 transition-all text-left text-sm"
              >
                <Mail className="w-5 h-5 text-orbit-teal" />
                <div>
                  <span className="block font-semibold text-slate-200">CSV Data Ingest</span>
                  <span className="text-xs text-slate-500">Upload customer lists instantly</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Churn Risk Pie Chart Fallback */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20">
            <h3 className="font-bold text-lg text-white mb-4">Risk Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Critical Risk</span>
                  <span className="text-red-400">{getRiskPercent("critical")}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${getRiskPercent("critical")}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>High Risk</span>
                  <span className="text-amber-400">{getRiskPercent("high")}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${getRiskPercent("high")}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Medium Risk</span>
                  <span className="text-yellow-400">{getRiskPercent("medium")}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${getRiskPercent("medium")}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Low Risk</span>
                  <span className="text-orbit-teal">{getRiskPercent("low")}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-orbit-teal h-full rounded-full transition-all duration-500" style={{ width: `${getRiskPercent("low")}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
