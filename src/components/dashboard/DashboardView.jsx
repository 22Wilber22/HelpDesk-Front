import { useState, useEffect } from "react";
import { obtenerResumenDashboard } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function DashboardView() {
  const { usuario, esAdmin, esSupervisor, esAgente, esUsuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const data = await obtenerResumenDashboard();
        setStats(data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!stats) return null;

  // Preparar datos para gráficos
  const dataEstado = stats.por_estado.map(item => ({
    name: item.estado,
    value: item.cantidad
  }));

  const dataPrioridad = stats.por_prioridad.map(item => ({
    name: item.prioridad,
    cantidad: item.cantidad
  }));

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calcular totales auxiliares
  const totalTickets = stats.total;
  const ticketsAbiertos = stats.por_estado.find(e => e.estado === 'Abierto')?.cantidad || 0;
  const ticketsEnProceso = stats.por_estado.find(e => e.estado === 'En Proceso')?.cantidad || 0;
  const ticketsResueltos = stats.por_estado.find(e => e.estado === 'Resuelto')?.cantidad || 0;
  const ticketsCerrados = stats.por_estado.find(e => e.estado === 'Cerrado')?.cantidad || 0;

  const totalActivos = ticketsAbiertos + ticketsEnProceso;
  const totalFinalizados = ticketsResueltos + ticketsCerrados;
  const tasaResolucion = totalTickets > 0 ? ((totalFinalizados / totalTickets) * 100).toFixed(1) : 0;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Dashboard</h2>
          <p className="text-muted mb-0">
            Bienvenido, {usuario?.nombre || usuario?.nombre_completo || 'Usuario'}
          </p>
        </div>
        <div className="badge bg-light text-dark border p-2">
          {new Date().toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div className="card-body">
              <h6 className="text-uppercase opacity-75 small fw-bold">Total Tickets</h6>
              <h2 className="display-4 fw-bold mb-0">{totalTickets}</h2>
              <small className="opacity-75">En tu vista actual</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-white">
            <div className="card-body border-start border-4 border-info">
              <h6 className="text-muted text-uppercase small fw-bold">Activos</h6>
              <h2 className="fw-bold text-dark mb-0">{totalActivos}</h2>
              <small className="text-info">Abiertos + En Proceso</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-white">
            <div className="card-body border-start border-4 border-success">
              <h6 className="text-muted text-uppercase small fw-bold">Resueltos</h6>
              <h2 className="fw-bold text-dark mb-0">{totalFinalizados}</h2>
              <small className="text-success">Tasa de resolución: {tasaResolucion}%</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-white">
            <div className="card-body border-start border-4 border-warning">
              <h6 className="text-muted text-uppercase small fw-bold">Prioridad Alta</h6>
              <h2 className="fw-bold text-dark mb-0">
                {stats.por_prioridad.find(p => p.prioridad === 'Alta')?.cantidad || 0}
              </h2>
              <small className="text-warning">Requieren atención</small>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-4">
        {/* Gráfico de Estado */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 fw-bold">Distribución por Estado</h5>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataEstado}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Tickets']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de Prioridad */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 fw-bold">Tickets por Prioridad</h5>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataPrioridad}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="cantidad" fill="#82ca9d" radius={[4, 4, 0, 0]}>
                    {dataPrioridad.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'Alta' ? '#dc3545' :
                          entry.name === 'Media' ? '#ffc107' :
                            '#28a745'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}