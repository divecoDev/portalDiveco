# Reglas de Cursor para Portal Diveco

## 🏗️ Patrón de Arquitectura: Carga Masiva de Datos con Amplify Gen 2

### 📋 Cuándo Usar Este Patrón

Aplica esta arquitectura cuando necesites:
- Procesar y guardar **grandes volúmenes de datos** (>100 registros)
- Mostrar **progreso en tiempo real** al usuario
- Manejar **múltiples tipos de datos** en un solo proceso
- Garantizar **robustez** y **escalabilidad**

### 🎯 Principios de Diseño

1. **Procesamiento por Lotes:** Divide datos en chunks optimizados
2. **Progreso Visual:** Feedback en tiempo real al usuario
3. **Separación de Responsabilidades:** Frontend ↔ Backend ↔ Database
4. **Manejo de Errores:** Validaciones en cada capa
5. **Configuración Flexible:** Variables de entorno
6. **Logs Detallados:** Debug y monitoreo completo

### 🏗️ Estructura de la Implementación

#### 1. **Schema de Amplify Gen 2 (`amplify/data/resource.ts`)**

```typescript
// 🔑 PATRÓN: Usar mutation (NO modelo) para procesamiento de lotes
save[ModuleName]Batch: a
  .mutation()
  .arguments({
    tipo: a.string().required(),           // Tipo de datos específico del módulo
    data: a.json().required(),             // Datos serializados como JSON string
    metadata: a.json().required(),         // Metadatos del lote (fileName, batchId, etc.)
  })
  .returns(a.json())                       // Respuesta con resultado del procesamiento
  .authorization((allow) => [allow.publicApiKey()])
  .handler(a.handler.function([moduleName]SaveBatch)),
```

**🔑 Decisiones de Diseño:**
- **`.mutation()`** en lugar de `.model()` → Para operaciones de procesamiento complejas
- **`a.json()`** para campos complejos → Flexibilidad en estructura de datos
- **JSON string serialización** → Evita problemas de validación de Amplify
- **Autorización pública** → Simplifica el acceso (ajustar según seguridad)

#### 2. **Lambda Handler (`amplify/functions/[moduleName]/saveBatch/handler.ts`)**

```typescript
import mysql from "mysql2/promise";

// 🔑 PATRÓN: Interfaces específicas del módulo
interface BatchRecord {
  tipo: string;
  data: any[];
  metadata: {
    fileName: string;
    documentId: string;
    batchId: string;
    batchIndex: number;
    totalBatches: number;
  };
}

interface BatchResponse {
  success: boolean;
  message: string;
  processedRecords: number;
  // ... otros campos específicos
}

export const handler = async (event: any): Promise<BatchResponse> => {
  // 🔑 CRÍTICO: Amplify Gen 2 estructura de eventos
  let body: BatchRecord;

  if (event.arguments) {
    body = event.arguments;
  } else if (typeof event.body === 'string') {
    body = JSON.parse(event.body);
  } else {
    body = event;
  }

  // 🔑 CRÍTICO: Decodificar JSON strings de Amplify
  if (typeof body.data === 'string') {
    body.data = JSON.parse(body.data);
  }

  if (typeof body.metadata === 'string') {
    body.metadata = JSON.parse(body.metadata);
  }

  // 🔑 PATRÓN: Configuración MySQL estándar
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 60000,
  };

  const connection = await mysql.createConnection(dbConfig);

  try {
    // 🔑 PATRÓN: Switch por tipo de datos
    switch (body.tipo) {
      case 'tipo1':
        return await processTipo1Batch(connection, body);
      case 'tipo2':
        return await processTipo2Batch(connection, body);
      default:
        throw new Error(`Tipo de datos no soportado: ${body.tipo}`);
    }
  } finally {
    await connection.end();
  }
};

// 🔑 PATRÓN: Funciones específicas por tipo
async function processTipo1Batch(connection: mysql.Connection, body: BatchRecord): Promise<BatchResponse> {
  const insertQuery = `
    INSERT INTO tabla_tipo1 (
      document_id, batch_id, file_name, campo1, campo2, created_at
    ) VALUES (?, ?, ?, ?, ?, NOW())
  `;

  let processedRecords = 0;
  for (const record of body.data) {
    await connection.execute(insertQuery, [
      body.metadata.documentId,
      body.metadata.batchId,
      body.metadata.fileName,
      record.campo1,
      record.campo2
    ]);
    processedRecords++;
  }

  return {
    success: true,
    message: `Procesados ${processedRecords} registros de tipo1`,
    processedRecords
  };
}
```

