export type ExplosionFileType =
  | 'aprovisionamiento'
  | 'modeloSemielaborados'
  | 'materiaPrimaSemielaborados'
  | 'planVentas'
  | 'planProduccion';

export const EXPLOSION_FILE_TYPES: ExplosionFileType[] = [
  'aprovisionamiento',
  'modeloSemielaborados',
  'materiaPrimaSemielaborados',
  'planVentas',
  'planProduccion',
];

export const explosionFileInfo: Record<ExplosionFileType, { fileName: string; startMessage: string }> = {
  aprovisionamiento: {
    fileName: 'AprovisionamientoConfigurado.csv',
    startMessage: '📊 Generando AprovisionamientoConfigurado.csv...',
  },
  modeloSemielaborados: {
    fileName: 'PlanModeloConSemielaborados.csv',
    startMessage: '📊 Generando PlanModeloConSemielaborados.csv...',
  },
  materiaPrimaSemielaborados: {
    fileName: 'PlanModeloMateriasPrimaConSemielaborados.csv',
    startMessage: '📊 Generando PlanModeloMateriasPrimaConSemielaborados.csv...',
  },
  planVentas: {
    fileName: 'PlanVentas.csv',
    startMessage: '📊 Generando PlanVentas.csv...',
  },
  planProduccion: {
    fileName: 'PlanProduccion.csv',
    startMessage: '📊 Generando PlanProduccion.csv...',
  },
};


