import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import Ably from 'ably';

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

export const getToken: APIGatewayProxyHandler = async (event) => {
  try {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) {
      return response(500, { error: 'Ably API key not configured' });
    }

    const body = JSON.parse(event.body || '{}');
    const clientId = body.clientId;

    if (!clientId) {
      return response(400, { error: 'Client ID required' });
    }

    const ably = new Ably.Rest({ key: apiKey });

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId,
      capability: {
        'quiz:*': ['subscribe', 'publish', 'presence'],
      },
    });

    return response(200, tokenRequest);
  } catch (error) {
    console.error('Error creating Ably token:', error);
    return response(500, { error: 'Failed to create token' });
  }
};
