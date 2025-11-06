# Pruebas Unitarias - Suscripciones SUIC

Este directorio contiene pruebas unitarias para validar las suscripciones en tiempo real al modelo SUIC de Amplify Gen 2.

## Archivos de Prueba

### `suic-subscription.test.ts`
Pruebas unitarias para las suscripciones al modelo SUIC. Incluye:
- Inicio de suscripciones
- Recepción de actualizaciones
- Manejo de diferentes estados (completed, error, running)
- Manejo de errores
- Limpieza de suscripciones
- Polling de respaldo
- Integración con webhook

### `EjecutarRPA-subscription.test.ts`
Pruebas de integración para el componente EjecutarRPA. Incluye:
- Inicialización de suscripción
- Actualización de estado desde webhook
- Polling de respaldo
- Limpieza de recursos
- Manejo de múltiples actualizaciones

## Ejecutar Pruebas

### Ejecutar todas las pruebas unitarias
```bash
npm run test:unit
```

### Ejecutar pruebas en modo watch (desarrollo)
```bash
npm run test:unit:watch
```

### Ejecutar pruebas con UI interactiva
```bash
npm run test:unit:ui
```

### Ejecutar un archivo específico
```bash
npx vitest run test/unit/suic-subscription.test.ts
```

## Estructura de las Pruebas

Las pruebas utilizan mocks para simular:
- El cliente de Amplify (`generateClient`)
- El modelo SUIC y sus métodos (`onUpdate`, `get`, `update`)
- Las suscripciones y sus callbacks

## Validaciones Incluidas

1. **Inicio de Suscripción**
   - Verifica que se crea la suscripción con el filtro correcto
   - Valida que no se crean múltiples suscripciones duplicadas

2. **Recepción de Actualizaciones**
   - Procesa correctamente estados: `completed`, `error`, `running`
   - Maneja diferentes formatos de datos (directo, anidado, desconocido)

3. **Manejo de Errores**
   - Captura y procesa errores de suscripción correctamente

4. **Limpieza de Recursos**
   - Se desuscribe correctamente cuando el proceso termina
   - Limpia polling y suscripciones al desmontar

5. **Polling de Respaldo**
   - Verifica el estado periódicamente cuando la suscripción no funciona
   - Detecta cambios mediante consultas directas al modelo

6. **Integración con Webhook**
   - Simula actualizaciones desde el endpoint `/api/rpa/webhook`
   - Valida que las actualizaciones se reflejan en la UI

## Debugging

Si las pruebas fallan, revisa:
1. Los logs de la consola para ver qué datos se están recibiendo
2. La estructura de los datos mockeados
3. Los callbacks de la suscripción

## Notas

- Las pruebas utilizan mocks para no requerir una conexión real a Amplify
- Los intervalos de polling se reducen en las pruebas para ejecución más rápida
- Se simulan diferentes estructuras de datos para validar robustez

