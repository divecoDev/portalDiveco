# Carga Masiva de Aprovisionamiento

## 📋 Descripción

Sistema completo de carga masiva de datos de aprovisionamiento mediante archivos Excel, implementado siguiendo los patrones establecidos en el proyecto Portal Diveco.

## 🏗️ Arquitectura

### Componentes Principales

1. **Frontend (Vue/Nuxt)**
   - `AprovisionamientoUploadModal.vue` - Modal de carga masiva
   - `index.vue` - Página de listado con integración del modal

2. **Backend (Amplify Gen 2)**
   - `handler.ts` - Función Lambda con operación `bulkCreate`
   - `resource.ts` - Definición de schema con soporte para carga masiva

3. **Base de Datos (MySQL)**
   - Tabla `aprovisionamiento` con validaciones
   - Uso de `INSERT IGNORE` para evitar duplicados

## 🎯 Flujo de Trabajo

### 1. Usuario selecciona archivo Excel

```mermaid
graph LR
    A[Usuario] --> B[Selecciona Excel]
    B --> C[Validación Cliente]
    C --> D[Muestra Preview]
    D --> E[Usuario Confirma]
```

### 2. Validación en Frontend

El componente valida:
- ✅ Encabezados correctos
- ✅ Tipos de datos
- ✅ Rangos de valores (porcentaje 0-100)
- ✅ Campos requeridos

### 3. Envío al Backend

```typescript
const { data } = await client.queries.aprovisionamiento({
  operation: 'bulkCreate',
  data: JSON.stringify(parsedData.value),
});
```

### 4. Procesamiento en Lambda

La función Lambda:
1. Parsea los datos JSON
2. Valida cada registro
3. Ejecuta INSERT IGNORE masivo
4. Retorna estadísticas

## 📁 Estructura del Archivo Excel

### Formato Requerido

| centro_id_origen | material_id | centro_id_aprov | porcentaje |
|-----------------|-------------|-----------------|------------|
| 1001            | 12345       | 2001            | 100.00     |
| 1001            | 12346       | 2001            | 75.00      |
| 1001            | 12346       | 2002            | 25.00      |

### Validaciones

#### Centro ID Origen
- Tipo: Número entero
- Requerido: Sí
- Descripción: ID del centro de origen o suministro

#### Material ID
- Tipo: Número entero
- Requerido: Sí
- Descripción: ID del material o producto

#### Centro ID Aprovisionamiento
- Tipo: Número entero
- Requerido: Sí
- Descripción: ID del centro de aprovisionamiento o destino

#### Porcentaje
- Tipo: Número decimal
- Rango: 0.00 - 100.00
- Requerido: Sí
- Decimales: 2
- Descripción: Porcentaje de asignación

## 🔧 Implementación Técnica

### Frontend: AprovisionamientoUploadModal.vue

#### Headers Esperados
```javascript
const headers = ref([
  'centro_id_origen',
  'material_id',
  'centro_id_aprov',
  'porcentaje',
]);
```

#### Validación de Fila
```javascript
const validateRow = (row, rowNumber) => {
  const errors = [];
  
  // Validar centro_id_origen
  const centroIdOrigen = parseInt(row[0]);
  if (!centroIdOrigen || isNaN(centroIdOrigen)) {
    errors.push(`Fila ${rowNumber}: centro_id_origen debe ser un número entero`);
  }
  
  // ... más validaciones
  
  return errors;
};
```

#### Procesamiento y Envío
```javascript
const processAndSave = async () => {
  const { data } = await client.queries.aprovisionamiento({
    operation: 'bulkCreate',
    data: JSON.stringify(parsedData.value),
  });
  
  // Parsear respuesta y mostrar resultados
};
```

### Backend: handler.ts

#### Función bulkCreateAprovisionamiento

```typescript
async function bulkCreateAprovisionamiento(
  connection: mysql.Connection, 
  body: any
): Promise<AprovisionamientoResponse> {
  // 1. Parsear datos
  const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  
  // 2. Validar cada registro
  parsedData.forEach((record, index) => {
    // Validaciones...
  });
  
  // 3. Insertar masivamente
  const query = `
    INSERT IGNORE INTO aprovisionamiento 
    (centro_id_origen, material_id, centro_id_aprov, porcentaje) 
    VALUES ${values}
  `;
  
  // 4. Retornar estadísticas
  return {
    success: true,
    data: {
      total: parsedData.length,
      inserted: affectedRows,
      duplicates: duplicates,
      invalid: invalidRecords.length
    }
  };
}
```

#### Estrategia de Duplicados

Se usa `INSERT IGNORE` para:
- ✅ Evitar errores de clave duplicada
- ✅ Continuar con el resto de registros
- ✅ Reportar duplicados al usuario

### Schema Amplify: data/resource.ts

```typescript
aprovisionamiento: a
  .query()
  .arguments({
    operation: a.string(),
    // ... otros argumentos
    data: a.string(), // JSON string para carga masiva
  })
  .returns(a.json())
  .handler(a.handler.function(aprovisionamiento)),
```

## 📊 Respuesta del Backend

