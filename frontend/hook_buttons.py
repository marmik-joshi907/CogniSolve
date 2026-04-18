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

def hook_primary_button(filepath):
    fullpath = os.path.join(app_dir, filepath)
    if not os.path.exists(fullpath):
        return
    with open(fullpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The buttons have slightly different CSS classes but identical conceptual usage:
    # They usually start with `<button className="mb-6`
    
    # We will use Regex to find the button tag and inject an onClick if it doesn't already have one 
    # (or replace the existing onClick we put in analytics/page.js)
    
    # Let's clean out the onClick I just added to analytics/page.js first so regex processing is uniform
    content = content.replace('onClick={() => alert("New custom cross-validation analysis matrix will be generated momentarily...")} ', '')

    def replacement(m):
        button_tag = m.group(0)
        # Check if it already has onClick
        if "onClick={" in button_tag:
            return button_tag
        return button_tag.replace('<button ', '<button onClick={() => alert("Action initialized: Opening creation modal...")} ')
        
    content = re.sub(r'<button className="mb-6\s+[^>]+>', replacement, content)
    
    with open(fullpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in pages:
    hook_primary_button(p)

print("Primary buttons hooked up across all dashboards.")
