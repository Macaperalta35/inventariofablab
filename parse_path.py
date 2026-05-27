import re

with open('public/logo-inacap.svg', 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Find the d attribute of path5019
d_match = re.search(r'id="path5019"[^>]*d="([^"]+)"', svg_content)
if not d_match:
    d_match = re.search(r'd="([^"]+)"[^>]*id="path5019"', svg_content)

if d_match:
    d_data = d_match.group(1)
    print(f"Path data length: {len(d_data)}")
    
    # Split the path data into sub-paths by "M" or "m"
    # We want to keep the "M" or "m" with the split parts
    sub_paths = []
    current_sub = ""
    # We split by 'M' or 'm' but keep the delimiter
    tokens = re.split(r'(?=[Mm])', d_data.strip())
    for token in tokens:
        if token.strip():
            sub_paths.append(token.strip())
            
    print(f"Total sub-paths: {len(sub_paths)}")
    
    # Let's inspect some of them
    for i, sp in enumerate(sub_paths):
        print(f"Sub-path {i}: length: {len(sp)}, starts with: {sp[:80]}...")
else:
    print("Could not find path5019's d attribute!")
