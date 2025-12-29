// Award Badge System for QuizNight.live

export type AwardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// =============================================================================
// BADGE AWARD EVENT TYPES (for real-time notifications)
// =============================================================================

/** When a badge is awarded during gameplay */
export interface BadgeAwardEvent {
  badgeId: string;
  badge: AwardBadge;
  awardType: 'question' | 'set'; // awarded after question or at set end
  playerId: string;
  playerDisplayName: string;
  timestamp: number;
}

/** Summary of badges earned during a set (for end-of-set screen) */
export interface SetBadgeSummary {
  playerId: string;
  badges: AwardBadge[];
  totalSkillPointsEarned: number;
  newTotalSkillPoints: number;
}

/** User's earned badges stored in their profile */
export interface UserBadgeRecord {
  badgeId: string;
  earnedAt: string; // ISO timestamp
  setId?: string; // which set it was earned in (if applicable)
}

export interface AwardBadge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  groupId: string;
  tier: number; // 1, 2, 3... for tiered badges within a group
  rarity: AwardRarity;
  skillPoints: number;
  requirement: number; // the threshold to earn this badge
}

export interface AwardGroup {
  id: string;
  name: string;
  description: string;
  showHighestOnly: boolean; // if true, only display the highest tier earned
  badges: AwardBadge[];
}

// Skill points by rarity
export const SKILL_POINTS_BY_RARITY: Record<AwardRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 250,
};

// =============================================================================
// AWARD GROUPS & BADGES
// =============================================================================

