
/**
 * Script especializado para analizar datos de la BD y prepararlos para el dashboard
 * Optimizado para el schema de HelpDesk
 */

class DashboardAnalyzer {
  constructor(ticketsData, usuariosData, clientesData) {
    this.tickets = ticketsData || [];
    this.usuarios = usuariosData || [];
    this.clientes = clientesData || [];
    this.analysis = {};
  }

  /**
   * Análisis completo de todos los datos
   */
  analyzeAll() {
    console.log('🔍 Iniciando análisis de datos para dashboard...');

    this.analysis = {
      timestamp: new Date().toISOString(),
      general: this.analyzeGeneral(),
      porEstado: this.analyzePorEstado(),
      porPrioridad: this.analyzePorPrioridad(),
      porTiempo: this.analyzePorTiempo(),
      porAgente: this.analyzePorAgente(),
      porCliente: this.analyzePorCliente(),
      metricasAvanzadas: this.analyzeMetricasAvanzadas(),
      tendencias: this.analyzeTendencias()
    };

    console.log('✅ Análisis completado:', this.analysis.general.totalTickets, 'tickets procesados');
    return this.analysis;
  }

  /**
   * Métricas generales del sistema
   */
  analyzeGeneral() {
    const totalTickets = this.tickets.length;
    const ticketsActivos = this.tickets.filter(t =>
      ['Abierto', 'En Proceso'].includes(t.estado)
    ).length;

    const ticketsResueltos = this.tickets.filter(t =>
      ['Resuelto', 'Cerrado'].includes(t.estado)
    ).length;

    const tasaResolucion = totalTickets > 0 ?
      (ticketsResueltos / totalTickets * 100).toFixed(1) : 0;

    return {
      totalTickets,
      ticketsActivos,
      ticketsResueltos,
      tasaResolucion: parseFloat(tasaResolucion),
      totalUsuarios: this.usuarios.filter(u => u.estado === 'activo').length,
      totalClientes: this.clientes.filter(c => c.activo === 1 || c.activo === true).length
    };
  }

  /**
   * Análisis detallado por estado
   */
  analyzePorEstado() {
    const estados = ['Abierto', 'En Proceso', 'En Espera', 'Resuelto', 'Cancelado'];
    const porEstado = {};

    estados.forEach(estado => {
      const ticketsEstado = this.tickets.filter(t => t.estado === estado);
      porEstado[estado] = {
        cantidad: ticketsEstado.length,
        porcentaje: this.tickets.length > 0 ?
          (ticketsEstado.length / this.tickets.length * 100).toFixed(1) : 0,
        prioridades: this.analizarPrioridadesPorEstado(ticketsEstado),
        tiempoPromedio: this.calcularTiempoPromedioEstado(ticketsEstado)
      };
    });

    // Para gráfico de pastel
    const datosGrafico = estados.map(estado => ({
      nombre: estado,
      cantidad: porEstado[estado].cantidad,
      color: this.getColorPorEstado(estado)
    }));

    return {
      detallado: porEstado,
      grafico: datosGrafico,
      estadoMasComun: this.getEstadoMasComun(porEstado)
    };
  }

  /**
   * Análisis por prioridad
   */
  analyzePorPrioridad() {
    const prioridades = ['Alta', 'Media', 'Baja'];
    const porPrioridad = {};

    prioridades.forEach(prioridad => {
      const ticketsPrioridad = this.tickets.filter(t => t.prioridad === prioridad);
      porPrioridad[prioridad] = {
        cantidad: ticketsPrioridad.length,
        porcentaje: this.tickets.length > 0 ?
          (ticketsPrioridad.length / this.tickets.length * 100).toFixed(1) : 0,
        estados: this.analizarEstadosPorPrioridad(ticketsPrioridad),
        urgencia: this.calcularIndiceUrgencia(prioridad, ticketsPrioridad)
      };
    });

    const datosGrafico = prioridades.map(prioridad => ({
      nombre: prioridad,
      cantidad: porPrioridad[prioridad].cantidad,
      color: this.getColorPorPrioridad(prioridad)
    }));

    return {
      detallado: porPrioridad,
      grafico: datosGrafico,
      prioridadMasComun: this.getPrioridadMasComun(porPrioridad)
    };
  }

