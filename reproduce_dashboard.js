
import DashboardAnalyzer from './src/components/dashboard/DashboardAnalyzer.js';

// Mock data
const mockTickets = [
    { id: 1, estado: 'Abierto', prioridad: 'Alta', fecha_creacion: new Date().toISOString() },
    { id: 2, estado: 'Resuelto', prioridad: 'Media', fecha_creacion: new Date().toISOString() }
];

const mockUsuarios = [
    { id: 1, nombre: 'Admin', rol: 'Admin', estado: 'activo' }
];

const mockClientes = [
    { id: 1, nombre: 'Cliente 1', activo: 1 }
];

console.log('--- TEST 1: Missing Clients (Current State) ---');
try {
    const analyzerMissing = new DashboardAnalyzer(mockTickets, mockUsuarios, undefined);
    const resultMissing = analyzerMissing.analyzeAll();
    console.log('Result with missing clients:', resultMissing.general);
    if (resultMissing.general.totalClientes === 0) {
        console.log('PASS: Correctly handled missing clients (count is 0)');
    } else {
        console.log('FAIL: Unexpected client count');
    }
} catch (error) {
    console.error('CRITICAL FAIL: Error with missing clients:', error);
}

console.log('\n--- TEST 2: With Clients (Target State) ---');
try {
    const analyzerFull = new DashboardAnalyzer(mockTickets, mockUsuarios, mockClientes);
    const resultFull = analyzerFull.analyzeAll();
    console.log('Result with clients:', resultFull.general);
    if (resultFull.general.totalClientes === 1) {
        console.log('PASS: Correctly counted clients');
    } else {
        console.log('FAIL: Client count mismatch');
    }
} catch (error) {
    console.error('CRITICAL FAIL: Error with clients:', error);
}
