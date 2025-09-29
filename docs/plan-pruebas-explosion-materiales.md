## Plan de Pruebas (1 Semana) — @explosion-materiales/

### Objetivo
Asegurar calidad funcional, integraciones, rendimiento, seguridad y UX del módulo `@explosion-materiales/` y su backend antes de release.

### Alcance
- Frontend: `app/pages/tools/explosion-materiales/{index.vue,new.vue,view/**,edit/**}`, componentes relacionados en `app/components/boom/**`, stores `stores/useBoomProcess.ts`, `stores/useBoomExplosionProcess.ts`, composables `app/composables/useBoomProcess.ts`.
- Backend/Integraciones: `server/api/sap/**`, `amplify/functions/boom/**` (`GetPlanProduccion`, `runPipeline`, `GetStatusPipeline`, `saveSalePlan`).
- Seguridad/Acceso: `middleware/auth.ts`, `middleware/require-role.ts`, `middleware/auth-admin.ts`, roles Cognito.

### Entregables
- Matriz de pruebas (casos/datos/esperado/resultado) y reporte de bugs con evidencias.
- Resultados E2E (Cypress) con videos/screenshots.
- Cobertura (Vitest) y reporte Lighthouse.
- Checklist de criterios de salida firmado.

---

## Clasificación de Tareas por Tipo de Pruebas

### 1) Pruebas de Humo (Smoke)
- [ ] Navegar: Inicio → Herramientas → `@explosion-materiales/`.
- [ ] Cargar/seleccionar plan en `index.vue` y ejecutar explosión.
- [ ] Visualizar resultados en `view/` sin errores críticos.
- [ ] Verificar estados de `loading` y errores genéricos.

### 2) Pruebas Unitarias (Vitest)
- [ ] `stores/useBoomProcess.ts`: cálculos, transformaciones, control de estados (`isLoading`, `hasError`).
- [ ] `stores/useBoomExplosionProcess.ts`: flujo de explosión, normalización de datos.
- [ ] `app/composables/useBoomProcess.ts`: validaciones de entrada (cantidades, unidades, límites). 
- [ ] Helpers de formateo (fechas, cantidades) usados en `index.vue` y `view/**`.
- [ ] Cobertura objetivo día 1: ≥60%; objetivo semana: ≥80% en lógica clave.

### 3) Pruebas de Integración (Frontend ↔ Backend)
- [ ] `server/api/sap/*` + UI: ejecutar `runPipeline` desde `index.vue` y validar request/response.
- [ ] Polling `GetStatusPipeline` y actualización de UI (spinners, estados, botones deshabilitados).
- [ ] `GetPlanProduccion`: parámetros, paginación/segmentación si aplica.
- [ ] `saveSalePlan`: validar payload, manejo de errores 4xx/5xx y mensajes en UI.
- [ ] Escenarios: respuestas parciales, latencias altas, timeouts; recuperación y reintentos.

### 4) Pruebas Funcionales (Reglas de Negocio)
- [ ] Explosión con BOM simple, multinivel (3–5 niveles), variantes y sustitutos.
- [ ] Manejo de faltantes, stock cero, costos atípicos, lead times.
- [ ] Prevención de ciclos en jerarquías BOM.
- [ ] Flujos alternos: datos incompletos/sin resultados; reintento manual; cancelación si aplica.

### 5) Pruebas de UI/UX
- [ ] Cumplimiento de guías Portal (cards, gradientes, botones, estados vacíos/errores).
- [ ] Estados `disabled`, `hover`, `focus`, feedback consistente.
- [ ] Breadcrumbs y SEO con `useSeoMeta` en páginas de `@explosion-materiales/`.
- [ ] Responsividad: mobile, tablet, desktop (layouts en `index.vue`, `new.vue`, `view/**`, `edit/**`).

### 6) Accesibilidad (A11y)
- [ ] Navegación por teclado; orden de foco y foco visible.
- [ ] Labels descriptivos y roles ARIA donde corresponda.
- [ ] Contraste suficiente en temas claro/oscuro.
- [ ] Validar con axe DevTools issues críticos.