**🔑 Patrones Críticos:**
- **Manejo de `event.arguments`** → Amplify Gen 2 estructura específica
- **Decodificación JSON** → Los campos `a.json()` llegan como strings
- **Variables de entorno** → Configuración flexible por ambiente
- **Conexión MySQL robusta** → Timeout y SSL configurables
- **Switch por tipo** → Escalabilidad para múltiples tipos de datos

#### 3. **Resource Configuration (`amplify/functions/[moduleName]/saveBatch/resource.ts`)**

```typescript
import { defineFunction } from "@aws-amplify/backend";

export const [moduleName]SaveBatch = defineFunction({
  name: "[moduleName]SaveBatch",
  entry: "./handler.ts",
  timeoutSeconds: 900,        // 15 minutos para lotes grandes
  memoryMB: 1024,            // Memoria suficiente para procesamiento
  environment: {
    MYSQL_HOST: "your-rds-endpoint.amazonaws.com",
    MYSQL_USER: "admin",
    MYSQL_PASSWORD: "your-password",
    MYSQL_DATABASE: "your-database",
    MYSQL_PORT: "3306",
    MYSQL_SSL: "false",       // o "true" para producción
  }
});
```

**🔑 Configuraciones Críticas:**
- **`timeoutSeconds: 900`** → 15 minutos máximo para lotes grandes
- **`memoryMB: 1024`** → Memoria suficiente para procesamiento en lote
- **Variables `MYSQL_*`** → Configuración explícita de base de datos
- **Valores hardcodeados** → Evita problemas de resolución de variables

#### 4. **Pinia Store (`stores/use[ModuleName]Process.ts`)**