  /**
   * Análisis temporal - últimos 30 días
   */
  analyzePorTiempo() {
    const ultimos30Dias = this.getUltimosNDias(30);
    const datosTemporal = [];

    ultimos30Dias.forEach(dia => {
      const ticketsDia = this.tickets.filter(ticket => {
        if (!ticket.fecha_creacion) return false;
        const fechaTicket = new Date(ticket.fecha_creacion);
        return fechaTicket.toDateString() === dia.fecha.toDateString();
      });

      datosTemporal.push({
        fecha: dia.formatoCorto,
        fechaCompleta: dia.fecha.toISOString().split('T')[0],
        total: ticketsDia.length,
        resueltos: ticketsDia.filter(t => ['Resuelto', 'Cerrado'].includes(t.estado)).length,
        abiertos: ticketsDia.filter(t => ['Abierto', 'En Proceso'].includes(t.estado)).length,
        tasaResolucion: ticketsDia.length > 0 ?
          (ticketsDia.filter(t => ['Resuelto', 'Cerrado'].includes(t.estado)).length / ticketsDia.length * 100).toFixed(1) : 0
      });
    });

    // Métricas de tendencia
    const tendencia = this.calcularTendencia(datosTemporal);

    return {
      datos: datosTemporal,
      tendencia,
      diaMasActivo: this.getDiaMasActivo(datosTemporal),
      promedioDiario: (this.tickets.length / 30).toFixed(1)
    };
  }

  /**
   * Análisis por agente/empleado
   */
  analyzePorAgente() {
    const agentes = this.usuarios.filter(u =>
      ['Agente', 'Supervisor', 'Admin'].includes(u.rol) && u.estado === 'activo'
    );

    const porAgente = agentes.map(agente => {
      const ticketsAgente = this.tickets.filter(t =>
        t.agente_id === agente.usuario_id || t.asignado_a === agente.usuario_id
      );

      const ticketsResueltos = ticketsAgente.filter(t =>
        ['Resuelto', 'Cerrado'].includes(t.estado)
      );

      const eficiencia = ticketsAgente.length > 0 ?
        (ticketsResueltos.length / ticketsAgente.length * 100).toFixed(1) : 0;

      return {
        id: agente.usuario_id,
        nombre: agente.nombre_completo,
        rol: agente.rol,
        totalTickets: ticketsAgente.length,
        ticketsResueltos: ticketsResueltos.length,
        eficiencia: parseFloat(eficiencia),
        ticketsActivos: ticketsAgente.filter(t => ['Abierto', 'En Proceso'].includes(t.estado)).length,
        tiempoPromedio: this.calcularTiempoPromedioAgente(ticketsResueltos)
      };
    });

    // Ordenar por eficiencia
    const topAgentes = porAgente
      .filter(a => a.totalTickets > 0)
      .sort((a, b) => b.eficiencia - a.eficiencia)
      .slice(0, 5);

    return {
      todos: porAgente,
      topAgentes,
      agenteMasEficiente: topAgentes[0] || null,
      promedioEficiencia: this.calcularPromedio(porAgente.map(a => a.eficiencia))
    };
  }

  /**
   * Análisis por cliente
   */
  analyzePorCliente() {
    const clientesActivos = this.clientes.filter(c => c.activo === 1 || c.activo === true);

    const porCliente = clientesActivos.map(cliente => {
      const ticketsCliente = this.tickets.filter(t =>
        t.cliente_id === cliente.cliente_id
      );

      return {
        id: cliente.cliente_id,
        nombre: cliente.nombre,
        empresa: cliente.empresa,
        totalTickets: ticketsCliente.length,
        ticketsActivos: ticketsCliente.filter(t => ['Abierto', 'En Proceso'].includes(t.estado)).length,
        ticketsResueltos: ticketsCliente.filter(t => ['Resuelto', 'Cerrado'].includes(t.estado)).length,
        satisfaccion: this.calcularSatisfaccionCliente(ticketsCliente),
        ultimoTicket: this.getUltimoTicket(ticketsCliente)
      };
    });

    const clientesFrecuentes = porCliente
      .filter(c => c.totalTickets > 0)
      .sort((a, b) => b.totalTickets - a.totalTickets)
      .slice(0, 10);

    return {
      todos: porCliente,
      clientesFrecuentes,
      clienteMasActivo: clientesFrecuentes[0] || null
    };
  }

  /**
   * Métricas avanzadas y KPI
   */
  analyzeMetricasAvanzadas() {
    const ticketsResueltos = this.tickets.filter(t =>
      ['Resuelto', 'Cerrado'].includes(t.estado)
    );

    return {
      tiempoPrimeraRespuesta: this.calcularTiempoPrimeraRespuesta(),
      tiempoResolucionPromedio: this.calcularTiempoResolucionPromedio(ticketsResueltos),
      tasaReapertura: this.calcularTasaReapertura(),
      satisfaccionGlobal: this.calcularSatisfaccionGlobal(),
      backlog: this.tickets.filter(t => ['Abierto', 'En Proceso'].includes(t.estado)).length,
      edadPromedioBacklog: this.calcularEdadPromedioBacklog()
    };
  }

