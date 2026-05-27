// @vitest-environment node
/**
 * ============================================================
 * QA Test Suite - Sistema de Inventario Fab Lab INACAP
 * ============================================================
 * Estas pruebas validan la lógica de negocio pura del sistema
 * de forma aislada, sin depender del DOM ni del navegador.
 * Cada función refleja exactamente la lógica implementada
 * en main.js, extrayéndola para verificar su correcto funcionamiento.
 * ============================================================
 */
import { describe, it, expect, beforeEach } from 'vitest';

// ── Réplica de la lógica de negocio extraída de main.js ────────────

/**
 * Simula el state de la aplicación
 */
function createState() {
  return {
    user: null,
    recentScans: [],
    assets: [
      { id: 'HER-001', name: 'Cinta metrica', category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active' },
      { id: 'HER-002', name: 'Kit Soldadura',  category: 'Herramientas', total: 2, available: 2, borrowed: 0, status: 'active' },
      { id: 'HER-003', name: 'Alicate', category: 'Herramientas', total: 1, available: 0, borrowed: 1, status: 'active' },
    ]
  };
}

/**
 * Lógica de préstamo (replica saveLoan de main.js)
 */
function performLoan(state, assetId, qty, borrowerName) {
  if (!borrowerName || borrowerName.trim() === '') return { ok: false, error: 'El nombre del solicitante es requerido.' };
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return { ok: false, error: 'Activo no encontrado.' };
  if (asset.available < qty) return { ok: false, error: 'Cantidad no válida o stock insuficiente.' };
  asset.available -= qty;
  asset.borrowed += qty;
  state.recentScans.unshift({ asset: asset.name, user: borrowerName, time: 'Préstamo', status: 'active' });
  return { ok: true };
}

/**
 * Lógica de devolución (replica saveReturn de main.js)
 */
function performReturn(state, assetId, qty, condition) {
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return { ok: false, error: 'Activo no encontrado.' };
  if (asset.borrowed < qty) return { ok: false, error: 'Cantidad a devolver no válida.' };
  asset.borrowed -= qty;
  asset.available += qty;
  if (condition === 'damaged' || condition === 'incomplete') {
    asset.status = 'maintenance';
    state.recentScans.unshift({ asset: asset.name, user: 'staff', time: 'Devolución c/ Daño', status: 'maintenance' });
  } else {
    state.recentScans.unshift({ asset: asset.name, user: 'staff', time: 'Devuelto Ok', status: 'active' });
  }
  return { ok: true };
}

/**
 * Lógica de control de acceso por roles (replica guards en editAsset/deleteAsset)
 */
function checkAdminAccess(state) {
  return state.user?.role === 'admin';
}

// ── Tests ───────────────────────────────────────────────────────────

describe('📦 QA Suite — Flujo de Préstamos', () => {
  let state;
  beforeEach(() => { state = createState(); });

  it('✅ TC-01: Préstamo exitoso reduce "disponible" y aumenta "prestado"', () => {
    const result = performLoan(state, 'HER-001', 1, 'Juan Pérez');
    const asset = state.assets.find(a => a.id === 'HER-001');
    expect(result.ok).toBe(true);
    expect(asset.available).toBe(1);
    expect(asset.borrowed).toBe(1);
  });

  it('✅ TC-02: Prestar cantidad total disponible deja stock en 0', () => {
    const result = performLoan(state, 'HER-001', 2, 'María González');
    const asset = state.assets.find(a => a.id === 'HER-001');
    expect(result.ok).toBe(true);
    expect(asset.available).toBe(0);
    expect(asset.borrowed).toBe(2);
  });

  it('❌ TC-03: Prestar más unidades que el stock disponible debe ser bloqueado', () => {
    const result = performLoan(state, 'HER-001', 10, 'Ana Torres');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/stock insuficiente/i);
    // Stock no debe cambiar
    expect(state.assets.find(a => a.id === 'HER-001').available).toBe(2);
  });

  it('❌ TC-04: Prestar sin nombre de solicitante debe ser bloqueado', () => {
    const result = performLoan(state, 'HER-001', 1, '');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/nombre/i);
  });

  it('✅ TC-05: El préstamo registra la transacción en el historial reciente', () => {
    performLoan(state, 'HER-001', 1, 'Carlos Muñoz');
    expect(state.recentScans[0].user).toBe('Carlos Muñoz');
    expect(state.recentScans[0].time).toBe('Préstamo');
  });
});

