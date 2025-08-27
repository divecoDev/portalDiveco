# 🧪 Página de Pruebas - Reinicio de Contraseñas

## Descripción

Esta página temporal (`/test-reset-password`) está diseñada específicamente para probar y debuggear ambas implementaciones del reinicio de contraseñas SAP:

1. **Implementación Nuxt** (original)
2. **Implementación Amplify** (nueva función Lambda)

## Características Principales

### 🔍 **Componente de Comparación Integrado**

- Formulario para seleccionar usuario SAP
- Botones para probar cada implementación por separado
- Botón para probar ambas implementaciones simultáneamente
- Visualización de resultados y comparación automática

### 📊 **Panel de Debugging Avanzado**

- **Logs en tiempo real** con timestamps precisos
- **Filtros por nivel de log** (Info, Warn, Error, Debug)
- **Auto-scroll** configurable
- **Exportación de logs** a archivo de texto
- **Limpieza automática** de logs para optimizar memoria

### 📈 **Métricas de Rendimiento**

- Total de pruebas realizadas
- Tiempo promedio de respuesta
- Tasa de éxito/error
- Desglose por implementación (Nuxt vs Amplify)

### 🔧 **Estado del Sistema**

- Estado de conexión del servidor Nuxt
- Estado del backend de Amplify
- Estado de conexión con SAP Web Service
- Información de memoria y recursos

## Cómo Acceder

### URL de la Página

```
http://localhost:3000/test-reset-password
```

### Navegación

- Agregar la ruta al menú de navegación
- Acceso directo desde el dashboard
- Enlace desde la documentación del proyecto

## Uso de la Página

### 1. **Inicialización**

- La página se carga automáticamente
- Se ejecuta una prueba de conexión inicial
- Se monitorea el estado del sistema
- Se capturan logs del componente de comparación

### 2. **Pruebas de Funcionalidad**

- Seleccionar un usuario SAP del dropdown
- El email se autocompleta automáticamente
- Usar los botones de prueba según la necesidad:
  - **Probar Nuxt**: Solo implementación original
  - **Probar Amplify**: Solo implementación Lambda
  - **Probar Ambas**: Comparación simultánea

### 3. **Monitoreo de Logs**

- Los logs se muestran en tiempo real
- Cada log incluye timestamp, nivel y fuente
- Filtros para mostrar solo ciertos tipos de log
- Auto-scroll para seguir la ejecución

### 4. **Análisis de Resultados**

- Comparación automática entre implementaciones
- Identificación de diferencias
- Métricas de rendimiento actualizadas
- Estado del sistema en tiempo real

## Herramientas de Debugging

### 📝 **Captura de Logs**

- **Console Interception**: Captura logs de `console.log`, `console.error`, `console.warn`
- **Component Logs**: Logs específicos del componente de comparación
- **System Logs**: Logs del sistema y pruebas de conexión
- **Test Logs**: Logs de las pruebas de reinicio

### 🔍 **Filtros de Log**

- **Info**: Información general y exitosa
- **Warn**: Advertencias y reintentos
- **Error**: Errores y fallos
- **Debug**: Información detallada de debugging

### 📊 **Métricas en Tiempo Real**

- **Contadores**: Total de pruebas, éxitos, errores
- **Tiempos**: Promedios de respuesta por implementación
- **Porcentajes**: Tasa de éxito calculada automáticamente

### 💾 **Gestión de Memoria**

- **Límite automático**: Máximo 1000 logs en memoria
- **Limpieza automática**: Cada hora si hay más de 500 logs
- **Limpieza manual**: Botón para limpiar todos los logs
- **Exportación**: Descarga de logs para análisis externo

## Casos de Uso

### 🧪 **Desarrollo y Testing**

- Verificar funcionamiento de ambas implementaciones
- Comparar rendimiento y comportamiento
- Identificar diferencias en respuestas
- Debuggear errores específicos

### 🔍 **Troubleshooting**

- Analizar logs detallados de ejecución
- Identificar puntos de falla
- Verificar conectividad de servicios
- Monitorear estado del sistema

### 📊 **Análisis de Rendimiento**

- Medir tiempos de respuesta
- Comparar eficiencia de implementaciones
- Identificar cuellos de botella
- Optimizar configuración

### 📝 **Documentación y Reportes**

- Exportar logs para análisis
- Generar reportes de pruebas
- Documentar comportamientos
- Compartir información con el equipo

## Configuración Avanzada

### ⚙️ **Opciones de Logging**

