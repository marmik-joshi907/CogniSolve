"use client";
import { useState, useEffect } from "react";

const SlaTimer = ({ deadline, initialBreached }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isBreached, setIsBreached] = useState(initialBreached);

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0 || initialBreached) {
        setIsBreached(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsBreached(false);
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60))),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, initialBreached]);

  if (isBreached) {
    return (
      <div className="flex items-center gap-1 text-error font-bold text-[10px] bg-error-container/20 px-1.5 py-0.5 rounded uppercase border border-error/20 inline-flex">
        <span className="material-symbols-outlined text-[12px]">warning</span>
        BREACHED
      </div>
    );
  }

  const { hours, minutes, seconds } = timeLeft;
  const isWarning = hours < 2;

  return (
    <div className={`flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded border inline-flex ${isWarning ? 'text-orange-700 bg-orange-50 border-orange-200' : 'text-primary bg-primary/5 border-primary/20'}`}>
      <span className="material-symbols-outlined text-[12px]">timer</span>
      {hours}h {minutes}m {seconds}s
    </div>
  );
};

export default function ComplaintLog() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const json = await res.json();
      if (json.success) setComplaints(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchComplaints();
        fetchStats();
        if (selectedComplaint?.id === id) {
          setSelectedComplaint({ ...selectedComplaint, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNav = (e, pageName) => {
    e.preventDefault();
    const roleMapping = {
      "Executive View": "Customer Support Executive",
      "Quality Assurance": "QA Team Member",
      Operations: "Operations Manager",
    };
    const requiredRole = roleMapping[pageName] || "authorized personnel";
    alert(
      `Access Restricted: Please login as ${requiredRole} to access this portal.`
    );
  };

  // Filtering
  const filtered = complaints.filter((c) => {
    if (filterCategory && c.category !== filterCategory) return false;
    if (filterPriority && c.priority !== filterPriority) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (
      searchQuery &&
      !c.complaint_text.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !`CGN-${c.id}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const total = stats?.total_complaints || 0;
  const openCount = stats?.by_status?.open || 0;
  const resolvedCount =
    (stats?.by_status?.resolved || 0) + (stats?.by_status?.closed || 0);
  const inProgressCount = stats?.by_status?.in_progress || 0;

  const priorityColor = (p) => {
    if (p === "high")
      return "bg-error-container text-on-error-container";
    if (p === "medium")
      return "bg-tertiary-fixed text-on-tertiary-fixed";
    return "bg-[#d1e7dd] text-[#0f5132]";
  };

  const statusColor = (s) => {
    if (s === "resolved" || s === "closed")
      return "text-[#006d3a]";
    if (s === "in_progress") return "text-primary";
    return "text-error";
  };

  const statusIcon = (s) => {
    if (s === "resolved" || s === "closed") return "check_circle";
    if (s === "in_progress") return "pending";
    return "timer";
  };

  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-900 py-6 px-4 gap-2">
        <div className="mb-8 px-4">
          <h1 className="font-headline text-indigo-950 dark:text-white font-extrabold text-2xl tracking-tight">
            Cognisolve
          </h1>
          <p className="font-body text-xs text-secondary mt-1 uppercase tracking-wider font-semibold">
            Analytical Authority
          </p>
        </div>
        <button className="mb-6 w-full py-3 px-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <a
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="#"
            onClick={(e) => handleNav(e, "Executive View")}
          >
            <span className="material-symbols-outlined text-[20px]">
              dashboard
            </span>
            Executive View
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="#"
            onClick={(e) => handleNav(e, "Quality Assurance")}
          >
            <span className="material-symbols-outlined text-[20px]">
              fact_check
            </span>
            Quality Assurance
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="#"
            onClick={(e) => handleNav(e, "Operations")}
          >
            <span className="material-symbols-outlined text-[20px]">
              settings_suggest
            </span>
            Operations
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="#"
            onClick={(e) => handleNav(e, "Analytics")}
          >
            <span className="material-symbols-outlined text-[20px]">
              insights
            </span>
            Analytics
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm rounded-md font-bold font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              history_edu
            </span>
            Complaint Log
          </a>
        </div>
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-4">
          <a
            className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="#"
            onClick={(e) => handleNav(e, "Help Center")}
          >
            <span className="material-symbols-outlined text-[18px]">
              help_outline
            </span>
            Help Center
          </a>
          <a
            className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="#"
            onClick={(e) => handleNav(e, "Account")}
          >
            <span className="material-symbols-outlined text-[18px]">
              person
            </span>
            Account
          </a>
          <a
            className="flex items-center gap-3 px-4 py-2 mt-2 text-error hover:bg-error/10 hover:text-error rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors"
            href="/"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            Sign Out
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 relative min-h-screen pb-20 md:pb-0">
        {/* Mobile Top Nav */}
        <header className="md:hidden fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,30,0.06)] flex justify-between items-center px-4 h-16">
          <div className="font-['Manrope'] font-black text-xl text-indigo-900 dark:text-indigo-50">
            Cognisolve
          </div>
          <div className="flex gap-4 items-center">
            <button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-full transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-full transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 pt-24 md:pt-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <header className="mb-2">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
              Complaint Log
            </h2>
            <p className="font-body text-secondary max-w-2xl">
              Complete history of all submitted complaints with full
              classification data, resolution details, and SLA tracking.
            </p>
          </header>

          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
                Total Logged
              </p>
              <h3 className="font-headline text-3xl font-extrabold text-primary tracking-tighter">
                {total}
              </h3>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-error/5 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
                Open
              </p>
              <h3 className="font-headline text-3xl font-extrabold text-error tracking-tighter">
                {openCount}
              </h3>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
                In Progress
              </p>
              <h3 className="font-headline text-3xl font-extrabold text-primary tracking-tighter">
                {inProgressCount}
              </h3>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-[#006d3a]/5 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
                Resolved
              </p>
              <h3 className="font-headline text-3xl font-extrabold text-[#006d3a] tracking-tighter">
                {resolvedCount}
              </h3>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="Search by ID or keyword..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-sm text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Product">Product</option>
                <option value="Packaging">Packaging</option>
                <option value="Trade">Trade</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-sm text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-sm text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              {(filterCategory || filterPriority || filterStatus || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterCategory("");
                    setFilterPriority("");
                    setFilterStatus("");
                    setSearchQuery("");
                  }}
                  className="px-3 py-2.5 text-sm font-medium text-error hover:bg-error/10 rounded-xl transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Complaint Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  list_alt
                </span>
                All Complaints
              </h3>
              <span className="text-xs font-label uppercase text-secondary tracking-wider">
                {filtered.length} of {complaints.length} records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface/50 border-b border-surface-container-high/50">
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      ID
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      Complaint
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      Channel
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      Category
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      Priority
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      Confidence
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">
                      Date
                    </th>
                    <th className="px-5 py-3.5 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm divide-y divide-surface-container-high/30">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-12 text-center text-secondary"
                      >
                        <span className="material-symbols-outlined text-4xl text-secondary/40 mb-2 block">
                          search_off
                        </span>
                        No complaints match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((comp) => (
                      <tr
                        key={comp.id}
                        className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedComplaint(comp)}
                      >
                        <td className="px-5 py-3.5 font-mono font-medium text-primary text-xs">
                          CGN-{comp.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-on-surface truncate max-w-[250px]" title={comp.complaint_text}>
                            {comp.complaint_text}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] uppercase font-bold text-secondary bg-surface px-1.5 py-0.5 rounded-sm">
                            {comp.channel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-secondary capitalize text-xs">
                          {comp.category}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`${priorityColor(comp.priority)} text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm`}
                          >
                            {comp.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`${statusColor(comp.status)} text-xs font-bold flex items-center gap-1 w-fit`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {statusIcon(comp.status)}
                            </span>
                            {comp.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {comp.confidence_score ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${comp.confidence_score >= 0.8 ? "bg-[#006d3a]" : comp.confidence_score >= 0.6 ? "bg-[#f59e0b]" : "bg-error"}`}
                                  style={{ width: `${comp.confidence_score * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-secondary">
                                {(comp.confidence_score * 100).toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-secondary">N/A</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-secondary">
                          {comp.created_at
                            ? new Date(comp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            className="text-primary hover:bg-primary/5 p-1.5 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(comp);
                            }}
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-surface-container-high/50 bg-surface/30 flex justify-between items-center text-xs text-secondary font-label">
              <span>
                Showing {filtered.length} of {complaints.length} complaints
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Slide-Over Panel */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedComplaint(null)}
          ></div>
          <div className="relative w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl overflow-y-auto animate-slide-in">
            {/* Panel Header */}
            <div className="sticky top-0 bg-surface-container-lowest z-10 px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  CGN-{selectedComplaint.id}
                </h3>
                <p className="text-xs text-secondary mt-0.5 uppercase tracking-wider">
                  Complaint Detail
                </p>
              </div>
              <button
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
                onClick={() => setSelectedComplaint(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Meta Badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`${priorityColor(selectedComplaint.priority)} text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider`}
                >
                  {selectedComplaint.priority} priority
                </span>
                <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.category}
                </span>
                <span className="bg-surface-container-high text-secondary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.channel}
                </span>
                <span
                  className={`${statusColor(selectedComplaint.status)} bg-surface text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {statusIcon(selectedComplaint.status)}
                  </span>
                  {selectedComplaint.status.replace("_", " ")}
                </span>
              </div>

              {/* Complaint Text */}
              <div className="bg-surface p-4 rounded-lg border border-outline-variant/10">
                <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-2">
                  Complaint Text
                </h4>
                <p className="font-body text-sm text-on-surface leading-relaxed">
                  {selectedComplaint.complaint_text}
                </p>
              </div>

              {/* Confidence */}
              {selectedComplaint.confidence_score != null && (
                <div>
                  <div className="flex justify-between text-xs text-secondary mb-1.5">
                    <span className="uppercase tracking-wider font-bold">
                      Classification Confidence
                    </span>
                    <span className="font-bold">
                      {(selectedComplaint.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${selectedComplaint.confidence_score >= 0.8 ? "bg-[#006d3a]" : selectedComplaint.confidence_score >= 0.6 ? "bg-[#f59e0b]" : "bg-error"}`}
                      style={{
                        width: `${selectedComplaint.confidence_score * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* SLA Info */}
              {selectedComplaint.sla_deadline && (
                <div className="bg-surface p-4 rounded-lg border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary">
                      Target SLA Deadline
                    </h4>
                    <SlaTimer deadline={selectedComplaint.sla_deadline} initialBreached={selectedComplaint.sla_breached} />
                  </div>
                  <p className="text-sm text-on-surface font-medium">
                    DL: {new Date(selectedComplaint.sla_deadline).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Resolution Recommendation */}
              {selectedComplaint.resolution_text && (
                <div className="bg-[#006d3a]/5 p-4 rounded-lg border border-[#006d3a]/15">
                  <h4 className="font-label text-[10px] uppercase tracking-wider text-[#006d3a] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      lightbulb
                    </span>
                    AI Resolution Recommendation
                  </h4>
                  <div className="font-body text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {selectedComplaint.resolution_text}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/10">
                  <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-1">
                    Created
                  </h4>
                  <p className="text-xs text-on-surface">
                    {selectedComplaint.created_at
                      ? new Date(selectedComplaint.created_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/10">
                  <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-1">
                    Updated
                  </h4>
                  <p className="text-xs text-on-surface">
                    {selectedComplaint.updated_at
                      ? new Date(selectedComplaint.updated_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-4 border-t border-outline-variant/15 flex flex-wrap gap-2">
                {selectedComplaint.status === "open" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedComplaint.id, "in_progress")
                    }
                    className="flex-1 py-2.5 px-4 text-sm font-bold bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      play_arrow
                    </span>
                    Start Processing
                  </button>
                )}
                {selectedComplaint.status === "in_progress" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedComplaint.id, "resolved")
                    }
                    className="flex-1 py-2.5 px-4 text-sm font-bold bg-[#006d3a]/10 text-[#006d3a] rounded-md hover:bg-[#006d3a]/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    Mark Resolved
                  </button>
                )}
                {(selectedComplaint.status === "open" ||
                  selectedComplaint.status === "in_progress") && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedComplaint.id, "closed")
                    }
                    className="py-2.5 px-4 text-sm font-bold bg-surface-container-highest text-on-surface rounded-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      cancel
                    </span>
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
