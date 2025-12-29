import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { getLeaderboard, getUserRank } from '../services/leaderboardService';
import type { LeaderboardType } from '@quiz/shared';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

export const getLeaderboardHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const type = (event.pathParameters?.type || 'daily') as LeaderboardType;
    const userId = event.queryStringParameters?.userId;

    const entries = await getLeaderboard(type);

    let userRank = null;
    if (userId) {
      userRank = await getUserRank(type, userId);
    }

    return response(200, {
      type,
      entries,
      userRank,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return response(500, { error: 'Failed to get leaderboard' });
  }
};
