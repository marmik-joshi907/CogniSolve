"use client";
export default function Operations() {
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
<div className="flex items-center gap-6">
<button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 active:opacity-80 p-2 rounded-full flex items-center justify-center relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 active:opacity-80 p-2 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined">settings</span>
</button>
<div className="h-8 w-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm overflow-hidden cursor-pointer shadow-sm">
<img alt="User profile" className="w-full h-full object-cover" data-alt="close up professional headshot of a confident woman in business attire with soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASycN07uN8UJ1FQHS8SQFUPy2kgJ7X8J2Sj2QxWhMwRwZ90jGwCXSLNwjnwmQO39jLzmL1mGVz0CdGCSR5kRhmp5YLlmCEyh-MI26hGNZLJ8ehBKlEVngB8D3WbJrQxKrT_CIziGMI3wBvna4PxkrME79UPHqZQEudmpzEZE3vNkcQr6u71-cuhp2Jq51V0WWeRsf3YM_VaHmzMCyVMhTcEFYN9sVhlMwYVWx9TROUknD-LzGdqTAVLham9D-kj5xXEJ97TtSjO8VZ"/>
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
<button className="mb-6 mx-2 bg-gradient-to-br from-primary to-primary-container text-white rounded-DEFAULT py-2.5 px-4 font-label text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
<span className="material-symbols-outlined text-[18px]">add</span>
            New Analysis
        </button>
<nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
{/*  Executive View  */}
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="#" onClick={(e) => handleNav(e, "Executive View")}>
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">dashboard</span>
                Executive View
            </a>
{/*  Quality Assurance  */}
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="#" onClick={(e) => handleNav(e, "Quality Assurance")}>
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
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="#" onClick={(e) => handleNav(e, "Analytics")}>
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">insights</span>
                Analytics
            </a>
{/*  Complaint Log  */}
<a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-sm tracking-wide uppercase font-bold group" href="#" onClick={(e) => handleNav(e, "Complaint Log")}>
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">history_edu</span>
                Complaint Log
            </a>
</nav>
<div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-2.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-xs tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Help Center")}>
<span className="material-symbols-outlined text-[18px]">help_outline</span>
                Help Center
            </a>
<a className="flex items-center gap-3 px-4 py-2.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-['Inter'] text-xs tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Account")}>
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
<button className="px-3 py-1.5 text-sm font-label text-on-surface hover:bg-surface-container-low rounded-DEFAULT flex items-center gap-2 transition-colors">
<span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        Last 7 Days
                        <span className="material-symbols-outlined text-[16px] text-secondary">expand_more</span>
</button>
<div className="w-px bg-surface-variant mx-1 my-1"></div>
<button className="px-3 py-1.5 text-sm font-label text-on-surface hover:bg-surface-container-low rounded-DEFAULT flex items-center gap-2 transition-colors">
<span className="material-symbols-outlined text-[16px]">category</span>
                        All Categories
                        <span className="material-symbols-outlined text-[16px] text-secondary">expand_more</span>
</button>
<div className="w-px bg-surface-variant mx-1 my-1"></div>
<button className="px-3 py-1.5 text-sm font-label text-on-surface hover:bg-surface-container-low rounded-DEFAULT flex items-center gap-2 transition-colors">
<span className="material-symbols-outlined text-[16px]">flag</span>
                        All Priorities
                        <span className="material-symbols-outlined text-[16px] text-secondary">expand_more</span>
</button>
</div>
{/*  Export Actions  */}
<div className="flex gap-2 ml-auto md:ml-4">
<button className="bg-surface-container-lowest text-primary hover:bg-surface-container-low px-4 py-2 rounded-DEFAULT font-label text-sm font-semibold shadow-[0_4px_12px_rgba(25,28,30,0.03)] transition-all flex items-center gap-2 border border-transparent hover:border-surface-variant">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        Export PDF
                    </button>
<button className="bg-surface-container-highest text-on-surface hover:bg-surface-variant px-4 py-2 rounded-DEFAULT font-label text-sm font-semibold transition-all flex items-center gap-2">
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
<h3 className="font-headline text-4xl font-extrabold text-primary tracking-tighter">94.2%</h3>
<div className="flex items-center text-sm font-medium text-[#006d3a] mb-1 bg-[#e6f4ea] px-1.5 py-0.5 rounded-DEFAULT">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +1.2%
                    </div>
