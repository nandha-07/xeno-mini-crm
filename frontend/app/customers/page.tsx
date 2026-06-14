"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  User,
  ShoppingBag,
  Send,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Mask a contact for privacy: hide the trailing digits of a phone number
 * (keeping country code + first digits), or partially hide an email local part.
 * e.g. "+919876543210" -> "+91987654xxxx", "priya@gmail.com" -> "pr***@gmail.com"
 */
function maskContact(contact?: string | null): string {
  if (!contact) return "";
  const value = contact.trim();
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    const visible = local.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
  }
  // Phone: mask the last 4 digits, keep the rest (incl. leading +).
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return "xxxx";
  const hideCount = Math.min(4, digits.length - 2);
  return value.slice(0, value.length - hideCount) + "x".repeat(hideCount);
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [churnRisk, setChurnRisk] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected customer details
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);


  // Delete state
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [removingAll, setRemovingAll] = useState(false);

  // Create state
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const limit = 15;

  const confirmDeleteCustomer = (e: React.MouseEvent, cust: any) => {
    e.stopPropagation();
    setCustomerToDelete(cust);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setDeletingId(customerToDelete.id);
    try {
      await api.customers.remove(customerToDelete.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      setTotal((t) => Math.max(0, t - 1));
      if (selectedId === customerToDelete.id) {
        setSelectedId(null);
        setDetails(null);
      }
      toast.success("Customer deleted.");
      setCustomerToDelete(null);
    } catch (err: any) {
      toast.error(err.message ?? "Could not delete customer.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveAll = async () => {
    setRemovingAll(true);
    try {
      const res = await api.customers.removeAll();
      setCustomers([]);
      setTotal(0);
      setSelectedId(null);
      setDetails(null);
      setConfirmAll(false);
      toast.success(`Removed ${res.count ?? "all"} customers and their data.`);
    } catch (err: any) {
      toast.error(err.message ?? "Could not remove data.");
    } finally {
      setRemovingAll(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName) return toast.error("First name is required.");
    setCreating(true);
    let formattedPhone = newPhone?.trim() || undefined;
    if (formattedPhone && !formattedPhone.startsWith("+")) {
      // If it looks like an Indian number without +91, we can prepend +91. 
      // But safest is just to prepend + if they just missed it, or +91 if length is 10.
      if (formattedPhone.length === 10) {
        formattedPhone = "+91" + formattedPhone;
      } else {
        formattedPhone = "+" + formattedPhone;
      }
    }

    try {
      const res = await api.customers.create({
        first_name: newFirstName,
        last_name: newLastName || undefined,
        email: newEmail || undefined,
        phone: formattedPhone,
      });
      // We manually add it to the top of the list
      setCustomers((prev) => [res, ...prev]);
      setTotal((t) => t + 1);
      setShowAddModal(false);
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPhone("");
      toast.success("Customer created.");
    } catch (err: any) {
      toast.error(err.message ?? "Could not create customer.");
    } finally {
      setCreating(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.first_name) return toast.error("First name is required.");
    setSavingEdit(true);
    try {
      const res = await api.customers.update(selectedId!, editData);
      setDetails({ ...details, ...res });
      setCustomers((prev) => prev.map((c) => (c.id === selectedId ? { ...c, ...res } : c)));
      setEditMode(false);
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      toast.error(err.message ?? "Could not update profile.");
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit,
          search: search || undefined,
          churn_risk: churnRisk === "all" ? undefined : churnRisk,
        };
        const res = await api.customers.list(params);
        // The backend returns { data, total, page, limit }
        const rows = Array.isArray(res?.data) ? res.data : [];
        setCustomers(rows);
        setTotal(typeof res?.total === "number" ? res.total : rows.length);
      } catch (err) {
        console.error("Error loading customers", err);
        // Fallback mockup list
        const mockList = [
          { id: "c1", first_name: "Priya", last_name: "Sharma", email: "priya@gmail.com", phone: "+919876543210", city: "Mumbai", score: { rfm_score: 84, churn_risk: "low" } },
          { id: "c2", first_name: "Rahul", last_name: "Verma", email: "rahul@yahoo.com", phone: "+919812345678", city: "Delhi", score: { rfm_score: 38, churn_risk: "high" } },
          { id: "c3", first_name: "Ananya", last_name: "Iyer", email: "ananya@outlook.com", phone: "+918887776665", city: "Bangalore", score: { rfm_score: 15, churn_risk: "critical" } },
          { id: "c4", first_name: "Amit", last_name: "Patel", email: "amit.patel@gmail.com", phone: "+919998887776", city: "Ahmedabad", score: { rfm_score: 52, churn_risk: "medium" } },
        ];
        setCustomers(mockList);
        setTotal(mockList.length);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [page, search, churnRisk]);

  // Handle row click
  const handleSelectCustomer = async (id: string) => {
    setSelectedId(id);
    setDetailsLoading(true);
    try {
      const detailData = await api.customers.get(id);
      setDetails(detailData);
    } catch (err) {
      console.error("Error loading customer profile details", err);
      // Fallback mockup profile details
      setDetails({
        id,
        first_name: "Ananya",
        last_name: "Iyer",
        email: "ananya@outlook.com",
        phone: "+918887776665",
        city: "Bangalore",
        score: {
          rfm_score: 15,
          churn_risk: "critical",
          recency_days: 98,
          frequency: 1,
          monetary: 1250,
          top_category: "haircare",
          last_product: "Argan Oil Shampoo",
        },
        ai_summary: "Frequent buyer of haircare who has not ordered in 98 days. High probability of churn due to promotional inactivity; suggest sending a WhatsApp coupon code.",
        orders: [
          { id: "o1", order_date: "2026-03-06T10:00:00Z", amount: 1250, status: "completed", items_count: 1 }
        ],
        campaigns: [
          { name: "Haircare Spring Launch", sent_at: "2026-02-15T00:00:00Z", status: "opened" }
        ]
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto relative min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Explore profiles, RFM scores, and generate instant AI summaries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-orbit-purple text-white hover:bg-orbit-purple text-sm font-semibold transition-colors"
          >
            <User className="w-4 h-4" />
            Add Customer
          </button>
          <button
            onClick={() => setConfirmAll(true)}
            disabled={total === 0}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Remove all data
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple transition-colors"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Churn Risk Tab Bar */}
        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {["all", "low", "medium", "high", "critical"].map((risk) => (
            <button
              key={risk}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all",
                churnRisk === risk
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              )}
              onClick={() => {
                setChurnRisk(risk);
                setPage(1);
              }}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="border border-slate-800 bg-slate-900/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">RFM Score</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-orbit-purple" />
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No customers match the current criteria.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-900/30 cursor-pointer transition-colors"
                    onClick={() => handleSelectCustomer(cust.id)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {cust.first_name} {cust.last_name || ""}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{cust.city || "—"}</td>
                    <td className="px-6 py-4 text-slate-300 font-semibold">
                      {cust.score?.rfm_score ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      {cust.score?.churn_risk === "low" && (
                        <span className="px-2 py-0.5 rounded bg-teal-950 text-orbit-teal text-xs font-semibold uppercase tracking-wider border border-teal-900/50">
                          Low
                        </span>
                      )}
                      {cust.score?.churn_risk === "medium" && (
                        <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 text-xs font-semibold uppercase tracking-wider border border-yellow-900/50">
                          Medium
                        </span>
                      )}
                      {cust.score?.churn_risk === "high" && (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-amber-900/50">
                          High
                        </span>
                      )}
                      {cust.score?.churn_risk === "critical" && (
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-xs font-semibold uppercase tracking-wider border border-red-900/50">
                          Critical
                        </span>
                      )}
                      {!cust.score?.churn_risk && (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {maskContact(cust.phone || cust.email)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {cust.channel_pref && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase tracking-wider">
                            {cust.channel_pref}
                          </span>
                        )}
                        {cust.score?.top_category && (
                          <span className="px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 text-[10px] uppercase tracking-wider border border-purple-800/30">
                            {cust.score.top_category}
                          </span>
                        )}
                        {!cust.channel_pref && !cust.score?.top_category && (
                          <span className="text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => confirmDeleteCustomer(e, cust)}
                        disabled={deletingId === cust.id}
                        className="px-3 py-1.5 rounded-lg border border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                        title="Remove customer"
                      >
                        {deletingId === cust.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Remove Customer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/20 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing page {page}
          </span>
          <div className="flex gap-2">
            <button
              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400"
              onClick={() => setPage((p) => p + 1)}
              disabled={customers.length < limit}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Customer Detail Panel Drawer */}
      {selectedId && (
        <div className="fixed inset-y-0 right-0 w-full md:w-1/2 bg-slate-950/80 backdrop-blur-md border-l border-slate-800 z-50 shadow-2xl flex flex-col h-screen">
          {/* Drawer Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/20">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-orbit-purple" />
              <span className="font-bold text-slate-200">Customer Profile</span>
            </div>
            <div className="flex items-center gap-2">
              {details && !editMode && (
                <button
                  className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                  onClick={() => {
                    setEditData({
                      first_name: details.first_name,
                      last_name: details.last_name || "",
                      email: details.email || "",
                      phone: details.phone || "",
                      city: details.city || "",
                      channel_pref: details.channel_pref || "whatsapp",
                    });
                    setEditMode(true);
                  }}
                >
                  Edit Profile
                </button>
              )}
              <button
                className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white"
              onClick={() => {
                setSelectedId(null);
                setDetails(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {detailsLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-orbit-purple" />
                <span className="text-slate-400 text-sm">Assembling profile timeline...</span>
              </div>
            ) : details ? (
              <>
                {/* Profile Overview */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 flex gap-4 items-start md:items-center flex-col md:flex-row">
                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center font-bold text-lg text-orbit-purple border border-purple-800/50 shrink-0">
                    {details.first_name[0]}
                  </div>
                  {editMode ? (
                    <form onSubmit={handleEditSave} className="flex-1 w-full space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={editData.first_name || ""}
                          onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-orbit-purple"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={editData.last_name || ""}
                          onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-orbit-purple"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="email"
                          placeholder="Email"
                          value={editData.email || ""}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-orbit-purple"
                        />
                        <input
                          type="text"
                          placeholder="Phone (e.g. +919876543210)"
                          value={editData.phone || ""}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-orbit-purple"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={editData.city || ""}
                          onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-orbit-purple"
                        />
                        <select
                          value={editData.channel_pref || "whatsapp"}
                          onChange={(e) => setEditData({ ...editData, channel_pref: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-orbit-purple"
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                          <option value="email">Email</option>
                          <option value="rcs">RCS</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={savingEdit}
                          className="px-4 py-2 bg-orbit-purple hover:bg-purple-600 text-white text-sm font-medium rounded flex items-center justify-center min-w-[80px]"
                        >
                          {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          disabled={savingEdit}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {details.first_name} {details.last_name || ""}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {details.city || "Unknown Location"} • {details.phone || details.email}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI summary 360 */}
                {details.ai_summary && (
                  <div className="p-5 rounded-xl border border-purple-900/30 bg-purple-950/10 space-y-2 relative overflow-hidden">
                    <div className="flex gap-2 items-center text-orbit-purple font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-orbit-purple animate-pulse" />
                      AI 360 Summary
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed font-medium">
                      {details.ai_summary}
                    </p>
                  </div>
                )}

                {/* RFM Score Detail Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 text-center">
                    <span className="text-xs text-slate-500 block uppercase tracking-wider">
                      Recency
                    </span>
                    <span className="text-lg font-bold text-white">
                      {details.score?.recency_days ?? "—"} d
                    </span>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 text-center">
                    <span className="text-xs text-slate-500 block uppercase tracking-wider">
                      Frequency
                    </span>
                    <span className="text-lg font-bold text-white">
                      {details.score?.frequency ?? "—"} orders
                    </span>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 text-center">
                    <span className="text-xs text-slate-500 block uppercase tracking-wider">
                      Monetary
                    </span>
                    <span className="text-lg font-bold text-orbit-teal">
                      ₹{details.score?.monetary?.toLocaleString() ?? "0"}
                    </span>
                  </div>
                </div>

                {/* Order History */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-300 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    Order History ({details.orders?.length ?? 0})
                  </h4>
                  {details.orders && details.orders.length > 0 ? (
                    <div className="space-y-2">
                      {details.orders.map((ord: any) => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/10 flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="text-slate-300 block font-semibold">
                              ₹{ord.amount.toLocaleString()}
                            </span>
                            <span className="text-slate-500">
                              {new Date(ord.order_date).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                            {ord.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">No order history available.</p>
                  )}
                </div>

                {/* Campaign History */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-300 text-sm flex items-center gap-2">
                    <Send className="w-4 h-4 text-slate-400" />
                    Campaign Touchpoints ({details.campaigns?.length ?? 0})
                  </h4>
                  {details.campaigns && details.campaigns.length > 0 ? (
                    <div className="space-y-2">
                      {details.campaigns.map((camp: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/10 flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="text-slate-300 block font-semibold">
                              {camp.name}
                            </span>
                            <span className="text-slate-500">
                              {camp.sent_at ? new Date(camp.sent_at).toLocaleDateString() : "Pending"}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                            {camp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">No campaign touchpoints recorded.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-12">Failed to load profile.</div>
            )}
          </div>
        </div>
      )}

      {/* Remove-all confirmation modal */}
      {confirmAll && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-900/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-950/50 border border-red-900/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Remove all customer data?</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              This permanently deletes <span className="text-red-300 font-semibold">all {total} customers</span> in
              your organization, along with their orders, RFM scores, and message history.
              Segments and campaigns are kept. <span className="text-slate-300">This cannot be undone.</span>
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmAll(false)}
                disabled={removingAll}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAll}
                disabled={removingAll}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {removingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Customer Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Customer</h3>
                <p className="text-sm text-slate-400">
                  Are you sure you want to delete <strong className="text-white">{customerToDelete.first_name} {customerToDelete.last_name || ""}</strong>?
                </p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 pl-16">
              This will permanently remove their profile, order history, and RFM scores. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCustomerToDelete(null)}
                disabled={deletingId === customerToDelete.id}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={deletingId === customerToDelete.id}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {deletingId === customerToDelete.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-orbit-purple" />
                Add Customer
              </h3>
              <button
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">First Name *</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple transition-colors"
                    placeholder="e.g. Jane"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple transition-colors"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple transition-colors"
                  placeholder="e.g. jane@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-700 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-orbit-purple transition-colors"
                  placeholder="e.g. +919876543210"
                />
              </div>
              
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newFirstName}
                  className="flex-1 py-2.5 rounded-lg bg-orbit-purple hover:bg-orbit-purple text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