  /**
   * Análisis de tendencias
   */
  analyzeTendencias() {
    const ultimaSemana = this.getUltimosNDias(7);
    const semanaAnterior = this.getUltimosNDias(7, 7);

    const ticketsUltimaSemana = this.contarTicketsPorPeriodo(ultimaSemana);
    const ticketsSemanaAnterior = this.contarTicketsPorPeriodo(semanaAnterior);

    return {
      crecimiento: this.calcularCrecimiento(ticketsUltimaSemana, ticketsSemanaAnterior),
      tendenciaEstados: this.analizarTendenciaEstados(),
      tendenciaPrioridades: this.analizarTendenciaPrioridades(),
      prediccion: this.predecirCargaTrabajo()
    };
  }

  // ===== MÉTODOS HELPER =====

  getUltimosNDias(n, desplazamiento = 0) {
    const dias = [];
    for (let i = n + desplazamiento - 1; i >= desplazamiento; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      dias.push({
        fecha,
        formatoCorto: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
      });
    }
    return dias;
  }

  calcularTiempoPromedioEstado(tickets) {
    const ticketsConTiempo = tickets.filter(t => t.fecha_creacion && t.fecha_actualizacion);
    if (ticketsConTiempo.length === 0) return 'N/A';

    const totalMs = ticketsConTiempo.reduce((acc, ticket) => {
      const inicio = new Date(ticket.fecha_creacion);
      const fin = new Date(ticket.fecha_actualizacion);
      return acc + (fin - inicio);
    }, 0);

    const avgMs = totalMs / ticketsConTiempo.length;
    return this.formatearTiempo(avgMs);
  }

  formatearTiempo(ms) {
    const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
    const horas = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
  }

  getColorPorEstado(estado) {
    const colores = {
      'Abierto': '#17a2b8',
      'En Proceso': '#ffc107',
      'En Espera': '#fd7e14',
      'Resuelto': '#28a745',
      'Cancelado': '#6c757d'
    };
    return colores[estado] || '#6c757d';
  }

  getColorPorPrioridad(prioridad) {
    const colores = {
      'Alta': '#dc3545',
      'Media': '#ffc107',
      'Baja': '#28a745'
    };
    return colores[prioridad] || '#6c757d';
  }

  // ... más métodos helper según necesites

  analizarPrioridadesPorEstado(tickets) {
    const prioridades = ['Alta', 'Media', 'Baja'];
    const resultado = {};
    prioridades.forEach(p => {
      resultado[p] = tickets.filter(t => t.prioridad === p).length;
    });
    return resultado;
  }

  analizarEstadosPorPrioridad(tickets) {
    const estados = ['Abierto', 'En Proceso', 'En Espera', 'Resuelto', 'Cancelado'];
    const resultado = {};
    estados.forEach(e => {
      resultado[e] = tickets.filter(t => t.estado === e).length;
    });
    return resultado;
  }

  getEstadoMasComun(porEstado) {
    let max = 0;
    let estado = 'N/A';
    Object.entries(porEstado).forEach(([k, v]) => {
      if (v.cantidad > max) {
        max = v.cantidad;
        estado = k;
      }
    });
    return estado;
  }

  getPrioridadMasComun(porPrioridad) {
    let max = 0;
    let prioridad = 'N/A';
    Object.entries(porPrioridad).forEach(([k, v]) => {
      if (v.cantidad > max) {
        max = v.cantidad;
        prioridad = k;
      }
    });
    return prioridad;
  }

  calcularIndiceUrgencia(prioridad, tickets) {
    // Simple heurística: (cantidad * peso) / total
    const pesos = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
    const peso = pesos[prioridad] || 1;
    return (tickets.length * peso);
  }

  calcularTendencia(datosTemporal) {
    if (datosTemporal.length < 2) return 'Estable';
    const inicio = datosTemporal[0].total;
    const fin = datosTemporal[datosTemporal.length - 1].total;
    if (fin > inicio) return 'Alza';
    if (fin < inicio) return 'Baja';
    return 'Estable';
  }

  getDiaMasActivo(datosTemporal) {
    if (datosTemporal.length === 0) return null;
    return datosTemporal.reduce((prev, current) =>
      (prev.total > current.total) ? prev : current
    );
  }

