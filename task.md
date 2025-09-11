# PLAN DE IMPLEMENTACIÓN - NIVEL 2

## Microsoft Graph Multi-Tenant Authentication

### COMPLEJIDAD: Nivel 2 (Simple Enhancement)

**Fecha:** 10 de septiembre, 2025
**Estado:** ✅ IMPLEMENTACIÓN COMPLETA

### OBJETIVO

Modificar la función `getAccessToken` en `useMicrosoftGraph.ts` para que determine dinámicamente el tenant (nova/diveco) basándose en el dominio del email del usuario autenticado, en lugar de usar el valor hardcodeado "nova".

### REQUISITOS

- **Nova Finanzas**: usuarios con dominio `@novafinanzas.com` → usar tenant "nova"
- **Diveco**: usuarios con dominio `@diveco.com` → usar tenant "diveco"
- Mantener compatibilidad con el sistema actual
- Manejo de casos edge (emails sin dominio válido)

### ARCHIVOS A MODIFICAR

#### 1. `app/composables/useMicrosoftGraph.ts`

- **Línea 33**: Modificar llamada a `amplifyClient.queries.MicrosoftGraphToken()`
- **Agregar**: Función utilitaria para determinar tenant
- **Agregar**: Importación de `useAuth` composable
- **Modificar**: Función `getAccessToken()` para obtener email del usuario

#### 2. `amplify/functions/microsoft-graph/token/handler.ts`

- **Líneas 8-10**: Agregar lógica condicional para variables de entorno
- **Verificar**: Existencia de variables DIVECO (MS_DIVECO_TENANT_ID, MS_DIVECO_CLIENT_ID, MS_DIVECO_CLIENT_SECRET)
- **Agregar**: Manejo de error para tenant no válido

### ESTRATEGIA DE IMPLEMENTACIÓN

#### Paso 1: Función Utilitaria para Determinar Tenant

```typescript
const determineTenant = (email: string): string => {
  if (!email) return "nova"; // default fallback

  if (email.includes("@novafinanzas.com")) {
    return "nova";
  } else if (email.includes("@diveco.com")) {
    return "diveco";
  }

  return "nova"; // default fallback
};
```

#### Paso 2: Modificación de getAccessToken()

```typescript
const getAccessToken = async (): Promise<string> => {
  const { currentUser } = useAuth();
  const userEmail = currentUser.value?.signInDetails?.loginId || "";
  const tenant = determineTenant(userEmail);

  const request = await amplifyClient.queries.MicrosoftGraphToken(tenant);
  const response = JSON.parse(request.data);
  return response.access_token;
};
```

#### Paso 3: Actualización del Handler Lambda

```typescript
const getTenantConfig = (tenantName: string) => {
  switch (tenantName) {
    case "nova":
      return {
        tenantId: process.env.MS_NOVA_TENANT_ID || "",
        clientId: process.env.MS_NOVA_CLIENT_ID || "",
        clientSecret: process.env.MS_NOVA_CLIENT_SECRET || "",
      };
    case "diveco":
      return {
        tenantId: process.env.MS_DIVECO_TENANT_ID || "",
        clientId: process.env.MS_DIVECO_CLIENT_ID || "",
        clientSecret: process.env.MS_DIVECO_CLIENT_SECRET || "",
      };
    default:
      throw new Error(`Tenant no válido: ${tenantName}`);
  }
};
```

### PASOS DETALLADOS DE IMPLEMENTACIÓN

1. **Importar useAuth en useMicrosoftGraph.ts**
2. **Crear función determineTenant()**
3. **Modificar getAccessToken() para obtener email del usuario**
4. **Actualizar handler Lambda con lógica multi-tenant**
5. **Verificar variables de entorno DIVECO**
6. **Agregar manejo de errores**
7. **Testing con usuarios de ambos dominios**

### DESAFÍOS POTENCIALES Y MITIGACIONES

#### Desafío 1: Variables de entorno DIVECO inexistentes

**Mitigación**: Verificar en configuración de Amplify y agregar si es necesario

#### Desafío 2: Usuario sin email o email inválido

**Mitigación**: Usar 'nova' como tenant por defecto

#### Desafío 3: Dependencia del estado de autenticación

