import { defineStore } from "pinia";

export const useSapUsersStore = defineStore("sapUsers", {
  state: () => ({
    // Lista completa de usuarios con todos los datos
    users: [],
    // Usuario actualmente seleccionado
    selectedUser: null,
    // Estados de carga y error
    isLoading: false,
    error: null,
    // Timestamp de la última carga para cache
    lastFetch: null,
    // Cache válido por 5 minutos
    cacheValidityMs: 5 * 60 * 1000,
  }),

  getters: {
    /**
     * Lista de nombres de usuario para los selectores
     */
    sapUserNames: (state) => state.users.map((user) => user.usuario),

    /**
     * Obtiene un usuario por su nombre de usuario
     */
    getUserByUsername: (state) => (username) => {
      return state.users.find((user) => user.usuario === username) || null;
    },

    /**
     * Verifica si los datos en cache son válidos
     */
    isCacheValid: (state) => {
      if (!state.lastFetch) return false;
      const now = Date.now();
      return now - state.lastFetch < state.cacheValidityMs;
    },

    /**
     * Verifica si hay datos disponibles
     */
    hasUsers: (state) => state.users.length > 0,

    /**
     * Obtiene estadísticas de usuarios
     */
    stats: (state) => ({
      total: state.users.length,
      hasData: state.users.length > 0,
      lastUpdate: state.lastFetch
        ? new Date(state.lastFetch).toLocaleString()
        : null,
    }),
  },

  actions: {
    /**
     * Obtiene la lista de usuarios SAP desde la API
     * Incluye cache inteligente para evitar peticiones innecesarias
     */
    async fetchUsers(forceRefresh = false) {
      // Si no es refresh forzado y el cache es válido, no hacer petición
      if (!forceRefresh && this.isCacheValid && this.hasUsers) {
        console.log("📋 Store SAP Users: Usando datos en cache");
        return { success: true, fromCache: true };
      }

      this.isLoading = true;
      this.error = null;

      try {
        console.log("🚀 Store SAP Users: Obteniendo usuarios desde API...");

        const response = await $fetch("/api/sap/users");

        if (response.status === 200 && response.data) {
          this.users = response.data;
          this.lastFetch = Date.now();

          console.log(
            `✅ Store SAP Users: ${response.data.length} usuarios cargados exitosamente`,
          );
          console.log(
            "📊 Usuarios únicos por correo:",
            new Set(response.data.map((u) => u.correo)).size,
          );

          return {
            success: true,
            count: response.data.length,
            fromCache: false,
          };
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (error) {
        console.error("❌ Store SAP Users: Error al obtener usuarios:", error);

        this.error = error.message || "Error al obtener usuarios SAP";

        // Si hay usuarios en cache, mantenerlos pero marcar el error
        if (!this.hasUsers) {
          this.users = [];
        }

        return {
          success: false,
          error: this.error,
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Selecciona un usuario por su nombre de usuario
     */
    selectUser(username) {
      if (!username) {
        this.selectedUser = null;
        return null;
      }

      const user = this.getUserByUsername(username);

      if (user) {
        this.selectedUser = user;
        console.log("👤 Store SAP Users: Usuario seleccionado:", user.usuario);
        return user;
      } else {
        console.warn("⚠️ Store SAP Users: Usuario no encontrado:", username);
        this.selectedUser = null;
        return null;
      }
    },

    /**
     * Limpia la selección actual
     */
    clearSelection() {
      this.selectedUser = null;
      console.log("🧹 Store SAP Users: Selección limpiada");
    },

    /**
     * Refresca los datos forzando una nueva petición
     */
    async refreshUsers() {
      console.log("🔄 Store SAP Users: Refrescando usuarios...");
      return await this.fetchUsers(true);
    },

    /**
     * Limpia todos los datos del store
     */
    clearAll() {
      this.users = [];
      this.selectedUser = null;
      this.error = null;
      this.lastFetch = null;
      console.log("🧹 Store SAP Users: Store limpiado completamente");
    },

    /**
     * Inicializa el store cargando usuarios si es necesario
     */
    async initialize() {
      if (!this.hasUsers || !this.isCacheValid) {
        console.log("🏁 Store SAP Users: Inicializando store...");
        return await this.fetchUsers();
      } else {
        console.log(
          "📋 Store SAP Users: Store ya inicializado con datos válidos",
        );
        return { success: true, fromCache: true };
      }
    },
  },
});
