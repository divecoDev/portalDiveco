/**
 * Composable para cálculos de estadísticas de auditoría
 * Proporciona funciones reactivas para métricas de negocio
 */

import { computed } from "vue";
import type { AuditLog } from "~/domain/audit/types";
import {
  BUSINESS_HOURS,
  MASSIVE_DELETE_THRESHOLD,
  isOutsideBusinessHours,
  isCriticalAction,
} from "~/utils/audit-business-rules";

export const useAuditStatistics = () => {
  /**
   * Obtener intentos no autorizados (logs con errores o accesos denegados)
   * Busca en metadata errores o mensajes de acceso denegado
   */
  const getUnauthorizedAttempts = (
    logs: AuditLog[],
    hours: number = 24
  ): AuditLog[] => {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      if (logDate < cutoffTime) return false;

      // Buscar indicadores de error en metadata
      const metadata = log.metadata || {};
      const hasError =
        metadata.error ||
        metadata.statusCode === 403 ||
        metadata.statusCode === 401 ||
        metadata.message?.toLowerCase().includes("denied") ||
        metadata.message?.toLowerCase().includes("unauthorized") ||
        metadata.message?.toLowerCase().includes("forbidden");

      return hasError;
    });
  };

  /**
   * Obtener actividad fuera del horario laboral
   */
  const getOffHoursActivity = (logs: AuditLog[]): AuditLog[] => {
    return logs.filter((log) => isOutsideBusinessHours(log.timestamp));
  };

  /**
   * Detectar deletes masivos (múltiples deletes del mismo usuario en poco tiempo)
   */
  const getMassiveDeletes = (
    logs: AuditLog[],
    threshold: number = MASSIVE_DELETE_THRESHOLD
  ): Array<{ userId: string; userEmail: string; count: number; logs: AuditLog[] }> => {
    const deleteLogs = logs.filter((log) => log.action === "DELETE");
    const userDeletes: Record<
      string,
      { userEmail: string; logs: AuditLog[] }
    > = {};

    // Agrupar deletes por usuario en ventanas de 1 hora
    deleteLogs.forEach((log) => {
      if (!userDeletes[log.userId]) {
        userDeletes[log.userId] = {
          userEmail: log.userEmail,
          logs: [],
        };
      }
      userDeletes[log.userId].logs.push(log);
    });

    // Identificar usuarios con deletes masivos
    const massiveDeletes = Object.entries(userDeletes)
      .map(([userId, data]) => {
        // Agrupar por ventanas de 1 hora
        const hourlyGroups: Record<string, AuditLog[]> = {};
        data.logs.forEach((log) => {
          const date = new Date(log.timestamp);
          const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          if (!hourlyGroups[hourKey]) {
            hourlyGroups[hourKey] = [];
          }
          hourlyGroups[hourKey].push(log);
        });

        // Encontrar la hora con más deletes
        const maxHourly = Math.max(
          ...Object.values(hourlyGroups).map((group) => group.length)
        );

        if (maxHourly >= threshold) {
          return {
            userId,
            userEmail: data.userEmail,
            count: maxHourly,
            logs: data.logs,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return massiveDeletes;
  };

  /**
   * Obtener usuarios activos en un período
   */
  const getActiveUsers = (
    logs: AuditLog[],
    period: "today" | "week" | "month" = "today"
  ): number => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case "today":
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
    }

    const usersInPeriod = new Set<string>();
    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      if (logDate >= cutoffDate) {
        usersInPeriod.add(log.userId);
      }
    });

    return usersInPeriod.size;
  };

  /**
   * Obtener usuarios más productivos (top N)
   */
  const getUserProductivity = (
    logs: AuditLog[],
    topN: number = 5
  ): Array<{ userId: string; userEmail: string; userName?: string; count: number }> => {
    const userCounts: Record<
      string,
      { userEmail: string; userName?: string; count: number }
    > = {};

    logs.forEach((log) => {
      if (!userCounts[log.userId]) {
        userCounts[log.userId] = {
          userEmail: log.userEmail,
          userName: log.userName,
          count: 0,
        };
      }
      userCounts[log.userId].count++;
    });

    return Object.entries(userCounts)
      .map(([userId, data]) => ({
        userId,
        ...data,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  };

  /**
   * Obtener usuarios activos por semana (últimas N semanas)
   */
  const getWeeklyActiveUsers = (
    logs: AuditLog[],
    weeks: number = 8
  ): Array<{ week: string; count: number }> => {
    const weekData: Record<string, Set<string>> = {};

    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Domingo de esa semana
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weekData[weekKey]) {
        weekData[weekKey] = new Set();
      }
      weekData[weekKey].add(log.userId);
    });

    // Generar las últimas N semanas
    const result: Array<{ week: string; count: number }> = [];
    const now = new Date();
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - i * 7);
      const weekKey = weekStart.toISOString().split("T")[0];
      const count = weekData[weekKey]?.size || 0;

      const weekLabel = weekStart.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });

      result.push({ week: weekLabel, count });
    }

    return result;
  };

  /**
   * Obtener operaciones por módulo (últimos 30 días)
   */
  const getModuleUsage = (
    logs: AuditLog[]
  ): Array<{ module: string; count: number }> => {
    const moduleCounts: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    logs
      .filter((log) => new Date(log.timestamp) >= thirtyDaysAgo)
      .forEach((log) => {
        moduleCounts[log.module] = (moduleCounts[log.module] || 0) + 1;
      });

    return Object.entries(moduleCounts)
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count);
  };

  /**
   * Obtener cambios críticos recientes
   */
  const getCriticalChanges = (
    logs: AuditLog[],
    hours: number = 48
  ): AuditLog[] => {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return logs
      .filter((log) => {
        const logDate = new Date(log.timestamp);
        if (logDate < cutoffTime) return false;
        return isCriticalAction(log.action);
      })
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  };

  /**
   * Calcular tasa de éxito global
   */
  const getSuccessRate = (logs: AuditLog[]): number => {
    if (logs.length === 0) return 100;

    const errorLogs = logs.filter((log) => {
      const metadata = log.metadata || {};
      return (
        metadata.error ||
        metadata.statusCode >= 400 ||
        metadata.message?.toLowerCase().includes("error")
      );
    });

    const successCount = logs.length - errorLogs.length;
    return Math.round((successCount / logs.length) * 100);
  };

  /**
   * Obtener estadísticas del día
   */
  const getTodayStats = (
    logs: AuditLog[]
  ): { total: number; successRate: number } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter(
      (log) => new Date(log.timestamp) >= today
    );

    return {
      total: todayLogs.length,
      successRate: getSuccessRate(todayLogs),
    };
  };

  /**
   * Obtener módulo más usado
   */
  const getTopModule = (
    logs: AuditLog[]
  ): { module: string; count: number } | null => {
    const moduleUsage = getModuleUsage(logs);
    return moduleUsage[0] || null;
  };

  return {
    getUnauthorizedAttempts,
    getOffHoursActivity,
    getMassiveDeletes,
    getActiveUsers,
    getUserProductivity,
    getWeeklyActiveUsers,
    getModuleUsage,
    getCriticalChanges,
    getSuccessRate,
    getTodayStats,
    getTopModule,
  };
};
