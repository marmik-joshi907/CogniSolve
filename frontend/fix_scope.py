import os
import re

app_dir = r"c:\Users\Asus\Desktop\Cognisolve\frontend\src\app"

pages = [
    "action-center/page.js",
    "complaint-log/page.js",
    "operations/page.js",
    "qa/page.js"
]

def fix_file(filepath):
    fullpath = os.path.join(app_dir, filepath)
    if not os.path.exists(fullpath):
        return
    with open(fullpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the exact lines we want to move
    bad_lines = "\n  const [showHelp, setShowHelp] = useState(false);\n  const [showAccount, setShowAccount] = useState(false);"

    if bad_lines in content:
        # Remove them from wherever they are incorrectly placed
        content = content.replace(bad_lines, "")
        
        # Inject them into the main component
        # Find exactly: export default function Something() {
        # and insert right after
        match = re.search(r'export default function \w+\([^)]*\)\s*\{', content)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + bad_lines + content[insert_pos:]
        
        with open(fullpath, 'w', encoding='utf-8') as f:
            f.write(content)

for p in pages:
    fix_file(p)

print("State variables shifted.")
