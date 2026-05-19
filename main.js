import * as XLSX from 'xlsx';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/inventariofablab/sw.js')
      .then(reg => console.log('SW Registered', reg))
      .catch(err => console.log('SW Error', err));
  });
}

// State management
let state = {
  user: null, 
  assets: [
    { id: 'HER-001', name: 'Cinta metrica', description: 'Stanley 8m', category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-002', name: 'Kit Soldadura', description: 'Multimetro, Cautin, estaño, no contiene pasta para soldar', category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-003', name: 'Kit de pinzas de precisión', description: 'Pinzas de diferentes puntas', category: 'Herramientas', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-004', name: 'Alicate Electricista', description: '8"', category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-005', name: 'Alicate Cortante', description: '6"', category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-006', name: 'Alicate Punta Larga', description: '6"', category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-007', name: 'Pistola de Corchetes', description: '"Total"  con stock de corchetes', category: 'Herramientas', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-008', name: 'Juego de Atornilladores "BAHCO"', description: '4 punta plana y 1 punta cruz', category: 'Herramientas', total: 5, available: 5, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-009', name: 'Llave ajustable', description: 'STANLEY 0 a 152mm', category: 'Herramientas', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-010', name: 'Multi escuadra', description: 'Metalica', category: 'Herramientas', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-011', name: 'Kit para armar PC', description: 'Contiene muchas herramientas', category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-012', name: 'Kits compas', description: 'compas simple', category: 'Herramientas', total: 3, available: 3, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-013', name: 'Cartoneros', description: 'Cartonero de seguridad', category: 'Herramientas', total: 3, available: 3, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-014', name: 'Micro USB mini', description: 'Usb a USB mini', category: 'Herramientas', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-015', name: 'USB C', description: 'Carga rapida', category: 'Herramientas', total: 8, available: 8, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-016', name: 'Meta Quest 2', description: 'Gafas VR', category: 'Herramientas', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'HER-017', name: 'Parlante redondo', description: 'Reuniones', category: 'Herramientas', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-001', name: 'Insumos 1', description: 'Baterias, soldadura, encendedor, Grapas, pegamento B', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-002', name: 'Cloroformo', description: '1 Litro TOXICO', category: 'Químicos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-003', name: 'Acetona pura', description: '1 Litro Toxico', category: 'Químicos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-004', name: 'Alcohol Isopropilico', description: '1 litro Toxico', category: 'Químicos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-005', name: 'Filamento 3D', description: 'Blanco', category: 'Insumos', total: 7, available: 7, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-006', name: 'Filamento 3D', description: 'Azul', category: 'Insumos', total: 6, available: 6, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-007', name: 'Filamento 3D', description: 'Negro', category: 'Insumos', total: 6, available: 6, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-008', name: 'Filamento 3D', description: 'Verde', category: 'Insumos', total: 5, available: 5, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-009', name: 'Filamento 3D', description: 'Rojo', category: 'Insumos', total: 7, available: 7, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-010', name: 'Guantes Activex', description: 'Cuero', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-011', name: 'Lentes de S', description: 'Antiparras', category: 'Insumos', total: 18, available: 18, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-012', name: 'Algodón', description: 'Hidrofilo', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-013', name: 'Cajas Mascarillas', description: 'KN95 (10 unidades por cajas)', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-014', name: 'Cajas Joysticks', description: '1 unidad por caja', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-015', name: 'Bolsa de botones azules', description: '2 pines 6x6x7mm', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-016', name: 'BolsasBotones negros', description: '2 pines 6x6x7mm', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-017', name: 'Switchs Arcade', description: 'Unidades', category: 'Insumos', total: 380, available: 380, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-018', name: 'Bolsas Kits Arcade', description: 'Mixtos(Botones y switchs)', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'INS-019', name: 'Enchufe USB', description: '', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-001', name: 'Maleta de sensores', description: 'Vidersos sensores sueltos', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-002', name: 'Controlador de motores', description: 'L298N', category: 'Insumos', total: 8, available: 8, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-003', name: 'Sensores de proximidad', description: 'HC-SR04', category: 'Insumos', total: 8, available: 8, borrowed: 1, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-004', name: 'Potenciometros', description: 'PTS 104', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-005', name: 'Kits de leds', description: 'Multicolor', category: 'Insumos', total: 200, available: 200, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-006', name: 'Servomotor', description: 'SG90 9G', category: 'Insumos', total: 18, available: 18, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-007', name: 'ESP32', description: '850-ESP32WC', category: 'Insumos', total: 12, available: 12, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-008', name: 'Kit Diodos', description: 'In 4007', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-009', name: 'Kit Capacitores rojos', description: 'Variables', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-010', name: 'Kit Transistores', description: 'Variables', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-011', name: 'Juego de capacitores Grandes', description: 'Variables', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-012', name: 'Resistencias', description: 'Variables', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-013', name: 'Kit de robot', description: 'Completos', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-014', name: 'Kit de robot', description: 'Incompletos', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-015', name: 'Fuentes de Poder PC', description: 'GP PERFORMANCE BLACK EDITION', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-016', name: 'Monitores', description: 'Pantalla, Master G 27´', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-017', name: 'Tarjeta Grafica', description: 'Asus RTX 3050', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-018', name: 'Procesadores', description: 'Ryzen 5 5000', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-019', name: 'Placa madre', description: 'A520M A PRO', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-020', name: 'Gabinete Ordenador', description: 'Cuerpo del PC', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-021', name: 'Memoria Ram', description: '8G', category: 'Insumos', total: 4, available: 4, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-022', name: 'Monitor basico', description: 'Samsumg', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-023', name: 'Tarjeta Arduino Uno', description: 'Uno', category: 'Insumos', total: 15, available: 15, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-024', name: 'Tarfeta de Arduino', description: 'Nano', category: 'Insumos', total: 6, available: 6, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-025', name: 'Protoboard', description: 'Pequeños', category: 'Insumos', total: 11, available: 11, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-026', name: 'Cables Dupont', description: 'Machos / Machos x40', category: 'Insumos', total: 5, available: 5, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-027', name: 'Kit Resistencias pequeño', description: 'Bolsa de 100', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-028', name: 'Acelerometro', description: 'HW-860 GY-291', category: 'Insumos', total: 6, available: 6, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-029', name: 'Fuente de voltaje', description: 'hasta 9V', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-030', name: 'Modulo sensor Luminoso', description: 'pwr led modulo', category: 'Insumos', total: 3, available: 3, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-031', name: 'Modulo sensor de movimiento infrarojo pasivo', description: 'HC-SR501', category: 'Insumos', total: 7, available: 7, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-032', name: 'Modulo Sensor de Humedad', description: 'en chino', category: 'Insumos', total: 3, available: 3, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-033', name: 'Modulo amplificador de Audio', description: 'Kit Mini Power Amplifier LM386 Audio Amplifier', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-034', name: 'Transistores', description: 'IRF 540', category: 'Insumos', total: 10, available: 10, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-035', name: 'Sensores de nivel', description: 'Modulo 180416', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-036', name: 'Motorres', description: '3V', category: 'Insumos', total: 20, available: 20, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-037', name: 'Arduino', description: 'Mega', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-038', name: 'ESP32', description: 'Plus', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-039', name: 'Porta Baterias', description: '1.5 V', category: 'Insumos', total: 4, available: 4, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-040', name: 'Kit de micro electronica', description: 'Botones, diodos, capacitoresy cables', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-041', name: 'Cables Dupont', description: 'Macho / Hembra x 40', category: 'Insumos', total: 2, available: 2, borrowed: 0, status: 'active', location: 'FabLab', image: '' },
    { id: 'ELEC-042', name: 'Cable de cobre', description: 'trenzado', category: 'Insumos', total: 1, available: 1, borrowed: 0, status: 'active', location: 'FabLab', image: '' }
  ],
  recentScans: [
    { asset: 'Impresora 3D Creality K1', user: 'Juan Pérez', time: 'Hace 5 min', status: 'active' },
    { asset: 'Osciloscopio Digital', user: 'Ana Soto', time: 'Hace 1 hora', status: 'active' },
    { asset: 'Cortadora Láser CO2', user: 'Pedro Rozas', time: 'Hace 3 horas', status: 'maintenance' },
  ],
  currentView: 'login',
  accessibility: {
    highContrast: false,
    largeText: false
  }
};

