// app/composables/useSuicIndexedDB.ts
import { ref } from 'vue';

interface SuicDataRecord {
  id: string;
  suicId: string;
  paisCode: string;
  data: any[];
  timestamp: number;
}

class SuicIndexedDB {
  private dbName = 'SuicDB';
  private version = 1;
  private storeName = 'suicData';
  private db: IDBDatabase | null = null;

  // Función auxiliar para serializar datos de forma segura
  private serializeData(data: any[]): any[] {
    return data.map(row => {
      try {
        // Crear un objeto completamente limpio
        const cleanRow: any = {};
        
        Object.keys(row).forEach(key => {
          const value = row[key];
          
          // Manejar diferentes tipos de valores
          if (value === null || value === undefined) {
            cleanRow[key] = null;
          } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            // Valores primitivos seguros
            cleanRow[key] = value;
          } else if (typeof value === 'function') {
            // Saltar funciones
            return;
          } else if (value instanceof Date) {
            // Convertir fechas a string ISO
            cleanRow[key] = value.toISOString();
          } else if (Array.isArray(value)) {
            // Arrays: serializar recursivamente
            cleanRow[key] = value.map(item => {
              if (typeof item === 'object' && item !== null) {
                try {
                  return JSON.parse(JSON.stringify(item));
                } catch {
                  return String(item);
                }
              }
              return item;
            });
          } else if (typeof value === 'object') {
            // Objetos: intentar serialización profunda
            try {
              cleanRow[key] = JSON.parse(JSON.stringify(value));
            } catch {
              // Fallback: convertir a string
              cleanRow[key] = String(value);
            }
          } else {
            // Cualquier otro tipo: convertir a string
            cleanRow[key] = String(value);
          }
        });
        
        return cleanRow;
      } catch (error) {
        console.warn('Error serializing row, using minimal fallback:', error);
        // Fallback mínimo: solo valores primitivos
        const minimalRow: any = {};
        Object.keys(row).forEach(key => {
          const value = row[key];
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            minimalRow[key] = value;
          } else if (value === null || value === undefined) {
            minimalRow[key] = null;
          } else {
            minimalRow[key] = String(value);
          }
        });
        return minimalRow;
      }
    });
  }

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Crear store si no existe
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // Crear índices para búsquedas eficientes
          store.createIndex('suicId', 'suicId', { unique: false });
          store.createIndex('paisCode', 'paisCode', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          
          console.log('✅ IndexedDB store created');
        }
      };
    });
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  async saveData(suicId: string, paisCode: string, data: any[]): Promise<void> {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Serializar los datos para evitar problemas de clonación
      console.log(`🔍 Serializing ${data.length} records for ${suicId}_${paisCode}`);
      const serializedData = this.serializeData(data);
      console.log(`✅ Serialization completed, sample record:`, serializedData[0]);

      const record: SuicDataRecord = {
        id: `${suicId}_${paisCode}`,
        suicId,
        paisCode,
        data: serializedData,
        timestamp: Date.now()
      };

      const request = store.put(record);

      request.onsuccess = () => {
        console.log(`💾 Saved ${serializedData.length} records for ${suicId}_${paisCode}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Error saving data:', request.error);
        const error = request.error;
        
        // Manejo específico para errores de clonación
        if (error && error.message && error.message.includes('could not be cloned')) {
          reject(new Error('Los datos contienen elementos que no se pueden almacenar. Intenta con un archivo más simple.'));
        } else {
          reject(error);
        }
      };
    });
  }

  async loadData(suicId: string): Promise<Record<string, any[]>> {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('suicId');
      
      const request = index.getAll(suicId);

      request.onsuccess = () => {
        const records: SuicDataRecord[] = request.result;
        const dataByPais: Record<string, any[]> = {};
        
        records.forEach(record => {
          dataByPais[record.paisCode] = record.data;
        });

        console.log(`📂 Loaded data for ${suicId}:`, Object.keys(dataByPais));
        resolve(dataByPais);
      };

      request.onerror = () => {
        console.error('Error loading data:', request.error);
        reject(request.error);
      };
    });
  }

  async clearCountry(suicId: string, paisCode: string): Promise<void> {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(`${suicId}_${paisCode}`);

      request.onsuccess = () => {
        console.log(`🗑️ Cleared data for ${suicId}_${paisCode}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing country data:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAll(suicId: string): Promise<void> {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('suicId');
      
      const request = index.getAll(suicId);

      request.onsuccess = () => {
        const records: SuicDataRecord[] = request.result;
        const deletePromises = records.map(record => {
          return new Promise<void>((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(record.id);
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            console.log(`🗑️ Cleared all data for ${suicId}`);
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => {
        console.error('Error clearing all data:', request.error);
        reject(request.error);
      };
    });
  }

  async getCountsBySuicId(suicId: string): Promise<Record<string, number>> {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('suicId');
      
      const request = index.getAll(suicId);

      request.onsuccess = () => {
        const records: SuicDataRecord[] = request.result;
        const counts: Record<string, number> = {};
        
        records.forEach(record => {
          counts[record.paisCode] = record.data.length;
        });

        console.log(`📊 Counts for ${suicId}:`, counts);
        resolve(counts);
      };

      request.onerror = () => {
        console.error('Error getting counts:', request.error);
        reject(request.error);
      };
    });
  }

  // Verificar si IndexedDB está disponible
  isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }
}

// Instancia singleton
const suicDB = new SuicIndexedDB();

export const useSuicIndexedDB = () => {
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const initDB = async (): Promise<void> => {
    if (!suicDB.isAvailable()) {
      throw new Error('IndexedDB no está disponible en este navegador');
    }

    isLoading.value = true;
    error.value = null;

    try {
      await suicDB.initDB();
      isInitialized.value = true;
    } catch (err: any) {
      error.value = err.message || 'Error inicializando IndexedDB';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const saveData = async (suicId: string, paisCode: string, data: any[]): Promise<void> => {
    if (!isInitialized.value) {
      await initDB();
    }

    try {
      await suicDB.saveData(suicId, paisCode, data);
    } catch (err: any) {
      error.value = err.message || 'Error guardando datos';
      throw err;
    }
  };

  const loadData = async (suicId: string): Promise<Record<string, any[]>> => {
    if (!isInitialized.value) {
      await initDB();
    }

    try {
      return await suicDB.loadData(suicId);
    } catch (err: any) {
      error.value = err.message || 'Error cargando datos';
      throw err;
    }
  };

  const clearCountry = async (suicId: string, paisCode: string): Promise<void> => {
    if (!isInitialized.value) {
      await initDB();
    }

    try {
      await suicDB.clearCountry(suicId, paisCode);
    } catch (err: any) {
      error.value = err.message || 'Error eliminando datos del país';
      throw err;
    }
  };

  const clearAll = async (suicId: string): Promise<void> => {
    if (!isInitialized.value) {
      await initDB();
    }

    try {
      await suicDB.clearAll(suicId);
    } catch (err: any) {
      error.value = err.message || 'Error eliminando todos los datos';
      throw err;
    }
  };

  const getCountsBySuicId = async (suicId: string): Promise<Record<string, number>> => {
    if (!isInitialized.value) {
      await initDB();
    }

    try {
      return await suicDB.getCountsBySuicId(suicId);
    } catch (err: any) {
      error.value = err.message || 'Error obteniendo conteos';
      throw err;
    }
  };

  return {
    isInitialized,
    isLoading,
    error,
    initDB,
    saveData,
    loadData,
    clearCountry,
    clearAll,
    getCountsBySuicId,
    isAvailable: () => suicDB.isAvailable()
  };
};
