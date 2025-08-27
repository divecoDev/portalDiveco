# Implementación Dual: Nuxt vs AWS Amplify Functions

## Descripción

Este documento describe las dos implementaciones del reinicio de contraseñas SAP que hemos creado para permitir pruebas comparativas:

1. **Implementación Nuxt** (original): Endpoint de servidor en `/api/sap/reset-password`
2. **Implementación Amplify** (nueva): Función Lambda generada por AWS Amplify

## Arquitectura de las Implementaciones

### 🔵 Implementación Nuxt (Original)

```
Frontend → Nuxt Server API → SAP Web Service
```

- **Ubicación**: `server/api/sap/reset-password.post.ts`
- **Servicio**: `app/services/sap-password-service.ts`
- **Componente**: `app/components/PasswordResetForm.vue`
- **Ventajas**:
  - Respuesta rápida (mismo servidor)
  - Fácil debugging
  - Logs en tiempo real
- **Desventajas**:
  - Consume recursos del servidor Nuxt
  - No escalable automáticamente

### 🟣 Implementación Amplify (Nueva)

```
Frontend → AWS Amplify Data Client → Lambda Function → SAP Web Service
```

- **Ubicación**: `amplify/functions/reset-password/`
- **Servicio**: `app/services/sap-password-service-amplify.ts`
- **Componente**: `app/components/PasswordResetComparison.vue`
- **Ventajas**:
  - Escalabilidad automática
  - Aislamiento de recursos
  - Mejor para producción
- **Desventajas**:
  - Latencia adicional (cold start)
  - Más complejo de debuggear

## Estructura de Archivos

### Implementación Amplify

```
amplify/
├── functions/
│   └── reset-password/
│       ├── resource.ts          # Definición de la función
│       └── handler.ts           # Código Lambda
├── data/
│   └── resource.ts              # Schema con la función
└── backend.ts                   # Backend principal
```

### Servicios del Frontend

```
app/services/
├── sap-password-service.ts      # Servicio Nuxt (original)
└── sap-password-service-amplify.ts  # Servicio Amplify (nuevo)
```

### Componentes

```
app/components/
├── PasswordResetForm.vue        # Formulario original
└── PasswordResetComparison.vue  # Comparador de implementaciones
```

## Configuración de Amplify

### 1. Definición de la Función

```typescript
// amplify/functions/reset-password/resource.ts
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

## Uso de las Implementaciones

### Implementación Nuxt (Original)

```typescript
import { resetPassword } from "~/services/sap-password-service";

const response = await resetPassword({
  sapUser: "JRODAS",
  email: "usuario@diveco.com",
});
```

### Implementación Amplify (Nueva)

```typescript
import { resetPasswordAmplify } from "~/services/sap-password-service-amplify";

const response = await resetPasswordAmplify({
  sapUser: "JRODAS",
  email: "usuario@diveco.com",
});
```

## Componente de Comparación

El componente `PasswordResetComparison.vue` permite:

1. **Probar Nuxt**: Ejecuta solo la implementación original
2. **Probar Amplify**: Ejecuta solo la implementación Lambda
3. **Probar Ambas**: Ejecuta ambas en paralelo y compara resultados
4. **Visualizar Logs**: Muestra logs detallados de ambas implementaciones
5. **Comparar Resultados**: Identifica diferencias entre implementaciones

### Uso del Componente

```vue
<template>
  <PasswordResetComparison
    :is-processing="false"
    @reset-success="handleSuccess"
    @reset-error="handleError"
  />
