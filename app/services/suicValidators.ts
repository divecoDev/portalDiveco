/**
 * SUIC Validators Service
 * Funciones puras para validación de datos SUIC siguiendo principios SOLID
 */

// Constantes de estructura de meses SUIC
export const SUIC_MONTHS_CONFIG = {
  // 12 meses con 8 columnas cada uno
  MONTHS: [
    { number: 1, name: 'Ene', columns: [
      'unidades_plan_1', 'precio_proyectado_1', 'venta_bruta_plan_1', 
      'porcentaje__desc_merc_1', 'descuento_merc_1', 'porcentaje__desc_ben_1', 
      'descuento_ben_1', 'venta_plan_1'
    ]},
    { number: 2, name: 'Feb', columns: [
      'unidades_plan_2', 'precio_proyectado_2', 'venta_bruta_plan_2', 
      'porcentaje__desc_merc_2', 'descuento_merc_2', 'porcentaje__desc_ben_2', 
      'descuento_ben_2', 'venta_plan_2'
    ]},
    { number: 3, name: 'Mar', columns: [
      'unidades_plan_3', 'precio_proyectado_3', 'venta_bruta_plan_3', 
      'porcentaje__desc_merc_3', 'descuento_merc_3', 'porcentaje__desc_ben_3', 
      'descuento_ben_3', 'venta_plan_3'
    ]},
    { number: 4, name: 'Abr', columns: [
      'unidades_plan_4', 'precio_proyectado_4', 'venta_bruta_plan_4', 
      'porcentaje__desc_merc_4', 'descuento_merc_4', 'porcentaje__desc_ben_4', 
      'descuento_ben_4', 'venta_plan_4'
    ]},
    { number: 5, name: 'May', columns: [
      'unidades_plan_5', 'precio_proyectado_5', 'venta_bruta_plan_5', 
      'porcentaje__desc_merc_5', 'descuento_merc_5', 'porcentaje__desc_ben_5', 
      'descuento_ben_5', 'venta_plan_5'
    ]},
    { number: 6, name: 'Jun', columns: [
      'unidades_plan_6', 'precio_proyectado_6', 'venta_bruta_plan_6', 
      'porcentaje__desc_merc_6', 'descuento_merc_6', 'porcentaje__desc_ben_6', 
      'descuento_ben_6', 'venta_plan_6'
    ]},
    { number: 7, name: 'Jul', columns: [
      'unidades_plan_7', 'precio_proyectado_7', 'venta_bruta_plan_7', 
      'porcentaje__desc_merc_7', 'descuento_merc_7', 'porcentaje__desc_ben_7', 
      'descuento_ben_7', 'venta_plan_7'
    ]},
    { number: 8, name: 'Ago', columns: [
      'unidades_plan_8', 'precio_proyectado_8', 'venta_bruta_plan_8', 
      'porcentaje__desc_merc_8', 'descuento_merc_8', 'porcentaje__desc_ben_8', 
      'descuento_ben_8', 'venta_plan_8'
    ]},
    { number: 9, name: 'Sep', columns: [
      'unidades_plan_9', 'precio_proyectado_9', 'venta_bruta_plan_9', 
      'porcentaje__desc_merc_9', 'descuento_merc_9', 'porcentaje__desc_ben_9', 
      'descuento_ben_9', 'venta_plan_9'
    ]},
    { number: 10, name: 'Oct', columns: [
      'unidades_plan_10', 'precio_proyectado_10', 'venta_bruta_plan_10', 
      'porcentaje__desc_merc_10', 'descuento_merc_10', 'porcentaje__desc_ben_10', 
      'descuento_ben_10', 'venta_plan_10'
    ]},
    { number: 11, name: 'Nov', columns: [
      'unidades_plan_11', 'precio_proyectado_11', 'venta_bruta_plan_11', 
      'porcentaje__desc_merc_11', 'descuento_merc_11', 'porcentaje__desc_ben_11', 
      'descuento_ben_11', 'venta_plan_11'
    ]},
    { number: 12, name: 'Dic', columns: [
      'unidades_plan_12', 'precio_proyectado_12', 'venta_bruta_plan_12', 
      'porcentaje__desc_merc_12', 'descuento_merc_12', 'porcentaje__desc_ben_12', 
      'descuento_ben_12', 'venta_plan_12'
    ]}
  ]
} as const;

