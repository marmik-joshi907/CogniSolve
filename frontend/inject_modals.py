import os
import re

app_dir = r"c:\Users\Asus\Desktop\Cognisolve\frontend\src\app"

pages = [
    "action-center/page.js",
    "complaint-log/page.js",
    "operations/page.js",
    "qa/page.js"
]

help_modal = """
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
"""

account_modal = """
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
                JD
              </div>
              <h3 className="text-xl font-bold font-headline text-white tracking-tight">Jane Doe</h3>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Admin / Operations Manager</p>
            </div>
            
            <div className="p-2 flex flex-col">
              <button className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface transition-colors">
                <span className="material-symbols-outlined text-secondary text-[20px]">manage_accounts</span>
                Manage Settings
              </button>
              <button className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface border-b border-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-secondary text-[20px]">security</span>
                Security & Privacy
              </button>
              <button className="flex items-center gap-3 px-4 py-3 mt-1 hover:bg-error/10 rounded-xl text-left text-sm font-bold text-error transition-colors">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Sign Out Securely
              </button>
            </div>
          </div>
        </div>
      )}
"""

def patch_file(filepath):
    fullpath = os.path.join(app_dir, filepath)
    if not os.path.exists(fullpath):
        return
        
    with open(fullpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject state if not present
    if "const [showHelp" not in content:
        # Find first state definition
        state_match = re.search(r'const \[[^\]]+\] = useState\([^)]*\);', content)
        if state_match:
            insert_pos = state_match.end()
            content = content[:insert_pos] + "\n  const [showHelp, setShowHelp] = useState(false);\n  const [showAccount, setShowAccount] = useState(false);" + content[insert_pos:]

    # 2. Swap the onClick handlers for Help Center
    content = re.sub(
        r'onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*alert\(`Redirecting to CogniSolve Help Center.*?\);?\s*\}\}', 
        'onClick={(e) => { e.preventDefault(); setShowHelp(true); }}', 
        content,
        flags=re.DOTALL
    )

    # 3. Swap the onClick handlers for Account
    content = re.sub(
        r'onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*alert\(`Account Settings.*?\);?\s*\}\}', 
        'onClick={(e) => { e.preventDefault(); setShowAccount(true); }}', 
        content,
        flags=re.DOTALL
    )
    
    # 4. Inject Modals before closing main div container or return closing
    if "{/* Help Modal */}" not in content:
        # Simplest is to find the last </div> before the final parenthesis/brace of the component.
        # So replacing '    </div>\n  );\n}' with the modals + that string.
        # But some files have `</main>...</div>` or `</style>...</div>`.
        content = re.sub(r'(\n\s*</main>.*?\n\s*</div>\n\s*\);\n\s*\})', '\n' + help_modal + account_modal + r'\1', content, flags=re.DOTALL)
        
        # If the above didn't match (e.g. operations page sometimes has main closed differently, or qa is different):
        if "{/* Help Modal */}" not in content:
            # Fallback block injection
            content = re.sub(r'(\n\s*)(</div>\n\s*\);\n\s*\})', r'\1' + help_modal + account_modal + r'\2', content, flags=re.DOTALL)


    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in pages:
    patch_file(p)

print("Modals injected.")
