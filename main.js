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
  user: { name: 'Admin', role: 'admin' },
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
  currentView: 'dashboard'
};

// DOM Elements
const views = document.querySelectorAll('.view');
const navButtons = {
  dashboard: document.getElementById('nav-dashboard'),
  inventory: document.getElementById('nav-inventory'),
  scan: document.getElementById('nav-scan')
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderInventory();
  renderRecentScans();
  updateStats();
  setupEventListeners();
  switchView('dashboard');
});

function setupEventListeners() {
  // Navigation
  Object.keys(navButtons).forEach(key => {
    navButtons[key].addEventListener('click', () => switchView(key));
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    renderInventory(e.target.value);
  });

  // Modal
  btnAddAsset.addEventListener('click', () => {
    openModal('Agregar Activo');
  });

  btnCancelModal.addEventListener('click', closeModal);

  btnSaveModal.addEventListener('click', saveAsset);

  // NFC Scanner
  btnStartScan.addEventListener('click', startNFCScan);

  // Logout (Mock)
  document.getElementById('btn-logout').addEventListener('click', () => {
    alert('Sesión cerrada (Demostración)');
  });
}

// View Switching
function switchView(viewId) {
  state.currentView = viewId;
  views.forEach(v => v.classList.add('hidden'));
  document.getElementById(`view-${viewId}`).classList.remove('hidden');

  // Update Nav Active State
  Object.values(navButtons).forEach(btn => btn.classList.remove('btn-primary'));
  Object.values(navButtons).forEach(btn => btn.classList.add('btn-ghost'));
  navButtons[viewId].classList.remove('btn-ghost');
  navButtons[viewId].classList.add('btn-primary');

  // Role check: Only admin can see "Add Asset"
  if (viewId === 'inventory') {
    btnAddAsset.style.display = state.user.role === 'admin' ? 'flex' : 'none';
  }
}

// Rendering
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
      <td>
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

// Modal Logic
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

function closeModal() {
  modal.classList.remove('active');
}

function saveAsset() {
  const newAsset = {
    id: document.getElementById('asset-nfc').value,
    name: document.getElementById('asset-name').value,
    category: document.getElementById('asset-category').value,
    status: document.getElementById('asset-status').value,
    location: 'Sede Inacap'
  };

  if (editingId) {
    state.assets = state.assets.map(a => a.id === editingId ? newAsset : a);
  } else {
    state.assets.push(newAsset);
  }

  renderInventory();
  updateStats();
  closeModal();
}

// Global exposure for onclick
window.editAsset = (id) => {
  const asset = state.assets.find(a => a.id === id);
  openModal('Editar Activo', asset);
};

// NFC Scanning Logic
async function startNFCScan() {
  if (!('NDEFReader' in window)) {
    scanStatus.innerHTML = `
      <div style="color: var(--danger);">
        <i class="fas fa-exclamation-triangle"></i> Web NFC no soportada en este navegador.<br>
        <small>Use Chrome en Android para esta funcionalidad.</small>
      </div>
      <button class="btn btn-ghost mt-2" id="mock-scan">Simular Lectura (Demo)</button>
    `;
    
    // Add mock listener for demo purposes
    setTimeout(() => {
      document.getElementById('mock-scan')?.addEventListener('click', simulateScan);
    }, 100);
    return;
  }

  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    scanStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando... Acerque el tag.';
    
    ndef.addEventListener("readingerror", () => {
      scanStatus.innerHTML = '<span style="color: var(--danger);">Error de lectura. Intente de nuevo.</span>';
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
      handleScanResult(serialNumber);
    });

  } catch (error) {
    scanStatus.innerHTML = `<span style="color: var(--danger);">Error: ${error.message}</span>`;
  }
}

function simulateScan() {
  // Simulate finding an asset
  const randomAsset = state.assets[Math.floor(Math.random() * state.assets.length)];
  handleScanResult(randomAsset.id);
}

function handleScanResult(serialNumber) {
  const asset = state.assets.find(a => a.id === serialNumber);
  
  if (asset) {
    scanStatus.innerHTML = `
      <div class="fade-in">
        <h3 style="color: var(--success); margin-bottom: 0.5rem;">¡Activo Identificado!</h3>
        <p><strong>${asset.name}</strong></p>
        <p class="text-dim">${asset.category} | ${asset.location}</p>
        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="viewAssetDetails('${asset.id}')">
          Ver Detalles / Editar
        </button>
      </div>
    `;
    
    // Log recent scan
    state.recentScans.unshift({
      asset: asset.name,
      user: state.user.name,
      time: 'Recién',
      status: asset.status
    });
    renderRecentScans();
  } else {
    scanStatus.innerHTML = `
      <div class="fade-in">
        <h3 style="color: var(--warning); margin-bottom: 0.5rem;">Tag Desconocido</h3>
        <p>ID: <code>${serialNumber}</code></p>
        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="registerNewNFC('${serialNumber}')">
          Registrar como Nuevo
        </button>
      </div>
    `;
  }
}

window.viewAssetDetails = (id) => {
  const asset = state.assets.find(a => a.id === id);
  switchView('inventory');
  editAsset(id);
};

window.registerNewNFC = (id) => {
  switchView('inventory');
  openModal('Registrar Nuevo Activo');
  document.getElementById('asset-nfc').value = id;
};
