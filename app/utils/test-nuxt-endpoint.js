// Archivo de prueba para el endpoint de Nuxt
// Este archivo se puede ejecutar en la consola del navegador

export async function testNuxtEndpoint() {
  const testData = {
    sapUser: "TEST_USER",
    email: "test@diveco.com",
  };

  console.log("🧪 Probando endpoint de Nuxt...");
  console.log("📤 Datos de prueba:", testData);

  try {
    const response = await $fetch("/api/sap/unlock-user", {
      method: "POST",
      body: testData,
    });

    console.log("✅ Respuesta exitosa:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en el endpoint:", error);

    if (error.statusCode) {
      console.error("📊 Detalles del error:", {
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        data: error.data,
      });
    }

    return { success: false, error: error.message };
  }
}

// Función para probar desde la consola del navegador
window.testNuxtEndpoint = testNuxtEndpoint;