  calcularTiempoPromedioAgente(ticketsResueltos) {
    return this.calcularTiempoPromedioEstado(ticketsResueltos);
  }

  calcularSatisfaccionCliente(tickets) {
    // Simulación: si no hay encuestas, devolver 5.0 o N/A
    return 5.0;
  }

  getUltimoTicket(tickets) {
    if (!tickets || tickets.length === 0) return null;
    return tickets.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))[0];
  }

  calcularTiempoPrimeraRespuesta() {
    return '1h 30m'; // Valor simulado/promedio
  }

  calcularTiempoResolucionPromedio(tickets) {
    return this.calcularTiempoPromedioEstado(tickets);
  }

  calcularTasaReapertura() {
    return '0%'; // Sin lógica de reapertura implementada aún
  }

  calcularSatisfaccionGlobal() {
    return 4.8; // Valor simulado
  }

  calcularEdadPromedioBacklog() {
    const backlog = this.tickets.filter(t => ['Abierto', 'En Proceso'].includes(t.estado));
    if (backlog.length === 0) return '0d';

    const hoy = new Date();
    const totalDias = backlog.reduce((acc, t) => {
      const creacion = new Date(t.fecha_creacion || hoy);
      return acc + (hoy - creacion);
    }, 0);

    return this.formatearTiempo(totalDias / backlog.length);
  }

  contarTicketsPorPeriodo(dias) {
    return dias.reduce((acc, dia) => {
      const count = this.tickets.filter(t => {
        if (!t.fecha_creacion) return false;
        return new Date(t.fecha_creacion).toDateString() === dia.fecha.toDateString();
      }).length;
      return acc + count;
    }, 0);
  }

  calcularCrecimiento(actual, anterior) {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior * 100).toFixed(1);
  }

  analizarTendenciaEstados() {
    return { tendencia: 'Estable' };
  }

  analizarTendenciaPrioridades() {
    return { tendencia: 'Estable' };
  }

  predecirCargaTrabajo() {
    return 'Moderada';
  }

  calcularPromedio(valores) {
    if (!valores || valores.length === 0) return 0;
    const suma = valores.reduce((a, b) => a + parseFloat(b), 0);
    return (suma / valores.length).toFixed(1);
  }
}

// ===== FUNCIONES DE USO RÁPIDO =====

/**
 * Función rápida para análisis básico
 */
export function analizarDashboardRapido(tickets, usuarios, clientes) {
  const analyzer = new DashboardAnalyzer(tickets, usuarios, clientes);
  return analyzer.analyzeAll();
}

/**
 * Función para análisis específico por rol
 */
export function analizarParaRol(rol, tickets, usuarios, clientes) {
  const analyzer = new DashboardAnalyzer(tickets, usuarios, clientes);
  const analisisCompleto = analyzer.analyzeAll();

  // Filtrar según el rol
  switch (rol) {
    case 'Admin':
      return analisisCompleto;

    case 'Supervisor':
      // Quitar datos sensibles de clientes
      const { porCliente, ...datosSupervisor } = analisisCompleto;
      return datosSupervisor;

    case 'Agente':
      // Solo datos generales y propios
      return {
        general: analisisCompleto.general,
        porEstado: analisisCompleto.porEstado,
        porPrioridad: analisisCompleto.porPrioridad,
        metricasAvanzadas: analisisCompleto.metricasAvanzadas
      };

    case 'Cliente':
      // Solo datos generales públicos
      return {
        general: {
          totalTickets: analisisCompleto.general.totalTickets,
          tasaResolucion: analisisCompleto.general.tasaResolucion
        },
        porEstado: analisisCompleto.porEstado
      };

    default:
      return analisisCompleto;
  }
}

/**
 * Exportar datos para gráficos específicos
 */
export function prepararDatosParaGraficos(analisis) {
  return {
    // Para gráfico de pastel de estados
    pieEstados: analisis.porEstado.grafico,

    // Para gráfico de barras de prioridades
    barPrioridades: analisis.porPrioridad.grafico,

    // Para gráfico de tendencia temporal
    lineTemporal: analisis.porTiempo.datos.map(d => ({
      fecha: d.fecha,
      total: d.total,
      resueltos: d.resueltos
    })),

    // Para gráfico de eficiencia de agentes
    barAgentes: analisis.porAgente.topAgentes.map(a => ({
      nombre: a.nombre.split(' ')[0], // Solo primer nombre
      eficiencia: a.eficiencia,
      tickets: a.totalTickets
    }))
  };
}

export default DashboardAnalyzer;