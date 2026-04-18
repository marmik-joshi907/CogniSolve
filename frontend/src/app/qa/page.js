"use client";
import { useState, useEffect, useMemo } from "react";

export default function QA() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showAllPending, setShowAllPending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("low");

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
  // QA review queue - any complaint that requires manual review due to low confidence
  const reviewQueue = complaints.filter(c => c.confidence_score < 0.7);
  const categories = stats?.by_category || {};
  const avgConfidence = stats?.avg_confidence || 0;

  // Resolve Trends Analysis for Chart
  const trendData = useMemo(() => {
    const resolved = complaints.filter(c => c.status === "resolved" || c.status === "closed");
    // Group resolved by day over the last 14 days
    let data = Array(14).fill(0);
    const today = new Date();
    resolved.forEach(c => {
      const created = new Date(c.created_at);
      const diffTime = Math.abs(today - created);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 14) {
        data[13 - diffDays] += 1;
      }
    });
    return data;
  }, [complaints]);
  const maxTrend = Math.max(1, ...trendData);

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

  const startEdit = (comp) => {
    setEditingId(comp.id);
    setEditCategory(comp.category);
    setEditPriority(comp.priority);
  };

  const handleAccept = async (id, currentCat, currentPri) => {
    try {
      const isEditing = editingId === id;
      const payload = {
        category: isEditing ? editCategory : currentCat,
        priority: isEditing ? editPriority : currentPri
      };
      
      await fetch(`/api/complaints/${id}/qa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingId(null);
      fetchComplaints();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id) => {
    try {
      await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' })
      });
      fetchComplaints();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = () => {
    window.location.href = "/api/export/csv";
  };

  return (
    <div className="flex min-h-screen w-full bg-surface">
      
      {/* SideNavBar */}
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
          <a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 hover:scale-[0.98] font-['Inter'] text-sm tracking-wide uppercase font-bold" href="/" onClick={(e) => handleNav(e, "Executive View")}>
            <span className="material-symbols-outlined">dashboard</span>
            Executive View
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-md bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm font-bold font-['Inter'] text-sm tracking-wide uppercase" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>fact_check</span>
            Quality Assurance
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 hover:scale-[0.98] font-['Inter'] text-sm tracking-wide uppercase font-bold" href="/operations">
            <span className="material-symbols-outlined">settings_suggest</span>
            Operations
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 hover:scale-[0.98] font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Analytics")}>
            <span className="material-symbols-outlined">insights</span>
            Analytics
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 hover:scale-[0.98] font-['Inter'] text-sm tracking-wide uppercase font-bold" href="/complaint-log">
            <span className="material-symbols-outlined">history_edu</span>
            Complaint Log
          </a>
        </nav>
        
        <div className="mt-auto flex flex-col gap-1">
          <a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 hover:scale-[0.98] font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Help Center")}>
            <span className="material-symbols-outlined">help_outline</span>
            Help Center
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 scale-98 hover:scale-[0.98] font-['Inter'] text-sm tracking-wide uppercase font-bold" href="#" onClick={(e) => handleNav(e, "Account")}>
            <span className="material-symbols-outlined">person</span>
            Account
          </a>
          <a className="flex items-center gap-3 px-4 py-2 mt-2 text-error hover:bg-error/10 hover:text-error rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col ml-0 md:ml-64 relative bg-surface h-full overflow-y-auto">
        <header className="fixed top-0 w-full md:w-[calc(100%-16rem)] z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,30,0.06)]">
          <div className="flex justify-between items-center px-8 h-16 w-full relative">
            <div className="md:hidden text-indigo-900 dark:text-indigo-50 font-black text-xl font-['Manrope']">Cognisolve</div>
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

        <div className="p-8 pt-24 max-w-7xl mx-auto w-full flex flex-col gap-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary-container/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Total Complaints</p>
              <div className="flex items-end gap-3">
                <h2 className="font-headline text-display-sm font-bold text-on-surface">{total}</h2>
                <span className="text-sm text-on-secondary-container mb-1 flex items-center bg-secondary-container/50 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span> Active
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary-container/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Classification Accuracy</p>
              <div className="flex items-end gap-3">
                <h2 className="font-headline text-display-sm font-bold text-on-surface">{avgConfidence > 0 ? (avgConfidence * 100).toFixed(1) : '—'}%</h2>
                <span className="text-sm text-on-surface-variant mb-1 flex items-center">
                  Target: 95%
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 mt-4 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${avgConfidence * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-error/5 to-error-container/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Flagged for Review</p>
              <div className="flex items-end gap-3">
                <h2 className="font-headline text-display-sm font-bold text-error">{reviewQueue.length}</h2>
                <span className="text-sm text-error mb-1 flex items-center bg-error-container/50 px-1.5 py-0.5 rounded">
                  Requires action
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary-container/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <p className="text-label-sm uppercase tracking-[0.05em] text-secondary font-bold mb-2">Avg Resolution Time</p>
              <div className="flex items-end gap-3">
                <h2 className="font-headline text-display-sm font-bold text-on-surface">1.8d</h2>
                <span className="text-sm text-[#006d3a] mb-1 flex items-center bg-[#006d3a]/10 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span> 0.4d
                </span>
              </div>
            </div>
          </div>

          {/* Complex Layout: Charts & Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 flex flex-col gap-8">
              
              {/* Dynamic Trend Analysis Chart */}
              <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline text-headline-sm font-bold text-on-surface">Resolved Volume &amp; Trend</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Number of complaints solved over the last 14 days.</p>
                  </div>
                  <button onClick={handleExport} className="text-primary text-sm font-medium hover:bg-surface-container-low px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                    Export <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>
                
                <div className="h-64 w-full bg-surface-container-low/50 rounded-lg border border-outline-variant/15 flex items-end px-4 pt-8 pb-4 relative">
                  <div className="absolute left-4 top-4 text-xs text-on-surface-variant">Solved Requests</div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-on-surface-variant">Last 14 Days</div>
                  
                  <div className="w-full h-full flex items-end justify-between gap-2 px-6">
                    {trendData.map((val, i) => {
                      const heightPercent = maxTrend > 0 ? Math.max(5, (val / maxTrend) * 100) : 5;
                      return (
                        <div key={i} className="w-full bg-primary/20 rounded-t-sm relative group hover:bg-primary/40 transition-colors" style={{ height: `${heightPercent}%` }}>
                          {val > 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-on-surface opacity-0 group-hover:opacity-100">{val}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Semantic Clusters Table */}
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline text-headline-sm font-bold text-on-surface">Semantic Clusters: Recurring Issues</h3>
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
                <div className="flex flex-col gap-4">
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
                  </div>
                  
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
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Queue & Categories */}
            <div className="flex flex-col gap-8">
              
              <div className="bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden border border-outline-variant/15">
                <div className="bg-surface-container-low p-4 border-b border-surface">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                      Review Queue
                    </h3>
                    <span className="bg-error-container text-on-error-container text-xs font-bold px-2 py-0.5 rounded-md">{reviewQueue.length} Pending</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">Low-confidence AI classifications requiring human validation.</p>
                </div>
                
                <div className={`p-4 flex flex-col gap-4 ${showAllPending ? 'max-h-none' : 'max-h-[450px] overflow-y-auto'}`}>
                  {reviewQueue.length === 0 ? (
                    <div className="text-center text-sm text-secondary p-4">No reviews required.</div>
                  ) : (
                    reviewQueue.slice(0, showAllPending ? reviewQueue.length : 5).map(comp => (
                      <div key={comp.id} className="bg-surface p-4 rounded-lg flex flex-col gap-3 relative border border-outline-variant/10">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">CMP-{comp.id}</span>
                          <span className="text-xs font-medium text-tertiary-fixed-dim bg-tertiary-fixed-dim/10 px-2 py-0.5 rounded">Conf: {(comp.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">"{comp.complaint_text}"</p>
                        
                        <div className="flex flex-col gap-2 mt-1">
                          {editingId === comp.id ? (
                            <>
                              <div className="flex flex-row items-center gap-2">
                                <span className="text-xs text-on-surface-variant flex-1">Category:</span>
                                <select 
                                  value={editCategory} 
                                  onChange={e => setEditCategory(e.target.value)}
                                  className="flex-2 p-1 text-xs border rounded w-full"
                                >
                                  <option value="Product">Product</option>
                                  <option value="Packaging">Packaging</option>
                                  <option value="Trade">Trade</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="flex flex-row items-center gap-2">
                                <span className="text-xs text-on-surface-variant flex-1">Priority:</span>
                                <select 
                                  value={editPriority} 
                                  onChange={e => setEditPriority(e.target.value)}
                                  className="flex-2 p-1 text-xs border rounded w-full"
                                >
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                </select>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-on-surface-variant flex justify-between">
                                AI Suggested Category: <strong className="text-on-surface">{comp.category}</strong>
                              </span>
                              <span className="text-xs text-on-surface-variant flex justify-between">
                                Suggested Priority: <strong className="text-on-surface">{comp.priority}</strong>
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2 mt-2 pt-3 border-t border-surface-container-high">
                          <button onClick={() => handleReject(comp.id)} className="flex-1 py-1.5 bg-surface-container-highest text-on-surface text-xs font-medium rounded hover:bg-surface-variant transition-colors border border-on-surface/10">Reject</button>
                          
                          {editingId === comp.id ? (
                            <button onClick={() => handleAccept(comp.id, comp.category, comp.priority)} className="flex-1 py-1.5 bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">save</span> Save
                            </button>
                          ) : (
                            <>
                              <button onClick={() => startEdit(comp)} className="flex-1 py-1.5 bg-surface-container-highest text-on-surface text-xs font-medium rounded hover:bg-surface-variant transition-colors border border-on-surface/10 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                              </button>
                              <button onClick={() => handleAccept(comp.id, comp.category, comp.priority)} className="flex-1 py-1.5 bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check</span> Accept
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {reviewQueue.length > 5 && (
                  <button 
                    onClick={() => setShowAllPending(!showAllPending)} 
                    className="w-full py-3 text-xs text-primary font-bold hover:bg-surface-container-low transition-colors border-t border-surface-container-high uppercase tracking-widest"
                  >
                    {showAllPending ? "Show Less" : "View All Pending"}
                  </button>
                )}
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-xl">
                <h3 className="font-headline text-headline-sm font-bold text-on-surface mb-6">Category Distribution</h3>
                <div className="flex flex-col gap-5">
                  {Object.entries(categories).map(([cat, count], idx) => {
                    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
                    const colors = ["bg-primary", "bg-primary/80", "bg-primary/60", "bg-primary/40", "bg-primary/20"];
                    const color = colors[idx % colors.length];
                    
                    return (
                      <div key={cat} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-on-surface capitalize">{cat}</span>
                          <span className="text-secondary">{percent}%</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(categories).length === 0 && (
                    <div className="text-sm text-secondary">No category data yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="h-8 w-full"></div>
        </div>
      </main>
    </div>
  );
}
