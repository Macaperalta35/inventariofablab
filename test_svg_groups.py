import xml.etree.ElementTree as ET
import copy

# Register namespaces to preserve them
namespaces = {
    '': 'http://www.w3.org/2000/svg',
    'dc': 'http://purl.org/dc/elements/1.1/',
    'cc': 'http://creativecommons.org/ns#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'svg': 'http://www.w3.org/2000/svg',
    'sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
    'inkscape': 'http://www.inkscape.org/namespaces/inkscape'
}
for prefix, uri in namespaces.items():
    ET.register_namespace(prefix, uri)

def generate_logo(keep_id):
    tree = ET.parse('public/logo-inacap.svg')
    root = tree.getroot()
    
    # Find g7330
    g7330 = root.find('.//{http://www.w3.org/2000/svg}g[@id="g7330"]')
    if g7330 is not None:
        # Keep only the specified keep_id group inside g7330
        to_remove = []
        for child in g7330:
            cid = child.get('id')
            if cid != keep_id:
                to_remove.append(child)
        for child in to_remove:
            g7330.remove(child)
            
    tree.write(f'public/{keep_id}.svg')

generate_logo('g5944')
generate_logo('g5895')
generate_logo('g6008')

# Let's also output a test HTML
html = """<!DOCTYPE html>
<html>
<head>
<title>SVG Groups Test</title>
</head>
<body>
<h1>SVG Groups Test</h1>
<div style="margin-bottom:20px;">
  <h2>Only g5944</h2>
  <img src="g5944.svg" style="border:1px solid red; height:200px;" />
</div>
<div style="margin-bottom:20px;">
  <h2>Only g5895</h2>
  <img src="g5895.svg" style="border:1px solid red; height:200px;" />
</div>
<div style="margin-bottom:20px;">
  <h2>Only g6008</h2>
  <img src="g6008.svg" style="border:1px solid red; height:200px;" />
</div>
</body>
</html>
"""
with open('public/test_logos.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Generated tests!")
