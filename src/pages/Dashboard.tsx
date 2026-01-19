import { useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MobileBlocker } from '@/components/MobileBlocker';
import { StrategicAwarenessHeader } from '@/components/StrategicAwarenessHeader';
import { TheaterBlock } from '@/components/TheaterBlock';
import { deriveStatusFromLogs } from '@/lib/state-machine';
import { getTopNBA, computeOverloadRisk } from '@/lib/nba-scoring';

const RECOMPUTE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function Dashboard() {
  const { 
    state, 
    updateTheater, 
    addLog, 
    addNBA, 
    setCurrentNBA, 
    updateGlobalMetrics,
    addReflection 
  } = useLocalStorage();

  // Recompute function
  const recompute = useCallback(() => {
    console.log('[AELPHER] Running scheduled recompute...');
    
    // Update IBM theater status
    const ibmStatus = deriveStatusFromLogs(state.ibm.logs);
    const ibmTopNBA = getTopNBA(state.ibm);
    if (ibmStatus !== state.ibm.status) {
      updateTheater('ibm', { status: ibmStatus });
    }
    if (ibmTopNBA && !state.ibm.currentNBA?.isLocked) {
      setCurrentNBA('ibm', ibmTopNBA.id, false);
    }

    // Update CS theater status
    const csStatus = deriveStatusFromLogs(state.cs.logs);
    const csTopNBA = getTopNBA(state.cs);
    if (csStatus !== state.cs.status) {
      updateTheater('cs', { status: csStatus });
    }
    if (csTopNBA && !state.cs.currentNBA?.isLocked) {
      setCurrentNBA('cs', csTopNBA.id, false);
    }

    // Update global metrics
    const overloadRisk = computeOverloadRisk(state.ibm, state.cs);
    updateGlobalMetrics({
      overloadRisk,
      lastSyncTime: new Date().toISOString(),
    });
  }, [state, updateTheater, setCurrentNBA, updateGlobalMetrics]);

  // Set up periodic recompute
  useEffect(() => {
    const interval = setInterval(recompute, RECOMPUTE_INTERVAL);
    // Run initial recompute
    recompute();
    return () => clearInterval(interval);
  }, [recompute]);

  return (
    <>
      <MobileBlocker />
      
      <div className="hidden min-h-screen flex-col gap-4 bg-background p-4 lg:flex">
        {/* Top 20%: Strategic Awareness Header */}
        <div className="flex-shrink-0">
          <StrategicAwarenessHeader 
            globalMetrics={state.globalMetrics}
            ibm={state.ibm}
            cs={state.cs}
          />
        </div>

        {/* Middle: Dual Theaters */}
        <div className="flex flex-1 flex-col gap-4 overflow-auto">
          {/* IBM Internship Theater */}
          <TheaterBlock
            theater={state.ibm}
            onAddLog={(log) => addLog('ibm', log)}
            onAddNBA={(nba) => addNBA('ibm', nba)}
            onSelectNBA={(id, manual) => setCurrentNBA('ibm', id, manual)}
            onAddReflection={(evidence, context) => addReflection({ armType: 'ibm', evidence, context })}
            reflections={state.reflections}
          />

          {/* CS Degree Theater */}
          <TheaterBlock
            theater={state.cs}
            onAddLog={(log) => addLog('cs', log)}
            onAddNBA={(nba) => addNBA('cs', nba)}
            onSelectNBA={(id, manual) => setCurrentNBA('cs', id, manual)}
            onAddReflection={(evidence, context) => addReflection({ armType: 'cs', evidence, context })}
            reflections={state.reflections}
          />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border pt-2 text-center">
          <span className="font-mono text-xs text-muted-foreground">
            AELPHER 2.0 — PERSONAL EXECUTION CONTROL SYSTEM — 
            LOCAL-FIRST ARCHITECTURE — LAST COMPUTED: {new Date(state.lastComputed).toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>
    </>
  );
}
