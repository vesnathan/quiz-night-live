// Scoring
export const POINTS_CORRECT = 50;
export const POINTS_WRONG = -200;

// Game timing
export const SET_DURATION_MINUTES = 30;
export const SET_BREAK_MINUTES = 30;
export const QUESTIONS_PER_SET = 20;
export const ANSWER_TIMEOUT_MS = 4000;
export const QUESTION_DISPLAY_MS = 5000;
export const BETWEEN_QUESTIONS_MS = 3000;

// Players
export const MIN_PLAYERS = 8;
export const MAX_LATENCY_COMPENSATION_MS = 300;

// Rooms
export const MAX_PLAYERS_PER_ROOM = 20;
export const INITIAL_ROOMS_COUNT = 3; // Number of rooms to create each half-hour
export const ROOM_RESERVE_TIMEOUT_MS = 30 * 60 * 1000; // Reserve spot for disconnected player until set ends
export const JOIN_WINDOW_SECONDS = 60; // Players can join 1 minute before set starts

// Room difficulty point modifiers
export const ROOM_DIFFICULTY_POINTS = {
  easy: { correct: 25, wrong: -100 },
  medium: { correct: 50, wrong: -200 }, // Current default
  hard: { correct: 100, wrong: -400 },
} as const;

// Buzzer
export const LATENCY_SAMPLE_SIZE = 5;

// Leaderboard
export const LEADERBOARD_SIZE = 100;

// Badge thresholds
export const BADGE_THRESHOLDS = {
  streak_3_wins: 3,
  streak_7_days: 7,
  streak_10_correct: 10,
  streak_month: 30,
  correct_100: 100,
  correct_1000: 1000,
  correct_10000: 10000,
  sets_50: 50,
} as const;

// Categories
export const QUESTION_CATEGORIES = [
  'general',
  'science',
  'history',
  'geography',
  'entertainment',
  'sports',
  'arts',
  'literature',
] as const;

// Ably channel names
export const ABLY_CHANNELS = {
  LOBBY: 'quiz:lobby', // Room list updates for all users
  ROOM_PREFIX: 'quiz:room:', // Per-room game events: quiz:room:{roomId}
  USER_PREFIX: 'quiz:user:', // User-specific channel, followed by userId
  // Legacy channels (kept for backwards compatibility during migration)
  GAME: 'quiz:game',
  PRESENCE: 'quiz:presence',
  BUZZER: 'quiz:buzzer',
} as const;

// DynamoDB table names (will be prefixed with stage)
export const TABLE_NAMES = {
  USERS: 'quiz-users',
  QUESTIONS: 'quiz-questions',
  SETS: 'quiz-sets',
  SCORES: 'quiz-scores',
  LEADERBOARDS: 'quiz-leaderboards',
} as const;
