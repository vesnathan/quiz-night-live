/**
 * Zustand selector hooks for gameStore
 * These provide focused slices of state to reduce re-renders
 * and simplify component code
 */

import { useGameStore } from './gameStore';
import type { GamePhase } from './gameStore';

/**
 * Player-related state
 */
export function usePlayerState() {
  return useGameStore((state) => ({
    player: state.player,
    setPlayer: state.setPlayer,
  }));
}

/**
 * Room-related state
 */
export function useRoomState() {
  return useGameStore((state) => ({
    currentRoomId: state.currentRoomId,
    currentRoomName: state.currentRoomName,
    setCurrentRoomId: state.setCurrentRoomId,
  }));
}

/**
 * Game phase state
 */
export function useGamePhaseState() {
  return useGameStore((state) => ({
    gamePhase: state.gamePhase,
    setGamePhase: state.setGamePhase,
    isSetActive: state.isSetActive,
    nextSetTime: state.nextSetTime,
  }));
}

/**
 * Current question state
 */
export function useQuestionState() {
  return useGameStore((state) => ({
    currentQuestion: state.currentQuestion,
    questionIndex: state.questionIndex,
    totalQuestions: state.totalQuestions,
    questionDuration: state.questionDuration,
    questionStartTime: state.questionStartTime,
    setCurrentQuestion: state.setCurrentQuestion,
  }));
}

/**
 * Buzzer state
 */
export function useBuzzerState() {
  return useGameStore((state) => ({
    buzzerEnabled: state.buzzerEnabled,
    buzzerWinner: state.buzzerWinner,
    buzzerWinnerName: state.buzzerWinnerName,
    answerDeadline: state.answerDeadline,
    setBuzzerState: state.setBuzzerState,
  }));
}

/**
 * Answer state
 */
export function useAnswerState() {
  return useGameStore((state) => ({
    selectedAnswer: state.selectedAnswer,
    revealedAnswer: state.revealedAnswer,
    isCorrect: state.isCorrect,
    setAnswerState: state.setAnswerState,
  }));
}

/**
 * Results state
 */
export function useResultsState() {
  return useGameStore((state) => ({
    explanation: state.explanation,
    wasAnswered: state.wasAnswered,
    wasCorrect: state.wasCorrect,
    nextQuestionTime: state.nextQuestionTime,
    setResultsState: state.setResultsState,
    clearResultsState: state.clearResultsState,
  }));
}

/**
 * Leaderboard state
 */
export function useLeaderboardState() {
  return useGameStore((state) => ({
    setLeaderboard: state.setLeaderboard,
    setSetLeaderboard: state.setSetLeaderboard,
    scores: state.scores,
    updateScores: state.updateScores,
  }));
}

/**
 * Players list state
 */
export function usePlayersState() {
  return useGameStore((state) => ({
    players: state.players,
    setPlayers: state.setPlayers,
    addPlayer: state.addPlayer,
    removePlayer: state.removePlayer,
  }));
}

/**
 * Badge state
 */
export function useBadgeState() {
  return useGameStore((state) => ({
    pendingBadgeAward: state.pendingBadgeAward,
    earnedBadgesThisSet: state.earnedBadgesThisSet,
    earnedBadgesThisQuestion: state.earnedBadgesThisQuestion,
    setPendingBadgeAward: state.setPendingBadgeAward,
    addEarnedBadge: state.addEarnedBadge,
    setEarnedBadgesThisQuestion: state.setEarnedBadgesThisQuestion,
    clearEarnedBadges: state.clearEarnedBadges,
  }));
}

/**
 * Anti-cheat state
 */
export function useAntiCheatState() {
  return useGameStore((state) => ({
    leftTabDuringQuestion: state.leftTabDuringQuestion,
    setLeftTabDuringQuestion: state.setLeftTabDuringQuestion,
  }));
}

/**
 * Session state (kicked detection)
 */
export function useSessionState() {
  return useGameStore((state) => ({
    sessionKicked: state.sessionKicked,
    sessionKickedReason: state.sessionKickedReason,
    setSessionKicked: state.setSessionKicked,
  }));
}

/**
 * Latency state
 */
export function useLatencyState() {
  return useGameStore((state) => ({
    latency: state.latency,
    latencySamples: state.latencySamples,
    addLatencySample: state.addLatencySample,
  }));
}

/**
 * Completed questions state (for research/review)
 */
export function useCompletedQuestionsState() {
  return useGameStore((state) => ({
    completedQuestions: state.completedQuestions,
    addCompletedQuestion: state.addCompletedQuestion,
    clearCompletedQuestions: state.clearCompletedQuestions,
  }));
}

/**
 * Computed selector: Can the current player buzz?
 */
export function useCanBuzz() {
  return useGameStore((state) => {
    const playerId = state.player?.id;
    return (
      state.buzzerEnabled &&
      !state.buzzerWinner &&
      !state.leftTabDuringQuestion &&
      state.gamePhase === 'question'
    );
  });
}

/**
 * Computed selector: Is it the current player's turn to answer?
 */
export function useIsMyTurn() {
  return useGameStore((state) => {
    const playerId = state.player?.id;
    return playerId !== null && state.buzzerWinner === playerId;
  });
}

/**
 * Computed selector: Current player's score
 */
export function useMyScore() {
  return useGameStore((state) => {
    const playerId = state.player?.id;
    return playerId ? state.scores[playerId] || 0 : 0;
  });
}
