import os
import re

app_dir = r"c:\Users\Asus\Desktop\Cognisolve\frontend\src\app"

pages = [
    "action-center/page.js",
    "complaint-log/page.js",
    "operations/page.js",
    "qa/page.js",
    "analytics/page.js"
]

def remove_primary_button(filepath):
    fullpath = os.path.join(app_dir, filepath)
    if not os.path.exists(fullpath):
        return
    with open(fullpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The button takes up roughly 3-4 lines 
    # Starts with `<button ` and has `className="mb-6`
    # and ends with `</button>` shortly after.
    
    # We will use multiline Regex to cleanly wipe out the entire node.
    # regex: <button[^>]*className="mb-6[^>]*>[\s\S]*?</button>\s*
    
    content = re.sub(r'<button[^>]*className="mb-6[^>]*>[\s\S]*?</button>\s*', '', content)
    
    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in pages:
    remove_primary_button(p)

print("Primary buttons completely removed from all sidebars.")
