import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import {
  startNewSet,
  addPlayer,
  removePlayer,
  startQuestion,
  handleBuzz,
  handleAnswer,
  endQuestion,
  endSet,
  getCurrentSession,
} from '../services/gameService';
import type { Player } from '@quiz/shared';

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

export const startSet: APIGatewayProxyHandler = async () => {
  try {
    const setId = await startNewSet();
    return response(200, { success: true, setId });
  } catch (error) {
    console.error('Error starting set:', error);
    return response(500, { error: 'Failed to start set' });
  }
};

export const joinGame: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const player: Player = {
      id: body.userId,
      displayName: body.displayName,
      isAI: false,
      latency: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      joinedAt: Date.now(),
    };

    await addPlayer(player);
    return response(200, { success: true });
  } catch (error) {
    console.error('Error joining game:', error);
    return response(500, { error: 'Failed to join game' });
  }
};

export const leaveGame: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    await removePlayer(body.userId);
    return response(200, { success: true });
  } catch (error) {
    console.error('Error leaving game:', error);
    return response(500, { error: 'Failed to leave game' });
  }
};

export const buzz: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const result = await handleBuzz(body.playerId, body.timestamp, body.latency);
    return response(200, result);
  } catch (error) {
    console.error('Error handling buzz:', error);
    return response(500, { error: 'Failed to process buzz' });
  }
};

export const answer: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const result = await handleAnswer(body.playerId, body.answerIndex);
    return response(200, result);
  } catch (error) {
    console.error('Error handling answer:', error);
    return response(500, { error: 'Failed to process answer' });
  }
};

export const nextQuestion: APIGatewayProxyHandler = async () => {
  try {
    await startQuestion();
    return response(200, { success: true });
  } catch (error) {
    console.error('Error starting question:', error);
    return response(500, { error: 'Failed to start question' });
  }
};

export const finishQuestion: APIGatewayProxyHandler = async () => {
  try {
    await endQuestion();
    return response(200, { success: true });
  } catch (error) {
    console.error('Error ending question:', error);
    return response(500, { error: 'Failed to end question' });
  }
};

export const finishSet: APIGatewayProxyHandler = async () => {
  try {
    await endSet();
    return response(200, { success: true });
  } catch (error) {
    console.error('Error ending set:', error);
    return response(500, { error: 'Failed to end set' });
  }
};

export const getStatus: APIGatewayProxyHandler = async () => {
  try {
    const session = getCurrentSession();
    return response(200, {
      active: !!session,
      setId: session?.setId,
      questionIndex: session?.currentQuestionIndex,
      playerCount: session?.players.size || 0,
    });
  } catch (error) {
    console.error('Error getting status:', error);
    return response(500, { error: 'Failed to get status' });
  }
};
