import { getAblyClient, CHANNELS } from '../config/ably';
import { getUnusedQuestions, markQuestionsUsed } from './questionService';
import { updateLeaderboard, createSetLeaderboard } from './leaderboardService';
import { updateUserStats, awardBadge, updateStreak } from './userService';
import type {
  Question,
  Player,
  QuestionStartPayload,
  BuzzPayload,
  AnswerPayload,
  QuestionEndPayload,
  SetEndPayload,
} from '@quiz/shared';
import {
  POINTS_CORRECT,
  POINTS_WRONG,
  QUESTIONS_PER_SET,
  ANSWER_TIMEOUT_MS,
  MAX_LATENCY_COMPENSATION_MS,
} from '@quiz/shared';
import { v4 as uuidv4 } from 'uuid';

interface GameSession {
  setId: string;
  questions: Question[];
  currentQuestionIndex: number;
  players: Map<string, Player>;
  scores: Map<string, number>;
  buzzes: Map<string, { timestamp: number; latency: number }>;
  currentBuzzWinner: string | null;
  answerDeadline: number | null;
}

// In-memory game state (in production, use Redis or DynamoDB)
let currentSession: GameSession | null = null;

export async function startNewSet(): Promise<string> {
  // Get questions for this set
  const questions = await getUnusedQuestions(QUESTIONS_PER_SET);

  if (questions.length < QUESTIONS_PER_SET) {
    throw new Error('Not enough questions available');
  }

  const setId = uuidv4();

  currentSession = {
    setId,
    questions,
    currentQuestionIndex: 0,
    players: new Map(),
    scores: new Map(),
    buzzes: new Map(),
    currentBuzzWinner: null,
    answerDeadline: null,
  };

  // Mark questions as used
  await markQuestionsUsed(questions.map((q) => q.id));

  return setId;
}

export async function addPlayer(player: Player): Promise<void> {
  if (!currentSession) return;

  currentSession.players.set(player.id, player);
  currentSession.scores.set(player.id, 0);

  // Broadcast player joined
  const ably = getAblyClient();
  const channel = ably.channels.get(CHANNELS.GAME);
  await channel.publish('player_joined', { player });
}

export async function removePlayer(playerId: string): Promise<void> {
  if (!currentSession) return;

  currentSession.players.delete(playerId);

  // Broadcast player left
  const ably = getAblyClient();
  const channel = ably.channels.get(CHANNELS.GAME);
  await channel.publish('player_left', { playerId });
}

export async function startQuestion(): Promise<void> {
  if (!currentSession) return;

  const question = currentSession.questions[currentSession.currentQuestionIndex];
  if (!question) return;

  // Reset buzzes
  currentSession.buzzes.clear();
  currentSession.currentBuzzWinner = null;
  currentSession.answerDeadline = null;

  // Broadcast question (without correct answer)
  const ably = getAblyClient();
  const channel = ably.channels.get(CHANNELS.GAME);

  const payload: QuestionStartPayload = {
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
      category: question.category,
      difficulty: question.difficulty,
    },
    questionIndex: currentSession.currentQuestionIndex,
    totalQuestions: QUESTIONS_PER_SET,
    questionDuration: 5000,
  };

  await channel.publish('question_start', payload);
}

export async function handleBuzz(
  playerId: string,
  timestamp: number,
  latency: number
): Promise<{ winner: boolean }> {
  if (!currentSession || currentSession.currentBuzzWinner) {
    return { winner: false };
  }

  // Calculate latency-adjusted timestamp
  const compensatedLatency = Math.min(latency, MAX_LATENCY_COMPENSATION_MS);
  const adjustedTimestamp = timestamp - compensatedLatency / 2;

  currentSession.buzzes.set(playerId, { timestamp: adjustedTimestamp, latency });

  // Find the earliest buzz
  let earliestPlayerId = playerId;
  let earliestTimestamp = adjustedTimestamp;

  currentSession.buzzes.forEach((buzz, id) => {
    if (buzz.timestamp < earliestTimestamp) {
      earliestTimestamp = buzz.timestamp;
      earliestPlayerId = id;
    }
  });

  // If this player is the winner
  if (earliestPlayerId === playerId) {
    currentSession.currentBuzzWinner = playerId;
    currentSession.answerDeadline = Date.now() + ANSWER_TIMEOUT_MS;

    const player = currentSession.players.get(playerId);

    const ably = getAblyClient();
    const channel = ably.channels.get(CHANNELS.GAME);

    const payload: BuzzPayload = {
      playerId,
      displayName: player?.displayName || 'Unknown',
      adjustedTimestamp,
    };

    await channel.publish('buzz', payload);

    return { winner: true };
  }

  return { winner: false };
}

