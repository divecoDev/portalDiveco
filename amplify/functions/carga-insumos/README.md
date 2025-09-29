# Función Lambda: Carga de Insumos - MySQL

## 📋 Descripción

Esta función Lambda procesa lotes de datos de Carga de Insumos y los almacena en una base de datos MySQL. Maneja tres tipos de datos:

- **Plan de Ventas**: Datos de planificación de ventas
- **Existencias**: Información de inventarios
- **Cobertura**: Datos de cobertura y disponibilidad

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
MYSQL_HOST=your-mysql-server.com
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=STGDiveco
MYSQL_PORT=3306
MYSQL_SSL=true  # Para conexiones seguras
```

### Configuración Local para Desarrollo

```bash
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_local_password
MYSQL_DATABASE=STGDiveco
MYSQL_PORT=3306
MYSQL_SSL=false
```

## 🚀 Despliegue

1. **Instalar dependencias**:
   ```bash
   cd amplify
   npm install
   ```

2. **Configurar variables de entorno** en tu proveedor de Lambda (AWS Lambda, etc.)

3. **Desplegar**:
   ```bash
   npx amplify push
   ```

## 📊 Estructura de Datos

### Plan de Ventas
```typescript
{
  ssour: string,
  vrsio: string,
  spmon: string,
  sptag: string,
  spwoc: string,
  spbup: string,
  pmnux: string,
  wenux: string,
  vsnda: string,
  periv: string,
  vwdat: string,
  basme: string,
  absat: string,
  produ: string,
  lagri: string,
  lagrz: string,
  reich: string,
  reicz: string
}
```

### Existencias
```typescript
{
  version: string,
  centro: string,
  almacen: string,
  material: string,
  periodo: string,
  mes: string,
  libre_u: number,
  no_liberado: number,
  bloqueado: number,
  devolucion: number,
  traslados: number,
  calidad: number,
  bloqueado_em: number
}
```

### Cobertura
```typescript
{
  version: string,
  centro: string,
  periodo: string,
  mes: string,
  dias_habiles_mes_planta: number,
  dias_coberturas_mes: number,
  dias_habiles_venta: number
}
```

## 🔍 Monitoreo

La función genera logs detallados:

- ✅ Conexiones exitosas
- 📊 Progreso de procesamiento
- ❌ Errores por registro
- 📈 Estadísticas finales

## 🗄️ Base de Datos

### Tablas Creadas

- `plan_ventas`
- `existencias`
- `cobertura`
- `carga_insumos_control` (opcional)

### Ejecutar Scripts SQL

Ejecuta el script `amplify/sql/create-tables.sql` en tu base de datos MySQL antes del primer uso.

## 🧪 Pruebas

### Payload de Ejemplo

```json
{
  "tipo": "planVentas",
  "data": [
    {
      "ssour": "001",
      "vrsio": "V1",
      "spmon": "202401"
    }
  ],
  "metadata": {
    "fileName": "plan_ventas_enero.xlsx",
    "loadedAt": "2024-01-15T10:30:00Z",
    "documentId": "carga-insumos-123456789",
    "batchId": "batch-pv-001",
    "batchIndex": 0,
    "totalBatches": 5
  }
}
```

### Respuesta Esperada

```json
{
  "success": true,
  "batchId": "batch-pv-001",
  "batchIndex": 0,
  "totalBatches": 5,
  "processedRecords": 1,
  "message": "Plan de Ventas: 1 registros procesados"
}
```

## ⚠️ Consideraciones

1. **Timeouts**: La función tiene un timeout de 5 minutos
2. **Memoria**: Configurada con 512MB para manejar lotes grandes
3. **Conexiones**: Se cierra la conexión MySQL al final de cada ejecución
4. **Errores**: Se capturan errores por registro sin detener el procesamiento completo
5. **Batch Size**: Recomendado máximo 500 registros por lote para optimal performance

## 🔄 Migración desde SQL Server

Si vienes de la versión SQL Server:

1. El handler anterior está respaldado como `handler-sqlserver.ts`
2. Las tablas ahora usan nombres en minúsculas (snake_case)
3. Los tipos de datos se adaptaron a MySQL
4. Se cambió de `mssql` a `mysql2` package