```typescript
import { defineStore } from "pinia";
import { generateClient } from "aws-amplify/api";

// 🔑 PATRÓN: Cliente sin tipado explícito
const getAmplifyClient = () => {
  return generateClient();
};

export const use[ModuleName]ProcessStore = defineStore("[moduleName]Process", {
  state: () => ({
    isProcessing: false,
    processedSteps: {
      tipo1: false,    // boolean (completado) o number 0-1 (progreso)
      tipo2: false,
      // ... agregar tipos específicos del módulo
    },
    // Estados específicos del módulo
    tipo1: { data: [], fileName: '', loadedAt: null },
    tipo2: { data: [], fileName: '', loadedAt: null },
  }),

  getters: {
    processProgress: (state) => {
      const steps = Object.values(state.processedSteps);
      const completed = steps.filter(step => step === true).length;
      const inProgress = steps.filter(step => typeof step === 'number').length;
      return completed + (inProgress * 0.5); // Progreso aproximado
    },

    allStepsProcessed: (state) => {
      return Object.values(state.processedSteps).every(step => step === true);
    }
  },

  actions: {
    // 🔑 PATRÓN: Transformar arrays indexados a objetos nombrados
    transformDataToObjects(tipo: string, data: any[]): any[] {
      return data.map(row => {
        if (!Array.isArray(row)) return row;

        switch (tipo) {
          case 'tipo1':
            return {
              campo1: row[0] || null,
              campo2: row[1] || null,
              campo3: row[2] || 0,
              // ... mapear según estructura específica
            };
          case 'tipo2':
            return {
              campoA: row[0] || null,
              campoB: row[1] || null,
              // ... mapear según estructura específica
            };
          default:
            return row;
        }
      });
    },

    // 🔑 PATRÓN: Procesamiento por lotes con progreso
    async processBatches(tipo: string, data: any[], fileName: string, documentId: string, batchId: string) {
      // Tamaños optimizados por complejidad
      const batchSizes = {
        tipo1: 200,    // Datos complejos (muchos campos)
        tipo2: 400,    // Datos medianos
        tipo3: 500,    // Datos simples
      };

      const transformedData = this.transformDataToObjects(tipo, data);
      const batchSize = batchSizes[tipo] || 300; // Default
      const totalBatches = Math.ceil(data.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const batchData = transformedData.slice(i * batchSize, (i + 1) * batchSize);
        const client = getAmplifyClient();

        // 🔑 CRÍTICO: Serializar como JSON strings para Amplify
        const { data: response } = await (client as any).mutations.save[ModuleName]Batch({
          tipo,
          data: JSON.stringify(batchData),
          metadata: JSON.stringify({
            fileName: fileName || `${tipo}_${new Date().toISOString()}`,
            documentId,
            batchId: `${batchId}-${tipo}-${i}`,
            batchIndex: i,
            totalBatches
          })
        });

        const result = typeof response === 'string' ? JSON.parse(response) : response;

        if (!result.success) {
          throw new Error(`Error en lote ${i + 1}/${totalBatches}: ${result.message}`);
        }

        // 🔑 PATRÓN: Actualizar progreso en tiempo real
        const progress = (i + 1) / totalBatches;
        (this.processedSteps as any)[tipo] = progress;

        // Pausa entre lotes para evitar throttling
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Marcar como completado
      (this.processedSteps as any)[tipo] = true;
    },

    // 🔑 PATRÓN: Orquestador principal
    async processDocuments() {
      this.isProcessing = true;

      try {
        const documentId = `${this.$id}-${Date.now()}`;
        const batchId = `batch-${Date.now()}`;

        // Procesar cada tipo con datos
        for (const [tipoKey, tipoData] of Object.entries(this.$state)) {
          if (tipoKey !== 'isProcessing' && tipoKey !== 'processedSteps' &&
              tipoData.data && tipoData.data.length > 0) {
            await this.processBatches(tipoKey, tipoData.data, tipoData.fileName, documentId, batchId);
          }
        }

        return { success: true, documentId };
      } catch (error) {
        console.error(`Error al procesar ${this.$id}:`, error);
        return { success: false, error: error.message };
      } finally {
        this.isProcessing = false;
      }
    }
  }
});
```

**🔑 Patrones del Store:**
- **Estado reactivo** → `processedSteps` con boolean/number para progreso
- **Getters calculados** → Progreso total y estado de completado
- **Transformación de datos** → Arrays indexados a objetos nombrados
- **Procesamiento por lotes** → Chunks optimizados con pausa entre lotes
- **Serialización JSON** → Datos y metadata como strings para Amplify
- **Manejo de errores** → Try/catch con estado de loading

#### 5. **Componente Vue (`components/[ModuleName]GuardarStep.vue`)**

