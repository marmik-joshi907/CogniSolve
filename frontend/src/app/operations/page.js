"use client";
import { useState, useEffect } from "react";

export default function Operations() {
  const [userName, setUserName] = useState("Jane Doe");
  const [userRole, setUserRole] = useState("Admin / Operations Manager");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('cognisolve_username');
      const storedRole = localStorage.getItem('cognisolve_role');
      if (storedUser) setUserName(storedUser);
      if (storedRole) setUserRole(storedRole);
    }
  }, []);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchStats();
    fetchComplaints();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const json = await res.json();
      if (json.success) setComplaints(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const total = stats?.total_complaints || 0;
  const breached = stats?.sla_breached || 0;
  const slaMetPercent = total === 0 ? 100 : (((total - breached) / total) * 100).toFixed(1);
  const highPriority = stats?.by_priority?.high || 0;

  const handleNav = (e, pageName) => {
    e.preventDefault();
    const roleMapping = {
      'Executive View': 'Customer Support Executive',
      'Quality Assurance': 'QA Team Member',
      'Operations': 'Operations Manager'
    };
    const requiredRole = roleMapping[pageName] || 'authorized personnel';
    showToast(`Access Restricted: Please login as ${requiredRole} to access this portal.`);
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/export/csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cognisolve_complaints_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed:', e);
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await fetch('/api/export/pdf');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cognisolve_report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };
  return (
    <div className="flex min-h-screen w-full bg-surface">
      
{/*  TopNavBar  */}
<nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,30,0.06)] flex justify-between items-center px-8 h-16 w-full">
<div className="flex items-center gap-4 pl-64">
{/*  Placeholder to offset sidebar width if logo was here, but JSON says logo is in sidebar. Wait, TopNavBar JSON has a logo too? "style_brand_logo". Let's put it here for mobile or consistency. Actually, I'll align it left, next to a potential hamburger menu (not in spec but good practice)  */}
<div className="text-indigo-900 dark:text-indigo-50 font-black text-xl font-headline hidden md:block opacity-0">Cognisolve</div>
</div>
<div className="flex-1 max-w-md mx-8 relative flex justify-end">
{/*  Search Bar: on_right  */}
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">search</span>
<input className="w-full bg-surface-container-low text-on-surface rounded-DEFAULT py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-secondary border-none transition-all" placeholder="Search insights..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6 relative">
{/* Notifications */}
<div className="relative">
<button onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); setShowProfile(false); }} className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 active:opacity-80 p-2 rounded-full flex items-center justify-center relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
</button>
{showNotifications && (
  <div className="absolute top-full mt-2 right-0 w-80 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-[100]">
    <div className="px-4 py-3 border-b border-outline-variant/10 bg-surface flex justify-between items-center">
      <h3 className="font-headline font-bold text-sm">Notifications</h3>
      <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">2 New</span>
    </div>
    <div className="max-h-64 overflow-y-auto">
      <div className="p-3 border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors cursor-pointer bg-primary/5">
        <p className="text-sm font-bold text-on-surface mb-0.5">SLA Breach Warning</p>
        <p className="text-xs text-secondary line-clamp-2 mb-1">Case CGN-6 is 30 minutes away from SLA breach.</p>
        <p className="text-[10px] text-secondary">Just now</p>
      </div>
      <div className="p-3 border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors cursor-pointer">
        <p className="text-sm font-bold text-on-surface mb-0.5">System Update</p>
        <p className="text-xs text-secondary line-clamp-2 mb-1">Weekly reports have successfully been generated.</p>
        <p className="text-[10px] text-secondary">2 hours ago</p>
      </div>
    </div>
    <div className="p-2 border-t border-outline-variant/10 bg-surface text-center">
      <button className="text-xs font-bold text-primary hover:text-primary-container transition-colors">Mark all as read</button>
    </div>
  </div>
)}
</div>

