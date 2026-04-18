"use client";
import { useState, useEffect } from "react";

export default function ActionCenter() {
  const [complaints, setComplaints] = useState([]);
  const [source, setSource] = useState("web");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const json = await res.json();
      if (json.success) {
        setComplaints(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/complaints/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, channel: source })
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          ...data.data,
          classification_method: data.classification?.method || 'unknown',
          resolution_method: data.resolution?.method || 'unknown',
        });
        fetchComplaints();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchComplaints();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNav = (e, pageName) => {
    e.preventDefault();
    const roleMapping = {
      'Executive View': 'Customer Support Executive',
      'Quality Assurance': 'QA Team Member',
      'Operations': 'Operations Manager'
    };
    const requiredRole = roleMapping[pageName] || 'authorized personnel';
    alert(`Access Restricted: Please login as ${requiredRole} to access this portal.`);
  };
  return (
    <div className="flex h-screen w-full bg-surface">
      
{/*  SideNavBar  */}
<nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-900 py-6 px-4 gap-2">
<div className="mb-8 px-4">
<h1 className="font-headline text-indigo-950 dark:text-white font-extrabold text-2xl tracking-tight">Cognisolve</h1>
<p className="font-body text-xs text-secondary mt-1 uppercase tracking-wider font-semibold">Analytical Authority</p>
</div>
<button className="mb-6 w-full py-3 px-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[18px]">add</span>
            New Analysis
        </button>
<div className="flex-1 flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm rounded-md font-bold font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => e.preventDefault()}>
<span className="material-symbols-outlined text-[20px]">dashboard</span>
                Executive View
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, "Quality Assurance")}>
<span className="material-symbols-outlined text-[20px]">fact_check</span>
                Quality Assurance
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, "Operations")}>
<span className="material-symbols-outlined text-[20px]">settings_suggest</span>
                Operations
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, "Analytics")}>
<span className="material-symbols-outlined text-[20px]">insights</span>
                Analytics
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, "Complaint Log")}>
<span className="material-symbols-outlined text-[20px]">history_edu</span>
                Complaint Log
            </a>
</div>
<div className="mt-auto flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-4">
<a className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, "Help Center")}>
<span className="material-symbols-outlined text-[18px]">help_outline</span>
                Help Center
            </a>
<a className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, "Account")}>
<span className="material-symbols-outlined text-[18px]">person</span>
                Account
            </a>
<a className="flex items-center gap-3 px-4 py-2 mt-2 text-error hover:bg-error/10 hover:text-error rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/">
<span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
            </a>
</div>
</nav>
{/*  Main Content Area  */}
<main className="flex-1 ml-0 md:ml-64 relative min-h-screen pb-20 md:pb-0">
{/*  TopNavBar Mobile  */}
<header className="md:hidden fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,30,0.06)] flex justify-between items-center px-4 h-16">
<div className="font-['Manrope'] font-black text-xl text-indigo-900 dark:text-indigo-50">Cognisolve</div>
<div className="flex gap-4 items-center">
<button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-full transition-all">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-full transition-all">
<span className="material-symbols-outlined">settings</span>
</button>
</div>
<div className="bg-slate-100 dark:bg-slate-800 h-px w-full absolute bottom-0 opacity-10"></div>
</header>
<div className="p-6 md:p-10 pt-24 md:pt-10 max-w-7xl mx-auto space-y-10">
{/*  Header  */}
<header className="mb-8">
<h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Executive Dashboard</h2>
<p className="font-body text-secondary max-w-2xl">Submit complaints, view AI classifications with ML-powered resolution recommendations, and manage the active queue.</p>
</header>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
{/*  Left Column: Submission & Real-time Result (Span 4)  */}
<div className="lg:col-span-4 flex flex-col gap-8">
{/*  Submission Form  */}
<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 relative overflow-hidden">
<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>
<h3 className="font-headline font-bold text-lg mb-4 text-on-surface">New Analysis</h3>
<form className="space-y-4">
<div>
<label className="block font-label text-xs uppercase tracking-wider text-secondary mb-1.5">Complaint Source</label>
<select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-surface-container-low border-none rounded-md text-sm p-3 focus:ring-2 focus:ring-primary/20 text-on-surface">
<option value="web">Web Portal</option>
<option value="email">Email</option>
<option value="call">Direct Call</option>
</select>
</div>
<div>
<label className="block font-label text-xs uppercase tracking-wider text-secondary mb-1.5">Raw Text</label>
<textarea value={rawText} onChange={(e) => setRawText(e.target.value)} className="w-full bg-surface-container-low border-none rounded-md text-sm p-3 focus:ring-2 focus:ring-primary/20 text-on-surface resize-none" placeholder="Paste complaint text here..." rows="4"></textarea>
</div>
<button onClick={handleAnalyze} disabled={loading} className="w-full py-3 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50" type="button">
                                {loading ? "Analyzing..." : "Analyze Content"}
                            </button>
