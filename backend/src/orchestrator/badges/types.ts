/**
 * Badge system types
 */

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Check if the badge should be awarded based on user stats */
  checkCondition: (stats: UserStats) => boolean;
  /** If true, this badge can be earned multiple times (default: false) */
  repeatable?: boolean;
}

export interface UserStats {
  totalCorrect: number;
  totalWrong: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  setsPlayed: number;
  setsWon: number;
  perfectSets: number;
}
