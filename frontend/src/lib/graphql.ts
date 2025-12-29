import { generateClient } from 'aws-amplify/api';

export const graphqlClient = generateClient();

// GraphQL queries
export const queries = {
  getMyProfile: /* GraphQL */ `
    query GetMyProfile {
      getMyProfile {
        id
        email
        username
        displayName
        createdAt
        stats {
          totalCorrect
          totalWrong
          totalPoints
          setsPlayed
          setsWon
          currentStreak
          longestStreak
        }
      }
    }
  `,

  getUserProfile: /* GraphQL */ `
    query GetUserProfile($userId: ID!) {
      getUserProfile(userId: $userId) {
        id
        username
        displayName
        stats {
          totalCorrect
          totalWrong
          totalPoints
          setsPlayed
          setsWon
          currentStreak
          longestStreak
        }
      }
    }
  `,

  getLeaderboard: /* GraphQL */ `
    query GetLeaderboard($type: LeaderboardType!, $limit: Int) {
      getLeaderboard(type: $type, limit: $limit) {
        type
        entries {
          rank
          userId
          username
          displayName
          score
        }
        updatedAt
      }
    }
  `,

  getGameState: /* GraphQL */ `
    query GetGameState {
      getGameState {
        isSetActive
        currentSetId
        nextSetTime
        playerCount
      }
    }
  `,

  getAblyToken: /* GraphQL */ `
    query GetAblyToken {
      getAblyToken {
        token
        expires
        duplicateSession
        duplicateIp
      }
    }
  `,
};

// GraphQL mutations
export const mutations = {
  updateDisplayName: /* GraphQL */ `
    mutation UpdateDisplayName($displayName: String!) {
      updateDisplayName(displayName: $displayName) {
        id
        displayName
      }
    }
  `,
};

// Helper types
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
  stats: UserStats;
}

export interface UserStats {
  totalCorrect: number;
  totalWrong: number;
  totalPoints: number;
  setsPlayed: number;
  setsWon: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  score: number;
}

export interface Leaderboard {
  type: 'DAILY' | 'WEEKLY' | 'ALL_TIME';
  entries: LeaderboardEntry[];
  updatedAt: string;
}

export interface GameState {
  isSetActive: boolean;
  currentSetId?: string;
  nextSetTime: string;
  playerCount: number;
}

export interface AblyTokenResponse {
  token: string;
  expires: string;
  duplicateSession?: boolean;
  duplicateIp?: boolean;
}
