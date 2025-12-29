import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TableNames } from '../config/dynamodb';
import type { LeaderboardEntry, LeaderboardType } from '@quiz/shared';
import { LEADERBOARD_SIZE } from '@quiz/shared';

interface LeaderboardRecord {
  type: LeaderboardType;
  period: string; // 'all' for all-time, date string for daily/weekly
  entries: LeaderboardEntry[];
  updatedAt: string;
}

function getPeriodKey(type: LeaderboardType): string {
  const now = new Date();

  switch (type) {
    case 'allTime':
      return 'all';
    case 'daily':
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'weekly': {
      // Get the Monday of the current week
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      return `week-${monday.toISOString().split('T')[0]}`;
    }
    case 'set':
      return `set-${now.getTime()}`;
    default:
      return 'all';
  }
}

export async function getLeaderboard(type: LeaderboardType): Promise<LeaderboardEntry[]> {
  const period = getPeriodKey(type);

  const result = await docClient.send(
    new GetCommand({
      TableName: TableNames.LEADERBOARDS,
      Key: { type, period },
    })
  );

  if (!result.Item) {
    return [];
  }

  return (result.Item as LeaderboardRecord).entries;
}

export async function updateLeaderboard(
  type: LeaderboardType,
  userId: string,
  displayName: string,
  scoreChange: number
): Promise<LeaderboardEntry[]> {
  const period = getPeriodKey(type);

  // Get current leaderboard
  const current = await getLeaderboard(type);

  // Find or create user entry
  let entry = current.find((e) => e.userId === userId);
  if (entry) {
    entry.score += scoreChange;
  } else {
    entry = {
      rank: 0,
      userId,
      displayName,
      score: scoreChange,
    };
    current.push(entry);
  }

  // Sort by score descending
  current.sort((a, b) => b.score - a.score);

  // Update ranks and trim to size
  const trimmed = current.slice(0, LEADERBOARD_SIZE).map((e, i) => ({
    ...e,
    rank: i + 1,
  }));

  // Save updated leaderboard
  await docClient.send(
    new PutCommand({
      TableName: TableNames.LEADERBOARDS,
      Item: {
        type,
        period,
        entries: trimmed,
        updatedAt: new Date().toISOString(),
      },
    })
  );

  return trimmed;
}

export async function getUserRank(
  type: LeaderboardType,
  userId: string
): Promise<{ rank: number; score: number } | null> {
  const entries = await getLeaderboard(type);
  const entry = entries.find((e) => e.userId === userId);

  if (!entry) {
    return null;
  }

  return { rank: entry.rank, score: entry.score };
}

export async function createSetLeaderboard(
  setId: string,
  scores: Record<string, { userId: string; displayName: string; score: number }>
): Promise<LeaderboardEntry[]> {
  const entries = Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, LEADERBOARD_SIZE)
    .map((e, i) => ({
      rank: i + 1,
      userId: e.userId,
      displayName: e.displayName,
      score: e.score,
    }));

  await docClient.send(
    new PutCommand({
      TableName: TableNames.LEADERBOARDS,
      Item: {
        type: 'set',
        period: `set-${setId}`,
        entries,
        updatedAt: new Date().toISOString(),
      },
    })
  );

  return entries;
}