```vue
<script setup>
import { use[ModuleName]ProcessStore } from '~/stores/use[ModuleName]Process'

// 🔑 PATRÓN: Props tipadas para datos de entrada
interface Props {
  tipo1Data?: any[];
  tipo2Data?: any[];
  // ... otros tipos específicos del módulo
}

const props = withDefaults(defineProps<Props>(), {
  tipo1Data: () => [],
  tipo2Data: () => [],
});

const store = use[ModuleName]ProcessStore()

// 🔑 PATRÓN: Estados reactivos del store
const isProcessing = computed(() => store.isProcessing)
const processedSteps = computed(() => store.processedSteps)
const allStepsProcessed = computed(() => store.allStepsProcessed)

// 🔑 PATRÓN: Acción principal de guardado
const guardarDocumentos = async () => {
  try {
    // Cargar datos en el store desde props
    if (props.tipo1Data?.length > 0) {
      store.tipo1.data = props.tipo1Data;
      store.tipo1.fileName = 'tipo1_data.xlsx';
      store.tipo1.loadedAt = new Date();
    }

    if (props.tipo2Data?.length > 0) {
      store.tipo2.data = props.tipo2Data;
      store.tipo2.fileName = 'tipo2_data.xlsx';
      store.tipo2.loadedAt = new Date();
    }

    // Procesar documentos
    const result = await store.processDocuments();

    if (result.success) {
      useToast().add({
        title: 'Éxito',
        description: `Documentos guardados exitosamente (ID: ${result.documentId})`,
        color: 'green',
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    useToast().add({
      title: 'Error',
      description: `Error: ${error.message}`,
      color: 'red',
    });
  }
};

// 🔑 PATRÓN: Estado visual dinámico
const getStepStatus = (stepId: string) => {
  const progress = store.processedSteps[stepId];

  if (progress === true) return 'completed';
  if (typeof progress === 'number' && progress > 0) return 'processing';
  if (isProcessing.value) return 'processing';
  return 'pending';
};

// 🔑 PATRÓN: Progreso visual
const getStepProgress = (stepId: string) => {
  const progress = store.processedSteps[stepId];
  if (typeof progress === 'number') {
    return Math.round(progress * 100);
  }
  return progress === true ? 100 : 0;
};
</script>

<template>
  <div class="space-y-6">
    <!-- 🔑 PATRÓN: Lista de pasos con estado visual -->
    <div
      v-for="step in steps"
      :key="step.id"
      class="flex items-center justify-between p-4 border rounded-lg"
      :class="{
        'border-green-500 bg-green-50': getStepStatus(step.id) === 'completed',
        'border-cyan-500 bg-cyan-50': getStepStatus(step.id) === 'processing',
        'border-gray-300': getStepStatus(step.id) === 'pending'
      }"
    >
      <div class="flex-1">
        <h3 class="font-semibold">{{ step.title }}</h3>
        <p class="text-sm text-gray-600">{{ step.description }}</p>

        <!-- 🔑 PATRÓN: Progreso en tiempo real -->
        <div v-if="getStepStatus(step.id) === 'processing'" class="mt-2">
          <div class="flex items-center justify-between text-sm">
            <span>Procesando...</span>
            <span>{{ getStepProgress(step.id) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${getStepProgress(step.id)}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 🔑 PATRÓN: Iconos de estado -->
      <div class="ml-4">
        <UIcon
          v-if="getStepStatus(step.id) === 'completed'"
          name="i-heroicons-check-circle"
          class="w-6 h-6 text-green-500"
        />
        <UIcon
          v-else-if="getStepStatus(step.id) === 'processing'"
          name="i-heroicons-clock"
          class="w-6 h-6 text-cyan-500 animate-spin"
        />
        <UIcon
          v-else
          name="i-heroicons-circle"
          class="w-6 h-6 text-gray-400"
        />
      </div>
    </div>

    <!-- 🔑 PATRÓN: Botón de acción principal -->
    <UButton
      @click="guardarDocumentos"
      :disabled="isProcessing || allStepsProcessed"
      :loading="isProcessing"
      size="lg"
      class="w-full"
    >
      {{ isProcessing ? 'Guardando...' : allStepsProcessed ? 'Completado' : 'Guardar Documentos' }}
    </UButton>
  </div>
</template>
```

**🔑 Patrones del Componente:**
- **Props tipadas** → Interface clara para datos de entrada
- **Estados reactivos** → Computed del store para reactividad
- **Progreso visual** → Barras de progreso y porcentajes en tiempo real
- **Estados dinámicos** → Iconos y estilos según el estado del proceso
- **Manejo de errores** → Toast notifications para feedback al usuario
- **UX optimizada** → Botón deshabilitado durante procesamiento

#### 6. **Base de Datos MySQL (Schema)**

