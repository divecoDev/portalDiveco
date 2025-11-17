// Tipos basados en la estructura de vista_estado_formularios

export type ViaticoEstado = "Aceptada" | "En Proceso" | "Rechazada" | "No Registrada";

export type ClaseDocumento = string;

export interface ViaticoFormulario {
  Id_Registro: number;
  Id_Formulario: string;
  Factura_Serie: string;
  Id_Empleado: number;
  Ruta_Archivo: string;
  Fecha_Documento: string;
  Estado: ViaticoEstado;
  Factura: string;
  Serie: string;
  Id_Factura: string;
  Importe_Aceptada: number;
  Importe_Segundo_Intento: number | null;
  motivo_rechazo: string | null;
  Clase_Documento: ClaseDocumento;
  Doc_Preliminar: string | null;
  nombre_empleado: string;
  codigo_empleado: string;
  Fecha_Contabilizacion: string | null;
  Centro_Costo: string | null;
  Cuenta_Mayor: string | null;
  Indicador_Impuesto: string | null;
  Moneda: string;
  Acreedor: string | null;
  Empleado: string;
  Fecha_Factura: string;
  Fecha_Rechazo: string | null;
  Fecha_Intento: string | null;
}

export interface ViaticoKPI {
  totalFormularios: number;
  aceptados: number;
  enProceso: number;
  rechazados: number;
  importeTotalAceptado: number;
  tasaAceptacion: number;
  tiempoPromedioProcesamiento: number; // en días
  importePromedio: number;
}

export interface ViaticoChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ViaticoStatusDistribution {
  estado: ViaticoEstado;
  cantidad: number;
  porcentaje: number;
}

export interface ViaticoTemporalData {
  fecha: string;
  registrados: number;
  contabilizados: number;
  rechazados: number;
}

export interface ViaticoMonthlyAmount {
  mes: string;
  importeAceptado: number;
  importeRechazado: number;
}

export interface ViaticoEmployeeData {
  empleado: string;
  codigoEmpleado: string;
  cantidadFormularios: number;
  importeTotal: number;
}

export interface ViaticoDocumentTypeData {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

export interface ViaticoRejectionReason {
  motivo: string;
  cantidad: number;
  porcentaje: number;
}

// Tipos para Estado de Cuenta
export interface ViaticoEstadoCuenta {
  empleado: {
    id: number;
    nombre: string;
    codigo: string;
  };
  saldoMesAnterior: number;
  saldoAFavor: number;
  transacciones: ViaticoTransaccion[];
  totalDebito: number;
  totalCredito: number;
}

export interface ViaticoTransaccion {
  fechaOperacion: string;
  facturaSerie: string;
  debito: number;
  credito: number;
  balance: number;
}
