import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TableNames } from '../config/dynamodb';
import type { User, UserStats, Badge, BadgeType } from '@quiz/shared';
import { v4 as uuidv4 } from 'uuid';

export async function getUser(userId: string): Promise<User | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableNames.USERS,
      Key: { id: userId },
    })
  );

  return (result.Item as User) || null;
}

export async function createUser(displayName: string): Promise<User> {
  const user: User = {
    id: uuidv4(),
    displayName,
    createdAt: new Date().toISOString(),
    stats: {
      totalCorrect: 0,
      totalWrong: 0,
      totalPoints: 0,
      setsPlayed: 0,
      setsWon: 0,
      perfectSets: 0,
    },
    badges: [],
    currentStreak: 0,
    longestStreak: 0,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableNames.USERS,
      Item: user,
    })
  );

  return user;
}

export async function updateUserStats(
  userId: string,
  statsUpdate: Partial<UserStats>
): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(statsUpdate).forEach(([key, value]) => {
    const attrName = `#${key}`;
    const attrValue = `:${key}`;
    updateExpressions.push(`stats.${attrName} = stats.${attrName} + ${attrValue}`);
    expressionAttributeNames[attrName] = key;
    expressionAttributeValues[attrValue] = value;
  });

  if (updateExpressions.length === 0) return;

  await docClient.send(
    new UpdateCommand({
      TableName: TableNames.USERS,
      Key: { id: userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
}

export async function awardBadge(
  userId: string,
  badgeType: BadgeType,
  name: string,
  description: string,
  icon: string
): Promise<Badge> {
  const badge: Badge = {
    id: badgeType,
    name,
    description,
    icon,
    earnedAt: new Date().toISOString(),
  };

  await docClient.send(
    new UpdateCommand({
      TableName: TableNames.USERS,
      Key: { id: userId },
      UpdateExpression: 'SET badges = list_append(if_not_exists(badges, :empty), :badge)',
      ExpressionAttributeValues: {
        ':badge': [badge],
        ':empty': [],
      },
    })
  );

  return badge;
}

export async function updateStreak(userId: string, won: boolean): Promise<void> {
  const user = await getUser(userId);
  if (!user) return;

  const newStreak = won ? user.currentStreak + 1 : 0;
  const longestStreak = Math.max(user.longestStreak, newStreak);

  await docClient.send(
    new UpdateCommand({
      TableName: TableNames.USERS,
      Key: { id: userId },
      UpdateExpression: 'SET currentStreak = :current, longestStreak = :longest',
      ExpressionAttributeValues: {
        ':current': newStreak,
        ':longest': longestStreak,
      },
    })
  );
}
