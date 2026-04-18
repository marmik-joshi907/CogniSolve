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

def kill_button_forever(filepath):
    fullpath = os.path.join(app_dir, filepath)
    if not os.path.exists(fullpath):
        return
    with open(fullpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The issue earlier was `=>` inside the onClick broke the `[^>]*` regex parsing of HTML tags.
    # We will simply match `<button` up to `New Analysis` and to `</button>`
    content = re.sub(r'<button\s+[^<]*onClick=\{[^}]*\}[^>]*>\s*<span[^>]*>[^<]*</span>\s*New Analysis\s*</button>', '', content)
    
    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in pages:
    kill_button_forever(p)

print("Button officially deleted globally.")
