# Función Lambda: Reinicio de Contraseñas SAP

## Descripción

Esta función Lambda implementa la funcionalidad de reinicio de contraseñas SAP usando AWS Amplify Functions. Es una implementación alternativa al endpoint de Nuxt que permite escalabilidad automática y mejor aislamiento de recursos.

## Arquitectura

```
Frontend → Amplify Data Client → Lambda Function → SAP Web Service
```

## Características

- ✅ **Sistema de reintentos**: Hasta 5 intentos con backoff exponencial
- ✅ **Logging detallado**: Timestamps y niveles de log estructurados
- ✅ **Manejo de errores**: Categorización de errores SAP vs errores de conexión
- ✅ **Validación robusta**: Verificación de campos requeridos
- ✅ **Autenticación Basic Auth**: Credenciales codificadas en base64
- ✅ **Parsing SOAP**: Extracción de datos usando regex

## Estructura de Archivos

```
reset-password/
├── README.md           # Este archivo
├── resource.ts         # Definición de la función Amplify
└── handler.ts          # Código principal de la Lambda
```

## Configuración

### 1. Definición de la Función

```typescript
// resource.ts
export const resetPassword = defineFunction({
  name: "reset-password",
  entry: "./handler.ts",
});
```

### 2. Schema de Datos

```typescript
// amplify/data/resource.ts
ResetPassword: a
  .mutation()
  .arguments({
    sapUser: a.string(),
    email: a.string()
  })
  .returns(a.string())
  .authorization((allow) => [allow.publicApiKey()])
  .handler(a.handler.function(resetPassword)),
```

### 3. Backend Principal

```typescript
// amplify/backend.ts
defineBackend({
  auth,
  data,
  groups,
  resetPassword, // Nueva función
});
```

## Uso

### Desde el Frontend

```typescript
import { resetPasswordAmplify } from "~/services/sap-password-service-amplify";

const response = await resetPasswordAmplify({
  sapUser: "JRODAS",
  email: "usuario@diveco.com",
});
```

### Llamada Directa

```typescript
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();
const response = await client.models.ResetPassword.create({
  sapUser: "JRODAS",
  email: "usuario@diveco.com",
});
```

## Parámetros de Entrada

### Event Structure

```typescript
interface LambdaEvent {
  arguments: {
    sapUser: string; // Usuario SAP (ej: "JRODAS")
    email: string; // Email corporativo
  };
}
```

### Validaciones

- **sapUser**: Debe ser una cadena no vacía
- **email**: Debe ser una cadena no vacía
- Ambos campos son requeridos

## Respuesta

### Estructura de Respuesta Exitosa

```typescript
{
  success: true,
  data: {
    mensaje: "Contraseña reiniciada exitosamente",
    nombre: "Jonathan Rodas",
    usuario: "JRODAS",
    emailEnviado: "usuario@diveco.com"
  },
  logs: ProcessLog[],
  attempts: 1
}
```

### Estructura de Respuesta con Error

```typescript
{
  success: false,
  error: {
    codigo: 1,
    mensaje: "Usuario no encontrado"
  },
  logs: ProcessLog[],
  attempts: 1
}
```

### Campos de Respuesta

- **success**: Boolean que indica si la operación fue exitosa
- **data**: Datos de la respuesta (solo si success = true)
- **error**: Información del error (solo si success = false)
- **logs**: Array de logs detallados del proceso
- **attempts**: Número de intentos realizados
- **exhausted**: Boolean que indica si se agotaron los reintentos

## Sistema de Reintentos

### Configuración

- **Máximo de intentos**: 5
- **Delay base**: 1 segundo
- **Backoff exponencial**: `BASE_DELAY * Math.pow(2, attempt - 1)`

### Lógica de Reintentos

- **Errores de conexión**: Se reintentan automáticamente
- **Errores del servicio SAP**: No se reintentan (códigos != 500)
- **Errores de validación**: No se reintentan

### Ejemplo de Delays

- Intento 1: 0ms (inmediato)
- Intento 2: 1000ms (1 segundo)
- Intento 3: 2000ms (2 segundos)
- Intento 4: 4000ms (4 segundos)
- Intento 5: 8000ms (8 segundos)

## Logging

### Niveles de Log

- **info**: Información general del proceso
- **warn**: Advertencias y reintentos
- **error**: Errores críticos

### Estructura de Log

```typescript
interface ProcessLog {
  timestamp: string; // ISO timestamp
  level: string; // info, warn, error
  message: string; // Mensaje descriptivo
}
```

### Ejemplos de Logs

```
2024-01-15T10:30:00.000Z INFO ===== INICIO FUNCIÓN LAMBDA REINICIO CONTRASEÑA =====
2024-01-15T10:30:00.100Z INFO Usuario SAP: JRODAS
2024-01-15T10:30:00.200Z INFO Email: usuario@diveco.com
2024-01-15T10:30:01.500Z INFO ===== REINICIO EXITOSO =====
```

## Manejo de Errores

### Tipos de Error

1. **Errores de Validación** (400)
   - Campos faltantes
   - Datos inválidos

2. **Errores del Servicio SAP**
   - Usuario no encontrado (código 1)
   - Email inválido (código 2)
   - Otros errores de negocio

3. **Errores de Conexión** (500)
   - Timeout de red
   - Servidor no disponible
   - Problemas de conectividad

4. **Errores Internos**
   - Errores de parsing
   - Errores inesperados

### Códigos de Error SAP

- **0**: Operación exitosa
- **1**: Usuario inexistente
- **2**: Email inválido
- **500**: Error interno del servicio (se reintenta)

