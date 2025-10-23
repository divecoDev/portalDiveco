<!-- 3a57c11c-a448-486c-a410-56de92ca6caa f6be99a1-1295-4287-a7d4-f001fad61371 -->
# Guardar Datos SUIC en MySQL con Amplify Gen 2

## Objetivo

Crear un sistema para persistir datos SUIC desde IndexedDB a MySQL, procesando por país y por lotes para mejor control y visualización del progreso.

## Arquitectura

### Flujo de Datos

1. Usuario carga Excel → IndexedDB (temporal)
2. Usuario presiona "Guardar" → Procesar por país
3. Por cada país → Dividir en lotes de 500 registros
4. Por cada lote → Lambda → MySQL
5. Actualizar UI con progreso en tiempo real

## Cambios Requeridos

### 1. Crear Lambda Function de Amplify Gen 2

**Archivo**: `amplify/functions/suic/handler.ts` (nuevo)

Crear función Lambda similar a `carga-insumos/saveBatch/handler.ts`:

```typescript
interface SuicBatchRequest {
  suicId: string;
  paisCode: string;
  data: any[];
  batchIndex: number;
  totalBatches: number;
  deleteExisting: boolean; // true si es el primer batch de un país
}

interface SuicBatchResponse {
  success: boolean;
  suicId: string;
  paisCode: string;
  batchIndex: number;
  totalBatches: number;
  processedRecords: number;
  message: string;
  errors?: any[];
}

export const handler = async (event: SuicBatchRequest): Promise<SuicBatchResponse>
```

Funcionalidades:

- Conectar a MySQL usando variables de entorno (MYSQL_HOST, MYSQL_USER, etc.)
- Si `deleteExisting === true`: Ejecutar `DELETE FROM suic WHERE id_suic = ? AND pais = ?`
- Insertar registros en lotes usando prepared statements
- Retornar progreso y errores
- Manejo robusto de errores con rollback si es necesario

Mapeo de columnas Excel → MySQL:

- Todas las 119 columnas del Excel
- `id_suic`: ID del registro SUIC de Amplify
- `pais`: Código de país (GT, SV, HN, NI, CR, PA)
- `centro`: ID del centro
- Las 12 repeticiones de unidades_plan, precio_proyectado, etc.

### 2. Registrar Lambda en Amplify Backend

**Archivo**: `amplify/backend.ts`

Agregar la nueva función:

```typescript
import { suicSaveBatch } from './functions/suic/resource';

export const backend = defineBackend({
  // ... otros recursos
  suicSaveBatch
});
```

### 3. Crear Resource Definition

**Archivo**: `amplify/functions/suic/resource.ts` (nuevo)

```typescript
import { defineFunction } from '@aws-amplify/backend';

export const suicSaveBatch = defineFunction({
  name: 'suicSaveBatch',
  entry: './handler.ts',
  timeoutSeconds: 900, // 15 minutos para lotes grandes
  environment: {
    MYSQL_HOST: process.env.MYSQL_HOST || '',
    MYSQL_USER: process.env.MYSQL_USER || '',
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
    MYSQL_DATABASE: process.env.MYSQL_DATABASE || '',
    MYSQL_PORT: process.env.MYSQL_PORT || '3306',
    MYSQL_SSL: process.env.MYSQL_SSL || 'true'
  }
});
```

### 4. Agregar Mutation a GraphQL Schema

**Archivo**: `amplify/data/resource.ts`

Agregar custom mutation:

```typescript
.query("saveSuicBatch", {
  arguments: {
    suicId: a.string().required(),
    paisCode: a.string().required(),
    data: a.json().required(),
    batchIndex: a.integer().required(),
    totalBatches: a.integer().required(),
    deleteExisting: a.boolean().required()
  },
  returns: a.json(),
  authorization: [allow.authenticated()],
  handler: a.handler.function(suicSaveBatch)
})
```

### 5. Crear Composable para Guardar en MySQL

**Archivo**: `app/composables/useSuicMySQL.ts` (nuevo)