</div>
<div className="mt-4 w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-primary-container w-[94.2%]"></div>
</div>
</div>
{/*  KPI 2  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
<div className="absolute right-0 top-0 w-24 h-24 bg-error/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
<p className="font-label text-xs uppercase tracking-widest text-secondary mb-2">Breached Count</p>
<div className="flex items-end gap-3">
<h3 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">18</h3>
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
<h3 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">4.2<span className="text-xl text-secondary font-medium ml-1">hrs</span></h3>
<div className="flex items-center text-sm font-medium text-[#006d3a] mb-1 bg-[#e6f4ea] px-1.5 py-0.5 rounded-DEFAULT">
<span className="material-symbols-outlined text-[14px]">trending_down</span>
                        -0.5h
                    </div>
</div>
<p className="font-body text-xs text-secondary mt-3">Across all tiers</p>
</div>
{/*  KPI 4  */}
<div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-surface-container-high/30">
<p className="font-label text-xs uppercase tracking-widest text-secondary mb-2">Open High Priority</p>
<div className="flex justify-between items-start">
<h3 className="font-headline text-4xl font-extrabold text-primary tracking-tighter">7</h3>
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
{/*  Placeholder Donut using CSS  */}
<div className="w-48 h-48 rounded-full border-[16px] border-surface-container-low relative flex items-center justify-center">
{/*  Simulated segments using conic-gradient on a pseudo element or inner div  */}
<div className="absolute inset-[-16px] rounded-full" style={{background: 'conic-gradient(#142175 0% 45%, #2e3a8c 45% 70%, #b7c8e1 70% 90%, #e0e3e5 90% 100%)', mask: 'radial-gradient(transparent 55%, black 56%)', WebkitMask: 'radial-gradient(transparent 55%, black 56%)'}}></div>
<div className="text-center z-10 bg-surface-container-lowest w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-inner">
<span className="font-headline text-3xl font-extrabold text-primary">342</span>
<span className="font-label text-[10px] uppercase tracking-wider text-secondary mt-1">Total Active</span>
</div>
</div>
</div>
<div className="mt-4 grid grid-cols-2 gap-2 text-sm font-body">
<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#142175]"></div> Billing (45%)</div>
<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2e3a8c]"></div> Technical (25%)</div>
<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#b7c8e1]"></div> Service (20%)</div>
<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#e0e3e5]"></div> Other (10%)</div>
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
{/*  Row: Breached (Red)  */}
<tr className="hover:bg-surface-container-low/50 transition-colors bg-error-container/5">
<td className="px-6 py-4 font-mono font-medium text-primary">CGN-8492</td>
<td className="px-6 py-4">
<div className="font-semibold text-on-surface">Acme Corp</div>
<div className="text-xs text-secondary mt-0.5">Enterprise Tier</div>
</td>
<td className="px-6 py-4 text-secondary">Billing Discrepancy</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT bg-error-container text-on-error-container text-xs font-bold uppercase tracking-wider">
<span className="material-symbols-outlined text-[14px]">warning</span>
                                    Breached (-2h)
                                </span>
</td>
<td className="px-6 py-4 text-on-surface flex items-center gap-2">
<img alt="Agent" className="w-6 h-6 rounded-full object-cover" data-alt="close up headshot of a professional man looking serious" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQq_UMcYhe-WzUijdrtGkfETxy_nysINblHQLqba2JRjLZIUc2YCGDUzGBlzMQzXH9xnzewN8RHXmuhYLDrMool-GZ8qZqrTUL2gWKMf_K2XlMFIYnouSvTJ2UIWXn45HRMOeKDrzlw03HpOUuB9towY1dflVW1qjPmK5gWQ7UAAsYiMtxAuOTgdbWNpmHFAeDzoCoqND3bzozZ3LQLfKvog3k1Mc5Ynk5PT3poC0MC2z03uDQ8YJ4Uisex_tlUeCdm5wprRk6daQW"/>
                                 J. Doe
                            </td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:bg-primary/5 p-1.5 rounded-DEFAULT transition-colors" title="View Details">
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</td>
</tr>
{/*  Row: Warning (Amber)  */}
<tr className="hover:bg-surface-container-low/50 transition-colors bg-tertiary-fixed/10">
<td className="px-6 py-4 font-mono font-medium text-primary">CGN-8495</td>
<td className="px-6 py-4">
<div className="font-semibold text-on-surface">TechLogistics Inc.</div>
<div className="text-xs text-secondary mt-0.5">Standard Tier</div>
</td>
<td className="px-6 py-4 text-secondary">Data Synchronization</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold uppercase tracking-wider">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                                    At Risk (&lt; 1h)
                                </span>
