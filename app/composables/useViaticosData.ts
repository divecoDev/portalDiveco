import { ref, computed, type Ref, type ComputedRef } from "vue";
import type {
  ViaticoFormulario,
  ViaticoKPI,
  ViaticoStatusDistribution,
  ViaticoTemporalData,
  ViaticoMonthlyAmount,
  ViaticoEmployeeData,
  ViaticoDocumentTypeData,
  ViaticoRejectionReason,
} from "~/domain/viaticos/types";

// Generar datos mock realistas
const generateMockData = (): ViaticoFormulario[] => {
  const estados: Array<"Aceptada" | "En Proceso" | "Rechazada"> = [
    "Aceptada",
    "En Proceso",
    "Rechazada",
  ];
  const clasesDocumento = ["Factura", "Recibo", "Nota de Crédito", "Ticket"];
  const motivosRechazo = [
    "Factura inválida",
    "Fecha vencida",
    "Documento incompleto",
    "Importe incorrecto",
    null,
  ];
  const empleados = [
    { id: 1, nombre: "Juan Pérez", codigo: "EMP001" },
    { id: 2, nombre: "María González", codigo: "EMP002" },
    { id: 3, nombre: "Carlos Rodríguez", codigo: "EMP003" },
    { id: 4, nombre: "Ana Martínez", codigo: "EMP004" },
    { id: 5, nombre: "Luis Sánchez", codigo: "EMP005" },
    { id: 6, nombre: "Laura Fernández", codigo: "EMP006" },
    { id: 7, nombre: "Pedro López", codigo: "EMP007" },
    { id: 8, nombre: "Sofía Ramírez", codigo: "EMP008" },
  ];

  const data: ViaticoFormulario[] = [];
  const now = new Date();

  // Generar 150 registros
  for (let i = 1; i <= 150; i++) {
    const empleado = empleados[Math.floor(Math.random() * empleados.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const fechaDoc = new Date(now);
    fechaDoc.setDate(fechaDoc.getDate() - Math.floor(Math.random() * 90)); // Últimos 90 días

    const importeAceptada =
      estado === "Aceptada" ? Math.random() * 5000 + 100 : 0;
    const importeSegundoIntento =
      estado === "Rechazada" && Math.random() > 0.5
        ? Math.random() * 5000 + 100
        : null;

    const fechaContabilizacion =
      estado === "Aceptada"
        ? new Date(fechaDoc.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        : null;

    const fechaRechazo =
      estado === "Rechazada"
        ? new Date(fechaDoc.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000)
        : null;

    data.push({
      Id_Registro: i,
      Id_Formulario: `FORM-${String(i).padStart(6, "0")}`,
      Factura_Serie: `FAC-${String(Math.floor(Math.random() * 10000)).padStart(6, "0")}`,
      Id_Empleado: empleado.id,
      Ruta_Archivo: `/archivos/viaticos/${i}.pdf`,
      Fecha_Documento: fechaDoc.toISOString().split("T")[0],
      Estado: estado,
      Factura: `FAC${Math.floor(Math.random() * 100000)}`,
      Serie: "A",
      Id_Factura: `FAC-${i}`,
      Importe_Aceptada: importeAceptada,
      Importe_Segundo_Intento: importeSegundoIntento,
      motivo_rechazo:
        estado === "Rechazada"
          ? motivosRechazo[Math.floor(Math.random() * motivosRechazo.length)]
          : null,
      Clase_Documento:
        clasesDocumento[Math.floor(Math.random() * clasesDocumento.length)],
      Doc_Preliminar: Math.random() > 0.7 ? "PRELIM" : null,
      nombre_empleado: empleado.nombre,
      codigo_empleado: empleado.codigo,
      Fecha_Contabilizacion: fechaContabilizacion
        ? fechaContabilizacion.toISOString().split("T")[0]
        : null,
      Centro_Costo: `CC${Math.floor(Math.random() * 10)}`,
      Cuenta_Mayor: `CM${Math.floor(Math.random() * 5)}`,
      Indicador_Impuesto: "S",
      Moneda: "GTQ",
      Acreedor: `ACR${Math.floor(Math.random() * 100)}`,
      Empleado: empleado.nombre,
      Fecha_Factura: fechaDoc.toISOString().split("T")[0],
      Fecha_Rechazo: fechaRechazo ? fechaRechazo.toISOString().split("T")[0] : null,
      Fecha_Intento: null,
    });
  }

  return data;
};

// Estado reactivo con datos mock
const formularios = ref<ViaticoFormulario[]>(generateMockData());
const loading = ref(false);

// Función para filtrar por empleado (para usuarios con acceso limitado)
const filterByEmployee = (
  data: ViaticoFormulario[],
  employeeId?: number
): ViaticoFormulario[] => {
  if (!employeeId) return data;
  return data.filter((f) => f.Id_Empleado === employeeId);
};

// Función para filtrar por rango de fechas
const filterByDateRange = (
  data: ViaticoFormulario[],
  startDate?: string,
  endDate?: string
): ViaticoFormulario[] => {
  if (!startDate && !endDate) return data;
  
  return data.filter((f) => {
    const fechaDoc = new Date(f.Fecha_Documento);
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Incluir todo el día final
      return fechaDoc >= start && fechaDoc <= end;
    }
    
    if (startDate) {
      const start = new Date(startDate);
      return fechaDoc >= start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return fechaDoc <= end;
    }
    
    return true;
  });
};

// Calcular KPIs
export const useViaticosData = (
  employeeId?: number | Ref<number | undefined> | ComputedRef<number | undefined>,
  startDate?: string | Ref<string | undefined> | ComputedRef<string | undefined>,
  endDate?: string | Ref<string | undefined> | ComputedRef<string | undefined>
) => {
  // Convertir a computed si son refs o computed
  const employeeIdValue = computed(() => {
    if (employeeId === undefined) return undefined;
    if (typeof employeeId === "object" && "value" in employeeId) {
      return employeeId.value;
    }
    return employeeId;
  });

  const startDateValue = computed(() => {
    if (startDate === undefined) return undefined;
    if (typeof startDate === "object" && "value" in startDate) {
      return startDate.value;
    }
    return startDate;
  });

  const endDateValue = computed(() => {
    if (endDate === undefined) return undefined;
    if (typeof endDate === "object" && "value" in endDate) {
      return endDate.value;
    }
    return endDate;
  });

  const filteredData = computed(() => {
    let data = formularios.value;
    data = filterByEmployee(data, employeeIdValue.value);
    data = filterByDateRange(data, startDateValue.value, endDateValue.value);
    return data;
  });

  const kpis = computed<ViaticoKPI>(() => {
    const data = filteredData.value;
    const total = data.length;
    const aceptados = data.filter((f) => f.Estado === "Aceptada").length;
    const enProceso = data.filter((f) => f.Estado === "En Proceso").length;
    const rechazados = data.filter((f) => f.Estado === "Rechazada").length;

    const importeTotalAceptado = data
      .filter((f) => f.Estado === "Aceptada")
      .reduce((sum, f) => sum + (f.Importe_Aceptada || 0), 0);

    const tasaAceptacion = total > 0 ? (aceptados / total) * 100 : 0;

    // Calcular tiempo promedio de procesamiento
    const tiemposProcesamiento = data
      .filter(
        (f) =>
          f.Estado === "Aceptada" &&
          f.Fecha_Contabilizacion &&
          f.Fecha_Documento
      )
      .map((f) => {
        const fechaDoc = new Date(f.Fecha_Documento);
        const fechaCont = new Date(f.Fecha_Contabilizacion!);
        return (fechaCont.getTime() - fechaDoc.getTime()) / (1000 * 60 * 60 * 24);
      });

    const tiempoPromedioProcesamiento =
      tiemposProcesamiento.length > 0
        ? tiemposProcesamiento.reduce((a, b) => a + b, 0) /
          tiemposProcesamiento.length
        : 0;

    const importePromedio =
      aceptados > 0 ? importeTotalAceptado / aceptados : 0;

    return {
      totalFormularios: total,
      aceptados,
      enProceso,
      rechazados,
      importeTotalAceptado,
      tasaAceptacion: Math.round(tasaAceptacion * 100) / 100,
      tiempoPromedioProcesamiento: Math.round(tiempoPromedioProcesamiento * 10) / 10,
      importePromedio: Math.round(importePromedio * 100) / 100,
    };
  });

  // Distribución por estado
  const statusDistribution = computed<ViaticoStatusDistribution[]>(() => {
    const data = filteredData.value;
    const total = data.length;
    const estados = ["Aceptada", "En Proceso", "Rechazada"] as const;

    return estados.map((estado) => {
      const cantidad = data.filter((f) => f.Estado === estado).length;
      return {
        estado,
        cantidad,
        porcentaje: total > 0 ? Math.round((cantidad / total) * 100 * 10) / 10 : 0,
      };
    });
  });

  // Datos temporales (por fecha)
  const temporalData = computed<ViaticoTemporalData[]>(() => {
    const data = filteredData.value;
    const map = new Map<string, { registrados: number; contabilizados: number; rechazados: number }>();

    data.forEach((f) => {
      const fecha = f.Fecha_Documento;
      if (!map.has(fecha)) {
        map.set(fecha, { registrados: 0, contabilizados: 0, rechazados: 0 });
      }
      const entry = map.get(fecha)!;
      entry.registrados++;
      if (f.Estado === "Aceptada" && f.Fecha_Contabilizacion) {
        entry.contabilizados++;
      }
      if (f.Estado === "Rechazada") {
        entry.rechazados++;
      }
    });

    return Array.from(map.entries())
      .map(([fecha, values]) => ({
        fecha,
        ...values,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  });

  // Importes por mes
  const monthlyAmounts = computed<ViaticoMonthlyAmount[]>(() => {
    const data = filteredData.value;
    const map = new Map<string, { aceptado: number; rechazado: number }>();

    data.forEach((f) => {
      const fecha = new Date(f.Fecha_Documento);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      
      if (!map.has(mes)) {
        map.set(mes, { aceptado: 0, rechazado: 0 });
      }
      const entry = map.get(mes)!;
      
      if (f.Estado === "Aceptada") {
        entry.aceptado += f.Importe_Aceptada || 0;
      } else if (f.Estado === "Rechazada") {
        entry.rechazado += f.Importe_Segundo_Intento || 0;
      }
    });

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return Array.from(map.entries())
      .map(([mes, values]) => {
        const [year, month] = mes.split("-");
        return {
          mes: `${meses[parseInt(month) - 1]} ${year}`,
          importeAceptado: Math.round(values.aceptado * 100) / 100,
          importeRechazado: Math.round(values.rechazado * 100) / 100,
        };
      })
      .sort((a, b) => a.mes.localeCompare(b.mes));
  });

  // Top empleados
  const topEmployees = computed<ViaticoEmployeeData[]>(() => {
    const data = filteredData.value;
    const map = new Map<string, { cantidad: number; importe: number; nombre: string; codigo: string }>();

    data.forEach((f) => {
      const key = f.codigo_empleado;
      if (!map.has(key)) {
        map.set(key, {
          cantidad: 0,
          importe: 0,
          nombre: f.nombre_empleado,
          codigo: f.codigo_empleado,
        });
      }
      const entry = map.get(key)!;
      entry.cantidad++;
      if (f.Estado === "Aceptada") {
        entry.importe += f.Importe_Aceptada || 0;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10)
      .map((e) => ({
        empleado: e.nombre,
        codigoEmpleado: e.codigo,
        cantidadFormularios: e.cantidad,
        importeTotal: Math.round(e.importe * 100) / 100,
      }));
  });

  // Distribución por tipo de documento
  const documentTypeDistribution = computed<ViaticoDocumentTypeData[]>(() => {
    const data = filteredData.value;
    const total = data.length;
    const map = new Map<string, number>();

    data.forEach((f) => {
      const tipo = f.Clase_Documento;
      map.set(tipo, (map.get(tipo) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
        porcentaje: total > 0 ? Math.round((cantidad / total) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  // Motivos de rechazo
  const rejectionReasons = computed<ViaticoRejectionReason[]>(() => {
    const data = filteredData.value.filter((f) => f.Estado === "Rechazada");
    const total = data.length;
    const map = new Map<string, number>();

    data.forEach((f) => {
      const motivo = f.motivo_rechazo || "Sin motivo especificado";
      map.set(motivo, (map.get(motivo) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([motivo, cantidad]) => ({
        motivo,
        cantidad,
        porcentaje: total > 0 ? Math.round((cantidad / total) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  return {
    formularios: filteredData,
    loading,
    kpis,
    statusDistribution,
    temporalData,
    monthlyAmounts,
    topEmployees,
    documentTypeDistribution,
    rejectionReasons,
    refresh: () => {
      formularios.value = generateMockData();
    },
  };
};