// DOM Elements
const views = document.querySelectorAll('.view');
const topNavbar = document.getElementById('top-navbar');
const sidebar = document.getElementById('sidebar');
const btnOpenMenu = document.getElementById('open-menu');
const btnCloseMenu = document.getElementById('close-menu');

const navButtons = {
  dashboard: document.getElementById('nav-dashboard'),
  inventory: document.getElementById('nav-inventory'),
  scan: document.getElementById('nav-scan'),
  reports: document.getElementById('nav-reports'),
  settings: document.getElementById('nav-settings')
};

const inventoryList = document.getElementById('inventory-list');
const recentScansList = document.querySelector('#recent-scans tbody');
const searchInput = document.getElementById('inventory-search');
const modal = document.getElementById('modal-asset');
const btnAddAsset = document.getElementById('btn-add-asset');
const btnCancelModal = document.getElementById('btn-modal-cancel');
const btnSaveModal = document.getElementById('btn-modal-save');
const btnStartScan = document.getElementById('btn-start-scan');
const scanStatus = document.getElementById('scan-status');

// Login Form
const loginForm = document.getElementById('login-form');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  createOverlay();
  setupEventListeners();
  checkSession();
});

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebar-overlay';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', toggleMenu);
}

function checkSession() {
  const savedUser = localStorage.getItem('fablab_user');
  if (savedUser && !state.user) {
    state.user = JSON.parse(savedUser);
  }

  if (!state.user) {
    topNavbar.style.display = 'none';
    document.body.className = ''; 
    switchView('login');
  } else {
    topNavbar.style.display = 'flex';
    updateUserUI();
    switchView('dashboard');
  }
}

