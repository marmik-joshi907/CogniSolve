"use client";
export default function QA() {
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
<aside className="hidden md:flex flex-col h-full py-6 px-4 gap-2 bg-slate-50 dark:bg-slate-900 w-64 fixed left-0 top-0 z-40 bg-slate-100 dark:bg-slate-800">
<div className="flex items-center gap-3 px-4 mb-8">
<div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold">C</div>
<div className="flex flex-col">
<span className="text-indigo-950 dark:text-white font-extrabold font-headline">Cognisolve</span>
<span className="text-[10px] text-slate-500 uppercase tracking-widest">Analytical Authority</span>
</div>
</div>
<button className="mb-6 mx-2 py-3 px-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-md hover:opacity-90 transition-opacity">
            New Analysis
        </button>
<nav className="flex-1 flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 on click transition-transform font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Executive View")}>
<span className="material-symbols-outlined">dashboard</span>
                Executive View
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-md bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm font-bold font-['Inter'] text-sm tracking-wide uppercase" href="#" onClick={(e) => e.preventDefault()}>
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 1'}}>fact_check</span>
                Quality Assurance
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 on click transition-transform font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Operations")}>
<span className="material-symbols-outlined">settings_suggest</span>
                Operations
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 on click transition-transform font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Analytics")}>
<span className="material-symbols-outlined">insights</span>
                Analytics
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 on click transition-transform font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Complaint Log")}>
<span className="material-symbols-outlined">history_edu</span>
                Complaint Log
            </a>
</nav>
<div className="mt-auto flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 on click transition-transform font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Help Center")}>
<span className="material-symbols-outlined">help_outline</span>
                Help Center
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 on click transition-transform font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Account")}>
<span className="material-symbols-outlined">person</span>
                Account
            </a>
<a className="flex items-center gap-3 px-4 py-2 mt-2 text-error hover:bg-error/10 hover:text-error rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/">
<span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
            </a>