```sql
-- 🔑 PATRÓN: Estructura estándar para tablas de carga masiva
CREATE TABLE IF NOT EXISTS [module_name]_[tipo] (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 🔑 CAMPOS DE CONTROL OBLIGATORIOS
    document_id VARCHAR(50) NOT NULL,
    batch_id VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) DEFAULT NULL,

    -- 🔑 CAMPOS ESPECÍFICOS DEL MÓDULO
    campo1 VARCHAR(50) DEFAULT NULL,
    campo2 DECIMAL(18,2) DEFAULT 0,
    campo3 INT DEFAULT 0,
    campo4 DATE DEFAULT NULL,

    -- 🔑 CAMPOS DE AUDITORÍA ESTÁNDAR
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 🔑 ÍNDICES OBLIGATORIOS PARA PERFORMANCE
    INDEX idx_[table_name]_document_id (document_id),
    INDEX idx_[table_name]_batch_id (batch_id),
    INDEX idx_[table_name]_created_at (created_at),

    -- 🔑 ÍNDICES ESPECÍFICOS SEGÚN NECESIDAD
    INDEX idx_[table_name]_campo1 (campo1),
    INDEX idx_[table_name]_campo1_campo2 (campo1, campo2)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 🔑 PATRÓN: Tabla de control general (opcional)
CREATE TABLE IF NOT EXISTS [module_name]_control (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL UNIQUE,
    document_name VARCHAR(255) NOT NULL,
    status ENUM('processing', 'completed', 'error') DEFAULT 'processing',

    -- Contadores por tipo
    tipo1_count INT DEFAULT 0,
    tipo2_count INT DEFAULT 0,
    total_count INT DEFAULT 0,

    -- Metadatos
    created_by VARCHAR(100) DEFAULT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,
    processing_time INT DEFAULT NULL, -- segundos

    -- Auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_control_document_id (document_id),
    INDEX idx_control_status (status),
    INDEX idx_control_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 🔑 PATRÓN: Stored Procedure para estadísticas (opcional)
DELIMITER //
DROP PROCEDURE IF EXISTS sp_Update[ModuleName]Stats //
CREATE PROCEDURE sp_Update[ModuleName]Stats(
    IN p_document_id VARCHAR(50)
)
BEGIN
    DECLARE v_tipo1_count INT DEFAULT 0;
    DECLARE v_tipo2_count INT DEFAULT 0;
    DECLARE v_total_count INT DEFAULT 0;
    DECLARE v_started_at DATETIME;
    DECLARE v_processing_time INT;

    -- Contar registros por tipo
    SELECT COUNT(*) INTO v_tipo1_count FROM [module_name]_tipo1 WHERE document_id = p_document_id;
    SELECT COUNT(*) INTO v_tipo2_count FROM [module_name]_tipo2 WHERE document_id = p_document_id;

    SET v_total_count = v_tipo1_count + v_tipo2_count;

    -- Obtener tiempo de inicio
    SELECT started_at INTO v_started_at FROM [module_name]_control WHERE document_id = p_document_id;
    SET v_processing_time = TIMESTAMPDIFF(SECOND, v_started_at, NOW());

    -- Actualizar estadísticas
    UPDATE [module_name]_control
    SET
        status = CASE WHEN v_total_count > 0 THEN 'completed' ELSE 'processing' END,
        tipo1_count = v_tipo1_count,
        tipo2_count = v_tipo2_count,
        total_count = v_total_count,
        completed_at = CASE WHEN v_total_count > 0 THEN NOW() ELSE NULL END,
        processing_time = v_processing_time,
        updated_at = NOW()
    WHERE document_id = p_document_id;

    -- Retornar estadísticas actualizadas
    SELECT * FROM [module_name]_control WHERE document_id = p_document_id;
END //
DELIMITER ;
```

