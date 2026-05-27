import re

raw_data = """HER-001	Cinta metrica	Stanley 8m	Herramientas	2	2	0	2
HER-002	Kit Soldadura	Multimetro, Cautin, estaño, no contiene pasta para soldar	Herramientas	2	2	0	2
HER-003	Kit de pinzas de precisión	Pinzas de diferentes puntas	Herramientas	1	1	0	1
HER-004	Alicate Electricista	8"	Herramientas	2	2	0	2
HER-005	Alicate Cortante	6"	Herramientas	2	2	0	2
HER-006	Alicate Punta Larga	6"	Herramientas	2	2	0	2
HER-007	Pistola de Corchetes	"Total"  con stock de corchetes	Herramientas	1	1	0	1
HER-008	Juego de Atornilladores "BAHCO"	4 punta plana y 1 punta cruz	Herramientas	5	5	0	5
HER-009	Llave ajustable	STANLEY 0 a 152mm	Herramientas	1	1	0	1
HER-010	Multi escuadra	Metalica	Herramientas	1	1	0	1
HER-011	Kit para armar PC	Contiene muchas herramientas	Herramientas	2	2	0	2
HER-012	Kits compas	compas simple	Herramientas	3	3	0	3
HER-013	Cartoneros	Cartonero de seguridad	Herramientas	3	3	0	3
HER-014	Micro USB mini	Usb a USB mini	Herramientas	10	10	0	10
HER-015	USB C	Carga rapida	Herramientas	8	8	0	8
HER-016	Meta Quest 2	Gafas VR 	Herramientas	1	1	0	1
HER-017	Parlante redondo	Reuniones	Herramientas	1	1	0	1
INS-001	Insumos 1	Baterias, soldadura, encendedor, Grapas, pegamento B	Insumos	1	1	0	1
INS-002	Cloroformo	1 Litro TOXICO	Quimico	1	1	0	1
INS-003	Acetona pura	1 Litro Toxico	Quimico	1	1	0	1
INS-004	Alcohol Isopropilico	1 litro Toxico	Quimico	1	1	0	1
INS-005	Filamento 3D 	Blanco	Insumos	7	7	0	7
INS-006	Filamento 3D 	Azul	Insumos	6	6	0	6
INS-007	Filamento 3D 	Negro	Insumos	6	6	0	6
INS-008	Filamento 3D 	Verde	Insumos	5	5	0	5
INS-009	Filamento 3D 	Rojo	Insumos	7	7	0	7
INS-010	Guantes Activex	Cuero	Insumos	10	10	0	10
INS-011	Lentes de S	Antiparras	Insumos	18	18	0	18
INS-012	Algodón 	Hidrofilo	Insumos	1	1	0	1
INS-013	Cajas Mascarillas 	KN95 (10 unidades por cajas)	Insumos	10	10	0	10
INS-014	Cajas Joysticks	1 unidad por caja	Insumos	10	10	0	10
INS-015	Bolsa de botones azules	2 pines 6x6x7mm	Insumos	10	10	0	10
INS-016	BolsasBotones negros	2 pines 6x6x7mm	Insumos	10	10	0	10
INS-017	 Switchs Arcade	Unidades	Insumos	380	380	0	380
INS-018	Bolsas Kits Arcade 	Mixtos(Botones y switchs)	Insumos	1	1	0	1
INS-019	Enchufe USB		Insumos	2	2	0	2
ELEC-001	Maleta de sensores	Vidersos sensores sueltos	Insumo	1	1	0	1
ELEC-002	Controlador de motores	L298N	Insumo	8	8	0	8
ELEC-003	Sensores de proximidad	HC-SR04	Insumo	8	8	1	7
ELEC-004	Potenciometros	PTS 104	Insumo	10	10	0	10
ELEC-005	Kits de leds	Multicolor	Insumo	200	200	0	200
ELEC-006	Servomotor	SG90 9G	Insumo	18	18	0	18
ELEC-007	ESP32	850-ESP32WC	Insumo	12	12	0	12
ELEC-008	Kit Diodos	In 4007	Insumo	10	10	0	10
ELEC-009	Kit Capacitores rojos 	Variables	Insumo	1	1	0	1
ELEC-010	Kit Transistores	Variables	Insumo	1	1	0	1
ELEC-011	Juego de capacitores Grandes	Variables	Insumo	1	1	0	1
ELEC-012	Resistencias	Variables	Insumo	1	1	0	1
ELEC-013	Kit de robot	Completos	Insumo	2	2	0	2
ELEC-014	Kit de robot	Incompletos	Insumo	1	1	0	1
ELEC-015	Fuentes de Poder PC	GP PERFORMANCE BLACK EDITION	Insumo	2	2	0	2
ELEC-016	Monitores	Pantalla, Master G 27´	Insumo	2	2	0	2
ELEC-017	Tarjeta Grafica	Asus RTX 3050	Insumo	2	2	0	2
ELEC-018	Procesadores 	Ryzen 5 5000	Insumo	2	2	0	2
ELEC-019	Placa madre	A520M A PRO	Insumo	2	2	0	2
ELEC-020	Gabinete Ordenador	Cuerpo del PC	Insumo	2	2	0	2
ELEC-021	Memoria Ram	8G	Insumo	4	4	0	4
ELEC-022	Monitor basico	Samsumg	Insumo	1	1	0	1
ELEC-023	Tarjeta Arduino Uno	Uno	Insumos	15	15	0	15
ELEC-024	Tarfeta de Arduino	Nano	Insumos	6	6	0	6
ELEC-025	Protoboard	Pequeños	Insumos	11	11	0	11
ELEC-026	Cables Dupont	Machos / Machos x40	Insumos	5	5	0	5
ELEC-027	Kit Resistencias pequeño 	Bolsa de 100	Insumo	2	2	0	2
ELEC-028	Acelerometro	HW-860 GY-291	Insumo	6	6	0	6
ELEC-029	Fuente de voltaje	hasta 9V	Insumo	10	10	0	10
ELEC-030	Modulo sensor Luminoso	pwr led modulo	Insumo	3	3	0	3
ELEC-031	Modulo sensor de movimiento infrarojo pasivo	HC-SR501	Insumo	7	7	0	7
ELEC-032	Modulo Sensor de Humedad	en chino	Insumo	3	3	0	3
ELEC-033	Modulo amplificador de Audio	 Kit Mini Power Amplifier LM386 Audio Amplifier	Insumo	1	1	0	1
ELEC-034	Transistores 	IRF 540	Insumo	10	10	0	10
ELEC-035	Sensores de nivel	Modulo 180416	Insumo	2	2	0	2
ELEC-036	Motorres	3V	Insumo	20	20	0	20
ELEC-037	Arduino	Mega	Insumo	2	2	0	2
ELEC-038	ESP32	Plus	Insumo	1	1	0	1
ELEC-039	Porta Baterias	1.5 V	Insumo	4	4	0	4
ELEC-040	Kit de micro electronica	Botones, diodos, capacitoresy cables	Insumo	1	1	0	1
ELEC-041	Cables Dupont	Macho / Hembra x 40	Insumo	2	2	0	2
ELEC-042	Cable de cobre 	trenzado	Insumo	1	1	0	1"""