export const AWARD_GROUPS: AwardGroup[] = [
  // ---------------------------------------------------------------------------
  // STREAK AWARDS - Correct answers in a row (show highest only)
  // ---------------------------------------------------------------------------
  {
    id: 'streak',
    name: 'Hot Streak',
    description: 'Correct answers in a row',
    showHighestOnly: true,
    badges: [
      {
        id: 'streak_5',
        name: 'Warming Up',
        description: '5 correct answers in a row',
        icon: '🔥',
        groupId: 'streak',
        tier: 1,
        rarity: 'common',
        skillPoints: 10,
        requirement: 5,
      },
      {
        id: 'streak_10',
        name: 'On Fire',
        description: '10 correct answers in a row',
        icon: '🔥',
        groupId: 'streak',
        tier: 2,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 10,
      },
      {
        id: 'streak_20',
        name: 'Unstoppable',
        description: '20 correct answers in a row',
        icon: '🔥',
        groupId: 'streak',
        tier: 3,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 20,
      },
      {
        id: 'streak_50',
        name: 'Inferno',
        description: '50 correct answers in a row',
        icon: '🔥',
        groupId: 'streak',
        tier: 4,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 50,
      },
      {
        id: 'streak_100',
        name: 'Legendary Streak',
        description: '100 correct answers in a row',
        icon: '🔥',
        groupId: 'streak',
        tier: 5,
        rarity: 'legendary',
        skillPoints: 250,
        requirement: 100,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // PERFECT SET AWARDS - Answer all questions in a set correctly
  // ---------------------------------------------------------------------------
  {
    id: 'perfect_set',
    name: 'Whitewash',
    description: 'Perfect sets with all questions answered correctly',
    showHighestOnly: true,
    badges: [
      {
        id: 'whitewash_1',
        name: 'Clean Sweep',
        description: 'Answer all questions correctly in a set',
        icon: '🧹',
        groupId: 'perfect_set',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 1,
      },
      {
        id: 'whitewash_5',
        name: 'Spotless',
        description: '5 perfect sets',
        icon: '✨',
        groupId: 'perfect_set',
        tier: 2,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 5,
      },
      {
        id: 'whitewash_10',
        name: 'Perfectionist',
        description: '10 perfect sets',
        icon: '💎',
        groupId: 'perfect_set',
        tier: 3,
        rarity: 'legendary',
        skillPoints: 250,
        requirement: 10,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // SETS PLAYED AWARDS - Total sets participated in
  // ---------------------------------------------------------------------------
  {
    id: 'sets_played',
    name: 'Dedication',
    description: 'Total sets played',
    showHighestOnly: true,
    badges: [
      {
        id: 'sets_10',
        name: 'Regular',
        description: 'Play 10 sets',
        icon: '📅',
        groupId: 'sets_played',
        tier: 1,
        rarity: 'common',
        skillPoints: 10,
        requirement: 10,
      },
      {
        id: 'sets_50',
        name: 'Committed',
        description: 'Play 50 sets',
        icon: '📅',
        groupId: 'sets_played',
        tier: 2,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 50,
      },
      {
        id: 'sets_100',
        name: 'Devoted',
        description: 'Play 100 sets',
        icon: '📅',
        groupId: 'sets_played',
        tier: 3,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 100,
      },
      {
        id: 'sets_500',
        name: 'Veteran',
        description: 'Play 500 sets',
        icon: '📅',
        groupId: 'sets_played',
        tier: 4,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 500,
      },
      {
        id: 'sets_1000',
        name: 'Quiz Master',
        description: 'Play 1000 sets',
        icon: '📅',
        groupId: 'sets_played',
        tier: 5,
        rarity: 'legendary',
        skillPoints: 250,
        requirement: 1000,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // SETS WON AWARDS - Total sets won (first place)
  // ---------------------------------------------------------------------------
  {
    id: 'sets_won',
    name: 'Champion',
    description: 'Sets won (first place)',
    showHighestOnly: true,
    badges: [
      {
        id: 'wins_1',
        name: 'First Victory',
        description: 'Win your first set',
        icon: '🏆',
        groupId: 'sets_won',
        tier: 1,
        rarity: 'common',
        skillPoints: 10,
        requirement: 1,
      },
      {
        id: 'wins_10',
        name: 'Winner',
        description: 'Win 10 sets',
        icon: '🏆',
        groupId: 'sets_won',
        tier: 2,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 10,
      },
      {
        id: 'wins_50',
        name: 'Champion',
        description: 'Win 50 sets',
        icon: '🏆',
        groupId: 'sets_won',
        tier: 3,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 50,
      },
      {
        id: 'wins_100',
        name: 'Grand Champion',
        description: 'Win 100 sets',
        icon: '🏆',
        groupId: 'sets_won',
        tier: 4,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 100,
      },
      {
        id: 'wins_500',
        name: 'Legend',
        description: 'Win 500 sets',
        icon: '🏆',
        groupId: 'sets_won',
        tier: 5,
        rarity: 'legendary',
        skillPoints: 250,
        requirement: 500,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // SPEED DEMON AWARDS - Fast buzzer wins
  // ---------------------------------------------------------------------------
  {
    id: 'speed',
    name: 'Speed Demon',
    description: 'Fastest buzzer in a set',
    showHighestOnly: false, // can show multiple speed achievements
    badges: [
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Fastest average buzzer time in a set',
        icon: '⚡',
        groupId: 'speed',
        tier: 1,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 1,
      },
      {
        id: 'lightning_10',
        name: 'Lightning Fast',
        description: 'Fastest buzzer 10 times',
        icon: '⚡',
        groupId: 'speed',
        tier: 2,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 10,
      },
      {
        id: 'lightning_50',
        name: 'Quicksilver',
        description: 'Fastest buzzer 50 times',
        icon: '⚡',
        groupId: 'speed',
        tier: 3,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 50,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // TOTAL CORRECT AWARDS - Lifetime correct answers
  // ---------------------------------------------------------------------------
  {
    id: 'total_correct',
    name: 'Knowledge',
    description: 'Total correct answers',
    showHighestOnly: true,
    badges: [
      {
        id: 'correct_100',
        name: 'Learner',
        description: '100 correct answers',
        icon: '🎯',
        groupId: 'total_correct',
        tier: 1,
        rarity: 'common',
        skillPoints: 10,
        requirement: 100,
      },
      {
        id: 'correct_500',
        name: 'Scholar',
        description: '500 correct answers',
        icon: '🎯',
        groupId: 'total_correct',
        tier: 2,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 500,
      },
      {
        id: 'correct_1000',
        name: 'Expert',
        description: '1,000 correct answers',
        icon: '🎯',
        groupId: 'total_correct',
        tier: 3,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 1000,
      },
      {
        id: 'correct_5000',
        name: 'Genius',
        description: '5,000 correct answers',
        icon: '🎯',
        groupId: 'total_correct',
        tier: 4,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 5000,
      },
      {
        id: 'correct_10000',
        name: 'Mastermind',
        description: '10,000 correct answers',
        icon: '🎯',
        groupId: 'total_correct',
        tier: 5,
        rarity: 'legendary',
        skillPoints: 250,
        requirement: 10000,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // DAILY STREAK AWARDS - Consecutive days played
  // ---------------------------------------------------------------------------
  {
    id: 'daily_streak',
    name: 'Daily Player',
    description: 'Consecutive days played',
    showHighestOnly: true,
    badges: [
      {
        id: 'daily_7',
        name: 'Week Warrior',
        description: 'Play 7 days in a row',
        icon: '📆',
        groupId: 'daily_streak',
        tier: 1,
        rarity: 'common',
        skillPoints: 10,
        requirement: 7,
      },
      {
        id: 'daily_30',
        name: 'Monthly Master',
        description: 'Play 30 days in a row',
        icon: '📆',
        groupId: 'daily_streak',
        tier: 2,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 30,
      },
      {
        id: 'daily_90',
        name: 'Quarterly Queen',
        description: 'Play 90 days in a row',
        icon: '📆',
        groupId: 'daily_streak',
        tier: 3,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 90,
      },
      {
        id: 'daily_180',
        name: 'Half Year Hero',
        description: 'Play 180 days in a row',
        icon: '📆',
        groupId: 'daily_streak',
        tier: 4,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 180,
      },
      {
        id: 'daily_365',
        name: 'Year-Round Legend',
        description: 'Play 365 days in a row',
        icon: '📆',
        groupId: 'daily_streak',
        tier: 5,
        rarity: 'legendary',
        skillPoints: 250,
        requirement: 365,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // COMEBACK AWARDS - Recovery achievements (show all)
  // ---------------------------------------------------------------------------
  {
    id: 'comeback',
    name: 'Comeback',
    description: 'Recovery achievements',
    showHighestOnly: false,
    badges: [
      {
        id: 'comeback_king',
        name: 'Comeback King',
        description: 'Win a set after being last at halftime',
        icon: '👑',
        groupId: 'comeback',
        tier: 1,
        rarity: 'epic',
        skillPoints: 100,
        requirement: 1,
      },
      {
        id: 'clutch',
        name: 'Clutch Player',
        description: 'Win on the final question',
        icon: '🎰',
        groupId: 'comeback',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 1,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // SPECIAL ACHIEVEMENTS (show all)
  // ---------------------------------------------------------------------------
  {
    id: 'special',
    name: 'Special',
    description: 'Unique achievements',
    showHighestOnly: false,
    badges: [
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Play a set before 6 AM',
        icon: '🌅',
        groupId: 'special',
        tier: 1,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 1,
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Play a set after midnight',
        icon: '🦉',
        groupId: 'special',
        tier: 1,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 1,
      },
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'First correct answer in a set',
        icon: '🩸',
        groupId: 'special',
        tier: 1,
        rarity: 'common',
        skillPoints: 10,
        requirement: 1,
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Play with 10 different players',
        icon: '🦋',
        groupId: 'special',
        tier: 1,
        rarity: 'uncommon',
        skillPoints: 25,
        requirement: 10,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // CATEGORY MASTERY (show all - one per category)
  // ---------------------------------------------------------------------------
  {
    id: 'category_mastery',
    name: 'Category Master',
    description: 'Excel in specific categories',
    showHighestOnly: false,
    badges: [
      {
        id: 'master_science',
        name: 'Science Whiz',
        description: '90% accuracy in Science (min 50 questions)',
        icon: '🔬',
        groupId: 'category_mastery',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 50,
      },
      {
        id: 'master_history',
        name: 'History Buff',
        description: '90% accuracy in History (min 50 questions)',
        icon: '📜',
        groupId: 'category_mastery',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 50,
      },
      {
        id: 'master_geography',
        name: 'Globe Trotter',
        description: '90% accuracy in Geography (min 50 questions)',
        icon: '🌍',
        groupId: 'category_mastery',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 50,
      },
      {
        id: 'master_sports',
        name: 'Sports Fanatic',
        description: '90% accuracy in Sports (min 50 questions)',
        icon: '⚽',
        groupId: 'category_mastery',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 50,
      },
      {
        id: 'master_entertainment',
        name: 'Pop Culture Pro',
        description: '90% accuracy in Entertainment (min 50 questions)',
        icon: '🎬',
        groupId: 'category_mastery',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 50,
      },
      {
        id: 'master_arts',
        name: 'Art Aficionado',
        description: '90% accuracy in Arts & Literature (min 50 questions)',
        icon: '🎨',
        groupId: 'category_mastery',
        tier: 1,
        rarity: 'rare',
        skillPoints: 50,
        requirement: 50,
      },
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Get all badges flattened */
export function getAllBadges(): AwardBadge[] {
  return AWARD_GROUPS.flatMap((group) => group.badges);
}

/** Get badge by ID */
export function getBadgeById(id: string): AwardBadge | undefined {
  return getAllBadges().find((badge) => badge.id === id);
}

/** Get group by ID */
export function getGroupById(id: string): AwardGroup | undefined {
  return AWARD_GROUPS.find((group) => group.id === id);
}

/** Get the highest tier badge earned in a group */
export function getHighestBadgeInGroup(
  groupId: string,
  earnedBadgeIds: string[]
): AwardBadge | undefined {
  const group = getGroupById(groupId);
  if (!group) return undefined;

  const earnedInGroup = group.badges
    .filter((badge) => earnedBadgeIds.includes(badge.id))
    .sort((a, b) => b.tier - a.tier);

  return earnedInGroup[0];
}

/** Calculate total skill points from earned badges */
export function calculateTotalSkillPoints(earnedBadgeIds: string[]): number {
  return earnedBadgeIds.reduce((total, badgeId) => {
    const badge = getBadgeById(badgeId);
    return total + (badge?.skillPoints || 0);
  }, 0);
}

/** Get badges to display (respecting showHighestOnly) */
export function getBadgesToDisplay(earnedBadgeIds: string[]): AwardBadge[] {
  const displayBadges: AwardBadge[] = [];

  for (const group of AWARD_GROUPS) {
    if (group.showHighestOnly) {
      const highest = getHighestBadgeInGroup(group.id, earnedBadgeIds);
      if (highest) {
        displayBadges.push(highest);
      }
    } else {
      const earnedInGroup = group.badges.filter((badge) =>
        earnedBadgeIds.includes(badge.id)
      );
      displayBadges.push(...earnedInGroup);
    }
  }

  return displayBadges;
}

/** Get rarity color for styling */
export function getRarityColor(rarity: AwardRarity): string {
  switch (rarity) {
    case 'common':
      return '#9CA3AF'; // gray-400
    case 'uncommon':
      return '#22C55E'; // green-500
    case 'rare':
      return '#3B82F6'; // blue-500
    case 'epic':
      return '#A855F7'; // purple-500
    case 'legendary':
      return '#F59E0B'; // amber-500
    default:
      return '#9CA3AF';
  }
}

/** Get rarity gradient for styling */
export function getRarityGradient(rarity: AwardRarity): string {
  switch (rarity) {
    case 'common':
      return 'from-gray-400 to-gray-500';
    case 'uncommon':
      return 'from-green-400 to-green-600';
    case 'rare':
      return 'from-blue-400 to-blue-600';
    case 'epic':
      return 'from-purple-400 to-purple-600';
    case 'legendary':
      return 'from-amber-400 to-orange-500';
    default:
      return 'from-gray-400 to-gray-500';
  }
}