### 7) Pruebas E2E (Cypress)
- [ ] Flujo principal: seleccionar plan → ejecutar explosión → ver resultados → guardar/exportar (si aplica).
- [ ] Fixtures: BOM simple, multinivel, con faltantes/sustitutos.
- [ ] Estabilizar con `cy.intercept` para SAP; evitar esperas fijas, usar esperas por estado.
- [ ] 3 corridas consecutivas del flujo principal sin flakes.

### 8) Performance y Web Vitals
- [ ] Lighthouse: Performance, A11y, Best Practices, SEO (objetivo: Perf ≥80, A11y ≥90).
- [ ] Revisar LCP, CLS, FID en `index.vue` y vistas pesadas (`view/**`).
- [ ] Optimizar: lazy load de rutas/componentes, `Suspense`, reducción de payloads, evitar N+1 en `useFetch/useAsyncData`.

### 9) Seguridad
- [ ] Acceso por roles/grupos (permitido/denegado) y rutas protegidas (`middleware/**`).
- [ ] Manejo de expiración de tokens (renovación/redirección adecuada).
- [ ] Prevención de XSS en inputs/render; no interpolar HTML sin sanitizar.
- [ ] Validar autorización en backend (no confiar solo en UI).

### 10) Consistencia de Datos
- [ ] Validar cálculos: redondeos, unidades, jerarquías BOM.
- [ ] Verificar mapping UI ↔ API: campos requeridos, tipos, límites.
- [ ] Exportaciones/descargas (si existen): formato y encoding.

### 11) Regresión
- [ ] Asegurar que cambios en `@explosion-materiales/` no rompen otras herramientas.
- [ ] Navegación global y layout (`layouts/default.vue`).

### 12) Observabilidad y Logs
- [ ] Consola y logs de servidor: errores normalizados y trazables.
- [ ] No exponer PII ni secretos en logs.

---

## Plan Semanal (Cronograma)

### Día 1 — Preparación, Smoke y Unit
- [ ] Entorno dev estable (Amplify, Auth, SAP). 
- [ ] Sembrar datos/fixtures SAP (OK, lentos, 4xx/5xx).
- [ ] Smoke del flujo principal.
- [ ] Unit tests y cobertura inicial (≥60%).

### Día 2 — Funcional y UI/UX
- [ ] Validaciones de formularios y estados visuales.
- [ ] Responsividad, a11y básica, breadcrumbs/SEO.

### Día 3 — Integración y Seguridad
- [ ] API SAP/Amplify (pipeline, status, plan, save). 
- [ ] Flujos alternos y resiliencia.
- [ ] Roles/rutas protegidas, expiración de token.

### Día 4 — E2E y Regresión
- [ ] E2E del flujo completo con fixtures.
- [ ] 3 corridas estables; regresión en herramientas vecinas.

### Día 5 — Performance y Resiliencia
- [ ] Lighthouse y Web Vitals; optimizaciones clave.
- [ ] Offline/errores de red; reintentos y mensajes.

### Día 6 — Seguridad y Datos
- [ ] XSS/headers, autorización backend.
- [ ] Consistencia de cálculos y exportaciones.

### Día 7 — Hardening y Cierre
- [ ] Cerrar bugs críticos/altos y re-test.
- [ ] Re-ejecutar E2E críticos; actualizar matriz y reportes.

---

## Matriz de Casos (Plantilla)
| ID | Tipo | Módulo | Precondiciones | Pasos | Datos | Esperado | Resultado | Estado | Severidad |
|---|---|---|---|---|---|---|---|---|---|
| TC-001 | E2E | Explosión | Sesión válida, plan disponible | Ir a herramienta, ejecutar | planId: X | Resultados sin errores |  |  | P1 |
| TC-002 | Unit | Validación | — | Ingresar cantidades inválidas | qty: -1 | Error inline claro |  |  | P2 |
| TC-003 | Integración | Pipeline | — | Ejecutar, consultar estado | — | Estados correctos |  |  | P1 |

