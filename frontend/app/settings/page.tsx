"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Upload,
  Key,
  Briefcase,
  Loader2,
  CheckCircle,
  FileText,
  AlertTriangle,
  Lock,
  Database,
  Save,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("import");

  // CSV Import States — AI agent flow: select → analyze → review → import
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  // API Configuration Fields
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [savingKeys, setSavingKeys] = useState(false);

  useEffect(() => {
    fetchEnv();
  }, []);

  const fetchEnv = async () => {
    try {
      const data = await api.appSettings.getEnv();
      setSupabaseUrl(data.supabase_url || "");
      setSupabaseAnonKey(data.supabase_anon_key || "");
      setSupabaseServiceKey(data.supabase_service_key || "");
      setGroqKey(data.groq_api_key || "");
      setTwilioSid(data.twilio_account_sid || "");
      setTwilioToken(data.twilio_auth_token || "");
      setTwilioPhone(data.twilio_phone_number || "");
      setSmtpServer(data.smtp_server || "");
      setSmtpPort(data.smtp_port || "");
      setSmtpUser(data.smtp_username || "");
      setSmtpPass(data.smtp_password || "");
      setSmtpFrom(data.smtp_from_email || "");
    } catch {
      // Non-admin users can't read env settings — this is expected
    }
  };

  // Brand profile fields
  const [brandName, setBrandName] = useState("Xeno Cosmetics");
  const [defaultTone, setDefaultTone] = useState("warm");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysis(null);
      setImportResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    setImportResult(null);
    try {
      const res = await api.imports.analyze(selectedFile);
      setAnalysis(res);
      toast.success(
        `AI detected ${res.entity_type} data and mapped ${Object.keys(res.mapping).length} columns.`
      );
    } catch (err: any) {
      toast.error(err.message ?? "AI analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRunImport = async () => {
    if (!selectedFile || !analysis) return;
    setUploading(true);
    try {
      const res = await api.imports.run(selectedFile, analysis);
      setImportResult(res);
      toast.success(`Imported ${res.rows_imported} of ${res.rows_total} rows.`);
    } catch (err: any) {
      toast.error(err.message ?? "Import failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAPIKeys = async () => {
    setSavingKeys(true);
    try {
      await api.appSettings.updateEnv({
        supabase_url: supabaseUrl,
        supabase_anon_key: supabaseAnonKey,
        supabase_service_key: supabaseServiceKey,
        groq_api_key: groqKey,
        twilio_account_sid: twilioSid,
        twilio_auth_token: twilioToken,
        twilio_phone_number: twilioPhone,
        smtp_server: smtpServer,
        smtp_port: smtpPort,
        smtp_username: smtpUser,
        smtp_password: smtpPass,
        smtp_from_email: smtpFrom,
      });
      toast.success("API Credentials configured! Restart your server to apply changes.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save credentials.");
    } finally {
      setSavingKeys(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure API credentials, import lists, and set up brand details.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800 gap-4">
        {[
          { id: "import", label: "CSV Data Import", icon: Upload },
          { id: "keys", label: "API Credentials", icon: Key },
          { id: "brand", label: "Brand Profile", icon: Briefcase },
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
        {/* Tab 1: AI-assisted Data Import */}
        {activeTab === "import" && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 space-y-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-orbit-purple" />
                AI Data Ingestion Agent
              </h3>
              <p className="text-slate-400 text-sm">
                Upload <span className="text-slate-200">any</span> customer or order file — CSV, JSON, or
                Excel, with <span className="text-slate-200">any column names</span>. The AI agent detects
                what the data is, maps your headers to our schema, and normalises values (phones, channels,
                dates, currency) automatically.
              </p>

              {/* Sample Files Download */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800/60 mt-2 mb-2">
                <span className="text-sm font-medium text-slate-400">Need some sample data to try it out?</span>
                <div className="flex gap-3">
                  <a href="/sample_customers.xlsx" download className="text-xs font-semibold bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4 text-orbit-purple" /> Customers Data
                  </a>
                  <a href="/sample_orders.xlsx" download className="text-xs font-semibold bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200 px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4 text-orbit-blue" /> Orders Data
                  </a>
                </div>
              </div>

              {/* Drag and Drop Box */}
              <div className="border-2 border-dashed border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-slate-950/40 hover:bg-slate-950/60 transition-colors relative cursor-pointer group">
                <input
                  key={selectedFile ? "has-file" : "empty"}
                  type="file"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-orbit-purple transition-colors" />
                <span className="text-sm font-semibold text-slate-300">
                  {selectedFile ? selectedFile.name : "Choose a customer or order data file"}
                </span>
                <span className="text-xs text-slate-500">CSV · JSON · Excel — any headers</span>
              </div>

              {/* Step 1: analyze */}
              {selectedFile && !analysis && (
                <div className="flex gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 py-2.5 bg-gradient-to-r from-orbit-purple to-orbit-blue hover:opacity-90 text-white rounded-lg text-sm font-semibold shadow-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI agent reading your file structure...
                      </>
                    ) : (
                      <>✨ Analyze with AI</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setAnalysis(null);
                      setImportResult(null);
                    }}
                    disabled={analyzing}
                    className="px-4 py-2.5 border border-slate-700 text-slate-400 hover:text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: mapping review */}
            {analysis && !importResult && (
              <div className="p-6 rounded-xl border border-purple-900/30 bg-purple-950/10 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-purple-300 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    AI Mapping Proposal
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold uppercase tracking-wide">
                      {analysis.entity_type}
                    </span>
                    {analysis.confidence != null && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-orbit-teal font-semibold">
                        {Math.round(analysis.confidence * 100)}% confident
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                      {analysis.rows_total} rows
                    </span>
                  </div>
                </div>

                {analysis.notes && (
                  <p className="text-xs text-slate-400 italic border-l-2 border-purple-800 pl-3">
                    {analysis.notes}
                  </p>
                )}

                {/* Mapping table */}
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold">Your Column</th>
                        <th className="text-left px-4 py-2 font-semibold">Maps To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {Object.entries(analysis.mapping).map(([src, dst]) => (
                        <tr key={src} className="bg-slate-900/20">
                          <td className="px-4 py-2 font-mono text-xs text-slate-300">{src}</td>
                          <td className="px-4 py-2">
                            <span className="font-mono text-xs text-purple-300 bg-purple-950/40 border border-purple-900/30 px-2 py-0.5 rounded">
                              {dst as string}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {analysis.unmapped_headers?.map((h: string) => (
                        <tr key={h} className="bg-slate-900/20 opacity-50">
                          <td className="px-4 py-2 font-mono text-xs text-slate-500">{h}</td>
                          <td className="px-4 py-2 text-xs text-slate-600 italic">ignored</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Value mappings */}
                {analysis.value_mappings && Object.keys(analysis.value_mappings).length > 0 && (
                  <div className="text-xs text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-300 block">Value normalisation:</span>
                    {Object.entries(analysis.value_mappings).map(([field, vmap]) => (
                      <div key={field} className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-mono text-orbit-purple">{field}:</span>
                        {Object.entries(vmap as Record<string, string>).map(([from, to]) => (
                          <span key={from} className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-mono">
                            {from} → {to}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleRunImport}
                    disabled={uploading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-90 text-white rounded-lg text-sm font-semibold shadow-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing & scheduling RFM scoring...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" /> Looks Right — Import
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setAnalysis(null)}
                    disabled={uploading}
                    className="px-4 py-2.5 border border-slate-700 text-slate-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Re-analyze
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: result */}
            {importResult && (
              <div className="p-5 rounded-xl border border-teal-900/30 bg-teal-950/10 space-y-3 animate-fadeIn">
                <h4 className="font-bold text-orbit-teal text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Import Completed — {importResult.entity_type} data
                </h4>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block">Rows in File</span>
                    <span className="text-lg font-bold text-white">{importResult.rows_total}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block">Imported</span>
                    <span className="text-lg font-bold text-orbit-teal">{importResult.rows_imported}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block">Failed</span>
                    <span className="text-lg font-bold text-amber-400">{importResult.rows_failed}</span>
                  </div>
                </div>
                {importResult.errors?.length > 0 && (
                  <div className="text-xs text-amber-400/80 space-y-0.5 max-h-32 overflow-y-auto pt-1">
                    {importResult.errors.slice(0, 10).map((e: any, i: number) => (
                      <div key={i} className="flex gap-2">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        Row {e.row}: {e.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: API Keys */}
        {activeTab === "keys" && (
          <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 space-y-4 shadow-xl hover:shadow-orbit-purple/5 transition-all duration-500">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-orbit-purple" />
                Database & AI Credentials
              </h3>
              <p className="text-slate-400 text-sm">
                These credentials are saved directly to your backend `.env` files.
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Supabase Service Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={supabaseServiceKey}
                    onChange={(e) => setSupabaseServiceKey(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Groq AI Secret Key
                  </label>
                  <input
                    type="password"
                    placeholder="gsk_XXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Twilio Block */}
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 space-y-4 shadow-xl hover:shadow-orbit-purple/5 transition-all duration-500 mt-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-400" />
                Twilio Credentials (WhatsApp/SMS)
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Twilio Account SID
                  </label>
                  <input
                    type="text"
                    placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Twilio Auth Token
                  </label>
                  <input
                    type="password"
                    placeholder="Twilio Auth Token"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Twilio Phone Number (From)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1234567890"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={twilioPhone}
                    onChange={(e) => setTwilioPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SMTP Block */}
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 space-y-4 shadow-xl hover:shadow-orbit-purple/5 transition-all duration-500 mt-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                SMTP Credentials (Email)
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.sendgrid.net"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                      value={smtpServer}
                      onChange={(e) => setSmtpServer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      placeholder="587"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    placeholder="apikey"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    placeholder="SMTP Password / Secret"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    From Email Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. no-reply@mybrand.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-200 text-xs focus:outline-none focus:border-orbit-purple focus:ring-1 focus:ring-orbit-purple/50 transition-all duration-300"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveAPIKeys}
                disabled={savingKeys}
                className="flex items-center gap-2 px-6 py-2.5 bg-orbit-purple hover:bg-orbit-purple/80 text-white font-semibold rounded-lg text-sm transition-all duration-300 transform active:scale-95 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50"
              >
                {savingKeys ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Credentials
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Brand Profile */}
        {activeTab === "brand" && (
          <div className="space-y-6 max-w-2xl">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/10 space-y-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orbit-purple" />
                Brand Profile
              </h3>
              <p className="text-slate-400 text-sm">
                Define details that direct the AI personalization tone and copy styling.
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Default Copywriting Tone
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple"
                    value={defaultTone}
                    onChange={(e) => setDefaultTone(e.target.value)}
                  >
                    <option value="warm">Warm & Professional</option>
                    <option value="urgent">Urgent & Direct</option>
                    <option value="playful">Playful & Emoji-heavy</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
