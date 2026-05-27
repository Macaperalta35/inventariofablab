import xml.etree.ElementTree as ET

# Register namespaces to preserve them
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('dc', 'http://purl.org/dc/elements/1.1/')
ET.register_namespace('cc', 'http://creativecommons.org/ns#')
ET.register_namespace('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
ET.register_namespace('svg', 'http://www.w3.org/2000/svg')
ET.register_namespace('sodipodi', 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd')
ET.register_namespace('inkscape', 'http://www.inkscape.org/namespaces/inkscape')

tree = ET.parse('public/logo-inacap.svg')
root = tree.getroot()

# Find layer1
layer1 = root.find('.//{http://www.w3.org/2000/svg}g[@id="layer1"]')
if layer1 is not None:
    g7575 = layer1.find('{http://www.w3.org/2000/svg}g[@id="g7575"]')
    if g7575 is not None:
        print("Found g7575. Children:")
        for child in g7575:
            print(f"Child tag: {child.tag}, id: {child.get('id')}, style: {child.get('style')}")
            # print nested elements if they exist
            for sub in child:
                print(f"  Sub child: {sub.tag}, id: {sub.get('id')}")
