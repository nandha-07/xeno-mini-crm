"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Layers,
  RefreshCw,
  Plus,
  Play,
  CheckCircle,
  HelpCircle,
  Loader2,
  Trash2,
  Wrench,
  ArrowRight,
  Settings2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // NL to Segment fields
  const [nlQuery, setNlQuery] = useState("");
  const [translating, setTranslating] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [translatedSpec, setTranslatedSpec] = useState<any | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewCustomers, setPreviewCustomers] = useState<any[]>([]);
  
  // Refresh loading states
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Manual Builder State
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"nl2" | "manual">("nl2");
  
  const [manualName, setManualName] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualCombinator, setManualCombinator] = useState<"AND" | "OR">("AND");
  const [manualRules, setManualRules] = useState<any[]>([{ id: Date.now(), field: "monetary", op: "gte", value: "" }]);
  
  const [manualPreviewing, setManualPreviewing] = useState(false);
  const [manualPreviewCount, setManualPreviewCount] = useState<number | null>(null);
  const [manualPreviewCustomers, setManualPreviewCustomers] = useState<any[]>([]);
  const [newlyCreatedSegmentId, setNewlyCreatedSegmentId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSegments() {
      try {
        const data = await api.segments.list();
        setSegments(data);
      } catch (err) {
        console.error("Error fetching segments", err);
        // Mock fallback segments
        setSegments([
          {
            id: "s1",
            name: "High Value Churn Risk",
            description: "AI generated from query: spent over ₹5000 and churn risk is critical",
            customer_count: 84,
            filter_spec: {
              and: [
                { field: "monetary", operator: "gte", value: 5000 },
                { field: "churn_risk", operator: "eq", value: "critical" },
              ],
            },
            created_at: "2026-06-10T12:00:00Z",
          },
          {
            id: "s2",
            name: "Mumbai Haircare Buyers",
            description: "AI generated from query: city is Mumbai and bought haircare category",
            customer_count: 128,
            filter_spec: {
              and: [
                { field: "city", operator: "eq", value: "Mumbai" },
                { field: "top_category", operator: "eq", value: "haircare" },
              ],
            },
            created_at: "2026-06-08T09:30:00Z",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadSegments();
  }, []);

  const handleDeleteSegment = async (id: string) => {
    setDeletingId(id);
    try {
      await api.segments.remove(id);
      setSegments((prev) => prev.filter((s) => s.id !== id));
      toast.success("Segment deleted successfully.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete segment.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTranslateAndPreview = async () => {
    if (!nlQuery.trim()) {
      toast.error("Please enter a natural language prompt first.");
      return;
    }
    setTranslating(true);
    setTranslatedSpec(null);
    setPreviewCount(null);
    setPreviewCustomers([]);

    try {
      const result = await api.segments.nl2segment(nlQuery);
      setTranslatedSpec(result.filter_spec);
      setPreviewCount(result.customer_count);
      setPreviewCustomers(result.preview || []);
      toast.success("AI parsed query successfully!");
    } catch (err) {
      console.error("NL translation failed", err);
      // Mock result fallback
      setTranslatedSpec({
        and: [
          { field: "monetary", operator: "gte", value: 5000 },
          { field: "recency_days", operator: "gte", value: 60 },
        ],
      });
      setPreviewCount(147);
      setPreviewCustomers([
        { first_name: "Priya", last_name: "Sharma", city: "Mumbai" },
        { first_name: "Amit", last_name: "Patel", city: "Ahmedabad" },
        { first_name: "Rahul", last_name: "Verma", city: "Delhi" },
      ]);
      toast.info("Using mockup translation. Start your AI engine keys to test Groq parsing.");
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveSegment = async () => {
    if (!segmentName.trim() || !translatedSpec) {
      toast.error("Please provide a name for the segment.");
      return;
    }

    try {
      const payload = {
        name: segmentName,
        description: `AI generated from query: ${nlQuery}`,
        filter_spec: translatedSpec,
        nl_query: nlQuery,
        customer_count: previewCount ?? 0,
      };
      const newSeg = await api.segments.create(payload);
      setSegments([newSeg, ...segments]);
      toast.success("Segment saved successfully!");
      
      // Reset NL query builder
      setSegmentName("");
      setNlQuery("");
      setTranslatedSpec(null);
      setPreviewCount(null);
      setPreviewCustomers([]);
    } catch (err) {
      console.error("Error saving segment", err);
      toast.error("Failed to save segment. Database offline.");
    }
  };

  const handleRefreshCount = async (id: string) => {
    setRefreshingId(id);
    try {
      const updated = await api.segments.refresh(id);
      setSegments(segments.map((s) => (s.id === id ? { ...s, customer_count: updated.customer_count } : s)));
      toast.success("Cohort count refreshed!");
    } catch (err) {
      console.error("Error refreshing segment count", err);
      toast.error("Failed to refresh segment.");
    } finally {
      setRefreshingId(null);
    }
  };

  // --- Manual Builder Functions ---
  const handleAddRule = () => {
    setManualRules([...manualRules, { id: Date.now(), field: "monetary", op: "gte", value: "" }]);
  };

  const handleRemoveRule = (id: number) => {
    setManualRules(manualRules.filter(r => r.id !== id));
  };

  const handleUpdateRule = (id: number, key: string, val: string) => {
    setManualRules(manualRules.map(r => r.id === id ? { ...r, [key]: val } : r));
  };

  const buildManualSpec = () => {
    const conditions = manualRules.map(r => {
      let val: any = r.value;
      if (r.op === 'in' || r.op === 'not_in') {
        val = String(val).split(',').map((s:string) => s.trim()).filter(Boolean);
      } else if (['monetary', 'recency_days', 'frequency', 'rfm_score'].includes(r.field)) {
        val = Number(val);
      }
      return { field: r.field, op: r.op, value: val };
    });
    return { operator: manualCombinator, conditions };
  };

  const handlePreviewManual = async () => {
    if (manualRules.length === 0) return toast.error("Add at least one rule");
    setManualPreviewing(true);
    setManualPreviewCount(null);
    setManualPreviewCustomers([]);
    try {
      const res = await api.segments.preview(buildManualSpec());
      setManualPreviewCount(res.customer_count);
      setManualPreviewCustomers(res.preview);
      toast.success("Audience preview updated!");
    } catch (err: any) {
      console.error("Manual preview error:", err);
      toast.error(err.message || "Failed to preview audience");
    } finally {
      setManualPreviewing(false);
    }
  };

  const handleSaveManual = async () => {
    if (!manualName.trim()) return toast.error("Please provide a name for the segment.");
    if (manualRules.length === 0) return toast.error("Add at least one rule");
    
    try {
      const payload = {
        name: manualName,
        description: manualDescription || "Manually built segment",
        filter_spec: buildManualSpec(),
        customer_count: manualPreviewCount ?? 0,
      };
      
      const newSeg = await api.segments.create(payload);
      setSegments([newSeg, ...segments]);
      setNewlyCreatedSegmentId(newSeg.id);
      toast.success("Segment saved successfully!");
    } catch (err: any) {
      console.error("Error saving manual segment:", err);
      toast.error("Failed to save segment.");
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Segment Builder
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Target cohorts in plain English. No complex SQL queries needed.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Builder Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab("nl2")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                activeTab === "nl2" ? "bg-orbit-purple text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Sparkles className="w-4 h-4" />
              NL2Segment
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                activeTab === "manual" ? "bg-orbit-teal text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Wrench className="w-4 h-4" />
              Manual Builder
            </button>
          </div>

          {activeTab === "nl2" && (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm space-y-4 animate-fadeIn">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orbit-purple animate-pulse" />
                NL2Segment Builder
              </h3>
              <p className="text-slate-400 text-sm">
                Describe your target audience. You can filter by monetary value, recency, category, location, or churn risk.
              </p>

            {/* Query Input Box */}
            <div className="space-y-2">
              <textarea
                placeholder="Example: customers from Mumbai who spent more than ₹5000 and have low or medium churn risk..."
                rows={3}
                className="w-full p-4 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple transition-colors placeholder:text-slate-600"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Supports: monetary, city, recency_days, churn_risk...
                </span>
                <button
                  onClick={handleTranslateAndPreview}
                  disabled={translating}
                  className="px-4 py-2 bg-gradient-to-r from-orbit-purple to-orbit-blue text-white font-semibold rounded-lg text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {translating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing Cohorts...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Translate & Preview
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Translation Output Preview */}
            {translatedSpec && (
              <div className="p-5 rounded-lg border border-purple-900/30 bg-purple-950/10 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-orbit-teal" />
                    Audience Matches: {previewCount} customers
                  </h4>
                </div>

                {/* Filter Specs */}
                <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs font-mono text-orbit-purple overflow-x-auto">
                  {JSON.stringify(translatedSpec, null, 2)}
                </div>

                {/* Preview Cohort list */}
                {previewCustomers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 font-semibold block">Sample Recipients:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {previewCustomers.map((cust, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                          {cust.first_name} {cust.last_name || ""} ({cust.city || "India"})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Segment Prompt */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter segment name (e.g. VIP Mumbai Lapsed)"
                    className="flex-1 px-3 py-2 rounded border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                  />
                  <button
                    onClick={handleSaveSegment}
                    className="px-4 py-2 bg-orbit-teal hover:bg-orbit-teal text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Save Audience Segment
                  </button>
                  {newlyCreatedSegmentId && (
                    <button
                      onClick={() => router.push(`/campaigns?segment_id=${newlyCreatedSegmentId}`)}
                      className="px-4 py-2 bg-orbit-blue hover:bg-orbit-blue text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      Create Campaign <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Manual Builder UI */}
          {activeTab === "manual" && (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm space-y-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-5 h-5 text-orbit-teal" />
                <h3 className="font-bold text-white text-lg">Manual Builder</h3>
              </div>
              
              {/* Segment Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Segment Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. High Value Churn Risk"
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-teal"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief description of this audience..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-teal"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Rules Engine */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-300">Match</span>
                  <select
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-2 py-1 focus:outline-none"
                    value={manualCombinator}
                    onChange={(e) => setManualCombinator(e.target.value as "AND" | "OR")}
                  >
                    <option value="AND">ALL</option>
                    <option value="OR">ANY</option>
                  </select>
                  <span className="text-sm font-medium text-slate-300">of the following rules:</span>
                </div>

                <div className="space-y-3">
                  {manualRules.map((rule, idx) => (
                    <div key={rule.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      {/* Field */}
                      <select
                        className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded px-2 py-1.5 focus:outline-none"
                        value={rule.field}
                        onChange={(e) => handleUpdateRule(rule.id, 'field', e.target.value)}
                      >
                        <option value="monetary">Total Spent (₹)</option>
                        <option value="recency_days">Days Since Last Order</option>
                        <option value="frequency">Total Orders</option>
                        <option value="rfm_score">RFM Score</option>
                        <option value="churn_risk">Churn Risk (low, medium, high, critical)</option>
                        <option value="city">City</option>
                        <option value="channel_pref">Channel Pref</option>
                        <option value="top_category">Top Category</option>
                      </select>

                      {/* Operator */}
                      <select
                        className="w-32 bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded px-2 py-1.5 focus:outline-none"
                        value={rule.op}
                        onChange={(e) => handleUpdateRule(rule.id, 'op', e.target.value)}
                      >
                        <option value="eq">Equals (=)</option>
                        <option value="neq">Not Equal (!=)</option>
                        <option value="gt">Greater (&gt;)</option>
                        <option value="gte">Greater/Eq (&gt;=)</option>
                        <option value="lt">Less (&lt;)</option>
                        <option value="lte">Less/Eq (&lt;=)</option>
                        <option value="contains">Contains</option>
                        <option value="in">In List (comma sep)</option>
                      </select>

                      {/* Value */}
                      <input
                        type="text"
                        placeholder="Value..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-orbit-teal"
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, 'value', e.target.value)}
                      />

                      {/* Remove Rule */}
                      <button
                        onClick={() => handleRemoveRule(rule.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Remove Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddRule}
                  className="text-sm text-orbit-teal font-semibold hover:text-teal-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Rule
                </button>
              </div>

              {/* Manual Preview/Save Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <button
                  onClick={handlePreviewManual}
                  disabled={manualPreviewing}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {manualPreviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  Preview Audience
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveManual}
                    className="px-4 py-2 bg-orbit-teal hover:bg-orbit-teal text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Save Segment
                  </button>
                  {newlyCreatedSegmentId && (
                    <button
                      onClick={() => router.push(`/campaigns?segment_id=${newlyCreatedSegmentId}`)}
                      className="px-4 py-2 bg-orbit-blue hover:bg-orbit-blue text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                    >
                      Create Campaign <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Preview Results */}
              {manualPreviewCount !== null && (
                <div className="p-4 rounded-lg border border-teal-900/30 bg-teal-950/10 space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-sm text-teal-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-orbit-teal" />
                    Audience Matches: {manualPreviewCount} customers
                  </h4>
                  {manualPreviewCustomers.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {manualPreviewCustomers.map((cust, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                          {typeof cust === "string" ? cust : `${cust.first_name} ${cust.last_name || ""} (${cust.city || "India"})`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Saved Segment Lists */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/20">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Saved Segments
            </h3>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-slate-500 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  Loading segments...
                </div>
              ) : segments.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">No saved segments found.</p>
              ) : (
                segments.map((seg) => (
                  <div
                    key={seg.id}
                    className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3 relative group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 text-sm block">
                        {seg.name}
                      </span>
                      <span className="text-xs text-slate-500 block mt-1 line-clamp-2">
                        {seg.description}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                      <span className="text-xs text-slate-400 font-semibold">
                        {seg.customer_count} customers
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRefreshCount(seg.id)}
                          disabled={refreshingId === seg.id || deletingId === seg.id}
                          className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                          title="Refresh count"
                        >
                          <RefreshCw
                            className={cn(
                              "w-3.5 h-3.5",
                              refreshingId === seg.id && "animate-spin"
                            )}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteSegment(seg.id)}
                          disabled={refreshingId === seg.id || deletingId === seg.id}
                          className="p-1.5 rounded bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                          title="Delete segment"
                        >
                          {deletingId === seg.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