### Estructura de Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "total": 100,
    "valid": 98,
    "invalid": 2,
    "inserted": 95,
    "duplicates": 3,
    "invalidRecords": [
      {
        "index": 45,
        "error": "El porcentaje debe estar entre 0 y 100",
        "record": { /* ... */ }
      }
    ]
  },
  "message": "Carga masiva completada: 95 registros insertados, 3 duplicados ignorados, 2 registros inválidos"
}
```

### Campos de la Respuesta

- **total**: Total de registros en el archivo
- **valid**: Registros que pasaron validación
- **invalid**: Registros con errores de validación
- **inserted**: Registros insertados exitosamente
- **duplicates**: Registros duplicados (no insertados)
- **invalidRecords**: Primeros 10 registros inválidos con detalle

## 🎨 UI/UX

### Estados del Modal

1. **Inicial**: Instrucciones y área de carga
2. **Cargando**: Progress bar de lectura del archivo
3. **Validado**: Resumen de datos antes de guardar
4. **Procesando**: Spinner durante guardado
5. **Completado**: Cierre automático y notificación

### Notificaciones

#### Éxito
```javascript
useToast().add({
  title: 'Carga masiva exitosa',
  description: `Se cargaron ${inserted} registros correctamente`,
  color: 'green',
});
```

#### Error de Validación
```javascript
useToast().add({
  title: 'Error de validación',
  description: validationError.value,
  color: 'red',
});
```

## 🧪 Casos de Prueba

### Caso 1: Carga Exitosa
- **Input**: Archivo con 10 registros válidos
- **Expected**: 10 registros insertados, mensaje de éxito

### Caso 2: Registros Duplicados
- **Input**: 10 registros, 3 ya existen en BD
- **Expected**: 7 nuevos insertados, 3 duplicados reportados

### Caso 3: Validación Frontend
- **Input**: Porcentaje fuera de rango (150.00)
- **Expected**: Error antes de enviar al backend

### Caso 4: Registros Inválidos
- **Input**: 10 registros, 2 con material_id no numérico
- **Expected**: 8 insertados, 2 inválidos reportados

### Caso 5: Archivo Vacío
- **Input**: Excel solo con headers
- **Expected**: Error "no contiene datos"

## 📝 Buenas Prácticas Implementadas

### Validación en Capas
1. ✅ Validación de encabezados (estructura)
2. ✅ Validación de tipos (frontend)
3. ✅ Validación de rangos (frontend)
4. ✅ Validación de negocio (backend)
5. ✅ Validación de duplicados (base de datos)

### Manejo de Errores
- ✅ Try-catch en todos los niveles
- ✅ Mensajes descriptivos al usuario
- ✅ Logs detallados en consola
- ✅ Rollback automático (transacciones)

### Performance
- ✅ INSERT masivo (no iterativo)
- ✅ Validación en lotes
- ✅ Timeouts configurables
- ✅ Memoria optimizada

### Experiencia de Usuario
- ✅ Progress bars
- ✅ Feedback inmediato
- ✅ Plantilla descargable
- ✅ Instrucciones claras
- ✅ Mensajes informativos

## 🔐 Seguridad

### Validaciones
- ✅ Tipos de datos estrictos
- ✅ Rangos de valores
- ✅ SQL Injection prevention (prepared statements)
- ✅ Límite de tamaño de archivo (10MB)

### Autorización
- ✅ Middleware de rol requerido
- ✅ API Key en Amplify
- ✅ Conexión SSL a base de datos

## 🚀 Despliegue

### Variables de Entorno Requeridas

```bash
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=portal
MYSQL_PORT=3306
MYSQL_SSL=false
```

### Pasos de Despliegue

1. **Amplify Gen 2**
   ```bash
   npx ampx sandbox
   ```

2. **Deploy a Producción**
   ```bash
   npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
   ```

3. **Verificar Función Lambda**
   - Revisar logs en CloudWatch
   - Confirmar timeout (300s)
   - Verificar memoria (512MB)

## 📚 Referencias

- [Documentación Amplify Gen 2](https://docs.amplify.aws/)
- [read-excel-file](https://github.com/catamphetamine/read-excel-file)
- [MySQL2](https://github.com/sidorares/node-mysql2)

## 🐛 Troubleshooting

### Error: "No se pudo conectar a MySQL"
- Verificar variables de entorno
- Confirmar permisos de red (Security Groups)
- Revisar credenciales

### Error: "Timeout en Lambda"
- Aumentar timeout en resource.ts
- Reducir tamaño de lote
- Optimizar query SQL

### Error: "Formato de archivo inválido"
- Verificar encabezados exactos
- Confirmar tipo de archivo (XLSX, XLS, CSV)
- Revisar encoding (UTF-8)

## 📈 Métricas

### KPIs a Monitorear
- ⏱️ Tiempo promedio de procesamiento
- 📊 Tasa de éxito de cargas
- 🔄 Número de duplicados promedio
- ❌ Errores de validación más comunes

### Límites Recomendados
- Máximo 1000 registros por carga
- Timeout Lambda: 300 segundos
- Memoria Lambda: 512 MB
- Tamaño archivo: 10 MB

## 🎓 Lecciones Aprendidas

1. **Validación Temprana**: Validar en frontend ahorra costos de Lambda
2. **Feedback Continuo**: Progress bars mejoran UX significativamente
3. **Manejo de Duplicados**: INSERT IGNORE es más eficiente que validar antes
4. **Logs Detallados**: Facilitan debugging en producción
5. **Plantillas**: Reducen errores del usuario dramáticamente

## 🔄 Próximas Mejoras

- [ ] Soporte para archivos más grandes (chunking)
- [ ] Preview de primeras 10 filas antes de guardar
- [ ] Exportación de errores en archivo
- [ ] Validación asíncrona con WebWorkers
- [ ] Modo "dry-run" para simular sin guardar
- [ ] Historial de cargas masivas
- [ ] Rollback de carga masiva

---

**Creado**: 2025-10-09  
**Autor**: Portal Diveco Team  
**Versión**: 1.0.0

