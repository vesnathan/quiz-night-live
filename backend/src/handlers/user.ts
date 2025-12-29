import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { getUser, createUser } from '../services/userService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

export const getUserHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return response(400, { error: 'User ID required' });
    }

    const user = await getUser(userId);
    if (!user) {
      return response(404, { error: 'User not found' });
    }

    return response(200, user);
  } catch (error) {
    console.error('Error getting user:', error);
    return response(500, { error: 'Failed to get user' });
  }
};

export const createUserHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.displayName) {
      return response(400, { error: 'displayName required' });
    }

    const user = await createUser(body.displayName);
    return response(201, user);
  } catch (error) {
    console.error('Error creating user:', error);
    return response(500, { error: 'Failed to create user' });
  }
};