</template>
```

## Diferencias Técnicas

### Manejo de Credenciales

#### Nuxt

```typescript
const credentials = btoa(
  `${SAP_WEB_SERVICE_CONFIG.credentials.username}:${SAP_WEB_SERVICE_CONFIG.credentials.password}`
);
```

#### Amplify (Lambda)

```typescript
const credentials = Buffer.from(
  `${SAP_WEB_SERVICE_CONFIG.credentials.username}:${SAP_WEB_SERVICE_CONFIG.credentials.password}`
).toString("base64");
```

### Parsing de Respuestas

#### Nuxt

- Usa `$fetch` nativo de Nuxt
- Manejo de errores HTTP integrado

#### Amplify

- Usa `fetch` nativo de Node.js en Lambda
- Manejo de errores HTTP manual

### Logs y Debugging

#### Nuxt

- Logs en consola del servidor Nuxt
- Fácil acceso a logs en desarrollo

#### Amplify

- Logs en CloudWatch
- Requiere configuración adicional para debugging

## Despliegue y Configuración

### 1. Desplegar Backend Amplify

```bash
cd amplify
amplify push
```

### 2. Configurar Variables de Entorno

```bash
amplify env checkout dev
amplify env pull
```

### 3. Verificar Función Lambda

```bash
amplify function list
amplify function console reset-password
```

## Pruebas y Validación

### 1. Prueba Individual

```bash
# Probar solo Nuxt
curl -X POST http://localhost:3000/api/sap/reset-password \
  -H "Content-Type: application/json" \
  -d '{"sapUser":"JRODAS","email":"test@diveco.com"}'
```

### 2. Prueba Amplify

```bash
# Usar el componente de comparación en el frontend
# O llamar directamente desde el código
```

### 3. Prueba de Comparación

```typescript
import { compareResponses } from "~/services/sap-password-service-amplify";

const comparison = compareResponses(nuxtResponse, amplifyResponse);
console.log("Diferencias:", comparison.differences);
```

## Monitoreo y Métricas

### CloudWatch (Amplify)

- **Métricas**: Duración, errores, throttling
- **Logs**: Structured logs con timestamps
- **Alarmas**: Configurables para errores

### Nuxt (Original)

- **Métricas**: Tiempo de respuesta del servidor
- **Logs**: Consola del servidor
- **Monitoreo**: Herramientas del servidor

## Consideraciones de Producción

### Cuándo Usar Nuxt

- **Desarrollo y testing**
- **Aplicaciones pequeñas**
- **Prototipos rápidos**
- **Debugging intensivo**

### Cuándo Usar Amplify

- **Producción**
- **Aplicaciones escalables**
- **Manejo de picos de tráfico**
- **Integración con AWS**

## Migración Gradual

### Fase 1: Implementación Dual

- Mantener ambas implementaciones
- Usar Nuxt para desarrollo
- Usar Amplify para pruebas

### Fase 2: Testing y Validación

- Comparar resultados
- Medir rendimiento
- Validar funcionalidad

### Fase 3: Migración

- Cambiar a Amplify en producción
- Mantener Nuxt como fallback
- Monitorear métricas

### Fase 4: Eliminación

- Remover implementación Nuxt
- Limpiar código no utilizado
- Documentar lecciones aprendidas

## Troubleshooting

### Problemas Comunes

#### 1. Función Lambda No Responde

```bash
# Verificar logs
amplify function console reset-password

# Verificar configuración
amplify function get reset-password
```

#### 2. Errores de Autenticación

- Verificar credenciales en `sap-web-service.ts`
- Confirmar permisos de la función Lambda
- Verificar configuración de VPC si es necesario

#### 3. Timeouts

- Ajustar timeout de la función Lambda
- Verificar conectividad con SAP
- Revisar logs de reintentos

### Debugging

#### Nuxt

```typescript
// Agregar logs detallados
console.log("Request:", request);
console.log("Response:", response);
```

#### Amplify

```typescript
// Logs se envían a CloudWatch
console.log("Lambda execution:", { event, context });
```

## Próximos Pasos

1. **Desplegar backend Amplify**
2. **Probar ambas implementaciones**
3. **Comparar rendimiento**
4. **Validar funcionalidad**
5. **Documentar métricas**
6. **Planificar migración**

## Recursos Adicionales

- [AWS Amplify Functions Documentation](https://docs.amplify.aws/gen2/build-a-backend/functions/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Nuxt Server API](https://nuxt.com/docs/guide/concepts/server-engine)
- [SAP Web Services](https://help.sap.com/doc/saphelp_nw73ehp1/7.31.19/en-US/48/8fe37933114e6fe10000000a42189c/frameset.htm)
