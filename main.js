import * as XLSX from 'xlsx';
import { supabase } from './supabase.js';

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
  assets: [],
  recentScans: [],
  currentView: 'login',
  accessibility: {
    highContrast: false,
    largeText: false
  }
};

// ── Data Layer: Supabase ────────────────────────────────────────

async function loadInitialData() {
  const { data: assets, error: assetsErr } = await supabase
    .from('assets')
    .select('*')
    .order('id');

  if (assetsErr) {
    console.error('Error loading assets:', assetsErr);
  } else if (assets) {
    state.assets = assets;
  }

  const { data: loans, error: loansErr } = await supabase
    .from('loans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!loansErr && loans) {
    state.recentScans = loans.map(l => ({
      asset: l.asset_name,
      user: l.user_name,
      time: new Date(l.created_at).toLocaleString('es-CL'),
      status: l.action === 'return' && l.condition === 'damaged' ? 'maintenance' : 'active'
    }));
  }
}

async function getUsers() {
  const { data, error } = await supabase.from('users').select('*').order('id');
  if (error) {
    console.error('Error loading users:', error);
    return [];
  }
  return data || [];
}

// ── DOM Elements ────────────────────────────────────────────────

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
  users: document.getElementById('nav-users'),
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
const loginForm = document.getElementById('login-form');

// ── Init ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  createOverlay();
  setupEventListeners();
  showLoadingState(true);
  await loadInitialData();
  showLoadingState(false);
  checkSession();
});

function showLoadingState(isLoading) {
  let loader = document.getElementById('db-loader');
  if (isLoading) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'db-loader';
      loader.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:9999;color:#fff;font-size:1.2rem;gap:1rem;';
      loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando a la base de datos...';
      document.body.appendChild(loader);
    }
  } else {
    loader?.remove();
  }
}

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
  btnOpenMenu.addEventListener('click', toggleMenu);
  btnCloseMenu.addEventListener('click', toggleMenu);

  Object.keys(navButtons).forEach(key => {
    navButtons[key]?.addEventListener('click', () => {
      switchView(key);
      toggleMenu();
    });
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('active', true);

    const found = users?.find(u => u.password === pass);
    if (found) {
      state.user = { name: found.name, email: found.email, role: found.role, id: found.id };
      localStorage.setItem('fablab_user', JSON.stringify(state.user));
      checkSession();
    } else {
      alert('Credenciales incorrectas o usuario inactivo.');
    }
  });

  searchInput.addEventListener('input', () => renderInventory());
  document.getElementById('inventory-filter-category').addEventListener('change', () => renderInventory());

  btnAddAsset?.addEventListener('click', () => openModal('Agregar Activo'));
  btnCancelModal.addEventListener('click', closeModal);
  btnSaveModal.addEventListener('click', saveAsset);

  btnStartScan.addEventListener('click', startNFCScan);

  const logoutAction = () => {
    state.user = null;
    localStorage.removeItem('fablab_user');
    checkSession();
    if (sidebar.classList.contains('active')) toggleMenu();
  };
  document.getElementById('btn-logout-sidebar').addEventListener('click', logoutAction);

  document.getElementById('toggle-contrast').addEventListener('change', (e) => {
    state.accessibility.highContrast = e.target.checked;
    syncAccessibility();
  });
  document.getElementById('toggle-text-size').addEventListener('change', (e) => {
    state.accessibility.largeText = e.target.checked;
    syncAccessibility();
  });
  document.getElementById('login-toggle-contrast')?.addEventListener('change', (e) => {
    state.accessibility.highContrast = e.target.checked;
    syncAccessibility();
  });
  document.getElementById('login-toggle-text-size')?.addEventListener('change', (e) => {
    state.accessibility.largeText = e.target.checked;
    syncAccessibility();
  });

  document.getElementById('export-inventory-excel')?.addEventListener('click', () => exportToExcel(state.assets, 'Inventario_Total'));
  document.getElementById('export-maint-excel')?.addEventListener('click', () => {
    exportToExcel(state.assets.filter(a => a.status === 'maintenance'), 'Reporte_Mantenimiento');
  });
  document.getElementById('export-scans-excel')?.addEventListener('click', () => exportToExcel(state.recentScans, 'Historial_Escaneos'));
  document.getElementById('export-inventory-pdf')?.addEventListener('click', () => exportToPDF(state.assets, 'Reporte de Inventario Total'));
  document.getElementById('export-maint-pdf')?.addEventListener('click', () => {
    exportToPDF(state.assets.filter(a => a.status === 'maintenance'), 'Reporte de Activos en Mantenimiento');
  });
  document.getElementById('export-scans-pdf')?.addEventListener('click', () => exportToPDF(state.recentScans, 'Reporte de Historial de Escaneos'));
}

