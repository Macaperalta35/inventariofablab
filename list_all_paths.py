import xml.etree.ElementTree as ET

tree = ET.parse('public/logo-inacap.svg')
root = tree.getroot()

paths = root.findall('.//{http://www.w3.org/2000/svg}path')
print(f"Total paths in SVG: {len(paths)}")
for p in paths:
    # Print the ID and parents
    parent_map = {c: p for p in root.iter() for c in p}
    parent = parent_map.get(p)
    parent_id = parent.get('id') if parent is not None else 'None'
    grandparent = parent_map.get(parent) if parent is not None else None
    gp_id = grandparent.get('id') if grandparent is not None else 'None'
    print(f"Path id: {p.get('id')}, parent: {parent_id}, grandparent: {gp_id}, d starts: {p.get('d', '')[:40]}")
