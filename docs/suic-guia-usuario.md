# Guía de Usuario · Carga de Plantilla SUIC

Esta guía explica, con lenguaje sencillo, cómo utilizar la pantalla **Carga de Plantilla SUIC** dentro del Portal Diveco (Módulo 4). Está pensada para gerentes, personal administrativo y cualquier colaborador responsable de preparar la proyección de ventas regional.

---

## 1. Antes de Empezar

- **Plantilla oficial**: Trabaja siempre con la plantilla SUIC más reciente descargada desde el portal. Evita usar versiones antiguas o copias modificadas.
- **Información requerida**: La plantilla incluye seis países (`GT`, `SV`, `HN`, `NI`, `CR`, `PA`). Cada fila representa un centro y un cliente con sus metas mensuales.
- **Formato del archivo**: Solo se aceptan archivos Excel (`.xlsx` o `.xls`). No se admiten CSV u otros formatos.
- **Campos principales por fila**:
  - `pais` (texto en mayúsculas, ej. `GT`)
  - `centro` (código numérico o alfanumérico según el país)
  - `codigo_cliente` y `cliente_correcto` (identificación y nombre del cliente)
  - `material`, `modelo`, `linea`, `color`, `marca`, `presentacion`, `tamano`
  - Para cada mes (1 al 12): `unidades_plan_[mes]`, `precio_proyectado_[mes]`, `venta_bruta_plan_[mes]`, `porcentaje__desc_merc_[mes]`, `descuento_merc_[mes]`, `porcentaje__desc_ben_[mes]`, `descuento_ben_[mes]`, `venta_plan_[mes]`
- **Tipos de datos recomendados**:
  - Textos: sin tildes ni caracteres especiales; usa mayúsculas donde aplique.
  - Números: utiliza valores enteros o decimales. Evita símbolos como `%` o `Q`.
  - Celdas vacías permitidas: Únicamente para columnas mensuales (se guardan como `0` o `null`). Las columnas fijas (pais, centro, etc.) deben estar completas.
- **Validaciones internas**: El sistema revisa que todas las columnas estén presentes, que el orden sea correcto y que las celdas obligatorias tengan datos.

---

## 2. Recorrido por la Pantalla

1. **Header principal**  
   - Título “Carga Plantilla SUIC” con ícono cyan.
   - Descripción breve del objetivo.

2. **Zona de acciones rápidas**  
   - Botón `Descargar Plantilla`: Obtiene el Excel oficial.
   - Botón `Cargar Archivo Excel`: Abre el modal para subir la plantilla.
   - Botón `Guardar en Base de Datos`: Solo aparece cuando hay datos listos en caché.

3. **Indicadores por país** (`SuicCountryIndicators`)  
   - Muestra cuántos registros hay cargados por país.
   - Indica el estado de cada país (Sin procesar, Guardando, Guardado, Error).
   - Incluye acciones para limpiar un país específico o limpiar todos los datos temporales.

4. **Historial de carga** (si aplica)  
   - Sección informativa sobre cargas previas y enlaces de auditoría.

---

## 3. Paso a Paso para Cargar la Plantilla

### Paso 1 · Descargar la Plantilla
1. En el módulo SUIC, presiona `Descargar Plantilla`.
2. Guarda el archivo en tu equipo y ábrelo para llenarlo.

### Paso 2 · Completar la Información
1. Ingresa los datos por país, centro y cliente.  
   - Verifica que `pais` esté en mayúsculas y coincida con los seis códigos válidos.
   - Completa todos los campos clave (pais, centro, asignaciones, cliente, material, etc.).
2. Captura los valores mensuales según la planificación.
3. Evita dejar filas en blanco a mitad de la información; si no usarás una fila, elimínala.

### Paso 3 · Cargar el Archivo en el Portal
1. Regresa al portal y presiona `Cargar Archivo Excel`.
2. En el modal:
   - Haz clic en “Seleccionar archivo Excel”.
   - Elige la plantilla que acabas de llenar.
3. El sistema leerá el archivo y mostrará el nombre del archivo en el modal.
4. Si todo está correcto, el modal se cerrará automáticamente y verás los registros en los indicadores por país.

---

## 4. Validaciones Automáticas

Al seleccionar el archivo, el portal realiza varias revisiones automáticamente:

- **Formato**: debe ser `.xlsx` o `.xls`.
- **Columnas**: revisa que las 119 columnas existan y estén en el orden correcto. Si falta una, se mostrará el nombre de la columna faltante.
- **Campos obligatorios**: si alguna celda crítica está vacía (ej. `pais`, `centro`, `codigo_cliente`), se mostrará una advertencia indicando la fila y el nombre de la columna.
- **Código de país**: solo acepta `GT`, `SV`, `HN`, `NI`, `CR`, `PA`. Se indica si se detecta uno distinto.
- **Meses incompletos**: si un mes tiene valores inconsistentes (ej. falta `unidades_plan_5`), se mostrará un aviso amarillo con los meses detectados.
- **Conflictos con datos previos**: si ya habías cargado datos para alguno de los países, el sistema te pedirá confirmación antes de reemplazarlos.