// Tipos para validación
export interface ValidationError {
  rowIndex: number;
  monthNumber: number;
  missingColumns: string[];
  message: string;
}

export interface MonthValidationResult {
  monthNumber: number;
  monthName: string;
  isComplete: boolean;
  hasData: boolean;
  missingColumns: string[];
  errorCount: number;
  totalUnidades?: number; // Suma de unidades_plan_N del mes
  totalVentas?: number; // Suma de venta_plan_N del mes
}

export interface CountryValidationResult {
  availableMonths: number[];
  incompleteMonths: Map<number, number[]>; // monthNumber -> array of row indices
  validationErrors: ValidationError[];
  totalErrors: number;
  monthsMetadata: MonthValidationResult[];
  ventasByMonth?: number[]; // Array de 12 posiciones con totales de ventas
  unidadesByMonth?: number[]; // Array de 12 posiciones con totales de unidades
}

/**
 * Verifica si un valor tiene datos válidos (no null, undefined, vacío o 0)
 */
export function hasValidData(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return value !== 0;
  return true;
}

/**
 * Parsea un valor numérico de una columna SUIC
 */
function parseNumericValue(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.trim();
    if (cleaned === '') return 0;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Detecta qué meses tienen al menos una columna con datos en un registro
 */
export function detectAvailableMonths(record: Record<string, any>): number[] {
  const availableMonths: number[] = [];
  
  SUIC_MONTHS_CONFIG.MONTHS.forEach(month => {
    const hasAnyData = month.columns.some(column => 
      hasValidData(record[column])
    );
    
    if (hasAnyData) {
      availableMonths.push(month.number);
    }
  });
  
  return availableMonths;
}

/**
 * Valida que todas las columnas de un mes específico tengan datos
 */
export function validateMonthCompleteness(
  record: Record<string, any>, 
  monthNumber: number
): { isComplete: boolean; missingColumns: string[] } {
  const monthConfig = SUIC_MONTHS_CONFIG.MONTHS.find(m => m.number === monthNumber);
  
  if (!monthConfig) {
    throw new Error(`Mes ${monthNumber} no válido`);
  }
  
  const missingColumns: string[] = [];
  
  monthConfig.columns.forEach(column => {
    if (!hasValidData(record[column])) {
      missingColumns.push(column);
    }
  });
  
  return {
    isComplete: missingColumns.length === 0,
    missingColumns
  };
}

/**
 * Valida todos los datos de un país y retorna metadata completa
 */
export function validateCountryData(dataArray: Record<string, any>[]): CountryValidationResult {
  const availableMonths = new Set<number>();
  const incompleteMonths = new Map<number, number[]>();
  const validationErrors: ValidationError[] = [];
  const monthsMetadata: MonthValidationResult[] = [];
  
  // Procesar cada registro
  dataArray.forEach((record, rowIndex) => {
    const recordAvailableMonths = detectAvailableMonths(record);
    
    // Agregar meses disponibles al set global
    recordAvailableMonths.forEach(monthNumber => {
      availableMonths.add(monthNumber);
    });
    
    // Validar completitud de cada mes con datos
    recordAvailableMonths.forEach(monthNumber => {
      const validation = validateMonthCompleteness(record, monthNumber);
      
      if (!validation.isComplete) {
        // Agregar a meses incompletos
        if (!incompleteMonths.has(monthNumber)) {
          incompleteMonths.set(monthNumber, []);
        }
        incompleteMonths.get(monthNumber)!.push(rowIndex);
        
        // Crear error de validación
        validationErrors.push({
          rowIndex,
          monthNumber,
          missingColumns: validation.missingColumns,
          message: `Mes ${monthNumber}: Faltan columnas ${validation.missingColumns.join(', ')}`
        });
      }
    });
  });
  
  // Calcular totales por mes (ventas y unidades)
  const ventasByMonth = new Array(12).fill(0);
  const unidadesByMonth = new Array(12).fill(0);
  
  dataArray.forEach(record => {
    for (let month = 1; month <= 12; month++) {
      // Sumar ventas
      const ventaField = `venta_plan_${month}`;
      const ventaValue = parseNumericValue(record[ventaField]);
      ventasByMonth[month - 1] += ventaValue;
      
      // Sumar unidades
      const unidadesField = `unidades_plan_${month}`;
      const unidadesValue = parseNumericValue(record[unidadesField]);
      unidadesByMonth[month - 1] += unidadesValue;
    }
  });
  
  // Generar metadata por mes
  SUIC_MONTHS_CONFIG.MONTHS.forEach(month => {
    const monthNumber = month.number;
    const hasData = availableMonths.has(monthNumber);
    const incompleteRows = incompleteMonths.get(monthNumber) || [];
    
    monthsMetadata.push({
      monthNumber,
      monthName: month.name,
      isComplete: hasData && incompleteRows.length === 0,
      hasData,
      missingColumns: [], // Se llena dinámicamente si es necesario
      errorCount: incompleteRows.length,
      totalUnidades: unidadesByMonth[monthNumber - 1] > 0 ? unidadesByMonth[monthNumber - 1] : undefined,
      totalVentas: ventasByMonth[monthNumber - 1] > 0 ? ventasByMonth[monthNumber - 1] : undefined
    });
  });
  
  return {
    availableMonths: Array.from(availableMonths).sort((a, b) => a - b),
    incompleteMonths,
    validationErrors,
    totalErrors: validationErrors.length,
    monthsMetadata,
    ventasByMonth,
    unidadesByMonth
  };
}

/**
 * Valida un chunk de datos de manera optimizada
 */
export function validateDataChunk(
  dataChunk: Record<string, any>[], 
  startIndex: number = 0
): CountryValidationResult {
  // Crear array con índices correctos
  const indexedChunk = dataChunk.map((record, index) => ({
    ...record,
    _originalIndex: startIndex + index
  }));
  
  return validateCountryData(indexedChunk);
}

/**
 * Combina resultados de múltiples chunks de validación
 */
export function combineValidationResults(
  results: CountryValidationResult[]
): CountryValidationResult {
  const combinedAvailableMonths = new Set<number>();
  const combinedIncompleteMonths = new Map<number, number[]>();
  const combinedValidationErrors: ValidationError[] = [];
  let totalErrors = 0;
  
  results.forEach(result => {
    // Combinar meses disponibles
    result.availableMonths.forEach(month => {
      combinedAvailableMonths.add(month);
    });
    
    // Combinar meses incompletos
    result.incompleteMonths.forEach((rows, month) => {
      if (!combinedIncompleteMonths.has(month)) {
        combinedIncompleteMonths.set(month, []);
      }
      combinedIncompleteMonths.get(month)!.push(...rows);
    });
    
    // Combinar errores
    combinedValidationErrors.push(...result.validationErrors);
    totalErrors += result.totalErrors;
  });
  
  // Combinar totales por mes
  const combinedVentasByMonth = new Array(12).fill(0);
  const combinedUnidadesByMonth = new Array(12).fill(0);
  
  results.forEach(result => {
    if (result.ventasByMonth) {
      result.ventasByMonth.forEach((venta, index) => {
        combinedVentasByMonth[index] += venta;
      });
    }
    if (result.unidadesByMonth) {
      result.unidadesByMonth.forEach((unidades, index) => {
        combinedUnidadesByMonth[index] += unidades;
      });
    }
  });
  
  // Generar metadata final
  const monthsMetadata: MonthValidationResult[] = SUIC_MONTHS_CONFIG.MONTHS.map(month => {
    const monthNumber = month.number;
    const hasData = combinedAvailableMonths.has(monthNumber);
    const incompleteRows = combinedIncompleteMonths.get(monthNumber) || [];
    
    return {
      monthNumber,
      monthName: month.name,
      isComplete: hasData && incompleteRows.length === 0,
      hasData,
      missingColumns: [],
      errorCount: incompleteRows.length,
      totalUnidades: combinedUnidadesByMonth[monthNumber - 1] > 0 ? combinedUnidadesByMonth[monthNumber - 1] : undefined,
      totalVentas: combinedVentasByMonth[monthNumber - 1] > 0 ? combinedVentasByMonth[monthNumber - 1] : undefined
    };
  });
  
  return {
    availableMonths: Array.from(combinedAvailableMonths).sort((a, b) => a - b),
    incompleteMonths: combinedIncompleteMonths,
    validationErrors: combinedValidationErrors,
    totalErrors,
    monthsMetadata,
    ventasByMonth: combinedVentasByMonth,
    unidadesByMonth: combinedUnidadesByMonth
  };
}
