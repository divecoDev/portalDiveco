/**
 * Middleware para bloquear rutas durante ventanas de ejecución de RPA
 * 
 * Este middleware verifica si hay una ventana de ejecución RPA activa
 * antes de permitir el acceso a rutas configuradas como restringidas.
 */

import { isRouteRestricted } from "~/config/rpa-restrictions";
import { useRpaRestriction } from "~/composables/useRpaRestriction";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Verificar si la ruta está en la lista de restringidas
  const restrictedTool = isRouteRestricted(to.path);

  if (!restrictedTool) {
    // La ruta no está restringida, permitir acceso
    return;
  }

  // La ruta está restringida, verificar estado de restricción
  const { checkRestrictionStatus, isRestricted, getActiveWindow, getRestrictionMessage } = useRpaRestriction();

  try {
    // Consultar estado de restricción (sin cache para verificación en tiempo real)
    const status = await checkRestrictionStatus(true);

    if (status.isRestricted) {
      // Hay una ventana activa, bloquear acceso
      const activeWindow = getActiveWindow.value;
      const message = getRestrictionMessage.value || "Esta herramienta está deshabilitada temporalmente debido a la ejecución de procesos críticos (RPA). Intente de nuevo más tarde.";

      // Redirigir a página de bloqueo o mostrar mensaje
      // Por ahora, redirigimos a una página de bloqueo
      // En el futuro, podríamos mostrar un modal o mensaje inline
      return navigateTo({
        path: "/tools/rpa-horarios/blocked",
        query: {
          returnTo: to.path,
          message: message,
          windowName: activeWindow?.name || "",
          startTime: activeWindow?.startTime || "",
          endTime: activeWindow?.endTime || "",
        },
      });
    }

    // No hay restricción activa, permitir acceso
    return;
  } catch (error) {
    console.error("Error verificando restricción RPA:", error);
    // En caso de error, permitir acceso para evitar bloquear el sistema
    // por errores técnicos
    return;
  }
});

