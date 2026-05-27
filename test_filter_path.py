import re

with open('public/logo-inacap.svg', 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Find the d attribute of path5019
d_match = re.search(r'(id="path5019"[^>]*d=")([^"]+)(")', svg_content)
if not d_match:
    d_match = re.search(r'(d=")([^"]+)("[^>]*id="path5019")', svg_content)

if d_match:
    prefix = d_match.group(1)
    d_data = d_match.group(2)
    suffix = d_match.group(3)
    
    # Split the path data
    tokens = re.split(r'(?=[Mm])', d_data.strip())
    sub_paths = [t.strip() for t in tokens if t.strip()]
    
    # Keep only the last 8 paths (which we suspect are "inacap")
    filtered_sub_paths = sub_paths[-8:]
    
    new_d_data = " ".join(filtered_sub_paths)
    
    new_svg_content = svg_content[:d_match.start(2)] + new_d_data + svg_content[d_match.end(2):]
    
    with open('public/logo-inacap-fixed.svg', 'w', encoding='utf-8') as f:
        f.write(new_svg_content)
    print("Created public/logo-inacap-fixed.svg")
else:
    print("Could not find path5019")