```javascript
// Niveles de log activos
const activeLogLevels = ["info", "warn", "error", "debug"];

// Auto-scroll
const autoScroll = true;

// Límite de logs en memoria
const MAX_LOGS = 1000;
const CLEANUP_THRESHOLD = 500;
```

### 🔄 **Monitoreo del Sistema**

- **Intervalo de actualización**: 5 segundos
- **Limpieza automática**: 1 hora
- **Pruebas de conexión**: Al inicializar
- **Captura de memoria**: Si está disponible

### 📱 **Responsive Design**

- Adaptación automática a dispositivos móviles
- Grid responsivo para métricas
- Botones adaptables según pantalla
- Scroll optimizado para touch

## Troubleshooting

### ❌ **Problemas Comunes**

#### 1. **Logs No Se Muestran**

- Verificar que el componente esté montado
- Revisar filtros de nivel de log
- Comprobar que `monitorComponentLogs()` esté activo

#### 2. **Métricas No Se Actualizan**

- Verificar que `updateMetrics()` se llame
- Comprobar estructura de datos de respuesta
- Revisar manejo de eventos del componente

#### 3. **Estado del Sistema Incorrecto**

- Verificar función `testConnection()`
- Comprobar endpoints disponibles
- Revisar configuración de SAP

#### 4. **Problemas de Memoria**

- Verificar límites de logs automáticos
- Comprobar limpieza automática
- Revisar uso de `setInterval`

### 🔧 **Soluciones**

#### **Reiniciar Monitoreo**

```javascript
// En consola del navegador
location.reload();
```

#### **Limpiar Logs Manualmente**

```javascript
// En consola del navegador
window.clearAllLogs();
```

#### **Verificar Estado del Sistema**

```javascript
// En consola del navegador
window.testConnection();
```

## Personalización

### 🎨 **Estilos Personalizados**

- Colores por nivel de log
- Temas claro/oscuro
- Animaciones de entrada
- Scrollbar personalizado

### 📊 **Métricas Adicionales**

- Agregar nuevas métricas al objeto `metrics`
- Personalizar cálculos de rendimiento
- Agregar gráficos o visualizaciones
- Exportar métricas a CSV/JSON

### 🔌 **Integración con Herramientas**

- Envío de logs a servicios externos
- Integración con sistemas de monitoreo
- Webhooks para notificaciones
- API para consultas externas

## Mantenimiento

### 🧹 **Limpieza Regular**

- Revisar logs acumulados
- Verificar uso de memoria
- Actualizar métricas obsoletas
- Optimizar intervalos de monitoreo

### 📝 **Documentación**

- Actualizar casos de uso
- Documentar nuevas funcionalidades
- Mantener ejemplos de uso
- Registrar lecciones aprendidas

### 🔄 **Actualizaciones**

- Mantener compatibilidad con nuevas versiones
- Actualizar dependencias
- Optimizar rendimiento
- Agregar nuevas características

## Próximos Pasos

### 🚀 **Mejoras Planificadas**

1. **Gráficos en tiempo real** para métricas
2. **Alertas automáticas** para errores críticos
3. **Historial de pruebas** persistente
4. **Comparación de versiones** de implementaciones
5. **Integración con CI/CD** para pruebas automáticas

### 📋 **Tareas Pendientes**

- [ ] Agregar tests unitarios para la página
- [ ] Implementar persistencia de métricas
- [ ] Agregar exportación a formatos adicionales
- [ ] Optimizar rendimiento para grandes volúmenes de logs
- [ ] Implementar sistema de alertas

## Recursos Adicionales

### 📚 **Documentación Relacionada**

- [Implementación Dual: Nuxt vs AWS Amplify Functions](./amplify-vs-nuxt-implementation.md)
- [Función Lambda: Reinicio de Contraseñas SAP](../amplify/functions/reset-password/README.md)
- [SAP Web Service Integration](./sap-web-service-integration.md)

### 🔗 **Enlaces Útiles**

- [AWS Amplify Functions](https://docs.amplify.aws/gen2/build-a-backend/functions/)
- [Nuxt Server API](https://nuxt.com/docs/guide/concepts/server-engine)
- [Vue.js DevTools](https://devtools.vuejs.org/)

### 📞 **Soporte**

Para problemas o preguntas sobre esta página de pruebas:

1. Revisar logs en tiempo real
2. Verificar estado del sistema
3. Consultar documentación relacionada
4. Contactar al equipo de desarrollo