</div>
</aside>
{/*  Main Content Area  */}
<main className="flex-1 flex flex-col ml-0 md:ml-64 relative bg-surface h-full overflow-y-auto">
{/*  TopNavBar (Web)  */}
<header className="fixed top-0 w-full md:w-[calc(100%-16rem)] z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,30,0.06)]">
<div className="flex justify-between items-center px-8 h-16 w-full relative">
<div className="md:hidden text-indigo-900 dark:text-indigo-50 font-black text-xl font-['Manrope']">Cognisolve</div>
{/*  Spacer for web, to push search right  */}
<div className="hidden md:block flex-1">
<h1 className="font-headline font-bold text-lg text-indigo-900 tracking-tight">Quality Assurance Overview</h1>
</div>
<div className="flex items-center gap-4">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
<input className="pl-9 pr-4 py-1.5 bg-surface-container-low text-sm rounded-md border-0 focus:ring-1 focus:ring-primary/20 w-48 text-on-surface transition-all placeholder:text-slate-400" placeholder="Search complaints..." type="text"/>
</div>
<button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 p-2 rounded-full active:opacity-80">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 p-2 rounded-full active:opacity-80">
<span className="material-symbols-outlined">settings</span>
</button>
<div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden ml-2 cursor-pointer">
<img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS8u4b_mNJWlok4Qp4uDxt_E36pl15HwTsh4SOJKyV5D1OCZ4wA2WnZ4JdHHe81p6VpWEDIIUxiEZK52R24bw1xqMZT-y-Ad4b-zpMeP2d-nqPQNRqFfeNmrBEQPI_nropwtMswp3soBhldVJ2NmS8jJ3aZixA5YEjSofQwSJN4GZB4ly-ZfEQ_tqeBsWV_9H8xhkR3JfHO618mae0CVNTtivGBIJMlKIu_Gre-cewxfpOeA4RlVimROGUPebVQAVimUSVw2Wk2OBU"/>
</div>
</div>
<div className="bg-slate-100 dark:bg-slate-800 h-px w-full absolute bottom-0 opacity-10"></div>
</div>
</header>
{/*  Dashboard Content  */}
<div className="p-8 pt-24 max-w-7xl mx-auto w-full flex flex-col gap-8">
{/*  KPI Cards Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/*  Card 1  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary-container/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Total Complaints</p>
<div className="flex items-end gap-3">
<h2 className="font-headline text-display-sm font-bold text-on-surface">1,248</h2>
<span className="text-sm text-on-secondary-container mb-1 flex items-center bg-secondary-container/50 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[16px]">arrow_upward</span> 12%
                        </span>
</div>
<p className="text-xs text-on-surface-variant mt-3 opacity-70">vs last 30 days</p>
</div>
{/*  Card 2  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary-container/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Classification Accuracy</p>
<div className="flex items-end gap-3">
<h2 className="font-headline text-display-sm font-bold text-on-surface">94.2%</h2>
<span className="text-sm text-on-surface-variant mb-1 flex items-center">
                            Target: 95%
                        </span>
</div>
<div className="w-full bg-surface-container-high h-1.5 mt-4 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[94.2%]"></div>
</div>
</div>
{/*  Card 3  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-error/5 to-error-container/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Flagged for Review</p>
<div className="flex items-end gap-3">
<h2 className="font-headline text-display-sm font-bold text-error">42</h2>
<span className="text-sm text-error mb-1 flex items-center bg-error-container/50 px-1.5 py-0.5 rounded">
                            Requires action
                        </span>
</div>
<p className="text-xs text-on-surface-variant mt-3 opacity-70">Low confidence AI scores</p>
</div>
{/*  Card 4  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary-container/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Avg Resolution Time</p>
<div className="flex items-end gap-3">
<h2 className="font-headline text-display-sm font-bold text-on-surface">1.8d</h2>
<span className="text-sm text-[#006d3a] mb-1 flex items-center bg-[#006d3a]/10 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[16px]">arrow_downward</span> 0.4d
                        </span>
</div>
<p className="text-xs text-on-surface-variant mt-3 opacity-70">Time to close ticket</p>
</div>
</div>
{/*  Complex Layout: Charts & Tables  */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
{/*  Left Column: Charts  */}
<div className="xl:col-span-2 flex flex-col gap-8">
{/*  Line Chart Placeholder  */}
<div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col">
<div className="flex justify-between items-start mb-6">
<div>
<h3 className="font-headline text-headline-sm font-bold text-on-surface">Volume &amp; Trend Analysis</h3>
<p className="text-sm text-on-surface-variant mt-1">Daily complaint ingestion over the last 14 days.</p>
</div>
<button className="text-primary text-sm font-medium hover:bg-surface-container-low px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                Export <span className="material-symbols-outlined text-[18px]">download</span>
</button>
</div>
<div className="h-64 w-full bg-surface-container-low/50 rounded-lg border border-outline-variant/15 flex items-end px-4 pt-8 pb-4 relative">
{/*  Abstract Chart Representation  */}
<div className="absolute left-4 top-4 text-xs text-on-surface-variant">Volume</div>
<div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-on-surface-variant">Last 14 Days</div>
<div className="w-full h-full flex items-end justify-between gap-2 px-6">
<div className="w-full bg-primary/20 h-[30%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[45%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[25%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[60%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[50%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[80%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[40%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[55%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[70%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[90%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[65%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[45%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[35%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
<div className="w-full bg-primary/20 h-[50%] rounded-t-sm relative group hover:bg-primary/40 transition-colors"></div>
</div>
{/*  Overlay Line  */}
<svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
<polyline fill="none" points="5,70 12,55 19,75 26,40 33,50 40,20 47,60 54,45 61,30 68,10 75,35 82,55 89,65 96,50" stroke="#142175" strokeWidth="2"></polyline>
</svg>
</div>
</div>
{/*  Recurring Issues Table  */}
<div className="bg-surface-container-lowest p-6 rounded-xl">
<div className="flex justify-between items-center mb-6">
<h3 className="font-headline text-headline-sm font-bold text-on-surface">Semantic Clusters: Recurring Issues</h3>
<button className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">filter_list</span>
</button>
</div>
<div className="flex flex-col gap-4">
{/*  Table Row 1  */}
<div className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-container-low transition-colors group">
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<span className="w-2 h-2 rounded-full bg-error"></span>
<h4 className="font-medium text-on-surface text-sm">Login timeout during peak hours</h4>
</div>
<p className="text-xs text-on-surface-variant ml-5">"Session expired unexpectedly", "Forced logout while saving"</p>
</div>
<div className="text-right px-6">
<div className="text-display-xs font-headline font-bold text-on-surface">142</div>
<div className="text-[10px] uppercase tracking-wider text-secondary">Occurrences</div>
</div>
<div className="w-32 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
<div className="bg-error h-full w-[85%]"></div>
</div>
</div>
{/*  Table Row 2  */}
<div className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-container-low transition-colors group">
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
<h4 className="font-medium text-on-surface text-sm">Data export formatting errors</h4>
</div>
<p className="text-xs text-on-surface-variant ml-5">"CSV columns misaligned", "PDF report cuts off data"</p>
</div>
<div className="text-right px-6">
<div className="text-display-xs font-headline font-bold text-on-surface">87</div>
<div className="text-[10px] uppercase tracking-wider text-secondary">Occurrences</div>
</div>
<div className="w-32 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
<div className="bg-tertiary-fixed-dim h-full w-[45%]"></div>
</div>
</div>
{/*  Table Row 3  */}
<div className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-container-low transition-colors group">
<div className="flex-1">
<div className="flex items-center gap-3 mb-1">
<span className="w-2 h-2 rounded-full bg-primary-fixed-dim"></span>
<h4 className="font-medium text-on-surface text-sm">Navigation latency in Analytics tab</h4>
</div>
<p className="text-xs text-on-surface-variant ml-5">"Dashboard slow to load", "Graphs spinning endlessly"</p>
</div>
<div className="text-right px-6">
<div className="text-display-xs font-headline font-bold text-on-surface">54</div>
<div className="text-[10px] uppercase tracking-wider text-secondary">Occurrences</div>
</div>
<div className="w-32 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
<div className="bg-primary-fixed-dim h-full w-[25%]"></div>
</div>
</div>
</div>
</div>
</div>
{/*  Right Column: Queue & Dist  */}
<div className="flex flex-col gap-8">
{/*  Review Queue  */}
<div className="bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden border border-outline-variant/15">
<div className="bg-surface-container-low p-4 border-b border-surface">
<div className="flex items-center justify-between">
<h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-error text-[20px]">warning</span>
                                    Review Queue
                                </h3>
<span className="bg-error-container text-on-error-container text-xs font-bold px-2 py-0.5 rounded-md">42 Pending</span>
</div>
<p className="text-xs text-on-surface-variant mt-1">Low-confidence AI classifications requiring human validation.</p>
</div>
<div className="p-4 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
{/*  Queue Item 1  */}
<div className="bg-surface p-4 rounded-lg flex flex-col gap-3 relative">
<div className="flex justify-between items-start">
<span className="text-[10px] uppercase tracking-widest text-secondary font-bold">CMP-9921</span>
<span className="text-xs font-medium text-tertiary-fixed-dim bg-tertiary-fixed-dim/10 px-2 py-0.5 rounded">Conf: 45%</span>
</div>
<p className="text-sm text-on-surface leading-relaxed">"I tried updating my billing details but it just keeps looping back to the start. Also, I think I was overcharged last month?"</p>
<div className="flex flex-col gap-1 mt-1">
<span className="text-xs text-on-surface-variant">AI Suggested: <strong className="text-on-surface">Billing Error</strong></span>
<span className="text-xs text-on-surface-variant">Alternative: <strong className="text-on-surface">Technical Glitch</strong></span>
</div>
<div className="flex gap-2 mt-2 pt-3 border-t border-surface-container-high">
<button className="flex-1 py-1.5 bg-surface-container-highest text-on-surface text-sm font-medium rounded-md hover:bg-surface-variant transition-colors">Reject</button>
<button className="flex-1 py-1.5 bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity">Accept</button>
</div>
</div>
{/*  Queue Item 2  */}
<div className="bg-surface p-4 rounded-lg flex flex-col gap-3 relative">
<div className="flex justify-between items-start">
<span className="text-[10px] uppercase tracking-widest text-secondary font-bold">CMP-9904</span>
<span className="text-xs font-medium text-tertiary-fixed-dim bg-tertiary-fixed-dim/10 px-2 py-0.5 rounded">Conf: 52%</span>
</div>
<p className="text-sm text-on-surface leading-relaxed">"The new UI update is terrible. Where did the export button go? I need it for my weekly reports ASAP."</p>
<div className="flex flex-col gap-1 mt-1">
<span className="text-xs text-on-surface-variant">AI Suggested: <strong className="text-on-surface">Feature Request</strong></span>
<span className="text-xs text-on-surface-variant">Alternative: <strong className="text-on-surface">UX Feedback</strong></span>
</div>
<div className="flex gap-2 mt-2 pt-3 border-t border-surface-container-high">
<button className="flex-1 py-1.5 bg-surface-container-highest text-on-surface text-sm font-medium rounded-md hover:bg-surface-variant transition-colors">Reject</button>
<button className="flex-1 py-1.5 bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-medium rounded-md hover:opacity-90 transition-opacity">Accept</button>
</div>
</div>
</div>
<button className="w-full py-3 text-sm text-primary font-medium hover:bg-surface-container-low transition-colors border-t border-surface-container-high">
                            View All Pending
                        </button>
</div>
{/*  Horizontal Bar Chart  */}
<div className="bg-surface-container-lowest p-6 rounded-xl">
<h3 className="font-headline text-headline-sm font-bold text-on-surface mb-6">Category Distribution</h3>
<div className="flex flex-col gap-5">
<div className="flex flex-col gap-1">
<div className="flex justify-between text-sm">
<span className="font-medium text-on-surface">Technical Performance</span>
<span className="text-secondary">42%</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[42%] rounded-full"></div>
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex justify-between text-sm">
<span className="font-medium text-on-surface">Billing &amp; Subscriptions</span>
<span className="text-secondary">28%</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-primary/80 h-full w-[28%] rounded-full"></div>
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex justify-between text-sm">
<span className="font-medium text-on-surface">Feature Requests</span>
<span className="text-secondary">15%</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-primary/60 h-full w-[15%] rounded-full"></div>
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex justify-between text-sm">
<span className="font-medium text-on-surface">Account Access</span>
<span className="text-secondary">10%</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-primary/40 h-full w-[10%] rounded-full"></div>
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex justify-between text-sm">
<span className="font-medium text-on-surface">Other</span>
<span className="text-secondary">5%</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-primary/20 h-full w-[5%] rounded-full"></div>
</div>
</div>
</div>
</div>
</div>
</div>
{/*  Bottom padding for scrolling  */}
<div className="h-8 w-full"></div>
</div>
</main>

    </div>
  );
}
