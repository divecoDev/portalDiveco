# Integración con Web Service SAP

## Descripción

Este módulo implementa la integración con el web service SAP para la gestión de usuarios, específicamente para el desbloqueo de usuarios bloqueados.

## Arquitectura

### Componentes

1. **UserUnlockForm.vue** - Componente Vue que maneja el formulario de desbloqueo
2. **sap-web-service.ts** - Configuración centralizada del web service
3. **sap-web-service-client.ts** - Cliente utilitario para las llamadas SOAP

### Flujo de Datos

```
UserUnlockForm → SAPWebServiceClient → SAP Web Service → Response → UI Feedback
```

## Configuración

### Credenciales

```typescript
// app/config/sap-web-service.ts
export const SAP_WEB_SERVICE_CONFIG = {
  url: "http://QASAP.diveco.intranet:8000/sap/bc/srt/rfc/sap/zsdsrv_webservice_srvusrsap/410/zws_srvusrsap/zbn_srvusrsap",
  credentials: {
    username: "JOB_USER",
    password: "Sapdiv+2024",
  },
  headers: {
    "Content-Type": "text/xml;charset=UTF-8",
  },
  actions: {
    UNLOCK_USER: "D",
    RESET_PASSWORD: "R",
  },
};
```

### Headers de Autenticación

- **Content-Type**: `text/xml;charset=UTF-8`
- **Authorization**: `Basic <base64(username:password)>`

## Uso

### Desbloqueo de Usuario

```vue
<template>
  <UserUnlockForm
    :is-processing="isProcessing"
    @unlock-success="handleUnlockSuccess"
    @unlock-error="handleUnlockError"
  />
</template>

<script setup>
const handleUnlockSuccess = (data) => {
  // data: { mensaje, nombre, usuario }
  console.log(`Usuario ${data.usuario} desbloqueado: ${data.mensaje}`);
};

const handleUnlockError = (data) => {
  // data: { mensaje, codigo }
  console.error(`Error: ${data.mensaje} (Código: ${data.codigo})`);
};
</script>
```

### Llamada Directa al Cliente

```typescript
import { getSAPWebServiceClient } from "~/utils/sap-web-service-client";

const client = getSAPWebServiceClient();
const soapBody = client.generateUnlockUserSOAPBody(
  "JRODAS",
  "usuario@diveco.com"
);

try {
  const response = await client.callSOAPService(soapBody);
  if (response.success) {
    console.log("Usuario desbloqueado:", response.mensaje);
  }
} catch (error) {
  console.error("Error en la llamada:", error);
}
```

## Formato SOAP

### Request

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZGLFU_WS_SRVUSERSAP>
      <PC_ACCION>D</PC_ACCION>
      <PC_EMAIL>usuario@diveco.com</PC_EMAIL>
      <PC_USER>JRODAS</PC_USER>
    </urn:ZGLFU_WS_SRVUSERSAP>
  </soapenv:Body>
</soapenv:Envelope>
```

### Response

```xml
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Header/>
  <soap-env:Body>
    <n0:ZGLFU_WS_SRVUSERSAPResponse xmlns:n0="urn:sap-com:document:sap:rfc:functions">
      <PC_MENSAJE>el usuario JRODAS ha sido desbloqueado con éxito.</PC_MENSAJE>
      <PC_NOMBRE>Jonathan Rodas</PC_NOMBRE>
      <PC_PASS/>
      <PN_CODIGO>0</PN_CODIGO>
    </n0:ZGLFU_WS_SRVUSERSAPResponse>
  </soap-env:Body>
</soapenv:Envelope>
```

## Códigos de Respuesta

- **0**: Operación exitosa
- **Otros valores**: Error en la operación

## Manejo de Errores

### Errores de Conexión

- Timeout de red
- Servidor no disponible
- Problemas de autenticación

### Errores del Servicio

- Usuario no encontrado
- Email no válido
- Permisos insuficientes

## Seguridad

- Las credenciales están centralizadas en el archivo de configuración
- Se utiliza autenticación Basic Auth
- Las llamadas se realizan a través de HTTPS (en producción)

## Mantenimiento

### Actualizar Credenciales

Modificar el archivo `app/config/sap-web-service.ts`

### Agregar Nuevas Acciones

1. Agregar la acción en `SAP_WEB_SERVICE_CONFIG.actions`
2. Crear método en `SAPWebServiceClient`
3. Implementar en el componente correspondiente

### Logs y Debugging

- Los errores se registran en la consola del navegador
- Las respuestas del servidor se pueden inspeccionar en las DevTools

## Próximos Pasos

- [ ] Implementar reinicio de contraseñas
- [ ] Agregar validación de formato de email
- [ ] Implementar rate limiting
- [ ] Agregar logs de auditoría
- [ ] Implementar retry automático en caso de fallo