</form>
</div>
{/*  AI Result Card  */}
{result && (
<div className="bg-surface-container-low rounded-xl p-1 relative">
<div className="bg-surface-container-lowest p-5 rounded-lg h-full border border-outline-variant/15">
<div className="flex justify-between items-start mb-4">
<h3 className="font-headline font-bold text-lg text-on-surface">Analysis Result</h3>
<div className="flex items-center gap-2">
<span className="bg-surface-container-high text-primary text-xs font-bold px-2 py-1 rounded-sm">{(result.confidence_score * 100).toFixed(0)}% CONF</span>
<span className="bg-surface-container-high text-secondary text-[10px] font-bold px-2 py-1 rounded-sm uppercase">{result.classification_method || 'ML'}</span>
</div>
</div>
{/* Confidence Bar */}
<div className="mb-4">
<div className="flex justify-between text-xs text-secondary mb-1">
<span>Confidence Level</span>
<span>{(result.confidence_score * 100).toFixed(1)}%</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className={`h-full rounded-full transition-all ${result.confidence_score >= 0.8 ? 'bg-[#006d3a]' : result.confidence_score >= 0.6 ? 'bg-[#f59e0b]' : 'bg-error'}`} style={{ width: `${result.confidence_score * 100}%` }}></div>
</div>
</div>
<div className="space-y-4">
<div className="flex gap-2">
<span className="bg-error-container text-on-error-container text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">{result.priority} priority</span>
<span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">{result.category}</span>
</div>
<div className="bg-surface p-3 rounded-md border border-outline-variant/10">
<h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-1">Target SLA Deadline</h4>
<p className="font-body text-xs text-on-surface-variant leading-relaxed">
                                        {new Date(result.sla_deadline).toLocaleString()}
                                    </p>
</div>
{/* Resolution Recommendation */}
{result.resolution_text && (
<div className="bg-[#006d3a]/5 p-3 rounded-md border border-[#006d3a]/15">
<h4 className="font-label text-[10px] uppercase tracking-wider text-[#006d3a] mb-2 flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lightbulb</span>
AI Resolution Recommendation
<span className="text-[9px] bg-[#006d3a]/10 px-1.5 py-0.5 rounded ml-1">{result.resolution_method || 'template'}</span>
</h4>
<div className="font-body text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
{result.resolution_text}
</div>
</div>
)}
<div className="pt-2 flex justify-end gap-2">
<button className="px-4 py-2 text-sm font-medium text-primary hover:bg-surface-container rounded-md transition-colors" onClick={() => setResult(null)}>Dismiss</button>
</div>
</div>
</div>
</div>
)}
</div>
{/*  Right Column: Queue (Span 8)  */}
<div className="lg:col-span-8 flex flex-col gap-6">
{/*  Search & Filter  */}
<div className="flex flex-col sm:flex-row gap-4">
<div className="relative flex-1">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
<input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Search ID, keyword, or category..." type="text"/>
</div>
<div className="flex gap-2">
<button className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-sm text-sm font-medium text-secondary hover:bg-surface-container-low transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
                                Filter
                            </button>
</div>
</div>
{/*  Queue List  */}
<div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
<div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
<h3 className="font-headline font-bold text-lg text-on-surface">Active Queue</h3>
<span className="text-xs font-label uppercase text-secondary tracking-wider">Showing {complaints.length} items</span>
</div>
<div className="divide-y divide-surface-container-low max-h-[600px] overflow-y-auto">
{complaints.length === 0 ? (
  <div className="p-8 text-center text-sm text-secondary">No active complaints found.</div>
) : (
  complaints.map(comp => (
    <div key={comp.id} className="p-4 hover:bg-surface-container-low transition-colors group">
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
    <div className="w-16 text-xs font-label text-secondary font-medium">#{comp.id}</div>
    <div className="flex-1">
    <p className="font-body text-sm font-medium text-on-surface mb-1 truncate max-w-md">{comp.complaint_text}</p>
    <div className="flex gap-2 items-center flex-wrap">
    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-secondary bg-surface px-1.5 py-0.5 rounded-sm">
    <span className="material-symbols-outlined text-[12px]">inventory_2</span> {comp.category}
                                                </span>
    <span className={`${comp.priority === 'high' ? 'bg-error-container text-on-error-container' : comp.priority === 'medium' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-[#d1e7dd] text-[#0f5132]'} text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm`}>{comp.priority}</span>
    <span className="text-[10px] uppercase font-bold text-secondary bg-surface px-1.5 py-0.5 rounded-sm">{comp.channel}</span>
    </div>
    </div>
    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
    {/* Status Update Buttons */}
    {comp.status === 'open' && (
      <button onClick={() => handleStatusUpdate(comp.id, 'in_progress')} className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors">Start</button>
    )}
    {comp.status === 'in_progress' && (
      <button onClick={() => handleStatusUpdate(comp.id, 'resolved')} className="px-3 py-1.5 text-xs font-bold bg-[#006d3a]/10 text-[#006d3a] rounded-md hover:bg-[#006d3a]/20 transition-colors">Resolve</button>
    )}
    <div className={`${comp.status === 'resolved' || comp.status === 'closed' ? 'text-[#006d3a]' : comp.status === 'in_progress' ? 'text-primary' : 'text-error'} text-xs font-bold flex items-center gap-1`}>
    <span className="material-symbols-outlined text-[14px]">{comp.status === 'resolved' ? 'check_circle' : comp.status === 'in_progress' ? 'pending' : 'timer'}</span>
    {comp.status.replace('_', ' ')}
    </div>
    </div>
    </div>
    {/* Show resolution if available */}
    {comp.resolution_text && (
      <div className="mt-3 ml-16 p-2.5 bg-[#006d3a]/5 rounded-md border border-[#006d3a]/10">
        <p className="text-[10px] uppercase tracking-wider text-[#006d3a] font-bold mb-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">lightbulb</span> Resolution
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">{comp.resolution_text}</p>
      </div>
    )}
    </div>
  ))
)}
</div>
</div>
</div>
</div>
</div>
</main>

    </div>
  );
}
