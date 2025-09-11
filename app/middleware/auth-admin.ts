export default defineNuxtRouteMiddleware(async (to) => {
  // Solo ejecutar en el cliente
  if (process.server) {
    return;
  }

  // Middleware temporal para desarrollo
  // En producción, esto debe ser reemplazado por la autenticación real

  console.log(
    "🔧 Middleware auth-admin-dev: Permitiendo acceso para desarrollo"
  );

  // Para desarrollo, permitir acceso a todos los usuarios
  // En producción, esto debe verificar la autenticación real
  return false;
});
