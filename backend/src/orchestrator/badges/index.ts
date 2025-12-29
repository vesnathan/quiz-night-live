/**
 * Badge Registry
 *
 * All badges are automatically loaded from this folder.
 * To add a new badge, simply create a new .ts file in this folder
 * that exports a BadgeDefinition as the default export.
 */

import type { BadgeDefinition, UserStats } from './types';

// Import all badge definitions
import streak10 from './streak-10';
import correct100 from './correct-100';
import correct1000 from './correct-1000';
import correct10000 from './correct-10000';
import sets50 from './sets-50';
import firstWin from './first-win';
import wins10 from './wins-10';
import cleanSweep from './clean-sweep';

// Registry of all badges
export const allBadges: BadgeDefinition[] = [
  streak10,
  correct100,
  correct1000,
  correct10000,
  sets50,
  firstWin,
  wins10,
  cleanSweep,
];

/**
 * Check all badges and return the ones that should be awarded
 */
export function getEarnedBadges(stats: UserStats): BadgeDefinition[] {
  return allBadges.filter(badge => badge.checkCondition(stats));
}

/**
 * Get a specific badge by ID
 */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return allBadges.find(badge => badge.id === id);
}

export type { BadgeDefinition, UserStats };
