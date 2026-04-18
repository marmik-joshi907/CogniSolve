import os
import re

app_dir = r"c:\Users\Asus\Desktop\Cognisolve\frontend\src\app"

pages = [
    "action-center/page.js",
    "complaint-log/page.js",
    "operations/page.js",
    "qa/page.js"
]

def fix_auth_scope(filepath):
    fullpath = os.path.join(app_dir, filepath)
    if not os.path.exists(fullpath):
        return
    with open(fullpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The exact block that was mistakenly injected
    bad_auth_block = """
  const [userName, setUserName] = useState("Jane Doe");
  const [userRole, setUserRole] = useState("Admin / Operations Manager");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('cognisolve_username');
      const storedRole = localStorage.getItem('cognisolve_role');
      if (storedUser) setUserName(storedUser);
      if (storedRole) setUserRole(storedRole);
    }
  }, []);"""

    if bad_auth_block in content:
        # Check if it was injected directly under `export default function` before doing anything
        # We can just remove ALL instances and inject it once right under `export default function`
        content = content.replace(bad_auth_block, "")
        
        # Now find the export default function and insert it just after
        match = re.search(r'export default function \w+\([^)]*\)\s*\{', content)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + bad_auth_block + content[insert_pos:]
        
        with open(fullpath, 'w', encoding='utf-8') as f:
            f.write(content)

for p in pages:
    fix_auth_scope(p)

print("Auth scope fixed.")
