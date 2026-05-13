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
    { id: 'NFC001', name: 'Impresora 3D Creality K1', category: 'Maquinaria', status: 'active', location: 'Zona A' },
    { id: 'NFC002', name: 'Cortadora Láser CO2', category: 'Maquinaria', status: 'maintenance', location: 'Zona B' },
    { id: 'NFC003', name: 'Osciloscopio Digital', category: 'Electrónica', status: 'active', location: 'Laboratorio 1' },
    { id: 'NFC004', name: 'Kit Herramientas Mecánicas', category: 'Herramientas', status: 'active', location: 'Taller' },
    { id: 'NFC005', name: 'Router CNC', category: 'Maquinaria', status: 'lost', location: 'Zona B' },
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
  if (!state.user) {
    topNavbar.style.display = 'none';
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

  // Login with Test Account Check
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const role = document.getElementById('login-role-select').value;
    
    // Test Credentials
    const TEST_USER = "admin@inacap.cl";
    const TEST_PASS = "fablab2024";

    if (email === TEST_USER && pass === TEST_PASS) {
      state.user = {
        name: "Admin FabLab",
        email: email,
        role: role
      };
      
      localStorage.setItem('fablab_user', JSON.stringify(state.user));
      checkSession();
    } else {
      alert("Credenciales incorrectas. Pruebe con admin@inacap.cl / fablab2024");
    }
  });

  // Search
  searchInput.addEventListener('input', (e) => renderInventory(e.target.value));

  // Modal
  btnAddAsset?.addEventListener('click', () => openModal('Agregar Activo'));
  btnCancelModal.addEventListener('click', closeModal);
  btnSaveModal.addEventListener('click', saveAsset);

  // NFC Scanner
  btnStartScan.addEventListener('click', startNFCScan);

  // Logout (both buttons)
  const logoutAction = () => {
    state.user = null;
    localStorage.removeItem('fablab_user');
    checkSession();
    if (sidebar.classList.contains('active')) toggleMenu();
  };
  
  document.getElementById('btn-logout').addEventListener('click', logoutAction);
  document.getElementById('btn-logout-sidebar').addEventListener('click', logoutAction);

  // Accessibility Toggles
  document.getElementById('toggle-contrast').addEventListener('change', (e) => {
    state.accessibility.highContrast = e.target.checked;
    document.body.classList.toggle('high-contrast', e.target.checked);
  });

  document.getElementById('toggle-text-size').addEventListener('change', (e) => {
    state.accessibility.largeText = e.target.checked;
    document.body.classList.toggle('large-text', e.target.checked);
  });

  // Reports
  document.getElementById('export-inventory-btn').addEventListener('click', () => exportToExcel(state.assets, 'Inventario_Completo'));
  document.getElementById('export-maintenance-btn').addEventListener('click', () => {
    const maintenance = state.assets.filter(a => a.status === 'maintenance');
    exportToExcel(maintenance, 'Reporte_Mantenimiento');
  });
  document.getElementById('export-scans-btn').addEventListener('click', () => exportToExcel(state.recentScans, 'Historial_Escaneos'));
}

function updateUserUI() {
  document.getElementById('username-display').textContent = state.user.name;
  document.getElementById('user-initials').textContent = state.user.name.substring(0, 2).toUpperCase();
  
  document.body.className = ''; 
  document.body.classList.add(`role-${state.user.role}`);
  if (state.accessibility.highContrast) document.body.classList.add('high-contrast');
  if (state.accessibility.largeText) document.body.classList.add('large-text');
}

function switchView(viewId) {
  state.currentView = viewId;
  views.forEach(v => v.classList.add('hidden'));
  document.getElementById(`view-${viewId}`).classList.remove('hidden');

  if (viewId === 'dashboard') { updateStats(); renderRecentScans(); }
  if (viewId === 'inventory') renderInventory();
}

// Reuse existing rendering, modal, and export logic from previous version...
function renderInventory(filter = '') {
  const filtered = state.assets.filter(a => 
    a.name.toLowerCase().includes(filter.toLowerCase()) || 
    a.id.toLowerCase().includes(filter.toLowerCase()) ||
    a.category.toLowerCase().includes(filter.toLowerCase())
  );

  inventoryList.innerHTML = filtered.map(asset => `
    <tr>
      <td><code>${asset.id}</code></td>
      <td><strong>${asset.name}</strong></td>
      <td>${asset.category}</td>
      <td><span class="status-badge status-${asset.status}">${formatStatus(asset.status)}</span></td>
      <td>${asset.location}</td>
      <td class="admin-only">
        <button class="btn btn-ghost btn-sm" onclick="editAsset('${asset.id}')">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    </tr>
  `).join('');
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
  if (asset) {
    editingId = asset.id;
    document.getElementById('asset-nfc').value = asset.id;
    document.getElementById('asset-name').value = asset.name;
    document.getElementById('asset-category').value = asset.category;
    document.getElementById('asset-status').value = asset.status;
  } else {
    editingId = null;
    document.getElementById('asset-nfc').value = '';
    document.getElementById('asset-name').value = '';
  }
}

function closeModal() { modal.classList.remove('active'); }

function saveAsset() {
  const newAsset = {
    id: document.getElementById('asset-nfc').value,
    name: document.getElementById('asset-name').value,
    category: document.getElementById('asset-category').value,
    status: document.getElementById('asset-status').value,
    location: 'Sede Inacap'
  };
  if (editingId) state.assets = state.assets.map(a => a.id === editingId ? newAsset : a);
  else state.assets.push(newAsset);
  renderInventory(); updateStats(); closeModal();
}

function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString()}.xlsx`);
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