describe('🔄 QA Suite — Flujo de Devoluciones y Reportes', () => {
  let state;
  beforeEach(() => {
    state = createState();
    // Pre-state: HER-001 tiene 1 prestado
    performLoan(state, 'HER-001', 1, 'Juan Pérez');
  });

  it('✅ TC-06: Devolución en buen estado restaura el stock correctamente', () => {
    const result = performReturn(state, 'HER-001', 1, 'good');
    const asset = state.assets.find(a => a.id === 'HER-001');
    expect(result.ok).toBe(true);
    expect(asset.available).toBe(2);
    expect(asset.borrowed).toBe(0);
  });

  it('✅ TC-07: Devolución "Dañado" cambia el estado del activo a Mantenimiento', () => {
    performReturn(state, 'HER-001', 1, 'damaged');
    const asset = state.assets.find(a => a.id === 'HER-001');
    expect(asset.status).toBe('maintenance');
  });

  it('✅ TC-08: Devolución "Incompleto" también activa modo Mantenimiento', () => {
    performReturn(state, 'HER-001', 1, 'incomplete');
    const asset = state.assets.find(a => a.id === 'HER-001');
    expect(asset.status).toBe('maintenance');
  });

  it('✅ TC-09: Devolución en buen estado NO cambia el estado del activo', () => {
    performReturn(state, 'HER-001', 1, 'good');
    const asset = state.assets.find(a => a.id === 'HER-001');
    expect(asset.status).toBe('active');
  });

  it('❌ TC-10: Devolver más unidades de las prestadas debe ser bloqueado', () => {
    const result = performReturn(state, 'HER-001', 99, 'good');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no válida/i);
  });

  it('✅ TC-11: Devolución con daño registra alerta en el historial', () => {
    performReturn(state, 'HER-001', 1, 'damaged');
    expect(state.recentScans[0].time).toBe('Devolución c/ Daño');
    expect(state.recentScans[0].status).toBe('maintenance');
  });
});

describe('🔒 QA Suite — Control de Acceso por Roles (RBAC)', () => {
  let state;
  beforeEach(() => { state = createState(); });

  it('❌ TC-12: Sin sesión iniciada, el acceso de admin debe ser denegado', () => {
    state.user = null;
    expect(checkAdminAccess(state)).toBe(false);
  });

  it('❌ TC-13: Un Operador no debe tener acceso de administrador', () => {
    state.user = { name: 'Pedro Operador', role: 'operator' };
    expect(checkAdminAccess(state)).toBe(false);
  });

  it('✅ TC-14: Un Administrador sí debe tener acceso completo', () => {
    state.user = { name: 'Admin INACAP', role: 'admin' };
    expect(checkAdminAccess(state)).toBe(true);
  });
});

describe('📊 QA Suite — Integridad de Stock', () => {
  let state;
  beforeEach(() => { state = createState(); });

  it('✅ TC-15: Total de unidades se conserva durante todo el ciclo préstamo → devolución', () => {
    const assetBefore = state.assets.find(a => a.id === 'HER-001');
    const totalInicial = assetBefore.total;

    performLoan(state, 'HER-001', 1, 'Juan');
    performReturn(state, 'HER-001', 1, 'good');

    const assetAfter = state.assets.find(a => a.id === 'HER-001');
    expect(assetAfter.available + assetAfter.borrowed).toBe(totalInicial);
  });

  it('✅ TC-16: Múltiples préstamos acumulan correctamente el stock prestado', () => {
    performLoan(state, 'HER-001', 1, 'User A');
    performLoan(state, 'HER-001', 1, 'User B');
    const asset = state.assets.find(a => a.id === 'HER-001');
    expect(asset.borrowed).toBe(2);
    expect(asset.available).toBe(0);
  });
});