function toggleMenu() {
  sidebar.classList.toggle('active');
  document.getElementById('sidebar-overlay').classList.toggle('active');
}

function setupEventListeners() {
  // Sidebar Toggles
  btnOpenMenu.addEventListener('click', toggleMenu);
  btnCloseMenu.addEventListener('click', toggleMenu);

  // Navigation (from sidebar)
  Object.keys(navButtons).forEach(key => {
    navButtons[key]?.addEventListener('click', () => {
      switchView(key);
      toggleMenu();
    });
  });

  // Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const role = document.getElementById('login-role-select').value;
    
    const TEST_USER = "admin@inacap.cl";
    const TEST_PASS = "fablab2024";

    if (email === TEST_USER && pass === TEST_PASS) {
      state.user = { name: "Admin FabLab", email: email, role: role };
      localStorage.setItem('fablab_user', JSON.stringify(state.user));
      checkSession();
    } else {
      alert("Credenciales incorrectas. Pruebe con admin@inacap.cl / fablab2024");
    }
  });

  // Search & Filter
  searchInput.addEventListener('input', () => renderInventory());
  document.getElementById('inventory-filter-category').addEventListener('change', () => renderInventory());

  // Modal
  btnAddAsset?.addEventListener('click', () => openModal('Agregar Activo'));
  btnCancelModal.addEventListener('click', closeModal);
  btnSaveModal.addEventListener('click', saveAsset);

  // NFC Scanner
  btnStartScan.addEventListener('click', startNFCScan);

  // Logout
  const logoutAction = () => {
    state.user = null;
    localStorage.removeItem('fablab_user');
    checkSession();
    if (sidebar.classList.contains('active')) toggleMenu();
  };
  document.getElementById('btn-logout-sidebar').addEventListener('click', logoutAction);

  // Accessibility Toggles (Main Menu)
  document.getElementById('toggle-contrast').addEventListener('change', (e) => {
    state.accessibility.highContrast = e.target.checked;
    syncAccessibility();
  });
  document.getElementById('toggle-text-size').addEventListener('change', (e) => {
    state.accessibility.largeText = e.target.checked;
    syncAccessibility();
  });

  // Accessibility Toggles (Login Screen)
  document.getElementById('login-toggle-contrast')?.addEventListener('change', (e) => {
    state.accessibility.highContrast = e.target.checked;
    syncAccessibility();
  });
  document.getElementById('login-toggle-text-size')?.addEventListener('change', (e) => {
    state.accessibility.largeText = e.target.checked;
    syncAccessibility();
  });

  // Reports Excel
  document.getElementById('export-inventory-excel')?.addEventListener('click', () => exportToExcel(state.assets, 'Inventario_Total'));
  document.getElementById('export-maint-excel')?.addEventListener('click', () => {
    const maintenance = state.assets.filter(a => a.status === 'maintenance');
    exportToExcel(maintenance, 'Reporte_Mantenimiento');
  });
  document.getElementById('export-scans-excel')?.addEventListener('click', () => exportToExcel(state.recentScans, 'Historial_Escaneos'));

  // Reports PDF
  document.getElementById('export-inventory-pdf')?.addEventListener('click', () => exportToPDF(state.assets, 'Reporte de Inventario Total'));
  document.getElementById('export-maint-pdf')?.addEventListener('click', () => {
    const maintenance = state.assets.filter(a => a.status === 'maintenance');
    exportToPDF(maintenance, 'Reporte de Activos en Mantenimiento');
  });
  document.getElementById('export-scans-pdf')?.addEventListener('click', () => exportToPDF(state.recentScans, 'Reporte de Historial de Escaneos'));
}