function syncAccessibility() {
  document.body.classList.toggle('high-contrast', state.accessibility.highContrast);
  document.body.classList.toggle('large-text', state.accessibility.largeText);
  [document.getElementById('toggle-contrast'), document.getElementById('login-toggle-contrast')]
    .forEach(t => { if (t) t.checked = state.accessibility.highContrast; });
  [document.getElementById('toggle-text-size'), document.getElementById('login-toggle-text-size')]
    .forEach(t => { if (t) t.checked = state.accessibility.largeText; });
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
  if (viewId === 'users') renderUsers();
}

// ── Inventory Render ────────────────────────────────────────────

function renderInventory() {
  const searchTerm = searchInput.value.toLowerCase();
  const categoryFilter = document.getElementById('inventory-filter-category').value;

  const filtered = state.assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm) || a.id.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
        <td>${asset.owner || 'Laboratorio'}</td>
        <td>${asset.available} / ${asset.total}</td>
        <td><span class="status-badge status-${asset.status}">${formatStatus(asset.status)}</span></td>
        <td>${asset.location}</td>
        <td class="admin-only">
          ${asset.available > 0 ? `
          <button class="btn btn-ghost btn-sm" style="color:var(--primary);" onclick="openLoanModal('${asset.id}')" title="Prestar">
            <i class="fas fa-hand-holding"></i>
          </button>` : ''}
          ${asset.borrowed > 0 ? `
          <button class="btn btn-ghost btn-sm" style="color:var(--success);" onclick="openReturnModal('${asset.id}')" title="Recibir">
            <i class="fas fa-undo"></i>
          </button>` : ''}
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

// ── Asset Modal ─────────────────────────────────────────────────

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
    document.getElementById('asset-owner').value = asset.owner || 'Laboratorio';
    document.getElementById('asset-status').value = asset.status;
    document.getElementById('asset-location').value = asset.location || '';
    document.getElementById('asset-total').value = asset.total || 0;
    document.getElementById('asset-avail').value = asset.available || 0;
    document.getElementById('asset-borrowed').value = asset.borrowed || 0;
    document.getElementById('asset-image').value = asset.image || '';
    if (asset.image) {
      document.getElementById('image-preview').innerHTML = `<img src="${asset.image}" style="max-height: 100px; border-radius: 4px;" />`;
    }
  } else {
    editingId = null;
    document.getElementById('asset-nfc').value = '';
    document.getElementById('asset-name').value = '';
    document.getElementById('asset-desc').value = '';
    document.getElementById('asset-owner').value = 'Laboratorio';
    document.getElementById('asset-total').value = '1';
    document.getElementById('asset-avail').value = '1';
    document.getElementById('asset-borrowed').value = '0';
    document.getElementById('asset-location').value = 'FabLab';
    document.getElementById('asset-image').value = '';
  }
}

function closeModal() { modal.classList.remove('active'); }

async function saveAsset() {
  const newAsset = {
    id: document.getElementById('asset-nfc').value.trim(),
    name: document.getElementById('asset-name').value.trim(),
    description: document.getElementById('asset-desc').value.trim(),
    category: document.getElementById('asset-category').value,
    owner: document.getElementById('asset-owner').value.trim(),
    status: document.getElementById('asset-status').value,
    total: parseInt(document.getElementById('asset-total').value) || 0,
    available: parseInt(document.getElementById('asset-avail').value) || 0,
    borrowed: parseInt(document.getElementById('asset-borrowed').value) || 0,
    image: document.getElementById('asset-image').value,
    location: document.getElementById('asset-location').value.trim() || 'FabLab'
  };

  if (!newAsset.id || !newAsset.name) {
    alert('El ID y el nombre son requeridos.');
    return;
  }

  if (editingId) {
    const { error } = await supabase.from('assets').update(newAsset).eq('id', editingId);
    if (error) { alert('Error al guardar: ' + error.message); return; }
    state.assets = state.assets.map(a => a.id === editingId ? newAsset : a);
  } else {
    const { data, error } = await supabase.from('assets').insert(newAsset).select().single();
    if (error) { alert('Error al crear activo: ' + error.message); return; }
    state.assets.push(data);
  }

  renderInventory();
  updateStats();
  closeModal();
}

document.getElementById('asset-image-file').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const b64 = evt.target.result;
      document.getElementById('asset-image').value = b64;
      document.getElementById('image-preview').innerHTML = `<img src="${b64}" style="max-height: 100px; border-radius: 4px;" />`;
    };
    reader.readAsDataURL(file);
  }
});

window.editAsset = (id) => {
  if (state.user?.role !== 'admin') {
    alert('Acceso denegado: Se requieren permisos de administrador.');
    return;
  }
  const asset = state.assets.find(a => a.id === id);
  openModal('Editar Activo', asset);
};

