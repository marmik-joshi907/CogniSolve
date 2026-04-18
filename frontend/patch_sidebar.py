import os
import re

files = [
    ('src/app/action-center/page.js', 'Customer Support Executive', 'Executive View'),
    ('src/app/qa/page.js', 'QA Team Member', 'Quality Assurance'),
    ('src/app/operations/page.js', 'Operations Manager', 'Operations')
]

ROLES = {
    'Executive View': 'Customer Support Executive',
    'Quality Assurance': 'QA Team Member',
    'Operations': 'Operations Manager',
}

def patch_file(filepath, current_role, current_page_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if '"use client"' not in content:
        content = '"use client";\n' + content
        
    handler = """  const handleNav = (e, pageName) => {
    e.preventDefault();
    const roleMapping = {
      'Executive View': 'Customer Support Executive',
      'Quality Assurance': 'QA Team Member',
      'Operations': 'Operations Manager'
    };
    const requiredRole = roleMapping[pageName] || 'authorized personnel';
    alert(`Access Restricted: Please login as ${requiredRole} to access this portal.`);
  };
"""
    # Insert handler after `export default function ComponentName() {`
    content = re.sub(r'(export default function [^()]+\(\) {\n)', r'\1' + handler, content)

    # Now replace the <a> tags
    # <a className="... " href="#">
    #     <span ...>icon</span>
    #     Page Name
    # </a>
    
    def a_replacer(match):
        a_start = match.group(1)
        a_content = match.group(2)
        end_tag = match.group(3)
        
        # Extract page name
        # Usually format is: \n<span ...>icon</span>\n                Page Name\n            
        name_match = re.search(r'</span>\s+([A-Za-z ]+)\s+', a_content)
        if name_match:
            page_name = name_match.group(1).strip()
            if page_name != current_page_name:
                # Add onClick
                a_start = a_start.replace('href="#"', f'href="#" onClick={{(e) => handleNav(e, "{page_name}")}}')
            else:
                # If it's the current page, don't alert, just prevent default or leave href="#"
                a_start = a_start.replace('href="#"', 'href="#" onClick={(e) => e.preventDefault()}')
        
        return a_start + a_content + end_tag
        
    content = re.sub(r'(<a [^>]*href="#"[^>]*>)(.*?)(</a>)', a_replacer, content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {filepath}")

for f, r, p in files:
    patch_file(f, r, p)
