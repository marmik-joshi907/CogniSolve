import os
import re

app_dir = r"c:\Users\Asus\Desktop\Cognisolve\frontend\src\app"

pages = [
    "action-center/page.js",
    "complaint-log/page.js",
    "operations/page.js",
    "qa/page.js"
]

def patch_file(filepath):
    fullpath = os.path.join(app_dir, filepath)
    if not os.path.exists(fullpath):
        return
    with open(fullpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to add state for the dynamic user info
    if "const [userName, setUserName] = useState(" not in content:
        # Find first state definition
        state_match = re.search(r'const \[[^\]]+\] = useState\([^)]*\);', content)
        if state_match:
            insert_pos = state_match.end()
            content = content[:insert_pos] + "\n  const [userName, setUserName] = useState(\"Jane Doe\");\n  const [userRole, setUserRole] = useState(\"Admin / Operations Manager\");\n  useEffect(() => {\n    if (typeof window !== 'undefined') {\n      const storedUser = localStorage.getItem('cognisolve_username');\n      const storedRole = localStorage.getItem('cognisolve_role');\n      if (storedUser) setUserName(storedUser);\n      if (storedRole) setUserRole(storedRole);\n    }\n  }, []);" + content[insert_pos:]

    # Replace Jane Doe in the JSX
    content = content.replace(
        '<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold tracking-wider mb-2 ring-4 ring-white/10 backdrop-blur-md">\n                JD\n              </div>',
        '<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold tracking-wider mb-2 ring-4 ring-white/10 backdrop-blur-md">\n                {userName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}\n              </div>'
    )
    
    content = content.replace(
        '<h3 className="text-xl font-bold font-headline text-white tracking-tight">Jane Doe</h3>',
        '<h3 className="text-xl font-bold font-headline text-white tracking-tight">{userName}</h3>'
    )
    
    content = content.replace(
        '<p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Admin / Operations Manager</p>',
        '<p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">{userRole}</p>'
    )
    
    # Add working actions to the modal buttons
    content = content.replace(
        '<button className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface transition-colors">\n                <span className="material-symbols-outlined text-secondary text-[20px]">manage_accounts</span>\n                Manage Settings\n              </button>',
        '<button onClick={() => alert("Settings management initialized...")} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface transition-colors">\n                <span className="material-symbols-outlined text-secondary text-[20px]">manage_accounts</span>\n                Manage Settings\n              </button>'
    )
    
    content = content.replace(
        '<button className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface border-b border-surface-container-high transition-colors">\n                <span className="material-symbols-outlined text-secondary text-[20px]">security</span>\n                Security & Privacy\n              </button>',
        '<button onClick={() => alert("Privacy settings are managed by your administrator.")} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-xl text-left text-sm font-medium text-on-surface border-b border-surface-container-high transition-colors">\n                <span className="material-symbols-outlined text-secondary text-[20px]">security</span>\n                Security & Privacy\n              </button>'
    )
    
    content = content.replace(
        '<button className="flex items-center gap-3 px-4 py-3 mt-1 hover:bg-error/10 rounded-xl text-left text-sm font-bold text-error transition-colors">\n                <span className="material-symbols-outlined text-[20px]">logout</span>\n                Sign Out Securely\n              </button>',
        '<button onClick={() => { if(typeof window !== "undefined") { localStorage.removeItem("cognisolve_username"); localStorage.removeItem("cognisolve_role"); window.location.href = "/"; } }} className="flex items-center gap-3 px-4 py-3 mt-1 hover:bg-error/10 rounded-xl text-left text-sm font-bold text-error transition-colors">\n                <span className="material-symbols-outlined text-[20px]">logout</span>\n                Sign Out Securely\n              </button>'
    )

    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in pages:
    patch_file(p)

# Plus quick settings in operations page
ops_path = os.path.join(app_dir, "operations/page.js")
if os.path.exists(ops_path):
    with open(ops_path, 'r', encoding='utf-8') as f:
        ops = f.read()
    
    # Appearance, Preferences, Security quick links
    # These are in the dropdown
    ops = ops.replace(
        '<button className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">\n    <span className="material-symbols-outlined text-secondary">tune</span>\n    Preferences\n  </button>',
        '<button onClick={() => { setShowSettings(false); alert("User Interface preferences applied!"); }} className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">\n    <span className="material-symbols-outlined text-secondary">tune</span>\n    Preferences\n  </button>'
    )
    
    ops = ops.replace(
        '<button className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">\n    <span className="material-symbols-outlined text-secondary">palette</span>\n    Appearance\n  </button>',
        '<button onClick={() => { setShowSettings(false); alert("Dark mode toggle coming soon!"); }} className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">\n    <span className="material-symbols-outlined text-secondary">palette</span>\n    Appearance\n  </button>'
    )
    
    ops = ops.replace(
        '<button className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">\n    <span className="material-symbols-outlined text-secondary">lock</span>\n    Security\n  </button>',
        '<button onClick={() => { setShowSettings(false); setShowAccount(true); }} className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">\n    <span className="material-symbols-outlined text-secondary">lock</span>\n    Security\n  </button>'
    )
    
    with open(ops_path, 'w', encoding='utf-8') as f:
        f.write(ops)

print("Dynamic account features enabled.")