window.deleteAsset = async (id) => {
  if (state.user?.role !== 'admin') {
    alert('Acceso denegado: Se requieren permisos de administrador.');
    return;
  }
  if (confirm('¿Está seguro de que desea eliminar este activo?')) {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    state.assets = state.assets.filter(a => a.id !== id);
    renderInventory();
    updateStats();
  }
};

// ── Export ──────────────────────────────────────────────────────

function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString()}.xlsx`);
}

function exportToPDF(data, title) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(237, 28, 36);
  doc.text('INACAP FAB LAB', 14, 22);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 32);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 40);
  const headers = Object.keys(data[0] || {});
  const body = data.map(item => Object.values(item));
  doc.autoTable({
    startY: 50,
    head: [headers],
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [0, 56, 101] }
  });
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

// ── NFC Scanner ─────────────────────────────────────────────────

async function startNFCScan() {
  if (!('NDEFReader' in window)) {
    scanStatus.innerHTML = `<div>Web NFC no soportada.<br><button class="btn btn-ghost mt-2" id="mock-scan">Simular Lectura</button></div>`;
    setTimeout(() => document.getElementById('mock-scan')?.addEventListener('click', simulateScan), 100);
    return;
  }
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    scanStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';
    ndef.addEventListener('reading', ({ serialNumber }) => handleScanResult(serialNumber));
  } catch (error) {
    scanStatus.innerHTML = `Error: ${error.message}`;
  }
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
  } else {
    scanStatus.innerHTML = `<div><h3>Tag Desconocido</h3><p>ID: ${serialNumber}</p></div>`;
  }
}

window.viewAssetDetails = (id) => { switchView('inventory'); editAsset(id); };

// ── Users Management ────────────────────────────────────────────

async function renderUsers() {
  const users = await getUsers();
  const tbody = document.getElementById('users-list');
  if (!tbody) return;
  tbody.innerHTML = '';
  users.forEach(u => {
    const roleBadge = u.role === 'admin'
      ? '<span style="background:#ED1C24;color:white;padding:2px 8px;border-radius:20px;font-size:0.75rem;font-weight:700;">Admin</span>'
      : '<span style="background:#003865;color:white;padding:2px 8px;border-radius:20px;font-size:0.75rem;font-weight:700;">Operador</span>';
    const statusBadge = u.active
      ? '<span style="color:#16a34a;font-weight:600;">✔ Activo</span>'
      : '<span style="color:#dc2626;font-weight:600;">✘ Inactivo</span>';
    tbody.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${roleBadge}</td>
        <td>${statusBadge}</td>
        <td class="admin-only" style="display:table-cell;">
          <button class="btn btn-ghost btn-sm" onclick="editUser(${u.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          ${u.id !== 1 ? `<button class="btn btn-ghost btn-sm" onclick="toggleUserActive(${u.id})" title="${u.active ? 'Desactivar' : 'Activar'}" style="color:${u.active ? '#dc2626' : '#16a34a'}">
            <i class="fas fa-${u.active ? 'ban' : 'check-circle'}"></i>
          </button>` : ''}
        </td>
      </tr>`;
  });
}

let editingUserId = null;
const userModal = document.getElementById('modal-user');

function openUserModal(title, user = null) {
  document.getElementById('user-modal-title').textContent = title;
  userModal.classList.add('active');
  editingUserId = user ? user.id : null;
  document.getElementById('user-name').value = user ? user.name : '';
  document.getElementById('user-email').value = user ? user.email : '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-role').value = user ? user.role : 'operator';
  document.getElementById('user-password').placeholder = user ? 'Dejar vacío para no cambiar' : 'Contraseña';
}

function closeUserModal() { userModal.classList.remove('active'); }

async function saveUser() {
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;
  if (!name || !email) { alert('Nombre y correo son requeridos.'); return; }

  if (editingUserId) {
    const update = { name, email, role };
    if (password) update.password = password;
    const { error } = await supabase.from('users').update(update).eq('id', editingUserId);
    if (error) { alert('Error al guardar usuario: ' + error.message); return; }
  } else {
    if (!password) { alert('La contraseña es requerida para nuevos usuarios.'); return; }
    const users = await getUsers();
    if (users.find(u => u.email === email)) { alert('Ya existe un usuario con ese correo.'); return; }
    const newId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const { error } = await supabase.from('users').insert({ id: newId, name, email, password, role, active: true });
    if (error) { alert('Error al crear usuario: ' + error.message); return; }
  }

  renderUsers();
  closeUserModal();
}

window.editUser = async (id) => {
  const users = await getUsers();
  const user = users.find(u => u.id === id);
  if (user) openUserModal('Editar Usuario', user);
};