export async function handleAnswer(
  playerId: string,
  answerIndex: number
): Promise<{ correct: boolean; points: number }> {
  if (!currentSession || currentSession.currentBuzzWinner !== playerId) {
    return { correct: false, points: 0 };
  }

  const question = currentSession.questions[currentSession.currentQuestionIndex];
  const isCorrect = answerIndex === question.correctIndex;
  const points = isCorrect ? POINTS_CORRECT : POINTS_WRONG;

  // Update score
  const currentScore = currentSession.scores.get(playerId) || 0;
  currentSession.scores.set(playerId, currentScore + points);

  const player = currentSession.players.get(playerId);

  // Broadcast answer result
  const ably = getAblyClient();
  const channel = ably.channels.get(CHANNELS.GAME);

  const answerPayload: AnswerPayload = {
    playerId,
    answerIndex,
    isCorrect,
    correctIndex: question.correctIndex,
    pointsAwarded: points,
  };

  await channel.publish('answer', answerPayload);

  // Update user stats
  if (player && !player.isAI) {
    await updateUserStats(playerId, {
      totalCorrect: isCorrect ? 1 : 0,
      totalWrong: isCorrect ? 0 : 1,
      totalPoints: points,
    });

    // Update leaderboards
    await updateLeaderboard('daily', playerId, player.displayName, points);
    await updateLeaderboard('weekly', playerId, player.displayName, points);
    await updateLeaderboard('allTime', playerId, player.displayName, points);
  }

  return { correct: isCorrect, points };
}

export async function endQuestion(): Promise<void> {
  if (!currentSession) return;

  const question = currentSession.questions[currentSession.currentQuestionIndex];

  const ably = getAblyClient();
  const channel = ably.channels.get(CHANNELS.GAME);

  const scores: Record<string, number> = {};
  currentSession.scores.forEach((score, id) => {
    scores[id] = score;
  });

  const winner = currentSession.currentBuzzWinner
    ? currentSession.players.get(currentSession.currentBuzzWinner)
    : null;

  const payload: QuestionEndPayload = {
    correctIndex: question.correctIndex,
    explanation: question.explanation || '',
    scores,
    leaderboard: [],
    winnerId: currentSession.currentBuzzWinner,
    winnerName: winner?.displayName || null,
    wasAnswered: currentSession.currentBuzzWinner !== null,
    wasCorrect: null,
    nextQuestionIn: 5000,
  };

  await channel.publish('question_end', payload);

  // Move to next question
  currentSession.currentQuestionIndex++;
  currentSession.currentBuzzWinner = null;
  currentSession.answerDeadline = null;
  currentSession.buzzes.clear();
}

export async function endSet(): Promise<void> {
  if (!currentSession) return;

  const scores: Record<string, { userId: string; displayName: string; score: number }> = {};

  currentSession.scores.forEach((score, id) => {
    const player = currentSession!.players.get(id);
    if (player) {
      scores[id] = {
        userId: id,
        displayName: player.displayName,
        score,
      };
    }
  });

  // Create set leaderboard
  const leaderboard = await createSetLeaderboard(currentSession.setId, scores);

  // Find winner
  const winner = leaderboard[0];

  // Update winner stats
  if (winner && !currentSession.players.get(winner.userId)?.isAI) {
    await updateUserStats(winner.userId, { setsWon: 1 });
    await updateStreak(winner.userId, true);
  }

  // Update all players' sets played
  for (const [playerId, player] of currentSession.players) {
    if (!player.isAI) {
      await updateUserStats(playerId, { setsPlayed: 1 });

      // Reset streak for non-winners
      if (playerId !== winner?.userId) {
        await updateStreak(playerId, false);
      }
    }
  }

  const ably = getAblyClient();
  const channel = ably.channels.get(CHANNELS.GAME);

  const finalScores: Record<string, number> = {};
  currentSession.scores.forEach((score, id) => {
    finalScores[id] = score;
  });

  const payload: SetEndPayload = {
    finalScores,
    leaderboard,
  };

  await channel.publish('set_end', payload);

  // Clear session
  currentSession = null;
}

export function getCurrentSession(): GameSession | null {
  return currentSession;
}
