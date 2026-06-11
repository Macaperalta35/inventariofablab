-- ============================================================
-- SCHEMA: Inventario FabLab INACAP
-- Ejecutar una sola vez en el SQL Editor de Supabase
-- ============================================================

-- Tabla de activos / herramientas
CREATE TABLE IF NOT EXISTS assets (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  category    TEXT NOT NULL,
  owner       TEXT DEFAULT 'Laboratorio',
  status      TEXT DEFAULT 'active',
  total       INTEGER DEFAULT 1,
  available   INTEGER DEFAULT 1,
  borrowed    INTEGER DEFAULT 0,
  image       TEXT DEFAULT '',
  location    TEXT DEFAULT 'FabLab'
);

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role     TEXT DEFAULT 'operator',
  active   BOOLEAN DEFAULT TRUE
);

-- Tabla de historial de préstamos y devoluciones
CREATE TABLE IF NOT EXISTS loans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id     TEXT REFERENCES assets(id) ON DELETE SET NULL,
  asset_name   TEXT,
  user_name    TEXT,
  borrower_rut TEXT,
  action       TEXT,   -- 'loan' o 'return'
  qty          INTEGER,
  condition    TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans  ENABLE ROW LEVEL SECURITY;

-- Política: la app maneja su propia autenticación — acceso anónimo abierto
CREATE POLICY "anon_all_assets" ON assets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_users"  ON users  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_loans"  ON loans  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- DATOS INICIALES: Usuario administrador
-- ============================================================
INSERT INTO users (id, name, email, password, role, active)
VALUES (1, 'Admin FabLab', 'admin@inacap.cl', 'fablab2024', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- DATOS INICIALES: Activos del inventario
-- ============================================================
INSERT INTO assets (id, name, description, category, owner, status, total, available, borrowed, image, location) VALUES
('HER-001', 'Cinta metrica', 'Stanley 8m', 'Herramientas', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('HER-002', 'Kit Soldadura', 'Multimetro, Cautin, estaño, no contiene pasta para soldar', 'Herramientas', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('HER-003', 'Kit de pinzas de precisión', 'Pinzas de diferentes puntas', 'Herramientas', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('HER-004', 'Alicate Electricista', '8"', 'Herramientas', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('HER-005', 'Alicate Cortante', '6"', 'Herramientas', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('HER-006', 'Alicate Punta Larga', '6"', 'Herramientas', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('HER-007', 'Pistola de Corchetes', '"Total" con stock de corchetes', 'Herramientas', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('HER-008', 'Juego de Atornilladores "BAHCO"', '4 punta plana y 1 punta cruz', 'Herramientas', 'Laboratorio', 'active', 5, 5, 0, '', 'FabLab'),
('HER-009', 'Llave ajustable', 'STANLEY 0 a 152mm', 'Herramientas', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('HER-010', 'Multi escuadra', 'Metalica', 'Herramientas', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('HER-011', 'Kit para armar PC', 'Contiene muchas herramientas', 'Herramientas', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('HER-012', 'Kits compas', 'compas simple', 'Herramientas', 'Laboratorio', 'active', 3, 3, 0, '', 'FabLab'),
('HER-013', 'Cartoneros', 'Cartonero de seguridad', 'Herramientas', 'Laboratorio', 'active', 3, 3, 0, '', 'FabLab'),
('HER-014', 'Micro USB mini', 'Usb a USB mini', 'Herramientas', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('HER-015', 'USB C', 'Carga rapida', 'Herramientas', 'Laboratorio', 'active', 8, 8, 0, '', 'FabLab'),
('HER-016', 'Meta Quest 2', 'Gafas VR', 'Herramientas', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('HER-017', 'Parlante redondo', 'Reuniones', 'Herramientas', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('INS-001', 'Insumos 1', 'Baterias, soldadura, encendedor, Grapas, pegamento B', 'Insumos', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('INS-002', 'Cloroformo', '1 Litro TOXICO', 'Químicos', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('INS-003', 'Acetona pura', '1 Litro Toxico', 'Químicos', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('INS-004', 'Alcohol Isopropilico', '1 litro Toxico', 'Químicos', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('INS-005', 'Filamento 3D', 'Blanco', 'Insumos', 'Laboratorio', 'active', 7, 7, 0, '', 'FabLab'),
('INS-006', 'Filamento 3D', 'Azul', 'Insumos', 'Laboratorio', 'active', 6, 6, 0, '', 'FabLab'),
('INS-007', 'Filamento 3D', 'Negro', 'Insumos', 'Laboratorio', 'active', 6, 6, 0, '', 'FabLab'),
('INS-008', 'Filamento 3D', 'Verde', 'Insumos', 'Laboratorio', 'active', 5, 5, 0, '', 'FabLab'),
('INS-009', 'Filamento 3D', 'Rojo', 'Insumos', 'Laboratorio', 'active', 7, 7, 0, '', 'FabLab'),
('INS-010', 'Guantes Activex', 'Cuero', 'Insumos', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('INS-011', 'Lentes de S', 'Antiparras', 'Insumos', 'Laboratorio', 'active', 18, 18, 0, '', 'FabLab'),
('INS-012', 'Algodón', 'Hidrofilo', 'Insumos', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('INS-013', 'Cajas Mascarillas', 'KN95 (10 unidades por cajas)', 'Insumos', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('INS-014', 'Cajas Joysticks', '1 unidad por caja', 'Insumos', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('INS-015', 'Bolsa de botones azules', '2 pines 6x6x7mm', 'Insumos', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('INS-016', 'BolsasBotones negros', '2 pines 6x6x7mm', 'Insumos', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('INS-017', 'Switchs Arcade', 'Unidades', 'Insumos', 'Laboratorio', 'active', 380, 380, 0, '', 'FabLab'),
('INS-018', 'Bolsas Kits Arcade', 'Mixtos (Botones y switchs)', 'Insumos', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('INS-019', 'Enchufe USB', '', 'Insumos', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-001', 'Maleta de sensores', 'Diversos sensores sueltos', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-002', 'Controlador de motores', 'L298N', 'Electrónica', 'Laboratorio', 'active', 8, 8, 0, '', 'FabLab'),
('ELEC-003', 'Sensores de proximidad', 'HC-SR04', 'Electrónica', 'Laboratorio', 'active', 8, 7, 1, '', 'FabLab'),
('ELEC-004', 'Potenciometros', 'PTS 104', 'Electrónica', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('ELEC-005', 'Kits de leds', 'Multicolor', 'Electrónica', 'Laboratorio', 'active', 200, 200, 0, '', 'FabLab'),
('ELEC-006', 'Servomotor', 'SG90 9G', 'Electrónica', 'Laboratorio', 'active', 18, 18, 0, '', 'FabLab'),
('ELEC-007', 'ESP32', '850-ESP32WC', 'Electrónica', 'Laboratorio', 'active', 12, 12, 0, '', 'FabLab'),
('ELEC-008', 'Kit Diodos', 'In 4007', 'Electrónica', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('ELEC-009', 'Kit Capacitores rojos', 'Variables', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-010', 'Kit Transistores', 'Variables', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-011', 'Juego de capacitores Grandes', 'Variables', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-012', 'Resistencias', 'Variables', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-013', 'Kit de robot', 'Completos', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-014', 'Kit de robot', 'Incompletos', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-015', 'Fuentes de Poder PC', 'GP PERFORMANCE BLACK EDITION', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-016', 'Monitores', 'Pantalla, Master G 27', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-017', 'Tarjeta Grafica', 'Asus RTX 3050', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-018', 'Procesadores', 'Ryzen 5 5000', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-019', 'Placa madre', 'A520M A PRO', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-020', 'Gabinete Ordenador', 'Cuerpo del PC', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-021', 'Memoria Ram', '8G', 'Electrónica', 'Laboratorio', 'active', 4, 4, 0, '', 'FabLab'),
('ELEC-022', 'Monitor basico', 'Samsung', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-023', 'Tarjeta Arduino Uno', 'Uno', 'Electrónica', 'Laboratorio', 'active', 15, 15, 0, '', 'FabLab'),
('ELEC-024', 'Tarjeta de Arduino', 'Nano', 'Electrónica', 'Laboratorio', 'active', 6, 6, 0, '', 'FabLab'),
('ELEC-025', 'Protoboard', 'Pequeños', 'Electrónica', 'Laboratorio', 'active', 11, 11, 0, '', 'FabLab'),
('ELEC-026', 'Cables Dupont', 'Machos / Machos x40', 'Electrónica', 'Laboratorio', 'active', 5, 5, 0, '', 'FabLab'),
('ELEC-027', 'Kit Resistencias pequeño', 'Bolsa de 100', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-028', 'Acelerometro', 'HW-860 GY-291', 'Electrónica', 'Laboratorio', 'active', 6, 6, 0, '', 'FabLab'),
('ELEC-029', 'Fuente de voltaje', 'hasta 9V', 'Electrónica', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('ELEC-030', 'Modulo sensor Luminoso', 'pwr led modulo', 'Electrónica', 'Laboratorio', 'active', 3, 3, 0, '', 'FabLab'),
('ELEC-031', 'Modulo sensor de movimiento infrarojo pasivo', 'HC-SR501', 'Electrónica', 'Laboratorio', 'active', 7, 7, 0, '', 'FabLab'),
('ELEC-032', 'Modulo Sensor de Humedad', 'en chino', 'Electrónica', 'Laboratorio', 'active', 3, 3, 0, '', 'FabLab'),
('ELEC-033', 'Modulo amplificador de Audio', 'Kit Mini Power Amplifier LM386', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-034', 'Transistores', 'IRF 540', 'Electrónica', 'Laboratorio', 'active', 10, 10, 0, '', 'FabLab'),
('ELEC-035', 'Sensores de nivel', 'Modulo 180416', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-036', 'Motores', '3V', 'Electrónica', 'Laboratorio', 'active', 20, 20, 0, '', 'FabLab'),
('ELEC-037', 'Arduino', 'Mega', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-038', 'ESP32', 'Plus', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-039', 'Porta Baterias', '1.5 V', 'Electrónica', 'Laboratorio', 'active', 4, 4, 0, '', 'FabLab'),
('ELEC-040', 'Kit de micro electronica', 'Botones, diodos, capacitores y cables', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab'),
('ELEC-041', 'Cables Dupont', 'Macho / Hembra x 40', 'Electrónica', 'Laboratorio', 'active', 2, 2, 0, '', 'FabLab'),
('ELEC-042', 'Cable de cobre', 'trenzado', 'Electrónica', 'Laboratorio', 'active', 1, 1, 0, '', 'FabLab')
ON CONFLICT (id) DO NOTHING;