function syncAccessibility() {
  document.body.classList.toggle('high-contrast', state.accessibility.highContrast);
  document.body.classList.toggle('large-text', state.accessibility.largeText);
  const contrastToggles = [document.getElementById('toggle-contrast'), document.getElementById('login-toggle-contrast')];
  const textToggles = [document.getElementById('toggle-text-size'), document.getElementById('login-toggle-text-size')];
  contrastToggles.forEach(t => { if(t) t.checked = state.accessibility.highContrast; });
  textToggles.forEach(t => { if(t) t.checked = state.accessibility.largeText; });
}

function updateUserUI() {
  document.getElementById('username-display').textContent = state.user.name;
  document.getElementById('user-initials').textContent = state.user.name.substring(0, 2).toUpperCase();
  document.body.className = ''; 
  document.body.classList.add(`role-${state.user.role}`);
  syncAccessibility();
}

function switchView(viewId) {
  state.currentView = viewId;
  views.forEach(v => v.classList.add('hidden'));
  document.getElementById(`view-${viewId}`).classList.remove('hidden');
  if (viewId === 'dashboard') { updateStats(); renderRecentScans(); }
  if (viewId === 'inventory') renderInventory();
}

function renderInventory() {
  const searchTerm = searchInput.value.toLowerCase();
  const categoryFilter = document.getElementById('inventory-filter-category').value;

  const filtered = state.assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm) || a.id.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const grouped = filtered.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  let html = '';
  for (const [category, items] of Object.entries(grouped)) {
    html += `<tr class="category-header"><td colspan="8" style="background: var(--surface); font-weight: bold; padding: 1rem;">Sección: ${category}</td></tr>`;
    html += items.map(asset => `
      <tr>
        <td><code>${asset.id}</code></td>
        <td>
          <div class="item-name-cell">
            <strong>${asset.name}</strong>
            <div class="item-tooltip">
              <img src="${asset.image || 'https://via.placeholder.com/200x150?text=Sin+Imagen'}" alt="${asset.name}">
              <span class="tooltip-title">${asset.name}</span>
            </div>
          </div>
        </td>
        <td>${asset.description || ''}</td>
        <td>${asset.category}</td>
        <td>${asset.available} / ${asset.total}</td>
        <td><span class="status-badge status-${asset.status}">${formatStatus(asset.status)}</span></td>
        <td>${asset.location}</td>
        <td class="admin-only" style="display:flex;gap:5px;">
          <button class="btn btn-ghost btn-sm" onclick="editAsset('${asset.id}')" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="deleteAsset('${asset.id}')" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  inventoryList.innerHTML = html;
}

function renderRecentScans() {
  recentScansList.innerHTML = state.recentScans.map(scan => `
    <tr>
      <td>${scan.asset}</td>
      <td>${scan.user}</td>
      <td>${scan.time}</td>
      <td><span class="status-badge status-${scan.status}">${formatStatus(scan.status)}</span></td>
    </tr>
  `).join('');
}

function updateStats() {
  document.getElementById('stat-total').textContent = state.assets.length;
  document.getElementById('stat-maintenance').textContent = state.assets.filter(a => a.status === 'maintenance').length;
  document.getElementById('stat-lost').textContent = state.assets.filter(a => a.status === 'lost').length;
}

function formatStatus(status) {
  const map = { active: 'Activo', maintenance: 'Mantenimiento', lost: 'Baja' };
  return map[status] || status;
}

let editingId = null;
function openModal(title, asset = null) {
  document.getElementById('modal-title').textContent = title;
  modal.classList.add('active');
  document.getElementById('image-preview').innerHTML = '';
  document.getElementById('asset-image-file').value = '';
  if (asset) {
    editingId = asset.id;
    document.getElementById('asset-nfc').value = asset.id;
    document.getElementById('asset-name').value = asset.name;
    document.getElementById('asset-desc').value = asset.description || '';
    document.getElementById('asset-category').value = asset.category;
    document.getElementById('asset-status').value = asset.status;
    document.getElementById('asset-total').value = asset.total || 0;
    document.getElementById('asset-avail').value = asset.available || 0;
    document.getElementById('asset-borrowed').value = asset.borrowed || 0;
    document.getElementById('asset-image').value = asset.image || '';
    if(asset.image) {
      document.getElementById('image-preview').innerHTML = `<img src="${asset.image}" style="max-height: 100px; border-radius: 4px;" />`;
    }
  } else {
    editingId = null;
    document.getElementById('asset-nfc').value = '';
    document.getElementById('asset-name').value = '';
    document.getElementById('asset-desc').value = '';
    document.getElementById('asset-total').value = '1';
    document.getElementById('asset-avail').value = '1';
    document.getElementById('asset-borrowed').value = '0';
    document.getElementById('asset-image').value = '';
  }
}
function closeModal() { modal.classList.remove('active'); }

function saveAsset() {
  const newAsset = {
    id: document.getElementById('asset-nfc').value,
    name: document.getElementById('asset-name').value,
    description: document.getElementById('asset-desc').value,
    category: document.getElementById('asset-category').value,
    status: document.getElementById('asset-status').value,
    total: parseInt(document.getElementById('asset-total').value) || 0,
    available: parseInt(document.getElementById('asset-avail').value) || 0,
    borrowed: parseInt(document.getElementById('asset-borrowed').value) || 0,
    image: document.getElementById('asset-image').value,
    location: 'Sede Inacap'
  };
  if (editingId) state.assets = state.assets.map(a => a.id === editingId ? newAsset : a);
  else state.assets.push(newAsset);
  renderInventory(); updateStats(); closeModal();
}

// Handle file input for images
document.getElementById('asset-image-file').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if(file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const b64 = evt.target.result;
      document.getElementById('asset-image').value = b64;
      document.getElementById('image-preview').innerHTML = `<img src="${b64}" style="max-height: 100px; border-radius: 4px;" />`;
    };
    reader.readAsDataURL(file);
  }
});

// Export Logic
function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString()}.xlsx`);
}

