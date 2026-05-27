import xml.etree.ElementTree as ET

tree = ET.parse('public/logo-inacap.svg')
root = tree.getroot()

def inspect_group(gid):
    g = root.find(f'.//{{http://www.w3.org/2000/svg}}g[@id="{gid}"]')
    if g is not None:
        print(f"Group {gid} has {len(g)} children:")
        paths = g.findall('.//{http://www.w3.org/2000/svg}path')
        print(f"  Total nested paths: {len(paths)}")
        for child in g:
            subpaths = child.findall('.//{http://www.w3.org/2000/svg}path')
            if len(subpaths) > 0:
                print(f"    Child {child.get('id')} has {len(subpaths)} paths")
                for p in subpaths[:1]:
                    print(f"      p id: {p.get('id')}, d starts with: {p.get('d')[:50]}...")

inspect_group('g5944')
inspect_group('g5895')
inspect_group('g6008')