{/* Settings */}
<div className="relative">
<button onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); setShowProfile(false); }} className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 active:opacity-80 p-2 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined">settings</span>
</button>
{showSettings && (
  <div className="absolute top-full mt-2 right-0 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-[100]">
    <div className="px-4 py-3 border-b border-outline-variant/10 bg-surface">
      <h3 className="font-headline font-bold text-sm">Quick Settings</h3>
    </div>
    <div className="flex flex-col py-2">
      <button onClick={() => { setShowSettings(false); showToast("User Interface preferences applied!"); }} className="px-4 py-2.5 text-left text-sm hover:bg-surface-container-low transition-colors flex items-center gap-3">
        <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
        Preferences
      </button>
      <button onClick={() => { setShowSettings(false); showToast("Dark mode toggle coming soon!"); }} className="px-4 py-2.5 text-left text-sm hover:bg-surface-container-low transition-colors flex items-center gap-3">
        <span className="material-symbols-outlined text-[18px] text-secondary">palette</span>
        Appearance
      </button>
      <button onClick={() => { setShowSettings(false); setShowAccount(true); }} className="px-4 py-2.5 text-left text-sm hover:bg-surface-container-low transition-colors flex items-center gap-3">
        <span className="material-symbols-outlined text-[18px] text-secondary">lock</span>
        Security
      </button>
    </div>
  </div>
)}
</div>

{/* Profile */}
<div className="relative">
<div onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowSettings(false); }} className="h-8 w-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm overflow-hidden cursor-pointer shadow-sm ring-2 ring-transparent hover:ring-primary/20 transition-all">
<img alt="User profile" className="w-full h-full object-cover" data-alt="close up professional headshot of a confident woman in business attire with soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASycN07uN8UJ1FQHS8SQFUPy2kgJ7X8J2Sj2QxWhMwRwZ90jGwCXSLNwjnwmQO39jLzmL1mGVz0CdGCSR5kRhmp5YLlmCEyh-MI26hGNZLJ8ehBKlEVngB8D3WbJrQxKrT_CIziGMI3wBvna4PxkrME79UPHqZQEudmpzEZE3vNkcQr6u71-cuhp2Jq51V0WWeRsf3YM_VaHmzMCyVMhTcEFYN9sVhlMwYVWx9TROUknD-LzGdqTAVLham9D-kj5xXEJ97TtSjO8VZ"/>
</div>
{showProfile && (
  <div className="absolute top-full mt-2 right-0 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-[100]">
    <div className="px-4 py-3 border-b border-outline-variant/10 bg-surface flex flex-col items-center pt-5 pb-4">
      <div className="h-14 w-14 rounded-full overflow-hidden mb-3 ring-4 ring-surface-container-low">
        <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASycN07uN8UJ1FQHS8SQFUPy2kgJ7X8J2Sj2QxWhMwRwZ90jGwCXSLNwjnwmQO39jLzmL1mGVz0CdGCSR5kRhmp5YLlmCEyh-MI26hGNZLJ8ehBKlEVngB8D3WbJrQxKrT_CIziGMI3wBvna4PxkrME79UPHqZQEudmpzEZE3vNkcQr6u71-cuhp2Jq51V0WWeRsf3YM_VaHmzMCyVMhTcEFYN9sVhlMwYVWx9TROUknD-LzGdqTAVLham9D-kj5xXEJ97TtSjO8VZ"/>
      </div>
      <h3 className="font-headline font-bold text-sm text-center">Jane Doe</h3>
      <p className="text-xs text-secondary text-center">Operations Manager</p>
      <span className="mt-2 text-[10px] uppercase font-bold text-[#006d3a] bg-[#006d3a]/10 px-2 py-0.5 rounded-full">Active</span>
    </div>
    <div className="flex flex-col py-2">
      <button className="px-4 py-2 text-left text-sm hover:bg-surface-container-low transition-colors text-error font-medium flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Sign Out
      </button>
    </div>
  </div>
)}
</div>
</div>
<div className="bg-slate-100 dark:bg-slate-800 h-px w-full absolute bottom-0 opacity-10"></div>
</nav>
{/*  SideNavBar  */}
<aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-900 flex flex-col h-full py-6 px-4 gap-2 pt-20 border-r-0 shadow-[4px_0_24px_rgba(25,28,30,0.02)]">
<div className="mb-8 px-4 flex items-center gap-3">
<div className="w-8 h-8 rounded-DEFAULT bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
<span className="material-symbols-outlined text-white text-lg">analytics</span>
</div>
<div>
<h1 className="text-indigo-950 dark:text-white font-extrabold font-headline tracking-tight leading-none text-lg">Cognisolve</h1>
<p className="font-['Inter'] text-[10px] tracking-wide uppercase font-bold text-secondary mt-1">Analytical Authority</p>
</div>
</div>

<nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
{/*  Executive View  */}
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="/action-center">
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">dashboard</span>
                Executive View
            </a>
{/*  Quality Assurance  */}
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="/qa">
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">fact_check</span>
                Quality Assurance
            </a>
{/*  Operations (ACTIVE)  */}
<a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm rounded-md font-['Inter'] text-sm tracking-wide uppercase font-bold relative overflow-hidden group" href="#" onClick={(e) => e.preventDefault()}>
<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
<span className="material-symbols-outlined text-[20px] fill">settings_suggest</span>
                Operations
            </a>
{/*  Analytics  */}
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="/analytics">
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">insights</span>
                Analytics
            </a>
{/*  Complaint Log  */}
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="/complaint-log">
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">history_edu</span>
                Complaint Log
            </a>
</nav>
<div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-2.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-xs tracking-wide uppercase font-bold" href="#" onClick={(e) => { e.preventDefault(); setShowHelp(true); }}>
<span className="material-symbols-outlined text-[18px]">help_outline</span>
                Help Center
            </a>
<a className="flex items-center gap-3 px-4 py-2.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-xs tracking-wide uppercase font-bold" href="#" onClick={(e) => { e.preventDefault(); setShowAccount(true); }}>
<span className="material-symbols-outlined text-[18px]">person</span>
                Account
            </a>
<a className="flex items-center gap-3 px-4 py-2 mt-2 text-error hover:bg-error/10 hover:text-error rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/">
<span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
            </a>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="pl-64 pt-24 px-8 pb-12 w-full max-w-[1600px] mx-auto flex flex-col gap-8">
{/*  Header & Global Actions  */}
<header className="flex flex-col md:flex-row md:items-end justify-between gap-6 z-10 relative">
<div>
<h2 className="font-headline text-3xl font-bold text-primary tracking-tight leading-tight">Operations Command</h2>
<p className="font-body text-secondary mt-1 text-sm">Real-time resolution metrics and active agent workloads.</p>
</div>
<div className="flex flex-wrap items-center gap-3">
{/*  Filters  */}
<div className="flex bg-surface-container-lowest rounded-DEFAULT shadow-[0_4px_12px_rgba(25,28,30,0.03)] p-1">
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[16px] pointer-events-none">calendar_today</span>
<select className="pl-9 pr-8 py-1.5 text-sm font-label text-on-surface hover:bg-surface-container-low bg-transparent rounded-DEFAULT border-none focus:ring-0 appearance-none outline-none cursor-pointer">
<option>Last 7 Days</option>
<option>Last 30 Days</option>
<option>This Quarter</option>
<option>This Year</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary text-[16px] pointer-events-none">expand_more</span>
</div>
<div className="w-px bg-surface-variant mx-1 my-1"></div>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[16px] pointer-events-none">category</span>
<select className="pl-9 pr-8 py-1.5 text-sm font-label text-on-surface hover:bg-surface-container-low bg-transparent rounded-DEFAULT border-none focus:ring-0 appearance-none outline-none cursor-pointer">
<option>All Categories</option>
<option>Packaging</option>
<option>Product</option>
<option>Trade</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary text-[16px] pointer-events-none">expand_more</span>
</div>
<div className="w-px bg-surface-variant mx-1 my-1"></div>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[16px] pointer-events-none">flag</span>
<select className="pl-9 pr-8 py-1.5 text-sm font-label text-on-surface hover:bg-surface-container-low bg-transparent rounded-DEFAULT border-none focus:ring-0 appearance-none outline-none cursor-pointer">
<option>All Priorities</option>
<option>High</option>
<option>Medium</option>
<option>Low</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary text-[16px] pointer-events-none">expand_more</span>
</div>
</div>
{/*  Export Actions  */}
<div className="flex gap-2 ml-auto md:ml-4">
<button onClick={handleExportPDF} className="bg-surface-container-lowest text-primary hover:bg-surface-container-low px-4 py-2 rounded-DEFAULT font-label text-sm font-semibold shadow-[0_4px_12px_rgba(25,28,30,0.03)] transition-all flex items-center gap-2 border border-transparent hover:border-surface-variant">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        Export PDF
                    </button>
