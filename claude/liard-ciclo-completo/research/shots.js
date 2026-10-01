async (page) => {
  const O = '<carpeta de la galería>'; // ruta local de quien lo corra
  const NOW = '2026-09-28T10:00:00.000Z';
  const PID = '11111111-1111-4111-8111-111111111111';
  const eng = { id: 'e2e-engineer', email: 'martina@gimenez.com.ar', role: 'ENGINEER', emailVerified: true, needsOnboarding: false, fullName: 'Martina Giménez', photoUrl: null, phone: '+54 351 555-0142', companyName: 'Giménez Ingeniería Eléctrica', taxId: '20-35486521-2', website: null, state: 'Córdoba', city: 'Córdoba', position: 'Ingeniera de proyectos', categories: [], shortDescription: null, brands: [], deliveryZones: [], minOrderAmount: null, leadTimeDays: null, onboardingCompletedAt: NOW, createdAt: NOW };
  const sup = { ...eng, id: 'e2e-supplier', email: 'ventas@electrosur.com.ar', role: 'SUPPLIER', fullName: 'Julián Roldán', companyName: 'Electro Insumos del Sur S.A.' };
  const pc = (t, c, p, pe, e, s) => ({ total: t, completed: c, processing: p, pending: pe, error: e, stale: s });
  const projects = [
    { id: PID, name: 'Planta Norte', description: 'Ampliación nave 2 — tableros de fuerza', createdAt: NOW, updatedAt: NOW, planCount: pc(5, 3, 1, 0, 1, 0), progressPercentage: 60 },
    { id: 'p2', name: 'Torre Alvear', description: 'Edificio de 20 pisos', createdAt: NOW, updatedAt: NOW, planCount: pc(8, 8, 0, 0, 0, 0), progressPercentage: 100 },
    { id: 'p3', name: 'Hospital Regional Sur', description: 'Tableros seccionales', createdAt: NOW, updatedAt: NOW, planCount: pc(4, 1, 0, 2, 0, 1), progressPercentage: 25 },
    { id: 'p4', name: 'Subestación Beta', description: null, createdAt: NOW, updatedAt: NOW, planCount: pc(0, 0, 0, 0, 0, 0), progressPercentage: 0 },
  ];
  const plan = (id, name, status, extra = {}) => ({ id, name, status, sourceFormat: 'DXF', multiplier: 1, lastError: null, bomWarning: null, unidentifiedSymbolsCount: 0, processingStartedAt: status === 'PROCESSING' ? NOW : null, createdAt: NOW, updatedAt: NOW, ...extra });
  const detail = { id: PID, name: 'Planta Norte', description: 'Ampliación nave 2 — tableros de fuerza', referenceTable: { id: 'rt1', fileName: 'referencias-simbolos.dxf', uploadedAt: NOW, updatedAt: NOW }, currentQuoteId: null,
    plans: [plan('pl1', 'Tablero general TG', 'COMPLETED', { multiplier: 1 }), plan('pl2', 'Tablero de bombas TB-1', 'COMPLETED', { multiplier: 2, unidentifiedSymbolsCount: 3 }), plan('pl3', 'Tablero seccional TS-3', 'COMPLETED'), plan('pl4', 'Tablero iluminación TI', 'PROCESSING'), plan('pl5', 'Sala de máquinas', 'ERROR', { lastError: 'El servicio de detección no respondió a tiempo' })],
    createdAt: NOW, updatedAt: NOW, electricalPlans: 5, plansCountByStatus: { COMPLETED: 3, PENDING: 0, PROCESSING: 1, ERROR: 1, STALE: 0 } };
  const comp = (material, specification, quantity, brand = null) => ({ material, specification, quantity, effectiveQuantity: quantity, detectedQuantity: quantity, brand, subBrand: null, canonicalComponent: null, canonicalLinkStatus: 'AUTO', readingStatus: 'READ', sources: [] });
  const bom = { totalComponents: 6, completedPlans: 3, totalPlans: 5, unidentifiedCount: 3, isComplete: false, partialPlans: 0, warningMessage: null, planVersions: [],
    components: [comp('Interruptor termomagnético', '2x16A curva C 6kA', 24, 'Schneider Electric'), comp('Interruptor diferencial', '2x40A 30mA', 8), comp('Contactor', '3P 25A bobina 220V AC3', 6, 'Siemens'), comp('Guardamotor', '9-14A', 4), comp('Cable unipolar', '2,5 mm² IRAM NM 247-3', 320, 'Prysmian'), comp('Bornera', '4 mm² tornillo', 60)] };
  const orders = [
    { id: 'b1', orderNumber: 'PED-2026-014', projectId: PID, projectName: 'Planta Norte', sourcePlanId: null, sourcePlanName: null, status: 'SENT', providersCount: 2, sentProvidersCount: 2, confirmedProvidersCount: 0, rejectedProvidersCount: 0, expiredProvidersCount: 0, totalAmount: '2480000', currency: 'ARS', itemsCount: 42, sentAt: NOW },
    { id: 'b2', orderNumber: 'PED-2026-011', projectId: 'p2', projectName: 'Torre Alvear', sourcePlanId: null, sourcePlanName: null, status: 'CONFIRMED', providersCount: 3, sentProvidersCount: 3, confirmedProvidersCount: 3, rejectedProvidersCount: 0, expiredProvidersCount: 0, totalAmount: '5120000', currency: 'ARS', itemsCount: 87, sentAt: NOW },
    { id: 'b3', orderNumber: 'PED-2026-009', projectId: 'p3', projectName: 'Hospital Regional Sur', sourcePlanId: null, sourcePlanName: null, status: 'REJECTED', providersCount: 1, sentProvidersCount: 1, confirmedProvidersCount: 0, rejectedProvidersCount: 1, expiredProvidersCount: 0, totalAmount: '640000', currency: 'ARS', itemsCount: 12, sentAt: NOW },
  ];
  const reqs = [
    { id: 'r1', orderNumber: 'SOL-2026-031', status: 'SENT', requestedAt: NOW, totalAmount: '1180000', currency: 'ARS', itemsCount: 18, projectName: 'Planta Norte', clientName: 'Giménez Ingeniería Eléctrica' },
    { id: 'r2', orderNumber: 'SOL-2026-029', status: 'SENT', requestedAt: NOW, totalAmount: '420000', currency: 'ARS', itemsCount: 6, projectName: 'Edificio Panorámico', clientName: 'Estudio Ingenieros Asociados' },
  ];
  let session = eng;
  await page.unrouteAll();
  await page.route((url) => url.pathname.startsWith('/api/'), async (r) => {
    const u = new URL(r.request().url()); const p = u.pathname.replace(/^\/api/, '');
    const j = (b, s = 200) => r.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(b) });
    if (p === '/auth/me' || p === '/users/me') return j(session);
    if (p === '/project') return j(projects);
    if (p === `/project/${PID}`) return j(detail);
    if (p === `/project/${PID}/bom`) return j(bom);
    if (p.endsWith('/processing-status')) return j({ batchId: null, total: 0, queued: 0, running: 0, completed: 0, failed: 0, cancelled: 0, inProgress: false });
    if (p.endsWith('/brand-preferences')) return j({ own: { preferred: [], blocked: [] }, effective: { preferred: [], blocked: [] }, preferred: [], blocked: [] });
    if (p.startsWith('/quotation/') && p.endsWith('/current')) return j({ message: 'Not found' }, 404);
    if (p === '/orders') return j(orders);
    if (p === '/orders/supplier/requests') return j(reqs);
    return j({ message: 'Not found' }, 404);
  });
  await page.setViewportSize({ width: 1440, height: 994 });
  const shots = [['10-eng-projects', '/projects'], ['11-eng-project-detail', `/projects/${PID}`], ['12-eng-orders', '/orders'], ['13-eng-account', '/cuenta']];
  const out = [];
  for (const [n, path] of shots) {
    await page.goto('http://localhost:5199' + path); await page.waitForTimeout(2500);
    await page.screenshot({ path: `${O}/${n}.png` }); out.push(n + ' -> ' + page.url());
  }
  session = sup;
  for (const [n, path] of [['20-sup-requests', '/supplier/requests']]) {
    await page.goto('http://localhost:5199' + path); await page.waitForTimeout(2500);
    await page.screenshot({ path: `${O}/${n}.png` }); out.push(n + ' -> ' + page.url());
  }
  return out;
}