---

## Criterios de Entrada/Salida
**Entrada**: build dev estable; entornos configurados; fixtures listos.  
**Salida**: 0 bugs críticos/altos; ≤2 menores abiertos con workaround; cobertura ≥80% (lógica clave); Lighthouse Perf ≥80, A11y ≥90; E2E principal estable (3/3).

## Riesgos y Mitigación
- Inestabilidad SAP → mocks e intercepts; ventanas coordinadas.
- Datos inconsistentes → fixtures controlados y dataset de respaldo.
- Flaky E2E → esperas por estado real; evitar `cy.wait` fijos.

## Roles
- QA: diseño/ejecución de casos, reporte de bugs, E2E.  
- Frontend: fixes UI/estado/validaciones, optimizaciones.  
- Backend: contratos API/errores/performance.  
- Líder técnico: priorización, criterios de salida, sign-off.

---

## Listado detallado de pruebas E2E (@explosion-materiales/)
- [ ] E2E-001 Autenticación y acceso: login, navegación a `Herramientas → Explosión de Materiales`, ver `index.vue`.
- [ ] E2E-002 Autorización por rol: usuario sin permisos recibe bloqueo/redirección; usuario permitido accede.
- [ ] E2E-003 Carga inicial: render de filtros/listado de planes sin errores; estado `loading` visible.
- [ ] E2E-004 Selección de plan: elegir plan válido y habilitar acciones de explosión.
- [ ] E2E-005 Ejecución pipeline exitosa: disparar explosión, ver spinner, actualizar a `Completado`, visualizar resultados en `view/`.
- [ ] E2E-006 Polling de estado: verificar actualizaciones periódicas con `GetStatusPipeline` hasta finalizar.
- [ ] E2E-007 Resultados vacíos: plan sin componentes muestra estado vacío con CTA y mensaje claro.
- [ ] E2E-008 Error SAP 500: interceptar error 500 y mostrar mensaje de error con opción de reintento.
- [ ] E2E-009 Timeout SAP: simular timeout; UI mantiene feedback y permite reintentar sin duplicar requests.
- [ ] E2E-010 Respuesta parcial: datos incompletos se muestran con aviso; no se rompe el layout.
- [ ] E2E-011 Reintento manual: tras fallo, reintentar y completar exitosamente.
- [ ] E2E-012 Cancelación (si aplica): cancelar ejecución y confirmar estado revertido/neutral.
- [ ] E2E-013 Paginación/ordenamiento/filtrado de resultados (si aplica): controles funcionan y se reflejan en UI.
- [ ] E2E-014 Exportación/descarga (si existe): genera archivo con formato correcto y contenido esperado.
- [ ] E2E-015 Navegación entre vistas: `index.vue → view/ → back` mantiene estado/contexto esperado.
- [ ] E2E-016 Crear nuevo (`new.vue`): formulario válido, validaciones, envío y redirección a vista.
- [ ] E2E-017 Editar (`edit/`): modificar parámetros y re-ejecutar; confirmar cambios reflejados.
- [ ] E2E-018 Protección de cambios no guardados (si aplica): alerta al salir con edición pendiente.
- [ ] E2E-019 Expiración de sesión: simular token expirado durante polling; redirigir a login y conservar intención.
- [ ] E2E-020 Interrupción de red: offline durante polling y recuperación al volver online.
- [ ] E2E-021 Responsividad: verificar flujo completo en mobile y desktop sin desbordes/solapes.
- [ ] E2E-022 Accesibilidad básica: navegar con teclado por el flujo principal y activar acciones.
- [ ] E2E-023 Regresión de navegación global: el header/sidebar siguen operativos tras completar el flujo.
- [ ] E2E-024 Estabilidad: ejecutar E2E principal 3 veces consecutivas sin flakes.


