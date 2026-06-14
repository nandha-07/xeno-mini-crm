"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getSession, setSession, type Session } from "@/lib/auth";
import { Search, ChevronDown, Building2, X } from "lucide-react";

/** Routes that render full-screen without the sidebar or auth guard. */
const PUBLIC_ROUTES = ["/login", "/welcome"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = pathname === "/" || PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<Session | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");

  useEffect(() => {
    if (isPublic) {
      setReady(true);
      return;
    }
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSessionState(s);
    setReady(true);

    if (s.role === "admin") {
      import("@/lib/api").then(({ api }) => {
        api.auth.organizations().then(setOrgs).catch(console.error);
      });
    }
  }, [pathname, isPublic, router]);

  const filteredOrgs = orgs.filter(o => 
    o.company_name.toLowerCase().includes(orgSearch.toLowerCase()) || 
    o.org_id.toLowerCase().includes(orgSearch.toLowerCase())
  );

  if (isPublic) {
    return (
      <main className="flex-1 overflow-y-auto h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black bg-fixed scroll-smooth">
        {children}
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex-1 h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-black bg-fixed">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black bg-fixed scroll-smooth relative">
        {session?.role === "admin" && (
          <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-orbit-blue/30 px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orbit-purple tracking-widest uppercase">Admin Mode</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-orbit-blue px-4 py-2 rounded-lg text-sm text-slate-200 transition-colors"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                {session.admin_selected_org_name || "Viewing All Organizations"}
                {session.admin_selected_org_uuid && (
                  <div 
                    className="ml-2 hover:bg-slate-700 p-0.5 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSession({ ...session, admin_selected_org_uuid: undefined, admin_selected_org_name: undefined });
                      window.location.reload();
                    }}
                  >
                    <X className="w-3 h-3 text-slate-400 hover:text-white" />
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-slate-500 ml-1" />
              </button>

              {showOrgDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search org name or ID..." 
                        value={orgSearch}
                        onChange={e => setOrgSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orbit-blue"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div 
                      className={`px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors border-b border-slate-800/50 ${!session.admin_selected_org_uuid ? 'bg-orbit-blue/10' : ''}`}
                      onClick={() => {
                        setSession({ ...session, admin_selected_org_uuid: undefined, admin_selected_org_name: undefined });
                        window.location.reload();
                      }}
                    >
                      <div className="font-semibold text-white text-sm">All Organizations</div>
                      <div className="text-xs text-slate-500 mt-0.5">View global metrics</div>
                    </div>
                    {filteredOrgs.map(org => (
                      <div 
                        key={org.id} 
                        className={`px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 ${session.admin_selected_org_uuid === org.id ? 'bg-orbit-blue/10' : ''}`}
                        onClick={() => {
                          setSession({ ...session, admin_selected_org_uuid: org.id, admin_selected_org_name: org.company_name });
                          window.location.reload();
                        }}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-semibold text-white text-sm">{org.company_name}</span>
                          <span className="text-[10px] text-orbit-purple font-mono bg-orbit-purple/10 px-2 py-0.5 rounded">{org.org_id}</span>
                        </div>
                        <div className="text-xs text-slate-500">{org.city || "No location"}</div>
                      </div>
                    ))}
                    {filteredOrgs.length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">
                        No organizations found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </main>
    </>
  );
}