items = []
for line in raw_data.strip().split('\n'):
    parts = line.split('\t')
    if len(parts) < 2 or not parts[1].strip(): continue
    _id = parts[0].strip()
    name = parts[1].strip()
    desc = parts[2].strip() if len(parts) > 2 else ""
    cat = parts[3].strip() if len(parts) > 3 else "Sin Categoría"
    if cat == 'Insumo': cat = 'Insumos'
    if cat == 'Quimico': cat = 'Químicos'
    t = int(parts[4].strip()) if len(parts) > 4 and parts[4].strip().isdigit() else 0
    a = int(parts[5].strip()) if len(parts) > 5 and parts[5].strip().isdigit() else 0
    b = int(parts[6].strip()) if len(parts) > 6 and parts[6].strip().isdigit() else 0
    
    item_str = f"    {{ id: '{_id}', name: '{name.replace(chr(39), chr(92)+chr(39))}', description: '{desc.replace(chr(39), chr(92)+chr(39))}', category: '{cat}', total: {t}, available: {a}, borrowed: {b}, status: 'active', location: 'FabLab', image: '' }}"
    items.append(item_str)

new_assets = "  assets: [\n" + ",\n".join(items) + "\n  ],"

# Read main.js
with open("main.js", "r", encoding="utf-8") as f:
    main_js = f.read()

# Replace assets
main_js = re.sub(r"  assets: \[\s*\],", new_assets, main_js, flags=re.DOTALL)

with open("main.js", "w", encoding="utf-8") as f:
    f.write(main_js)
