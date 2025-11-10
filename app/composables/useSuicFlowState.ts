import { generateClient } from 'aws-amplify/data';

export type SuicStepKey = 'step1' | 'step2' | 'step3';
export type SuicStepStatus = 'pending' | 'processing' | 'completed' | 'error';

export type SuicStepState = {
  status: SuicStepStatus;
  updatedAt: string | null;
  message?: string | null;
};

export type SuicFlowState = Record<SuicStepKey, SuicStepState>;

const STEP_KEYS: SuicStepKey[] = ['step1', 'step2', 'step3'];

export const createDefaultSuicFlowState = (): SuicFlowState => ({
  step1: { status: 'pending', updatedAt: null, message: null },
  step2: { status: 'pending', updatedAt: null, message: null },
  step3: { status: 'pending', updatedAt: null, message: null }
});

const normalizeStepState = (state: Partial<SuicStepState> | undefined): SuicStepState => ({
  status: (state?.status as SuicStepStatus) ?? 'pending',
  updatedAt: state?.updatedAt ?? null,
  message: state?.message ?? null
});

export const parseSuicFlowState = (raw: unknown): SuicFlowState => {
  if (!raw) {
    return createDefaultSuicFlowState();
  }

  let parsedValue: any = raw;

  if (typeof raw === 'string') {
    try {
      parsedValue = JSON.parse(raw);
    } catch {
      return createDefaultSuicFlowState();
    }
  }

  if (typeof parsedValue !== 'object' || parsedValue === null) {
    return createDefaultSuicFlowState();
  }

  const normalized: SuicFlowState = createDefaultSuicFlowState();

  STEP_KEYS.forEach((key) => {
    const value = (parsedValue as Record<string, any>)[key];
    normalized[key] = normalizeStepState(value);
  });

  return normalized;
};

export const serializeSuicFlowState = (state: SuicFlowState): string => JSON.stringify(state);

export const computeSuggestedSuicStep = (state: SuicFlowState): number => {
  if (state.step1.status !== 'completed') {
    return 0;
  }

  if (state.step2.status !== 'completed') {
    return 1;
  }

  return 2;
};

export const canAccessSuicStep = (state: SuicFlowState, stepIndex: number): boolean => {
  if (stepIndex <= 0) {
    return true;
  }

  if (stepIndex === 1) {
    return state.step1.status === 'completed';
  }

  if (stepIndex === 2) {
    return state.step1.status === 'completed' && state.step2.status === 'completed';
  }

  return false;
};

export const useSuicFlowState = () => {
  const client = generateClient();

  const updateSuicFlowState = async (
    suicId: string,
    updates: Partial<Record<SuicStepKey, { status: SuicStepStatus; message?: string | null }>>
  ): Promise<SuicFlowState> => {
    if (!suicId) {
      throw new Error('El id de SUIC es requerido para actualizar el flujo.');
    }

    const { data: suicRecord } = await (client as any).models.SUIC.get({ id: suicId });
    const currentState = parseSuicFlowState(suicRecord?.flowState);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        return;
      }

      const stepKey = key as SuicStepKey;
      currentState[stepKey] = {
        status: value.status,
        updatedAt: new Date().toISOString(),
        message: value.message ?? null
      };
    });

    const newCurrentStep = computeSuggestedSuicStep(currentState);

    await (client as any).models.SUIC.update({
      id: suicId,
      flowState: serializeSuicFlowState(currentState),
      currentStep: newCurrentStep
    });

    return currentState;
  };

  const ensureSuicFlowState = async (suicId: string, rawState: unknown): Promise<SuicFlowState> => {
    const parsed = parseSuicFlowState(rawState);

    const needsPersist =
      !rawState ||
      STEP_KEYS.some((key) => {
        const original = (typeof rawState === 'object' && rawState !== null
          ? (rawState as Record<string, any>)[key]
          : undefined) as Partial<SuicStepState> | undefined;

        if (!original) {
          return true;
        }

        return original.status === undefined;
      });

    if (needsPersist) {
      await (client as any).models.SUIC.update({
        id: suicId,
        flowState: serializeSuicFlowState(parsed),
        currentStep: computeSuggestedSuicStep(parsed)
      });
    }

    return parsed;
  };

  return {
    updateSuicFlowState,
    ensureSuicFlowState
  };
};