window.toggleUserActive = async (id) => {
  const users = await getUsers();
  const u = users.find(u => u.id === id);
  if (u) {
    const { error } = await supabase.from('users').update({ active: !u.active }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    renderUsers();
  }
};

document.getElementById('btn-add-user')?.addEventListener('click', () => openUserModal('Nuevo Usuario'));
document.getElementById('btn-user-modal-cancel')?.addEventListener('click', closeUserModal);
document.getElementById('btn-user-modal-save')?.addEventListener('click', saveUser);

// ── Loan & Return Management ────────────────────────────────────

const modalLoan = document.getElementById('modal-loan');
const modalReturn = document.getElementById('modal-return');

window.openLoanModal = (id) => {
  const asset = state.assets.find(a => a.id === id);
  if (!asset) return;
  document.getElementById('loan-asset-id').value = id;
  document.getElementById('loan-qty').max = asset.available;
  document.getElementById('loan-qty').value = 1;
  document.getElementById('loan-borrower-name').value = '';
  document.getElementById('loan-borrower-rut').value = '';
  modalLoan.classList.add('active');
};

window.closeLoanModal = () => { modalLoan?.classList.remove('active'); };

window.saveLoan = async () => {
  const id = document.getElementById('loan-asset-id').value;
  const qty = parseInt(document.getElementById('loan-qty').value);
  const name = document.getElementById('loan-borrower-name').value.trim();
  const rut = document.getElementById('loan-borrower-rut').value.trim();

  if (!name) { alert('El nombre del solicitante es requerido.'); return; }

  const asset = state.assets.find(a => a.id === id);
  if (!asset || asset.available < qty) {
    alert('Cantidad no válida o stock insuficiente.');
    return;
  }

  const newAvailable = asset.available - qty;
  const newBorrowed = asset.borrowed + qty;

  const { error: updateErr } = await supabase
    .from('assets')
    .update({ available: newAvailable, borrowed: newBorrowed })
    .eq('id', id);
  if (updateErr) { alert('Error al prestar activo: ' + updateErr.message); return; }

  await supabase.from('loans').insert({
    asset_id: id,
    asset_name: asset.name,
    user_name: name,
    borrower_rut: rut,
    action: 'loan',
    qty,
    condition: null,
    notes: null
  });

  asset.available = newAvailable;
  asset.borrowed = newBorrowed;
  state.recentScans.unshift({ asset: asset.name, user: name, time: new Date().toLocaleString('es-CL'), status: 'active' });
  renderInventory();
  updateStats();
  closeLoanModal();
};

window.openReturnModal = (id) => {
  const asset = state.assets.find(a => a.id === id);
  if (!asset) return;
  document.getElementById('return-asset-id').value = id;
  document.getElementById('return-qty').max = asset.borrowed;
  document.getElementById('return-qty').value = 1;
  document.getElementById('return-condition').value = 'good';
  document.getElementById('return-notes').value = '';
  modalReturn.classList.add('active');
};

window.closeReturnModal = () => { modalReturn?.classList.remove('active'); };

window.saveReturn = async () => {
  const id = document.getElementById('return-asset-id').value;
  const qty = parseInt(document.getElementById('return-qty').value);
  const condition = document.getElementById('return-condition').value;
  const notes = document.getElementById('return-notes').value.trim();

  const asset = state.assets.find(a => a.id === id);
  if (!asset || asset.borrowed < qty) {
    alert('Cantidad a devolver no válida.');
    return;
  }

  const newBorrowed = asset.borrowed - qty;
  const newAvailable = asset.available + qty;
  const newStatus = (condition === 'damaged' || condition === 'incomplete') ? 'maintenance' : asset.status;

  const { error: updateErr } = await supabase
    .from('assets')
    .update({ available: newAvailable, borrowed: newBorrowed, status: newStatus })
    .eq('id', id);
  if (updateErr) { alert('Error al devolver activo: ' + updateErr.message); return; }

  await supabase.from('loans').insert({
    asset_id: id,
    asset_name: asset.name,
    user_name: state.user.name,
    borrower_rut: null,
    action: 'return',
    qty,
    condition,
    notes
  });

  asset.borrowed = newBorrowed;
  asset.available = newAvailable;
  asset.status = newStatus;

  const scanStatus = condition === 'damaged' ? 'maintenance' : 'active';
  state.recentScans.unshift({ asset: asset.name, user: state.user.name, time: new Date().toLocaleString('es-CL'), status: scanStatus });

  renderInventory();
  updateStats();
  closeReturnModal();
};

document.getElementById('btn-loan-modal-cancel')?.addEventListener('click', closeLoanModal);
document.getElementById('btn-loan-modal-save')?.addEventListener('click', saveLoan);
document.getElementById('btn-return-modal-cancel')?.addEventListener('click', closeReturnModal);
document.getElementById('btn-return-modal-save')?.addEventListener('click', saveReturn);
