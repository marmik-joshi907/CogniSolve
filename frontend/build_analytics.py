import os
import re
import shutil

app_dir = r"c:\Users\Asus\Desktop\Cognisolve\frontend\src\app"
pages = ["action-center/page.js", "complaint-log/page.js", "operations/page.js", "qa/page.js"]

# Fix routing links across all 4 files
for filepath in pages:
    fullpath = os.path.join(app_dir, filepath)
    if os.path.exists(fullpath):
        with open(fullpath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Hunt down the Analytics link which right now points to /operations
        # Format usually: <a className="..." href="/operations">\n<span ...>insights</span>\nAnalytics\n</a>
        content = re.sub(r'(<a[^>]+href=")/operations("[^>]*>\s*<span[^>]*>insights</span>\s*Analytics\s*</a>)', r'\1/analytics\2', content)
        
        with open(fullpath, 'w', encoding='utf-8') as f:
            f.write(content)

# Now generate the analytics page by copying the Complaint Log as a base 
# and replacing the core widget with an analytics dashboard.
if not os.path.exists(os.path.join(app_dir, "analytics")):
    os.makedirs(os.path.join(app_dir, "analytics"))

source_path = os.path.join(app_dir, "complaint-log/page.js")
target_path = os.path.join(app_dir, "analytics/page.js")

if os.path.exists(source_path):
    with open(source_path, 'r', encoding='utf-8') as f:
        core = f.read()

    # 1. Update component name
    core = core.replace("export default function ComplaintLog()", "export default function AnalyticsDashboard()")
    core = core.replace("Complaint Log", "Analytics", 1) # Header
    
    # Update the body to show analytics graphs
    # We will strip the entire 'Complaint Table' and replace it with a CSS charts block
    table_start = core.find("          {/* Complaint Table */}")
    table_end = core.find("      {/* Detail Slide-Over Panel */}")
    
    analytics_jsx = """          {/* Analytics Dashboard Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Resolution Trends */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col h-[400px]">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    Volume vs Resolution Trend
                </div>
                <span className="text-secondary text-xs uppercase font-label">Past 7 Days</span>
              </h3>
              <div className="flex-1 flex items-end gap-2 px-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_19%,rgba(0,0,0,0.03)_20%,transparent_21%)] bg-[length:100%_20%] pointer-events-none"></div>
                {[65, 80, 50, 95, 75, 45, 90].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full group">
                    <div className="absolute -top-8 bg-surface-container shadow-md px-2 py-1 rounded text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10">{v} Cases</div>
                    <div className="w-[60%] bg-gradient-to-t from-primary/80 to-primary/40 rounded-t-md transition-all duration-500 ease-in-out group-hover:bg-primary" style={{ height: `${v}%` }}></div>
                    <div className="mt-3 text-xs font-bold text-secondary font-mono">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Compliance Gauge */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col h-[400px]">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d3a]">verified_user</span>
                SLA Compliance Rate
              </h3>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="relative w-48 h-48 flex justify-center items-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-surface-container-highest" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-[#006d3a]" strokeWidth="12" strokeDasharray="251" strokeDashoffset="30" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-headline font-extrabold text-[#006d3a]">88%</span>
                        <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">In-SLA</span>
                    </div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-lg mt-4">
                  <div className="flex flex-col items-center">
                      <span className="text-xs text-secondary font-bold uppercase">Total Cases</span>
                      <span className="text-xl font-bold">{total}</span>
                  </div>
                  <div className="flex flex-col items-center">
                      <span className="text-xs text-secondary font-bold uppercase">Breached</span>
                      <span className="text-xl font-bold text-error">12</span>
                  </div>
              </div>
            </div>

            {/* AI Classification Confidence Heatmap */}
            <div className="bg-surface-container-lowest lg:col-span-2 rounded-xl shadow-sm border border-outline-variant/15 p-6">
               <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">psychology</span>
                AI Classification Confidence
              </h3>
              <div className="space-y-4">
                  <div className="flex items-center gap-4">
                      <div className="w-24 text-sm font-bold text-secondary uppercase">Product</div>
                      <div className="flex-1 bg-surface-container h-4 rounded-full overflow-hidden flex">
                          <div className="bg-[#006d3a] h-full" style={{width: '75%'}}></div>
                          <div className="bg-[#f59e0b] h-full" style={{width: '15%'}}></div>
                          <div className="bg-error h-full" style={{width: '10%'}}></div>
                      </div>
                      <div className="w-12 text-right text-xs font-bold">92% Acc</div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="w-24 text-sm font-bold text-secondary uppercase">Packaging</div>
                      <div className="flex-1 bg-surface-container h-4 rounded-full overflow-hidden flex">
                          <div className="bg-[#006d3a] h-full" style={{width: '60%'}}></div>
                          <div className="bg-[#f59e0b] h-full" style={{width: '30%'}}></div>
                          <div className="bg-error h-full" style={{width: '10%'}}></div>
                      </div>
                      <div className="w-12 text-right text-xs font-bold">85% Acc</div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="w-24 text-sm font-bold text-secondary uppercase">Trade</div>
                      <div className="flex-1 bg-surface-container h-4 rounded-full overflow-hidden flex">
                          <div className="bg-[#006d3a] h-full" style={{width: '90%'}}></div>
                          <div className="bg-[#f59e0b] h-full" style={{width: '5%'}}></div>
                          <div className="bg-error h-full" style={{width: '5%'}}></div>
                      </div>
                      <div className="w-12 text-right text-xs font-bold">95% Acc</div>
                  </div>
                  <div className="flex gap-4 items-center justify-center pt-4 text-xs font-bold uppercase text-secondary">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#006d3a] rounded-sm"></div> High Confidence (>80%)</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#f59e0b] rounded-sm"></div> Medium Conf (60-80%)</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-error rounded-sm"></div> Low Conf (<60%)</span>
                  </div>
              </div>
            </div>

          </div>
    """
    
    if table_start != -1 and table_end != -1:
        core = core[:table_start] + analytics_jsx + core[table_end:]
        
    core = core.replace('href="#"\n            onClick={(e) => { e.preventDefault(); window.location.href="/analytics"; }}', 'href="#"\n            onClick={(e) => e.preventDefault()}')

    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(core)
        
print("Analytics route rebuilt.")
