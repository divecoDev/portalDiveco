// app/composables/useSuicData.ts
import { useSuicIndexedDB } from './useSuicIndexedDB';

export const useSuicData = (suicId: string) => {
  const loadedCounts = ref<Record<string, number>>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Usar IndexedDB como almacenamiento principal
  const { 
    saveData: saveToIndexedDB, 
    loadData: loadFromIndexedDB, 
    clearCountry: clearCountryFromIndexedDB, 
    clearAll: clearAllFromIndexedDB,
    getCountsBySuicId,
    isAvailable: isIndexedDBAvailable
  } = useSuicIndexedDB();

  // Fallback a localStorage si IndexedDB no está disponible
  const storageKey = `suic_data_${suicId}`;

  const loadDataFromStorage = (): Record<string, any[]> => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error: any) {
      console.error('Error loading from localStorage:', error);
      return {};
    }
  };

  const saveDataToStorage = (data: Record<string, any[]>): void => {
    try {
      const currentData = loadDataFromStorage();
      const merged = { ...currentData, ...data };
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch (error: any) {
      console.error('Error saving to localStorage:', error);
      if (error.name === 'QuotaExceededError') {
        throw new Error('Espacio insuficiente');
      }
      throw error;
    }
  };

  const loadData = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      if (isIndexedDBAvailable()) {
        console.log('🔍 Loading data from IndexedDB...');
        const counts = await getCountsBySuicId(suicId);
        loadedCounts.value = counts;
        console.log('📈 Final counts from IndexedDB:', counts);
      } else {
        console.log('🔍 Loading data from localStorage (fallback)...');
        const data = loadDataFromStorage();
        const counts: Record<string, number> = {};
        Object.entries(data).forEach(([pais, rows]) => {
          counts[pais] = (rows as any[]).length;
        });
        loadedCounts.value = counts;
        console.log('📈 Final counts from localStorage:', counts);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      error.value = err.message || 'Error cargando datos';
      
      // Fallback a localStorage si IndexedDB falla
      if (isIndexedDBAvailable()) {
        console.log('🔄 Falling back to localStorage...');
        const data = loadDataFromStorage();
        const counts: Record<string, number> = {};
        Object.entries(data).forEach(([pais, rows]) => {
          counts[pais] = (rows as any[]).length;
        });
        loadedCounts.value = counts;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const saveData = async (dataByPais: Record<string, any[]>): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      if (isIndexedDBAvailable()) {
        console.log('💾 Saving data to IndexedDB...');
        // Guardar cada país por separado en IndexedDB
        const savePromises = Object.entries(dataByPais).map(([paisCode, data]) => 
          saveToIndexedDB(suicId, paisCode, data)
        );
        await Promise.all(savePromises);
        console.log('✅ All data saved to IndexedDB');
      } else {
        console.log('💾 Saving data to localStorage (fallback)...');
        saveDataToStorage(dataByPais);
      }
      
      // Recargar datos después de guardar
      await loadData();
    } catch (err: any) {
      console.error('Error saving data:', err);
      error.value = err.message || 'Error guardando datos';
      
      // Fallback a localStorage si IndexedDB falla
      if (isIndexedDBAvailable()) {
        console.log('🔄 Falling back to localStorage...');
        try {
          saveDataToStorage(dataByPais);
          await loadData();
        } catch (fallbackErr: any) {
          console.error('Fallback also failed:', fallbackErr);
          throw fallbackErr;
        }
      } else {
        throw err;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const clearCountry = async (paisCode: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      if (isIndexedDBAvailable()) {
        console.log(`🗑️ Clearing country ${paisCode} from IndexedDB...`);
        await clearCountryFromIndexedDB(suicId, paisCode);
      } else {
        console.log(`🗑️ Clearing country ${paisCode} from localStorage...`);
        const data = loadDataFromStorage();
        delete data[paisCode];
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
      
      await loadData();
    } catch (err: any) {
      console.error('Error clearing country:', err);
      error.value = err.message || 'Error eliminando datos del país';
      
      // Fallback a localStorage si IndexedDB falla
      if (isIndexedDBAvailable()) {
        console.log('🔄 Falling back to localStorage...');
        const data = loadDataFromStorage();
        delete data[paisCode];
        localStorage.setItem(storageKey, JSON.stringify(data));
        await loadData();
      } else {
        throw err;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const clearAll = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      if (isIndexedDBAvailable()) {
        console.log(`🗑️ Clearing all data for ${suicId} from IndexedDB...`);
        await clearAllFromIndexedDB(suicId);
      } else {
        console.log(`🗑️ Clearing all data for ${suicId} from localStorage...`);
        localStorage.removeItem(storageKey);
      }
      
      loadedCounts.value = {};
    } catch (err: any) {
      console.error('Error clearing all data:', err);
      error.value = err.message || 'Error eliminando todos los datos';
      
      // Fallback a localStorage si IndexedDB falla
      if (isIndexedDBAvailable()) {
        console.log('🔄 Falling back to localStorage...');
        localStorage.removeItem(storageKey);
        loadedCounts.value = {};
      } else {
        throw err;
      }
    } finally {
      isLoading.value = false;
    }
  };

  return {
    loadedCounts,
    isLoading,
    error,
    loadDataFromStorage,
    saveData,
    loadData,
    clearCountry,
    clearAll
  };
};