```typescript
export const useSuicMySQL = () => {
  const BATCH_SIZE = 500; // Registros por lote

  const saveSuicToMySQL = async (
    suicId: string,
    paisCode: string,
    data: any[],
    onProgress?: (batchIndex: number, totalBatches: number) => void
  ) => {
    // Dividir datos en lotes
    const batches = [];
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      batches.push(data.slice(i, i + BATCH_SIZE));
    }

    const totalBatches = batches.length;
    const results = [];

    // Procesar cada lote
    for (let i = 0; i < batches.length; i++) {
      const deleteExisting = i === 0; // Solo borrar en el primer batch
      
      const result = await client.queries.saveSuicBatch({
        suicId,
        paisCode,
        data: JSON.stringify(batches[i]),
        batchIndex: i,
        totalBatches,
        deleteExisting
      });

      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, totalBatches);
      }
    }

    return results;
  };

  return {
    saveSuicToMySQL
  };
};
```

### 6. Actualizar SuicCountryIndicators Component

**Archivo**: `app/components/suic/SuicCountryIndicators.vue`

Agregar estados de guardado a las tarjetas:

Estados posibles:

- `not-saved`: Sin procesar (color gris)
- `saving`: Guardando (barra de progreso)
- `saved`: Guardado (color verde con checkmark)
- `error`: Error (color rojo con icono de error)
```vue
<template>
  <!-- Agregar props para estados -->
  const props = defineProps({
    loadedCounts: Object,
    saveStates: Object, // { GT: { status: 'saving', progress: 0.5 } }
  })

  <!-- En cada tarjeta de país -->
  <div v-if="loadedCounts[pais.code]" class="mt-2">
    <!-- Cantidad de registros -->
    <div class="flex items-center justify-center mb-2">
      <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-green-600 mr-1" />
      <p class="text-lg font-bold text-green-600">
        {{ loadedCounts[pais.code].toLocaleString() }}
      </p>
    </div>

    <!-- Estado de guardado -->
    <div v-if="saveStates[pais.code]" class="mb-2">
      <!-- Guardando con barra de progreso -->
      <div v-if="saveStates[pais.code].status === 'saving'" class="space-y-1">
        <div class="flex items-center justify-center gap-1 text-xs text-blue-600">
          <UIcon name="i-heroicons-arrow-path" class="w-3 h-3 animate-spin" />
          Guardando...
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            :style="{ width: `${saveStates[pais.code].progress * 100}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 text-center">
          {{ Math.round(saveStates[pais.code].progress * 100) }}%
        </p>
      </div>

      <!-- Guardado exitoso -->
      <div v-else-if="saveStates[pais.code].status === 'saved'" 
           class="flex items-center justify-center gap-1 text-xs text-green-600">
        <UIcon name="i-heroicons-check-circle" class="w-3 h-3" />
        Guardado
      </div>

      <!-- Error -->
      <div v-else-if="saveStates[pais.code].status === 'error'" 
           class="flex items-center justify-center gap-1 text-xs text-red-600">
        <UIcon name="i-heroicons-x-circle" class="w-3 h-3" />
        Error
      </div>

      <!-- Sin procesar -->
      <div v-else class="flex items-center justify-center gap-1 text-xs text-gray-500">
        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
        Sin procesar
      </div>
    </div>

    <!-- Botón limpiar (solo si no está guardando) -->
    <button
      v-if="!saveStates[pais.code] || saveStates[pais.code].status !== 'saving'"
      @click="$emit('clear-country', pais.code)"
      class="w-full flex items-center justify-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded transition-colors"
    >
      <UIcon name="i-heroicons-trash" class="w-3 h-3" />
      Limpiar
    </button>
  </div>
</template>
```


### 7. Actualizar CargaPlantillaSUIC Component

**Archivo**: `app/components/suic/CargaPlantillaSUIC.vue`

Agregar botón "Guardar en Base de Datos" y lógica de procesamiento:

```vue
<template>
  <!-- Agregar botón de guardar -->
  <div class="flex justify-center mb-6 gap-4">
    <button
      @click="downloadTemplate"
      class="..."
    >
      Descargar Plantilla
    </button>
    
    <button
      @click="showUploadModal = true"
      class="..."
    >
      Cargar Archivo Excel
    </button>

    <!-- Nuevo botón guardar -->
    <button
      v-if="hasDataToSave"
      @click="handleSaveToMySQL"
      :disabled="isSaving"
      class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5" />
      {{ isSaving ? 'Guardando...' : 'Guardar en Base de Datos' }}
    </button>
  </div>

  <!-- Pasar saveStates al componente de indicadores -->
  <SuicCountryIndicators 
    :loaded-counts="loadedCounts"
    :save-states="saveStates"
    @clear-country="handleClearCountry"
    @clear-all="handleClearAll"
  />