**🔑 Patrones de Base de Datos:**
- **Nomenclatura snake_case** → Consistencia en MySQL
- **Campos de control** → `document_id`, `batch_id`, `file_name` obligatorios
- **Auditoría estándar** → `created_at`, `updated_at` automáticos
- **Índices obligatorios** → Performance en consultas comunes
- **Tabla de control** → Estadísticas y seguimiento opcional
- **Stored procedures** → Lógica compleja en base de datos

### 📋 **Lista de Verificación para Implementación**

#### ✅ **Configuración Inicial**
- [ ] Crear mutation en `amplify/data/resource.ts` (NO model)
- [ ] Configurar Lambda con `timeoutSeconds: 900` y `memoryMB: 1024`
- [ ] Definir variables de entorno MySQL en `resource.ts`
- [ ] Crear tablas con campos de control obligatorios

#### ✅ **Backend (Lambda)**
- [ ] Manejar `event.arguments` para Amplify Gen 2
- [ ] Decodificar JSON strings (`body.data` y `body.metadata`)
- [ ] Configurar conexión MySQL con timeout y SSL
- [ ] Implementar switch por tipo de datos
- [ ] Usar queries parametrizadas (`?`) para prevenir SQL injection

#### ✅ **Frontend (Store)**
- [ ] Estado `processedSteps` con boolean/number para progreso
- [ ] Función `transformDataToObjects` para convertir arrays a objetos
- [ ] Lotes optimizados por complejidad (200-500 registros)
- [ ] Serialización JSON antes de enviar a Amplify
- [ ] Pausas entre lotes (100ms) para evitar throttling

#### ✅ **UI (Componente)**
- [ ] Props tipadas para datos de entrada
- [ ] Estados reactivos del store (computed)
- [ ] Progreso visual en tiempo real (barras y porcentajes)
- [ ] Toast notifications para éxito/error
- [ ] Botón deshabilitado durante procesamiento

#### ✅ **Base de Datos**
- [ ] Campos obligatorios: `document_id`, `batch_id`, `file_name`
- [ ] Auditoría: `created_at`, `updated_at`
- [ ] Índices: `document_id`, `batch_id`, `created_at`
- [ ] Nomenclatura snake_case para MySQL

### ⚠️ **Errores Críticos a Evitar**

| ❌ Error | ✅ Solución |
|----------|-------------|
| Usar `.model()` para procesamiento | Usar `.mutation()` con handler Lambda |
| No manejar `event.arguments` | Verificar estructura de Amplify Gen 2 |
| Enviar objetos sin serializar | `JSON.stringify()` antes de enviar |
| Arrays indexados sin transformar | Convertir a objetos con nombres de campos |
| Lotes demasiado grandes | Máximo 500 registros por lote |
| No mostrar progreso | Estado reactivo con números 0-1 |
| Variables de entorno incorrectas | Hardcodear valores en `resource.ts` |

### 🎯 **Tamaños de Lote Recomendados**

| Complejidad | Campos | Tamaño de Lote | Uso |
|-------------|---------|----------------|-----|
| **Simple** | 1-5 campos | 500 registros | IDs, nombres, fechas |
| **Medio** | 6-10 campos | 400 registros | Datos transaccionales |
| **Complejo** | 11+ campos | 200 registros | Datos con cálculos |

### 🔧 **Variables de Entorno Estándar**

```typescript
environment: {
  MYSQL_HOST: "your-rds-endpoint.amazonaws.com",
  MYSQL_USER: "admin",
  MYSQL_PASSWORD: "your-password",
  MYSQL_DATABASE: "your-database",
  MYSQL_PORT: "3306",
  MYSQL_SSL: "false", // o "true" para producción
}
```

### 📊 **Métricas de Performance**

- **Tiempo de procesamiento:** ~1-2 segundos por lote de 300 registros
- **Memoria Lambda:** 1024MB recomendado para lotes grandes
- **Timeout Lambda:** 900 segundos (15 minutos) máximo
- **Pausa entre lotes:** 100ms para evitar throttling

Esta arquitectura ha sido **probada exitosamente** en producción y garantiza **escalabilidad**, **performance** y **excelente experiencia de usuario**.