</td>
<td className="px-6 py-4 text-on-surface flex items-center gap-2">
<img alt="Agent" className="w-6 h-6 rounded-full object-cover" data-alt="close up headshot of a professional woman with glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC-hWK4xWfAVH-xtAm1AA-TfvxTAz0mhgMiK2EuIqjgxxLWfAGlbhCoVk--3ShU2BiseLsncexQxdHoEJc6PsTwB-eCyETs7qPFZU4bBHM6KpNxiIbR64d4aXcDYcG7MtfFFakUxB0Bov_hMXuNlGmk1GxcvVnLinN69GtJrUZngpdkOPuqFpJZOhiTzTV11CIWot0DB0Pfhe-gX6-6pwfSdTije8mn92L31uYL1EDqrCMBIdf0-Zbqj2_JeUbWcEC6pyjK-XzJlhv"/>
                                A. Smith
                            </td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:bg-primary/5 p-1.5 rounded-DEFAULT transition-colors">
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</td>
</tr>
{/*  Row: On Track (Green)  */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="px-6 py-4 font-mono font-medium text-primary">CGN-8501</td>
<td className="px-6 py-4">
<div className="font-semibold text-on-surface">Global Retailers</div>
<div className="text-xs text-secondary mt-0.5">Enterprise Tier</div>
</td>
<td className="px-6 py-4 text-secondary">Service Interruption</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT bg-[#e6f4ea] text-[#006d3a] text-xs font-bold uppercase tracking-wider">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    On Track (4h left)
                                </span>
</td>
<td className="px-6 py-4 text-secondary flex items-center gap-2 italic text-xs">
<span className="material-symbols-outlined text-[16px]">pending</span>
                                Unassigned
                            </td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:bg-primary/5 p-1.5 rounded-DEFAULT transition-colors">
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</td>
</tr>
{/*  Row: On Track (Green)  */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="px-6 py-4 font-mono font-medium text-primary">CGN-8502</td>
<td className="px-6 py-4">
<div className="font-semibold text-on-surface">Nexus Health</div>
<div className="text-xs text-secondary mt-0.5">Premium Tier</div>
</td>
<td className="px-6 py-4 text-secondary">Account Access</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-DEFAULT bg-[#e6f4ea] text-[#006d3a] text-xs font-bold uppercase tracking-wider">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    On Track (12h left)
                                </span>
</td>
<td className="px-6 py-4 text-on-surface flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-[10px] font-bold">ML</div>
                                M. Lee
                            </td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:bg-primary/5 p-1.5 rounded-DEFAULT transition-colors">
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-4 border-t border-surface-container-high/50 bg-surface/30 flex justify-between items-center text-xs text-secondary font-label">
<span>Showing 1-4 of 124 active cases</span>
<div className="flex gap-1">
<button className="px-2 py-1 hover:bg-surface-container-low rounded-DEFAULT disabled:opacity-50" disabled="">Prev</button>
<button className="px-2 py-1 bg-primary text-white rounded-DEFAULT">1</button>
<button className="px-2 py-1 hover:bg-surface-container-low rounded-DEFAULT">2</button>
<button className="px-2 py-1 hover:bg-surface-container-low rounded-DEFAULT">3</button>
<button className="px-2 py-1 hover:bg-surface-container-low rounded-DEFAULT">Next</button>
</div>
</div>
</section>
</main>

    </div>
  );
}
