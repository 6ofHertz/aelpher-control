// Aelpher 2.0 Type Definitions

export type ArmType = 'ibm' | 'cs';

export type StatusType = 'active' | 'warm' | 'idle' | 'blocked';

export interface LogEntry {
  id: string;
  armType: ArmType;
  timestamp: string;
  action: string;
  details: string;
  duration?: number; // in minutes
}

export interface NBAItem {
  id: string;
  armType: ArmType;
  title: string;
  description: string;
  score: number;
  staleDays: number;
  gap: number;
  hasEarlyProgressBonus: boolean;
  isManuallySelected: boolean;
  isLocked: boolean;
  createdAt: string;
  lastUpdated: string;
}

export interface TheaterState {
  armType: ArmType;
  status: StatusType;
  currentNBA: NBAItem | null;
  nbaQueue: NBAItem[];
  logs: LogEntry[];
  totalProgress: number; // 0-100
  energyAllocation: number; // 0-100
  lastActivity: string;
}

export interface GlobalMetrics {
  combinedProgress: number;
  energyAllocationIBM: number;
  energyAllocationCS: number;
  overloadRisk: number; // 0-100
  lastSyncTime: string;
}

export interface Reflection {
  id: string;
  armType: ArmType;
  timestamp: string;
  evidence: string;
  context: string;
}

export interface AelpherState {
  ibm: TheaterState;
  cs: TheaterState;
  globalMetrics: GlobalMetrics;
  reflections: Reflection[];
  lastComputed: string;
}