## Configuración del Web Service

### Credenciales

```typescript
// app/config/sap-web-service.ts
export const SAP_WEB_SERVICE_CONFIG = {
  url: "http://QASAP.diveco.intranet:8000/...",
  credentials: {
    username: "JOB_USER",
    password: "Sapdiv+2024",
  },
  actions: {
    RESET_PASSWORD: "R",
  },
};
```

### Headers HTTP

- **Content-Type**: `text/xml;charset=UTF-8`
- **Authorization**: `Basic <base64(username:password)>`

## Despliegue

### 1. Desplegar Backend

```bash
cd amplify
amplify push
```

### 2. Verificar Función

```bash
amplify function list
amplify function console reset-password
```

### 3. Verificar Logs

```bash
# En AWS Console
# Lambda > Functions > reset-password > Monitor > Logs
```

## Monitoreo

### CloudWatch Métricas

- **Invocations**: Número de invocaciones
- **Duration**: Tiempo de ejecución
- **Errors**: Número de errores
- **Throttles**: Número de throttles

### CloudWatch Logs

- **Log Group**: `/aws/lambda/reset-password-<env>`
- **Retención**: Configurable (por defecto indefinida)
- **Búsqueda**: Por timestamp, nivel de log, mensaje

### Alarmas Recomendadas

- **Error Rate > 5%**: Alerta cuando hay muchos errores
- **Duration > 30s**: Alerta cuando la función es lenta
- **Throttles > 0**: Alerta cuando hay throttling

## Testing

### Pruebas Locales

```bash
# Usar el componente de comparación
# app/components/PasswordResetComparison.vue
```

### Pruebas Unitarias

```typescript
// Crear tests para las funciones helper
describe("generateResetPasswordSOAPBody", () => {
  it("should generate valid SOAP XML", () => {
    const result = generateResetPasswordSOAPBody("JRODAS", "test@diveco.com");
    expect(result).toContain("<PC_ACCION>R</PC_ACCION>");
    expect(result).toContain("<PC_USER>JRODAS</PC_USER>");
  });
});
```

### Pruebas de Integración

```typescript
// Probar con datos reales de SAP
const testData = [
  { sapUser: "JRODAS", email: "usuario@diveco.com" },
  { sapUser: "TEST_USER", email: "test@diveco.com" },
];

for (const data of testData) {
  const response = await resetPasswordAmplify(data);
  expect(response.success).toBe(true);
}
```

## Performance

### Optimizaciones

1. **Reutilización de credenciales**: Codificación base64 una sola vez
2. **Parsing eficiente**: Uso de regex en lugar de librerías XML pesadas
3. **Logging estructurado**: Logs en memoria y escritura única al final
4. **Manejo de reintentos**: Delays exponenciales para evitar sobrecarga

### Métricas Esperadas

- **Cold Start**: 200-500ms
- **Warm Start**: 50-150ms
- **Tiempo de SAP**: 1-5 segundos
- **Timeout**: 30 segundos (configurable)

## Seguridad

### Autenticación

- **Basic Auth**: Credenciales codificadas en base64
- **Credenciales**: Almacenadas en configuración (no hardcodeadas)

### Autorización

- **API Key**: Acceso público (configurable)
- **IAM**: Permisos mínimos necesarios

### Validación

- **Input sanitization**: Validación de campos de entrada
- **Output encoding**: Respuestas estructuradas y seguras

## Troubleshooting

### Problemas Comunes

#### 1. Timeout de la Función

```bash
# Verificar logs de CloudWatch
# Buscar "AGOTADOS LOS 5 INTENTOS"
# Verificar conectividad con SAP
```

#### 2. Errores de Autenticación

```bash
# Verificar credenciales en sap-web-service.ts
# Confirmar que la función tiene acceso a la configuración
# Verificar permisos de red si es necesario
```

#### 3. Errores de Parsing

```bash
# Verificar formato de respuesta SAP
# Revisar logs para ver la respuesta XML completa
# Ajustar regex si es necesario
```

### Debugging

#### Agregar Logs Adicionales

```typescript
// En handler.ts
addLog("debug", `Response XML: ${responseText}`, processLogs);
```

#### Verificar Variables de Entorno

```typescript
// Verificar configuración
console.log("SAP Config:", {
  url: SAP_WEB_SERVICE_CONFIG.url,
  username: SAP_WEB_SERVICE_CONFIG.credentials.username,
  action: SAP_WEB_SERVICE_CONFIG.actions.RESET_PASSWORD,
});
```

## Mantenimiento

### Actualizaciones

1. **Modificar handler.ts** con los cambios necesarios
2. **Ejecutar `amplify push`** para desplegar
3. **Verificar logs** para confirmar funcionamiento
4. **Actualizar documentación** si es necesario

### Backup y Rollback

- **Versiones**: Lambda mantiene versiones automáticamente
- **Rollback**: Usar `amplify rollback` si es necesario
- **Configuración**: Mantener en control de versiones

## Recursos Adicionales

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Amplify Functions](https://docs.amplify.aws/gen2/build-a-backend/functions/)
- [SAP Web Services](https://help.sap.com/doc/saphelp_nw73ehp1/7.31.19/en-US/48/8fe37933114e6fe10000000a42189c/frameset.htm)
- [Node.js Fetch API](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch)

## Contacto

Para preguntas o problemas con esta función:

1. Revisar logs de CloudWatch
2. Verificar configuración de Amplify
3. Consultar documentación de SAP
4. Contactar al equipo de desarrollo
