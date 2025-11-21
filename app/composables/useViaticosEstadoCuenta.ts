import { ref, computed, watch, type Ref, type ComputedRef } from "vue";
import type { ViaticoEstadoCuenta, ViaticoTransaccion } from "~/domain/viaticos/types";

// Generar datos mock para estado de cuenta
const generateMockEstadoCuenta = (
  employeeId: number,
  year: number,
  month: number
): ViaticoEstadoCuenta => {
  const empleados = [
    { id: 103292, nombre: "MK CHRISTIAN OMAR GARCIA GARCIA", codigo: "103292" },
    { id: 103539, nombre: "OSCAR ADRIAN VASQUEZ VASQUEZ", codigo: "103539" },
    { id: 103307, nombre: "MK JORGE MARIO SANTOS GODOY", codigo: "103307" },
    { id: 1, nombre: "Juan Pérez", codigo: "EMP001" },
    { id: 2, nombre: "María González", codigo: "EMP002" },
  ];

  const empleado = empleados.find((e) => e.id === employeeId) || empleados[0];

  // Generar transacciones mock
  const transacciones: ViaticoTransaccion[] = [];
  const diasMes = new Date(year, month, 0).getDate();
  let balanceAcumulado = 2157.77; // Saldo mes anterior

  // Agregar crédito inicial
  transacciones.push({
    fechaOperacion: `${year}-${String(month).padStart(2, "0")}-01`,
    facturaSerie: "CREDITO_INICIAL",
    debito: 0,
    credito: 5000,
    balance: balanceAcumulado + 5000,
  });
  balanceAcumulado += 5000;

  // Generar débitos aleatorios
  for (let i = 0; i < 8; i++) {
    const dia = Math.floor(Math.random() * diasMes) + 1;
    const debito = Math.random() * 300 + 15;
    balanceAcumulado -= debito;

    transacciones.push({
      fechaOperacion: `${year}-${String(month).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      facturaSerie: `${Math.floor(Math.random() * 100000000000000000)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      debito: Math.round(debito * 100) / 100,
      credito: 0,
      balance: Math.round(balanceAcumulado * 100) / 100,
    });
  }

  // Ordenar por fecha
  transacciones.sort((a, b) => a.fechaOperacion.localeCompare(b.fechaOperacion));

  const totalDebito = transacciones.reduce((sum, t) => sum + t.debito, 0);
  const totalCredito = transacciones.reduce((sum, t) => sum + t.credito, 0);
  const saldoAFavor = balanceAcumulado;

  return {
    empleado: {
      id: empleado.id,
      nombre: empleado.nombre,
      codigo: empleado.codigo,
    },
    saldoMesAnterior: 2157.77,
    saldoAFavor: saldoAFavor,
    transacciones,
    totalDebito: Math.round(totalDebito * 100) / 100,
    totalCredito: Math.round(totalCredito * 100) / 100,
  };
};

export const useViaticosEstadoCuenta = (
  employeeId?: number | Ref<number | undefined> | ComputedRef<number | undefined>,
  year?: number | Ref<number | undefined> | ComputedRef<number | undefined>,
  month?: number | Ref<number | undefined> | ComputedRef<number | undefined>
) => {
  // Estado reactivo local a esta instancia
  const estadoCuenta = ref<ViaticoEstadoCuenta | null>(null);
  const loading = ref(false);

  // Convertir a computed si son refs o computed
  const employeeIdValue = computed(() => {
    if (employeeId === undefined) return undefined;
    if (typeof employeeId === "object" && "value" in employeeId) {
      return employeeId.value;
    }
    return employeeId;
  });

  const yearValue = computed(() => {
    if (year === undefined) return new Date().getFullYear();
    if (typeof year === "object" && "value" in year) {
      return year.value || new Date().getFullYear();
    }
    return year || new Date().getFullYear();
  });

  const monthValue = computed(() => {
    if (month === undefined) return new Date().getMonth() + 1;
    if (typeof month === "object" && "value" in month) {
      return month.value || new Date().getMonth() + 1;
    }
    return month || new Date().getMonth() + 1;
  });

  // Cargar estado de cuenta
  const loadEstadoCuenta = async () => {
    if (!employeeIdValue.value) {
      estadoCuenta.value = null;
      return;
    }

    loading.value = true;
    try {
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 500));
      estadoCuenta.value = generateMockEstadoCuenta(
        employeeIdValue.value,
        yearValue.value,
        monthValue.value
      );
    } catch (error) {
      console.error("Error al cargar estado de cuenta:", error);
      estadoCuenta.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Cargar cuando cambian los parámetros
  watch([employeeIdValue, yearValue, monthValue], () => {
    loadEstadoCuenta();
  }, { immediate: true });

  // Datos para gráfica de débito y crédito
  const debitCreditChartData = computed(() => {
    if (!estadoCuenta.value) return null;

    return {
      labels: ["Debito", "Credito"],
      datasets: [
        {
          label: "Monto",
          data: [estadoCuenta.value.totalDebito, estadoCuenta.value.totalCredito],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)", // Azul para débito
            "rgba(34, 197, 94, 0.8)", // Verde para crédito
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(34, 197, 94, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  });

  return {
    estadoCuenta: computed(() => estadoCuenta.value),
    loading: computed(() => loading.value),
    debitCreditChartData,
    loadEstadoCuenta,
  };
};