function exportToPDF(data, title) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(237, 28, 36); // INACAP Red
  doc.text('INACAP FAB LAB', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 32);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 40);
  
  // Table
  const headers = Object.keys(data[0]);
  const body = data.map(item => Object.values(item));
  
  doc.autoTable({
    startY: 50,
    head: [headers],
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [0, 56, 101] } // INACAP Blue
  });
  
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

window.editAsset = (id) => {
  const asset = state.assets.find(a => a.id === id);
  openModal('Editar Activo', asset);
};

async function startNFCScan() {
  if (!('NDEFReader' in window)) {
    scanStatus.innerHTML = `<div>Web NFC no soportada.<br><button class="btn btn-ghost mt-2" id="mock-scan">Simular Lectura</button></div>`;
    setTimeout(() => document.getElementById('mock-scan')?.addEventListener('click', simulateScan), 100);
    return;
  }
  try {
    const ndef = new NDEFReader(); await ndef.scan();
    scanStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';
    ndef.addEventListener("reading", ({ serialNumber }) => handleScanResult(serialNumber));
  } catch (error) { scanStatus.innerHTML = `Error: ${error.message}`; }
}

function simulateScan() {
  const randomAsset = state.assets[Math.floor(Math.random() * state.assets.length)];
  handleScanResult(randomAsset.id);
}

function handleScanResult(serialNumber) {
  const asset = state.assets.find(a => a.id === serialNumber);
  if (asset) {
    scanStatus.innerHTML = `<div class="fade-in"><h3>¡Identificado!</h3><p><strong>${asset.name}</strong></p><button class="btn btn-primary" onclick="viewAssetDetails('${asset.id}')">Ver Detalles</button></div>`;
    state.recentScans.unshift({ asset: asset.name, user: state.user.name, time: 'Recién', status: asset.status });
  } else scanStatus.innerHTML = `<div><h3>Tag Desconocido</h3><p>ID: ${serialNumber}</p></div>`;
}

window.viewAssetDetails = (id) => { switchView('inventory'); editAsset(id); };

window.deleteAsset = (id) => {
  if(confirm('¿Está seguro de que desea eliminar este activo?')) {
    state.assets = state.assets.filter(a => a.id !== id);
    renderInventory();
    updateStats();
  }
};
