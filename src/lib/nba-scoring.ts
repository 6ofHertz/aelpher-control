import type { NBAItem, TheaterState } from '@/types';

/**
 * NBA Scoring Engine for Aelpher 2.0
 * 
 * Score = (Staleness > 5 days ? 50 : 0) + (Gap * 10) + (Early Progress Bonus ? 15 : 0)
 * 
 * - Staleness: Days since last update
 * - Gap: Priority gap indicator (0-5 scale)
 * - Early Progress Bonus: Whether the item was started ahead of schedule
 */

export function calculateStaleDays(lastUpdated: string): number {
  const now = new Date();
  const updated = new Date(lastUpdated);
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.floor(diffDays * 10) / 10; // One decimal place
}

export function calculateNBAScore(nba: NBAItem): number {
  const staleDays = calculateStaleDays(nba.lastUpdated);
  
  // Staleness component: 50 points if stale > 5 days
  const stalenessScore = staleDays > 5 ? 50 : 0;
  
  // Gap component: Gap * 10 (gap is 0-5 scale)
  const gapScore = Math.min(nba.gap, 5) * 10;
  
  // Early progress bonus: 15 points
  const earlyBonus = nba.hasEarlyProgressBonus ? 15 : 0;
  
  const totalScore = stalenessScore + gapScore + earlyBonus;
  
  console.log(`[NBA-SCORING] ${nba.title}: Stale=${staleDays.toFixed(1)}d (${stalenessScore}pts), Gap=${nba.gap} (${gapScore}pts), Early=${earlyBonus}pts → Total=${totalScore}`);
  
  return totalScore;
}

export function rankNBAQueue(queue: NBAItem[]): NBAItem[] {
  return [...queue]
    .map(nba => ({
      ...nba,
      score: calculateNBAScore(nba),
      staleDays: calculateStaleDays(nba.lastUpdated),
    }))
    .sort((a, b) => {
      // Locked items always come first if manually selected
      if (a.isLocked && a.isManuallySelected) return -1;
      if (b.isLocked && b.isManuallySelected) return 1;
      // Otherwise sort by score (higher = more urgent)
      return b.score - a.score;
    });
}

export function getTopNBA(theater: TheaterState): NBAItem | null {
  // If there's a manually locked NBA, respect it
  const lockedNBA = theater.nbaQueue.find(n => n.isLocked && n.isManuallySelected);
  if (lockedNBA) {
    console.log(`[NBA-SCORING] ${theater.armType.toUpperCase()}: Returning LOCKED NBA: ${lockedNBA.title}`);
    return { ...lockedNBA, score: calculateNBAScore(lockedNBA) };
  }
  
  // Otherwise, calculate and return the highest scoring NBA
  const ranked = rankNBAQueue(theater.nbaQueue);
  const top = ranked[0] || null;
  
  if (top) {
    console.log(`[NBA-SCORING] ${theater.armType.toUpperCase()}: Top calculated NBA: ${top.title} (Score: ${top.score})`);
  } else {
    console.log(`[NBA-SCORING] ${theater.armType.toUpperCase()}: No NBAs in queue`);
  }
  
  return top;
}

export function computeOverloadRisk(ibm: TheaterState, cs: TheaterState): number {
  // Calculate overload based on:
  // 1. Number of stale items (> 5 days) across both arms
  // 2. Combined energy allocation
  // 3. Status of both theaters
  
  const allNBAs = [...ibm.nbaQueue, ...cs.nbaQueue];
  const staleCount = allNBAs.filter(n => calculateStaleDays(n.lastUpdated) > 5).length;
  const staleRatio = allNBAs.length > 0 ? staleCount / allNBAs.length : 0;
  
  // Status penalty
  const statusPenalty = 
    (ibm.status === 'blocked' ? 20 : 0) +
    (cs.status === 'blocked' ? 20 : 0) +
    (ibm.status === 'idle' ? 10 : 0) +
    (cs.status === 'idle' ? 10 : 0);
  
  // Energy imbalance penalty (if one arm has > 80% energy)
  const energyImbalance = Math.abs(ibm.energyAllocation - cs.energyAllocation);
  const energyPenalty = energyImbalance > 60 ? 15 : energyImbalance > 40 ? 10 : 0;
  
  const overloadRisk = Math.min(100, Math.round(staleRatio * 50 + statusPenalty + energyPenalty));
  
  console.log(`[OVERLOAD] Stale=${staleCount}/${allNBAs.length}, StatusPenalty=${statusPenalty}, EnergyPenalty=${energyPenalty} → Risk=${overloadRisk}%`);
  
  return overloadRisk;
}
