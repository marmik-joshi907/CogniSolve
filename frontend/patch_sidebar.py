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
        
    # Replace handleNav calls with actual links
    content = re.sub(r'href="#"\s+onClick=\{\(e\) => handleNav\(e, [\'"]Executive View[\'"]\)\}', 'href="/action-center"', content)
    content = re.sub(r'href="#"\s+onClick=\{\(e\) => handleNav\(e, [\'"]Quality Assurance[\'"]\)\}', 'href="/qa"', content)
    content = re.sub(r'href="#"\s+onClick=\{\(e\) => handleNav\(e, [\'"]Operations[\'"]\)\}', 'href="/operations"', content)
    content = re.sub(r'href="#"\s+onClick=\{\(e\) => handleNav\(e, [\'"]Analytics[\'"]\)\}', 'href="/operations"', content)
    content = re.sub(r'href="#"\s+onClick=\{\(e\) => handleNav\(e, [\'"]Complaint Log[\'"]\)\}', 'href="/complaint-log"', content)
    
    # Help Center and Account
    content = re.sub(r'href="#"\s+onClick=\{\(e\) => handleNav\(e, [\'"]Help Center[\'"]\)\}', 'href="#" onClick={(e) => { e.preventDefault(); alert("Redirecting to CogniSolve Help Center...\\n\\nFor immediate assistance, call 1-800-COGNISOLVE."); }}', content)
    
    content = re.sub(r'href="#"\s+onClick=\{\(e\) => handleNav\(e, [\'"]Account[\'"]\)\}', 'href="#" onClick={(e) => { e.preventDefault(); alert("Account Settings\\n\\nUser: Jane Doe\\nRole: Admin / Operations Manager\\nStatus: Active"); }}', content)
    
    # QA page special cases:
    content = re.sub(r'onClick=\{\(e\) => handleNav\(e, [\'"]Executive View[\'"]\)\}', 'onClick={(e) => { e.preventDefault(); window.location.href="/action-center"; }}', content)

    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in pages:
    patch_file(p)

print("Sidebar patched globally.")
