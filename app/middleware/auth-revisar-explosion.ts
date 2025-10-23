export default defineNuxtRouteMiddleware(async (to, from) => {
  const { hasGroup, fetchUserGroups } = useUserGroups(false); // No autoFetch para evitar onMounted
  
  // Cargar grupos manualmente antes de hacer validaciones
  await fetchUserGroups();
  
  // Permitir acceso si es EXPLOSION, REVISAR-EXPLOSION o ADMIN
  if (!hasGroup('EXPLOSION') && !hasGroup('REVISAR-EXPLOSION') && !hasGroup('ADMIN')) {
    return navigateTo('/');
  }
  
  // Si es REVISAR-EXPLOSION, bloquear rutas de edición y creación
  if (hasGroup('REVISAR-EXPLOSION') && !hasGroup('EXPLOSION') && !hasGroup('ADMIN')) {
    const restrictedPaths = [
      '/tools/explosion-materiales/new',
      '/tools/explosion-materiales/edit',
      '/tools/explosion-materiales/view'
    ];
    
    if (restrictedPaths.some(path => to.path.includes(path))) {
      return navigateTo('/tools/explosion-materiales');
    }
  }
  
  // Si es EXPLOSION, bloquear acceso a documentos (solo para REVISAR-EXPLOSION)
  if (hasGroup('EXPLOSION') && !hasGroup('REVISAR-EXPLOSION') && !hasGroup('ADMIN')) {
    if (to.path.includes('/tools/explosion-materiales/documents/')) {
      return navigateTo('/tools/explosion-materiales');
    }
  }
});
