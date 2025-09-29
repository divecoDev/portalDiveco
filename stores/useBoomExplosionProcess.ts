import { defineStore } from 'pinia'

export interface BoomExplosionStep {
  id: string
  title: string
  icon: string
  completed: boolean
  disabled: boolean
}

export interface BoomExplosionState {
  explosionId: string | null
  currentStep: number
  completedSteps: Record<string, boolean>
  availableSteps: BoomExplosionStep[]
  isLoading: boolean
  hasSavedData: boolean
  showCargaProcess: boolean
}

export const useBoomExplosionProcessStore = defineStore('boomExplosionProcess', {
  state: (): BoomExplosionState => ({
    explosionId: null,
    currentStep: 0,
    completedSteps: {
      'carga-de-insumos': false,
      'generar-plan-de-produccion': false,
      'validacion-de-aprovisionamiento': false,
      'explocionar': false
    },
    availableSteps: [],
    isLoading: false,
    hasSavedData: false,
    showCargaProcess: false
  }),

  getters: {
    // Determinar qué pasos están disponibles basado en el progreso
    computedAvailableSteps: (state): BoomExplosionStep[] => {
      const stepperItems = [
        {
          id: 'carga-de-insumos',
          title: 'Carga de insumos',
          icon: 'i-heroicons-circle-stack',
        },
        {
          id: 'generar-plan-de-produccion',
          title: 'Generar plan de producción',
          icon: 'i-heroicons-beaker',
        },
        {
          id: 'validacion-de-aprovisionamiento',
          title: 'Validacion de Aprovisionamiento',
          icon: 'i-heroicons-shield-check',
        },
        {
          id: 'explocionar',
          title: 'Explocionar',
          icon: 'i-heroicons-bolt',
        },
      ]

      return stepperItems.map((item, index) => {
        let disabled = false

        // El primer paso siempre está disponible
        if (index === 0) {
          disabled = false
        }
        // Los siguientes pasos dependen del anterior
        else if (index === 1) {
          disabled = !state.completedSteps['carga-de-insumos']
        }
        else if (index === 2) {
          disabled = !state.completedSteps['generar-plan-de-produccion']
        }
        else if (index === 3) {
          disabled = !state.completedSteps['validacion-de-aprovisionamiento']
        }

        return {
          ...item,
          completed: state.completedSteps[item.id],
          disabled
        }
      })
    },

    // Verificar si hay datos guardados
    computedHasSavedData: (state): boolean => {
      return state.completedSteps['carga-de-insumos'] && state.hasSavedData
    },

    // Obtener el progreso general del proceso
    progressPercentage: (state): number => {
      const totalSteps = Object.keys(state.completedSteps).length
      const completedCount = Object.values(state.completedSteps).filter(Boolean).length
      return Math.round((completedCount / totalSteps) * 100)
    }
  },

  actions: {
    // Inicializar el proceso para una explosión específica
    initializeProcess(explosionId: string) {
      this.explosionId = explosionId
      this.loadStateFromStorage()
    },

    // Cargar estado desde localStorage
    loadStateFromStorage() {
      if (!this.explosionId) return

      try {
        const storageKey = `boom-explosion-${this.explosionId}`
        const savedState = localStorage.getItem(storageKey)

        if (savedState) {
          const parsedState = JSON.parse(savedState)
          this.currentStep = parsedState.currentStep || 0
          this.completedSteps = { ...this.completedSteps, ...parsedState.completedSteps }
          this.hasSavedData = parsedState.hasSavedData || false
          this.showCargaProcess = parsedState.showCargaProcess || false
        }
      } catch (error) {
        console.error('Error loading state from storage:', error)
      }
    },

    // Guardar estado en localStorage
    saveStateToStorage() {
      if (!this.explosionId) return

      try {
        const storageKey = `boom-explosion-${this.explosionId}`
        const stateToSave = {
          currentStep: this.currentStep,
          completedSteps: this.completedSteps,
          hasSavedData: this.hasSavedData,
          showCargaProcess: this.showCargaProcess,
          lastUpdated: new Date().toISOString()
        }

        localStorage.setItem(storageKey, JSON.stringify(stateToSave))
      } catch (error) {
        console.error('Error saving state to storage:', error)
      }
    },

    // Establecer el paso actual
    setCurrentStep(step: number) {
      this.currentStep = step
      this.saveStateToStorage()
    },

    // Marcar un paso como completado
    completeStep(stepId: string) {
      this.completedSteps[stepId] = true
      this.saveStateToStorage()
    },

    // Marcar un paso como no completado
    uncompleteStep(stepId: string) {
      this.completedSteps[stepId] = false
      this.saveStateToStorage()
    },

    // Establecer si hay datos guardados
    setHasSavedData(hasData: boolean) {
      this.hasSavedData = hasData
      this.saveStateToStorage()
    },

    // Establecer si mostrar el proceso de carga
    setShowCargaProcess(show: boolean) {
      this.showCargaProcess = show
      this.saveStateToStorage()
    },

    // Avanzar al siguiente paso
    nextStep() {
      const maxStep = this.computedAvailableSteps.length - 1
      if (this.currentStep < maxStep) {
        this.currentStep++
        this.saveStateToStorage()
      }
    },

    // Retroceder al paso anterior
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
        this.saveStateToStorage()
      }
    },

    // Ir a un paso específico
    goToStep(step: number) {
      const maxStep = this.computedAvailableSteps.length - 1
      if (step >= 0 && step <= maxStep) {
        this.currentStep = step
        this.saveStateToStorage()
      }
    },

    // Resetear el proceso completo
    resetProcess() {
      this.currentStep = 0
      this.completedSteps = {
        'carga-de-insumos': false,
        'generar-plan-de-produccion': false,
        'validacion-de-aprovisionamiento': false,
        'explocionar': false
      }
      this.hasSavedData = false
      this.showCargaProcess = false
      this.saveStateToStorage()
    },

    // Limpiar el estado almacenado
    clearStoredState() {
      if (!this.explosionId) return

      try {
        const storageKey = `boom-explosion-${this.explosionId}`
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.error('Error clearing stored state:', error)
      }
    },

    // Manejar cuando se completa la carga de insumos
    handleCargaInsumosCompleted() {
      this.completeStep('carga-de-insumos')
      this.nextStep()
    },

    // Manejar cuando se completa el plan de producción
    handlePlanProduccionCompleted() {
      this.completeStep('generar-plan-de-produccion')
      this.nextStep()
    },

    // Manejar cuando se completa la validación de aprovisionamiento
    handleValidacionAprovisionamientoCompleted() {
      this.completeStep('validacion-de-aprovisionamiento')
      this.nextStep()
    },

    // Manejar cuando se completa la explosión
    handleExplosionCompleted() {
      this.completeStep('explocionar')
    }
  }
})
