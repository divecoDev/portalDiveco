# 🚀 Backend de Amplify - Portal

## 📋 Descripción

Este directorio contiene la configuración del backend de AWS Amplify para el portal, incluyendo:

- **Autenticación**: Configuración de Cognito
- **Datos**: Schema de datos y funciones personalizadas
- **Funciones**: Funciones Lambda para gestión de usuarios SAP

## 🏗️ Estructura

```
amplify/
├── auth/           # Configuración de autenticación
├── data/           # Schema de datos y funciones
├── functions/      # Funciones Lambda personalizadas
│   ├── groups/     # Función para obtener grupos de usuario
│   └── reset-password/ # Función para reiniciar contraseñas SAP
├── backend.ts      # Configuración principal del backend
├── package.json    # Dependencias y scripts
└── tsconfig.json   # Configuración de TypeScript
```

## 🚀 Despliegue

### 1. Instalar dependencias

```bash
cd amplify
npm install
```

### 2. Construir el backend

```bash
npm run build
```

### 3. Desplegar

```bash
npm run deploy
```

### 4. Verificar estado

```bash
npm run status
```

## 🔧 Funciones Disponibles

### ResetPassword

**Propósito**: Reinicia la contraseña de un usuario SAP

**Argumentos**:

- `sapUser`: Usuario SAP
- `email`: Email del usuario

**Retorna**: String con la respuesta del servicio

**Configuración**:

- Máximo 5 reintentos
- Delay exponencial entre reintentos
- Logs detallados de cada operación

### Groups

**Propósito**: Obtiene los grupos de un usuario

**Argumentos**:

- `username`: Nombre de usuario

**Retorna**: String con los grupos del usuario

## 📊 Monitoreo

### Logs

Todas las funciones generan logs detallados que incluyen:

- Timestamp de cada operación
- Nivel de log (INFO, WARN, ERROR)
- Mensaje descriptivo
- Información de reintentos

### Métricas

- Tiempo de respuesta
- Número de reintentos
- Tasa de éxito/error
- Estado de conexión con SAP

## 🧪 Pruebas

### Página de Pruebas

Accede a `/test-reset-password` para probar ambas implementaciones:

- **Nuxt API**: Endpoint del servidor
- **Amplify Lambda**: Función Lambda

### Comparación

La página de pruebas permite:

- Probar cada implementación por separado
- Comparar resultados automáticamente
- Ver logs en tiempo real
- Exportar logs para análisis

## 🔍 Troubleshooting

### Error: "Cannot read properties of undefined (reading 'create')"

**Causa**: La función de Amplify no está desplegada o el cliente no está configurado correctamente.

**Solución**:

1. Verificar que la función esté desplegada: `npm run status`
2. Reconstruir y desplegar: `npm run build && npm run deploy`
3. Verificar que el schema esté correctamente configurado

### Error: "La función ResetPassword no está disponible"

**Causa**: Problema con la configuración del schema o la función no está registrada.

**Solución**:

1. Verificar `amplify/data/resource.ts`
2. Asegurar que la función esté importada en `backend.ts`
3. Reconstruir el backend

## 📚 Recursos

- [Documentación de Amplify Gen2](https://docs.amplify.aws/react/build-a-backend/)
- [Funciones Lambda con Amplify](https://docs.amplify.aws/react/build-a-backend/functions/)
- [Schema de datos](https://docs.amplify.aws/react/build-a-backend/data/)
