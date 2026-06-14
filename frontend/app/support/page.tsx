"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";
import {
  LifeBuoy,
  Send,
  Loader2,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building,
  User,
  MoreVertical,
} from "lucide-react";

export default function SupportPage() {
  const [session, setSession] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [ticketType, setTicketType] = useState("bug");
  const [impactLevel, setImpactLevel] = useState("medium");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [poc, setPoc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s?.role === "admin") {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.tickets.list();
      setTickets(res.tickets || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || !description || !poc) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setSubmitting(true);
    try {
      await api.tickets.create({
        ticket_type: ticketType,
        impact_level: impactLevel,
        duration: duration,
        description: description,
        point_of_contact: poc,
      });
      setSubmitted(true);
      toast.success("Ticket submitted successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orbit-purple" />
      </div>
    );
  }

  const isAdmin = session?.role === "admin";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-orbit-purple" />
            Support Center
          </h1>
          <p className="text-slate-400">
            {isAdmin 
              ? "Platform administration: Global support tickets." 
              : "Raise an issue or request assistance from our expert team."}
          </p>
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-orange-500 font-semibold text-sm">Feature Under Testing</h3>
          <p className="text-orange-400/80 text-sm mt-1">
            The Support Center is currently under testing and is unavailable to use. Submitted tickets will not be processed at this time.
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Organization</th>
                  <th className="px-6 py-4 font-semibold">Ticket Type</th>
                  <th className="px-6 py-4 font-semibold">Impact</th>
                  <th className="px-6 py-4 font-semibold">Duration</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">POC</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
                        <p>No open support tickets.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-200">{t.company_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-300">
                        {t.ticket_type.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                          ${t.impact_level === "critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                            t.impact_level === "high" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : 
                            t.impact_level === "medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : 
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                          {t.impact_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {t.duration}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300 max-w-xs truncate" title={t.description}>
                          {t.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          {t.point_of_contact}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : submitted ? (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Ticket Received!</h2>
          <p className="text-lg text-emerald-200/80 mb-8 max-w-md">
            Our experts will reach you out very soon.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
          >
            Submit Another Ticket
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-orbit-purple" />
                  Type of Ticket
                </label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orbit-purple focus:border-transparent transition-all"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                >
                  <option value="bug">Bug Report / Issue</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="billing">Billing Inquiry</option>
                  <option value="question">General Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  Level of Impact
                </label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orbit-purple focus:border-transparent transition-all"
                  value={impactLevel}
                  onChange={(e) => setImpactLevel(e.target.value)}
                >
                  <option value="low">Low - Minor inconvenience</option>
                  <option value="medium">Medium - Core feature impaired</option>
                  <option value="high">High - Cannot perform key tasks</option>
                  <option value="critical">Critical - Complete system outage</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                How long has this concern been occurring?
              </label>
              <input 
                type="text"
                placeholder="e.g. For the past 3 days, since last update..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orbit-purple focus:border-transparent transition-all"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Brief Description
              </label>
              <textarea 
                placeholder="Please describe the issue, steps to reproduce, or details of your request..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orbit-purple focus:border-transparent transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Point of Contact
              </label>
              <input 
                type="text"
                placeholder="Name, Email, or Phone number for our team to reach out"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orbit-purple focus:border-transparent transition-all"
                value={poc}
                onChange={(e) => setPoc(e.target.value)}
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