<button onClick={handleExportCSV} className="bg-surface-container-highest text-on-surface hover:bg-surface-variant px-4 py-2 rounded-DEFAULT font-label text-sm font-semibold transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">table_chart</span>
                        Export CSV
                    </button>
</div>
</div>
</header>
{/*  KPI Row (Asymmetric Grid)  */}
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 z-10">
{/*  KPI 1  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="font-label text-xs uppercase tracking-widest text-secondary mb-2">SLA Met %</p>
<div className="flex items-end gap-3">
<h3 className="font-headline text-4xl font-extrabold text-primary tracking-tighter">{slaMetPercent}%</h3>
<div className="flex items-center text-sm font-medium text-[#006d3a] mb-1 bg-[#e6f4ea] px-1.5 py-0.5 rounded-DEFAULT">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
                        Active
                    </div>
</div>
<div className="mt-4 w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${slaMetPercent}%` }}></div>
</div>
</div>
{/*  KPI 2  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-error/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="font-label text-xs uppercase tracking-widest text-secondary mb-2">Breached Count</p>
<div className="flex items-end gap-3">
<h3 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">{breached}</h3>
<div className="flex items-center text-sm font-medium text-error mb-1 bg-error-container px-1.5 py-0.5 rounded-DEFAULT">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +3
                    </div>
</div>
<p className="font-body text-xs text-secondary mt-3">Target: &lt; 15 per week</p>
</div>
{/*  KPI 3  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-secondary-container/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="font-label text-xs uppercase tracking-widest text-secondary mb-2">Avg Resolution Time</p>
<div className="flex items-end gap-3">
<h3 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">{stats?.avg_resolution_hours || '—'}<span className="text-xl text-secondary font-medium ml-1">hrs</span></h3>
<div className="flex items-center text-sm font-medium text-[#006d3a] mb-1 bg-[#e6f4ea] px-1.5 py-0.5 rounded-DEFAULT">
<span className="material-symbols-outlined text-[14px]">trending_down</span>
                        Live
                    </div>
</div>
<p className="font-body text-xs text-secondary mt-3">Across all tiers</p>
</div>
{/*  KPI 4  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container-high/30">
<p className="font-label text-xs uppercase tracking-widest text-secondary mb-2">Total High Priority</p>
<div className="flex justify-between items-start">
<h3 className="font-headline text-4xl font-extrabold text-primary tracking-tighter">{highPriority}</h3>
<div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center animate-pulse">
<span className="material-symbols-outlined text-on-error-container">warning</span>
</div>
</div>
<div className="mt-4 flex -space-x-2">
<img alt="Agent" className="w-8 h-8 rounded-full border-2 border-white object-cover" data-alt="close up headshot of a professional man looking serious" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYcfq-LS-CtYJm7G_4VRprBnBW5OP4J3zuts5sJTHFTN5QRxxkYsam13MprJclPXOgyMFUXRKhpty3_0xBzyyYISWUFXDE3SrGKRg23W52j9BHpCI-Tmx0hddOi7q_Ti4IQ7_lf5HTLjxoeXvKU30ZgfJw1GQuDPcZbaO5iLR3coGBMxNG2hDUE6WA1UPSqNibzBbfTXm4N4wsAPJ8wtgrXcsKE0HfRM_WbbhTvYFFsWJexs7t_j-5lWT-GF7i4djRIQs6CC6TJsGw"/>
<img alt="Agent" className="w-8 h-8 rounded-full border-2 border-white object-cover" data-alt="close up headshot of a professional woman with glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCylNXeB_bMqSc1XZqol-eGjReyhp_wFy2cuJNgyxlOZlXEuemK8dSd-ANbtb72f-wGn5t3QtzCfSi9f3IkKjaLEd5A-lz71NaACYM4VZtJ4hKe3cwxYxcxSu2jgBF-UWh-ww3yh1zoxdIzJriIT9pH9_IkKZ1zsWFdfPZ_Cu8m1o3i_fkMv5RssI5uPLL9xb2FUTAb_xwVtcLXIwMA29ZwGTNIMG3p4tIb8AndGTSuhh27vsDcvJvTWdeSxENWeXtAuogLC-N4E86u"/>
<div className="w-8 h-8 rounded-full border-2 border-white bg-surface-variant flex items-center justify-center text-xs font-bold text-secondary">+3</div>
</div>
</div>
</section>
{/*  Charts Row  */}
<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10">
{/*  Donut Chart Card  */}
<div className="bg-surface-container-lowest rounded-lg p-6 lg:col-span-1 flex flex-col shadow-[0_4px_24px_rgba(25,28,30,0.02)]">
<div className="flex justify-between items-center mb-6">
<h3 className="font-headline text-lg font-bold text-primary">Category Distribution</h3>
<button className="text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</div>
<div className="flex-1 flex flex-col items-center justify-center relative min-h-[240px]">
{(() => {
  const cats = stats?.by_category || {};
  const catEntries = Object.entries(cats);
  const catColors = ['#142175', '#2e3a8c', '#b7c8e1', '#e0e3e5', '#6366f1'];
  let cumulative = 0;
  const segments = catEntries.map(([, count], i) => {
    const pct = total === 0 ? 0 : (count / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return `${catColors[i % catColors.length]} ${start}% ${cumulative}%`;
  });
  const gradient = segments.length > 0 ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#e0e3e5 0% 100%)';
  return (
    <div className="w-48 h-48 rounded-full border-[16px] border-surface-container-low relative flex items-center justify-center">
    <div className="absolute inset-[-16px] rounded-full" style={{background: gradient, mask: 'radial-gradient(transparent 55%, black 56%)', WebkitMask: 'radial-gradient(transparent 55%, black 56%)'}}></div>
    <div className="text-center z-10 bg-surface-container-lowest w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-inner">
    <span className="font-headline text-3xl font-extrabold text-primary">{total}</span>
    <span className="font-label text-[10px] uppercase tracking-wider text-secondary mt-1">Total Active</span>
    </div>
    </div>
  );
})()}
</div>
<div className="mt-4 grid grid-cols-2 gap-2 text-sm font-body">
{(() => {
  const cats = stats?.by_category || {};
  const catEntries = Object.entries(cats);
  const catColors = ['#142175', '#2e3a8c', '#b7c8e1', '#e0e3e5', '#6366f1'];
  return catEntries.map(([cat, count], i) => {
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return (<div key={cat} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: catColors[i % catColors.length]}}></div> {cat} ({pct}%)</div>);
  });
})()}
{Object.keys(stats?.by_category || {}).length === 0 && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#e0e3e5]"></div> No data yet</div>}
</div>
</div>
{/*  Bar Chart Card  */}
<div className="bg-surface-container-lowest rounded-lg p-6 lg:col-span-2 flex flex-col shadow-[0_4px_24px_rgba(25,28,30,0.02)]">
<div className="flex justify-between items-center mb-6">
<div>
<h3 className="font-headline text-lg font-bold text-primary">Agent Workload</h3>
<p className="font-body text-xs text-secondary mt-1">Open complaints per active analyst</p>
</div>
<div className="flex gap-2">
<span className="inline-flex items-center gap-1 text-xs font-label text-secondary"><div className="w-2 h-2 bg-primary rounded-full"></div> Standard</span>
<span className="inline-flex items-center gap-1 text-xs font-label text-secondary"><div className="w-2 h-2 bg-error-container rounded-full"></div> Escalated</span>
</div>
</div>
<div className="flex-1 flex items-end gap-4 h-48 mt-4 pt-4 border-b border-surface-container-high relative">
{/*  Y-Axis labels  */}
<div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-label text-secondary pb-6 -ml-2">
<span>20</span>
<span>15</span>
<span>10</span>
<span>5</span>
<span>0</span>
</div>
{/*  Bars (pl-6 to clear y-axis)  */}
<div className="flex-1 flex items-end justify-around h-full pl-6 pb-1">
{/*  Agent 1  */}
<div className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
<div className="w-8 flex flex-col-reverse gap-0.5">
<div className="w-full bg-primary h-[60%] rounded-t-sm group-hover:opacity-90 transition-opacity"></div>
<div className="w-full bg-error-container h-[10%] rounded-t-sm group-hover:opacity-90 transition-opacity"></div>
</div>
<span className="text-xs font-label text-on-surface">J. Doe</span>
</div>
{/*  Agent 2  */}
<div className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
<div className="w-8 flex flex-col-reverse gap-0.5">
<div className="w-full bg-primary h-[40%] rounded-t-sm"></div>
<div className="w-full bg-error-container h-[30%] rounded-t-sm"></div>
</div>
<span className="text-xs font-label text-on-surface">A. Smith</span>
</div>
{/*  Agent 3  */}
<div className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
<div className="w-8 flex flex-col-reverse gap-0.5">
<div className="w-full bg-primary h-[80%] rounded-t-sm"></div>
<div className="w-full bg-error-container h-[5%] rounded-t-sm"></div>
</div>
<span className="text-xs font-label text-on-surface">M. Lee</span>
</div>
{/*  Agent 4  */}
<div className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
<div className="w-8 flex flex-col-reverse gap-0.5">
<div className="w-full bg-primary h-[30%] rounded-t-sm"></div>
</div>
<span className="text-xs font-label text-on-surface">S. King</span>
</div>
{/*  Agent 5  */}
<div className="flex flex-col items-center gap-2 w-12 group cursor-pointer">
<div className="w-8 flex flex-col-reverse gap-0.5">
<div className="w-full bg-primary h-[50%] rounded-t-sm"></div>
<div className="w-full bg-error-container h-[20%] rounded-t-sm"></div>
</div>
<span className="text-xs font-label text-on-surface">R. Cole</span>
</div>
</div>
</div>
</div>
</section>
{/*  SLA Status Table  */}
<section className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(25,28,30,0.04)] z-10">
<div className="p-6 border-b border-surface-container-high/50 flex justify-between items-center bg-white">
<h3 className="font-headline text-lg font-bold text-primary">Active Cases &amp; SLA Status</h3>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">filter_list</span>
<select className="pl-9 pr-8 py-1.5 text-sm font-label text-on-surface bg-surface-container-low rounded-DEFAULT border-none focus:ring-1 focus:ring-primary/20 appearance-none outline-none cursor-pointer">
<option>Sort by: Urgency</option>
<option>Sort by: Oldest First</option>
<option>Sort by: SLA Target</option>
</select>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface/50 border-b border-surface-container-high/50">
<th className="px-6 py-4 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">Case ID</th>
<th className="px-6 py-4 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">Client / Account</th>
<th className="px-6 py-4 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">Category</th>
<th className="px-6 py-4 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">SLA Status</th>
<th className="px-6 py-4 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold">Assigned To</th>
<th className="px-6 py-4 font-label text-[11px] uppercase tracking-widest text-secondary font-semibold text-right">Action</th>
</tr>
</thead>
<tbody className="font-body text-sm divide-y divide-surface-container-high/30">
{complaints.length === 0 ? (
  <tr>
    <td colSpan="6" className="px-6 py-8 text-center text-secondary">No active cases found.</td>
  </tr>
) : (
  complaints.map(comp => {
    const isBreached = comp.sla_breached;
    const isHigh = comp.priority === 'high';
    const isResolved = comp.status === 'resolved' || comp.status === 'closed';
    
    return (
      <tr key={comp.id} className={`hover:bg-surface-container-low/50 transition-colors ${isBreached ? 'bg-error-container/5' : isHigh ? 'bg-tertiary-fixed/10' : ''}`}>
      <td className="px-6 py-4 font-mono font-medium text-primary">CGN-{comp.id}</td>
      <td className="px-6 py-4">
      <div className="font-semibold text-on-surface truncate max-w-[150px]" title={comp.complaint_text}>{comp.complaint_text}</div>
      <div className="text-xs text-secondary mt-0.5 capitalize">{comp.channel}</div>
      </td>
      <td className="px-6 py-4 text-secondary capitalize">{comp.category}</td>
      <td className="px-6 py-4">
        {isResolved ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT bg-[#e6f4ea] text-[#006d3a] text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Resolved
          </span>
        ) : isBreached ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT bg-error-container text-on-error-container text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Breached
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Active
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-on-surface flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-[10px] font-bold">Un</div>
          Unassigned
      </td>
      <td className="px-6 py-4 text-right">
      <button className="text-primary hover:bg-primary/5 p-1.5 rounded-DEFAULT transition-colors" title="View Details" onClick={() => setSelectedComplaint(comp)}>
      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>
      </td>
      </tr>
    );
  })
)}
</tbody>
</table>
</div>
<div className="p-4 border-t border-surface-container-high/50 bg-surface/30 flex justify-between items-center text-xs text-secondary font-label">
<span>Showing {complaints.length} active cases</span>
<div className="flex gap-1">
<button className="px-2 py-1 bg-primary text-white rounded-DEFAULT">1</button>
</div>
</div>
</section>

      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex justify-end">
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
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.priority} priority
                </span>
                <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.category}
                </span>
                <span className="bg-surface-container-high text-secondary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.channel}
                </span>
                <span className="bg-surface text-secondary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border">
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
            </div>
          </div>
          <style jsx>{`
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            .animate-slide-in {
                animation: slideIn 0.25s ease-out;
            }
          `}</style>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHelp(false)}></div>
          <div className="relative bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/15 pb-4">
              <h3 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">support_agent</span>
                Help Center
              </h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-1.5 hover:bg-surface-container rounded-full text-secondary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-body text-secondary leading-relaxed">
                Welcome to the CogniSolve Support Portal. Our AI-driven resolution system is designed to streamline your workflows.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h4 className="font-bold text-sm text-primary mb-1">Immediate Assistance</h4>
                <p className="text-xs text-secondary mb-3">Priority support is available 24/7 for critical SLA breaches.</p>
                <button className="w-full py-2.5 bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  Call 1-800-COGNISOLVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom flex items-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg font-['Inter'] text-sm">
          <span className="material-symbols-outlined text-green-400">info</span>
          {toastMessage}
        </div>
      )}

      {/* Account Modal */}
      {showAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAccount(false)}></div>
          <div className="relative bg-surface w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-br from-indigo-900 to-primary p-6 relative">
              <button 
                onClick={() => setShowAccount(false)}
                className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold tracking-wider mb-2 ring-4 ring-white/10 backdrop-blur-md">
                {userName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold font-headline text-white tracking-tight">{userName}</h3>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">{userRole}</p>
            </div>
            
            <div className="p-2 flex flex-col">
              <button onClick={() => showToast("Settings management initialized...")} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface transition-colors">
                <span className="material-symbols-outlined text-secondary text-[20px]">manage_accounts</span>
                Manage Settings
              </button>
              <button onClick={() => showToast("Privacy settings are managed by your administrator.")} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface border-b border-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-secondary text-[20px]">security</span>
                Security & Privacy
              </button>
              <button onClick={() => { if(typeof window !== "undefined") { localStorage.removeItem("cognisolve_username"); localStorage.removeItem("cognisolve_role"); window.location.href = "/"; } }} className="flex items-center gap-3 px-4 py-3 mt-1 hover:bg-error/10 rounded-xl text-left text-sm font-bold text-error transition-colors">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Sign Out Securely
              </button>
            </div>
          </div>
        </div>
      )}

</main>


    </div>
  );
}