**Mitigación**: Verificar que el usuario esté autenticado antes de obtener el token

#### Desafío 4: Cache de tokens por tenant

**Mitigación**: Considerar cache separado por tenant en futuras mejoras

### ESTRATEGIA DE TESTING

1. **Test con usuario @novafinanzas.com** → Verificar uso de credenciales NOVA
2. **Test con usuario @diveco.com** → Verificar uso de credenciales DIVECO
3. **Test con usuario sin dominio válido** → Verificar fallback a NOVA
4. **Test de manejo de errores** → Verificar comportamiento con tenant inválido

### CONSIDERACIONES DE ARQUITECTURA

- **Compatibilidad**: Mantiene compatibilidad hacia atrás
- **Escalabilidad**: Fácil agregar nuevos tenants en el futuro
- **Seguridad**: Cada tenant usa sus propias credenciales
- **Performance**: Impacto mínimo en rendimiento

### PRÓXIMO MODO RECOMENDADO

**IMPLEMENT MODE** - No se requiere fase creativa ya que la lógica es directa y bien definida.

### CHECKLIST DE COMPLETITUD

- [x] Análisis de requisitos completo
- [x] Archivos a modificar identificados
- [x] Estrategia de implementación definida
- [x] Desafíos y mitigaciones documentados
- [x] Plan de testing establecido
- [x] Consideraciones de arquitectura revisadas

## 🔧 IMPLEMENTACIÓN EJECUTADA

### CAMBIOS REALIZADOS

#### 1. ✅ `app/composables/useMicrosoftGraph.ts`

- **Línea 13**: Agregada importación de `useAuth` composable
- **Líneas 29-42**: Agregada función `determineTenant()` para detectar tenant basado en email
- **Líneas 50-68**: Modificada función `getAccessToken()` para obtener email del usuario y determinar tenant dinámicamente
- **Logging**: Agregado logging detallado para debugging

#### 2. ✅ `amplify/functions/microsoft-graph/token/handler.ts`

- **Líneas 1-23**: Agregada función `getTenantConfig()` para manejar configuraciones multi-tenant
- **Líneas 31-39**: Modificada lógica para usar configuración dinámica basada en tenant
- **Líneas 42-50**: Actualizadas variables para usar credenciales dinámicas (tenantId, clientId, clientSecret)
- **Error Handling**: Agregado manejo de error para tenants no válidos

### FUNCIONALIDAD IMPLEMENTADA

```typescript
// Lógica de determinación de tenant
const determineTenant = (email: string): string => {
  if (!email) return "nova"; // default fallback

  if (email.includes("@novafinanzas.com")) {
    return "nova";
  } else if (email.includes("@diveco.com")) {
    return "diveco";
  }

  return "nova"; // default fallback
};
```

### FLUJO DE AUTENTICACIÓN ACTUALIZADO

1. **Usuario se autentica** → Sistema obtiene email del usuario
2. **Determinación de tenant** → Analiza dominio del email (@novafinanzas.com vs @diveco.com)
3. **Llamada dinámica** → `amplifyClient.queries.MicrosoftGraphToken(tenant)`
4. **Handler Lambda** → Usa credenciales específicas del tenant determinado
5. **Token generado** → Con las credenciales correctas para el tenant

### VARIABLES DE ENTORNO REQUERIDAS

#### Nova Finanzas (existentes)

- `MS_NOVA_TENANT_ID`
- `MS_NOVA_CLIENT_ID`
- `MS_NOVA_CLIENT_SECRET`

#### Diveco (nuevas - pendientes de configurar)

- `MS_DIVECO_TENANT_ID`
- `MS_DIVECO_CLIENT_ID`
- `MS_DIVECO_CLIENT_SECRET`

### PRÓXIMOS PASOS RECOMENDADOS

1. **Configurar variables de entorno DIVECO** en la configuración de Amplify
2. **Testing con usuarios reales** de ambos dominios
3. **Verificar logs** en CloudWatch para confirmar funcionamiento
4. **Documentar** el proceso para el equipo

### ESTADO FINAL

✅ **IMPLEMENTACIÓN COMPLETA** - Lista para testing y configuración de variables de entorno DIVECO
