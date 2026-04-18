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
        
    # Python re.sub replaced literal newlines and ruined JS quotes
    # The string currently looks like:
    # alert("Redirecting to CogniSolve Help Center...
    # 
    # For immediate assistance, call 1-800-COGNISOLVE.");
    
    # We will just replace it correctly.
    # The simplest way is to replace alert("... \n\n ...") with alert(`... \n\n ...`)
    
    bad_help = 'alert("Redirecting to CogniSolve Help Center...\n\nFor immediate assistance, call 1-800-COGNISOLVE.");'
    good_help = 'alert(`Redirecting to CogniSolve Help Center...\\n\\nFor immediate assistance, call 1-800-COGNISOLVE.`);'
    
    content = content.replace(bad_help, good_help)
    
    bad_account = 'alert("Account Settings\n\nUser: Jane Doe\nRole: Admin / Operations Manager\nStatus: Active");'
    good_account = 'alert(`Account Settings\\n\\nUser: Jane Doe\\nRole: Admin / Operations Manager\\nStatus: Active`);'
    
    content = content.replace(bad_account, good_account)

    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in pages:
    patch_file(p)

print("Syntax error fixed.")
