import { useState, useEffect, useCallback } from 'react';
import type { AelpherState, TheaterState, LogEntry, NBAItem, Reflection, GlobalMetrics } from '@/types';

const STORAGE_KEY = 'aelpher-2.0-state';

const createInitialTheaterState = (armType: 'ibm' | 'cs'): TheaterState => ({
  armType,
  status: 'idle',
  currentNBA: null,
  nbaQueue: [],
  logs: [],
  totalProgress: 0,
  energyAllocation: 50,
  lastActivity: new Date().toISOString(),
});

const createInitialState = (): AelpherState => ({
  ibm: createInitialTheaterState('ibm'),
  cs: createInitialTheaterState('cs'),
  globalMetrics: {
    combinedProgress: 0,
    energyAllocationIBM: 50,
    energyAllocationCS: 50,
    overloadRisk: 0,
    lastSyncTime: new Date().toISOString(),
  },
  reflections: [],
  lastComputed: new Date().toISOString(),
});

export function useLocalStorage() {
  const [state, setState] = useState<AelpherState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[AELPHER] State loaded from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('[AELPHER] Failed to load state from localStorage:', error);
    }
    const initial = createInitialState();
    console.log('[AELPHER] Initialized with default state');
    return initial;
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('[AELPHER] State persisted to localStorage');
    } catch (error) {
      console.error('[AELPHER] Failed to persist state:', error);
    }
  }, [state]);

  const updateTheater = useCallback((armType: 'ibm' | 'cs', updates: Partial<TheaterState>) => {
    setState(prev => {
      const newState = {
        ...prev,
        [armType]: { ...prev[armType], ...updates },
        lastComputed: new Date().toISOString(),
      };
      console.log(`[AELPHER] Theater ${armType.toUpperCase()} updated:`, updates);
      return newState;
    });
  }, []);

  const addLog = useCallback((armType: 'ibm' | 'cs', log: Omit<LogEntry, 'id' | 'armType' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: crypto.randomUUID(),
      armType,
      timestamp: new Date().toISOString(),
    };
    setState(prev => {
      const theater = prev[armType];
      const newState = {
        ...prev,
        [armType]: {
          ...theater,
          logs: [newLog, ...theater.logs].slice(0, 100), // Keep last 100 logs
          lastActivity: newLog.timestamp,
        },
        lastComputed: new Date().toISOString(),
      };
      console.log(`[AELPHER] Log added to ${armType.toUpperCase()}:`, newLog);
      return newState;
    });
  }, []);

  const addNBA = useCallback((armType: 'ibm' | 'cs', nba: Omit<NBAItem, 'id' | 'armType' | 'createdAt' | 'lastUpdated' | 'score'>) => {
    const newNBA: NBAItem = {
      ...nba,
      id: crypto.randomUUID(),
      armType,
      score: 0, // Will be computed by scoring engine
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setState(prev => {
      const theater = prev[armType];
      const newState = {
        ...prev,
        [armType]: {
          ...theater,
          nbaQueue: [...theater.nbaQueue, newNBA],
        },
        lastComputed: new Date().toISOString(),
      };
      console.log(`[AELPHER] NBA added to ${armType.toUpperCase()}:`, newNBA);
      return newState;
    });
  }, []);

  const setCurrentNBA = useCallback((armType: 'ibm' | 'cs', nbaId: string | null, isManual: boolean = false) => {
    setState(prev => {
      const theater = prev[armType];
      const nba = nbaId ? theater.nbaQueue.find(n => n.id === nbaId) : null;
      if (nba) {
        nba.isManuallySelected = isManual;
        nba.isLocked = isManual;
      }
      const newState = {
        ...prev,
        [armType]: {
          ...theater,
          currentNBA: nba || null,
        },
        lastComputed: new Date().toISOString(),
      };
      console.log(`[AELPHER] Current NBA set for ${armType.toUpperCase()}:`, nba?.title || 'None', isManual ? '(MANUAL)' : '(AUTO)');
      return newState;
    });
  }, []);

  const updateGlobalMetrics = useCallback((metrics: Partial<GlobalMetrics>) => {
    setState(prev => ({
      ...prev,
      globalMetrics: { ...prev.globalMetrics, ...metrics },
      lastComputed: new Date().toISOString(),
    }));
    console.log('[AELPHER] Global metrics updated:', metrics);
  }, []);

  const addReflection = useCallback((reflection: Omit<Reflection, 'id' | 'timestamp'>) => {
    const newReflection: Reflection = {
      ...reflection,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      reflections: [newReflection, ...prev.reflections].slice(0, 50),
    }));
    console.log('[AELPHER] Reflection added:', newReflection);
  }, []);

  const resetState = useCallback(() => {
    const initial = createInitialState();
    setState(initial);
    console.log('[AELPHER] State reset to initial');
  }, []);

  return {
    state,
    updateTheater,
    addLog,
    addNBA,
    setCurrentNBA,
    updateGlobalMetrics,
    addReflection,
    resetState,
  };
}