</template>

<script setup>
import { useSuicIndexedDB } from '~/composables/useSuicIndexedDB';
import { useSuicMySQL } from '~/composables/useSuicMySQL';

const { loadData: loadFromIndexedDB } = useSuicIndexedDB();
const { saveSuicToMySQL } = useSuicMySQL();

const saveStates = ref({});
const isSaving = ref(false);

const hasDataToSave = computed(() => {
  return Object.keys(loadedCounts.value).length > 0;
});

const handleSaveToMySQL = async () => {
  isSaving.value = true;

  try {
    // Cargar datos de IndexedDB
    const allData = await loadFromIndexedDB(props.suicId);

    // Procesar cada país
    for (const [paisCode, data] of Object.entries(allData)) {
      // Inicializar estado
      saveStates.value[paisCode] = {
        status: 'saving',
        progress: 0
      };

      try {
        // Guardar con callback de progreso
        await saveSuicToMySQL(
          props.suicId,
          paisCode,
          data,
          (batchIndex, totalBatches) => {
            saveStates.value[paisCode].progress = batchIndex / totalBatches;
          }
        );

        // Marcar como guardado
        saveStates.value[paisCode] = {
          status: 'saved',
          progress: 1
        };

        useToast().add({
          title: `${paisCode} guardado`,
          description: `${data.length} registros guardados exitosamente`,
          color: 'green'
        });

      } catch (error) {
        console.error(`Error guardando ${paisCode}:`, error);
        saveStates.value[paisCode] = {
          status: 'error',
          progress: 0
        };

        useToast().add({
          title: `Error en ${paisCode}`,
          description: error.message,
          color: 'red'
        });
      }
    }

    useToast().add({
      title: 'Proceso completado',
      description: 'Todos los datos han sido procesados',
      color: 'blue'
    });

  } catch (error) {
    console.error('Error general:', error);
    useToast().add({
      title: 'Error',
      description: 'Error guardando datos en MySQL',
      color: 'red'
    });
  } finally {
    isSaving.value = false;
  }
};
</script>
```

### 8. Agregar package.json a Lambda

**Archivo**: `amplify/functions/suic/package.json` (nuevo)

```json
{
  "name": "suic-save-batch",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "mysql2": "^3.6.5"
  }
}
```

### 9. Agregar tsconfig.json a Lambda

**Archivo**: `amplify/functions/suic/tsconfig.json` (nuevo)

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2020",
    "moduleResolution": "node"
  }
}
```

## Estrategia de Guardado

### Por País y Por Lotes

1. **Dividir por país**: Procesar cada país independientemente
2. **Dividir en lotes**: 500 registros por lote para evitar timeouts
3. **Primer lote**: Borrar datos existentes de ese país+suicId
4. **Lotes subsiguientes**: Solo insertar

### Manejo de Reemplazo

- Al resubir datos de un país: `DELETE FROM suic WHERE id_suic = ? AND pais = ?`
- Solo se borran datos del país específico
- Otros países permanecen intactos

### Progreso en UI

- Barra de progreso por país
- Estados: Sin procesar → Guardando → Guardado/Error
- Deshabilitar acciones mientras se guarda

## Beneficios

- Procesamiento paralelo por país
- Control granular del progreso
- Tolerancia a fallos por país
- UI responsive con feedback en tiempo real
- Reemplazo selectivo de datos
- Escalable a grandes volúmenes

## Testing

1. Cargar archivo pequeño (< 500 registros por país)
2. Verificar guardado exitoso
3. Cargar archivo grande (> 500 registros por país)
4. Verificar división en lotes
5. Re-cargar mismo país
6. Verificar reemplazo correcto

### To-dos

- [ ] Crear amplify/functions/suic/handler.ts con lógica de guardado en MySQL
- [ ] Crear amplify/functions/suic/resource.ts para definición de función
- [ ] Actualizar amplify/backend.ts para registrar nueva función
- [ ] Agregar mutation saveSuicBatch en amplify/data/resource.ts
- [ ] Crear app/composables/useSuicMySQL.ts para interacción con Lambda
- [ ] Actualizar app/components/suic/SuicCountryIndicators.vue con estados y barras de progreso
- [ ] Actualizar app/components/suic/CargaPlantillaSUIC.vue con botón guardar y lógica de procesamiento
- [ ] Crear amplify/functions/suic/package.json y tsconfig.json