**Nota**: Si ocurre un error, corrige el archivo en tu computadora y vuelve a subirlo. No es necesario cerrar el modal.

---

## 5. Qué Sucede al Guardar (Respaldo y Caché)

Cuando el archivo pasa las validaciones iniciales:

1. **Respaldo en la nube (S3)**  
   - El portal guarda una copia del archivo original en un repositorio seguro.  
   - Si esta carga falla, verás un aviso amarillo; aun así, podrás continuar y los datos quedarán en caché local.

2. **Almacenamiento temporal (IndexedDB)**  
   - Los registros se guardan en tu navegador, separados por país.  
   - Esto permite revisar los datos antes de guardarlos definitivamente.  
   - Puedes cerrar la sesión y volver más tarde; los datos quedan disponibles en el mismo equipo y navegador.

3. **Indicadores por país**  
   - Para cada país cargado, verás la cantidad de registros y el estado actual.
   - Usa los botones de “Limpiar” si necesitas eliminar la caché de un país específico.

---

## 6. Guardar en Base de Datos (Proceso Final)

Cuando estés listo para consolidar la información en el sistema:

1. Asegúrate de que todos los países que deseas enviar aparezcan en los indicadores.
2. Presiona el botón `Guardar en Base de Datos`.
3. El portal procesará país por país. Para cada país:
   - Dividirá los datos en grupos de 500 registros.
   - El primer grupo eliminará los datos anteriores del país (garantiza que no queden duplicados).
   - Insertará todos los registros nuevos.
4. Durante este proceso verás:
   - **Estado “Guardando…”**: una barra azul muestra el progreso.
   - **Estado “Guardado”**: aparece un check verde cuando termina.
   - **Estado “Error”**: si algo falla, se mostrará en rojo y podrás consultar el mensaje emergente (toast).
5. Al finalizar, recibirás una notificación confirmando que el proceso se completó.

---

## 7. Mensajes y Estados Comunes

| Mensaje / Estado                 | Qué significa                                             | Cómo actuar                                              |
|----------------------------------|-----------------------------------------------------------|----------------------------------------------------------|
| `Archivo vacío`                  | El Excel no tiene filas con datos.                        | Revisa que hayas llenado la plantilla antes de cargarla. |
| `Faltan columnas`                | La estructura cambió o se eliminaron columnas.            | Descarga nuevamente la plantilla oficial.                |
| `Celda vacía en columna obligatoria` | Falta información básica en alguna fila.                  | Completa la celda indicada y vuelve a subir el archivo.  |
| `País inválido`                  | Se detectó un código diferente a GT, SV, HN, NI, CR, PA.   | Corrige el valor y asegúrate de utilizar mayúsculas.     |
| `Advertencia de meses`           | Algunas columnas mensuales no tienen datos.               | Verifica si se trata de un caso real o un error.         |
| `Guardar en Base de Datos` deshabilitado | No hay datos en caché para enviar.                    | Carga o confirma los datos antes de intentar guardar.    |
| Barra de progreso azul           | El país se está guardando en el servidor.                 | Espera a que termine.                                    |
| Estado verde “Guardado”          | El país se guardó correctamente en la base de datos.      | Continúa con otros países o cierra la pantalla.          |
| Estado rojo “Error”              | Ocurrió un problema al guardar ese país.                  | Revisa el mensaje emergente y vuelve a intentar.         |

---

## 8. Buenas Prácticas

- Revisa los totales por país antes de guardar; los indicadores muestran el número de filas registradas.
- Si necesitas corregir un país, utiliza el botón “Limpiar” antes de volver a cargar el archivo para evitar confusiones.
- Mantén una copia local del Excel enviado. Puede ser útil para auditorías o consultas posteriores.
- Evita abrir varias sesiones del portal al mismo tiempo; podrías sobrescribir la caché sin darte cuenta.
- Si cambias de equipo o navegador, deberás volver a cargar el archivo para tener los datos en caché.

---

## 9. Preguntas Frecuentes

**¿Puedo cargar países por separado?**  
Sí. Puedes preparar un archivo con uno o varios países. Al guardar, solo se procesarán los países incluidos en la caché.

**¿Qué pasa si cierro el navegador después de cargar pero antes de guardar?**  
Los datos permanecen en caché en el mismo navegador y equipo. Al regresar, verás nuevamente los indicadores y podrás continuar.

**¿Cómo confirmo que los datos se guardaron?**  
Cada país muestra el estado “Guardado” y aparece una notificación de éxito. Además, el archivo queda respaldado en S3 y el equipo de datos procesa la información para reportes.

**¿Puedo descargar los datos que ya guardé?**  
La guía actual cubre solo la carga. Los reportes y exportaciones se gestionan en las secciones de consulta del módulo (Capa Gold).

---

## 10. Soporte

Si persisten errores o necesitas asistencia:

- Contacta al equipo de soporte del Portal Diveco.
- Adjunta el mensaje de error y, si es posible, el archivo Excel utilizado.
- Indica fecha y hora en que ocurrió el incidente para facilitar el seguimiento.

---

**Última actualización:** noviembre 2025. Para cambios futuros en la interfaz o reglas de negocio, se publicará una nueva versión de esta guía.

