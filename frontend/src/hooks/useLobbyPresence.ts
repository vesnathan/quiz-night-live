'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Ably from 'ably';
import { ABLY_CHANNELS } from '@quiz/shared';
import { useGameStore } from '@/stores/gameStore';
import type { QuestionStartPayload, SetEndPayload } from '@quiz/shared';

interface ActiveUser {
  clientId: string;
  username: string;
  displayName: string;
}

// Singleton state management outside React
let ably: Ably.Realtime | null = null;
let activeUsers: ActiveUser[] = [];
let isConnected = false;
let subscribers = new Set<() => void>();
let refCount = 0;

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function getActiveUsers() {
  return activeUsers;
}

function getIsConnected() {
  return isConnected;
}

function initAbly(userId?: string, displayName?: string) {
  const ablyKey = process.env.NEXT_PUBLIC_ABLY_KEY;
  if (!ablyKey || ably) return;

  ably = new Ably.Realtime({
    key: ablyKey,
    clientId: userId || `anon-${Date.now()}`,
  });

  ably.connection.on('connected', () => {
    isConnected = true;
    notifySubscribers();
  });

  ably.connection.on('disconnected', () => {
    isConnected = false;
    notifySubscribers();
  });

  ably.connection.on('failed', () => {
    isConnected = false;
    notifySubscribers();
  });

  const channel = ably.channels.get(ABLY_CHANNELS.GAME);
  const presence = channel.presence;

  presence.subscribe('enter', (member) => {
    if (!activeUsers.some((u) => u.clientId === member.clientId)) {
      activeUsers = [
        ...activeUsers,
        {
          clientId: member.clientId!,
          username: member.data?.username || 'Player',
          displayName: member.data?.displayName || member.data?.username || 'Player',
        },
      ];
      notifySubscribers();
    }
  });

  presence.subscribe('leave', (member) => {
    activeUsers = activeUsers.filter((u) => u.clientId !== member.clientId);
    notifySubscribers();
  });

  // Subscribe to game state events (question_start, set_end) for lobby display
  channel.subscribe('question_start', (message) => {
    const payload = message.data as QuestionStartPayload;
    // Update game store with current question index for lobby display
    useGameStore.getState().setCurrentQuestion(
      payload.question,
      payload.questionIndex,
      payload.totalQuestions,
      payload.questionDuration
    );
    // Mark set as active
    useGameStore.getState().setSetActive(true);
  });

  channel.subscribe('set_end', () => {
    // Mark set as inactive
    useGameStore.getState().setSetActive(false);
  });

  // Enter presence, fetch members, and get current game state when connected
  ably.connection.once('connected', async () => {
    try {
      // Only enter presence if we have a real user ID (authenticated)
      if (userId && displayName) {
        await presence.enter({ displayName });
      }

      const members = await presence.get();
      activeUsers = members.map((m) => ({
        clientId: m.clientId!,
        username: m.data?.username || 'Player',
        displayName: m.data?.displayName || m.data?.username || 'Player',
      }));
      notifySubscribers();

      // Fetch recent history to get current game state
      // This ensures we have the latest question_start or set_end even if we just connected
      const history = await channel.history({ limit: 10 });
      const messages = history.items;

      // Find the most recent question_start or set_end
      for (const msg of messages) {
        if (msg.name === 'question_start') {
          const payload = msg.data as QuestionStartPayload;
          useGameStore.getState().setCurrentQuestion(
            payload.question,
            payload.questionIndex,
            payload.totalQuestions,
            payload.questionDuration
          );
          useGameStore.getState().setSetActive(true);
          break; // Found the most recent, stop looking
        } else if (msg.name === 'set_end') {
          useGameStore.getState().setSetActive(false);
          break; // Set ended, stop looking
        }
      }
    } catch (e) {
      console.error('Failed to initialize lobby state:', e);
    }
  });
}

async function cleanupAbly() {
  if (ably) {
    try {
      const channel = ably.channels.get(ABLY_CHANNELS.GAME);
      await channel.presence.leave();
    } catch (e) {
      // Ignore leave errors
    }
    ably.close();
    ably = null;
    activeUsers = [];
    isConnected = false;
    notifySubscribers();
  }
}

interface UseLobbyPresenceOptions {
  enabled: boolean;
  userId?: string;
  displayName?: string;
}

export function useLobbyPresence(options: UseLobbyPresenceOptions = { enabled: false }) {
  const { enabled, userId, displayName } = options;

  // Use useSyncExternalStore for reactive updates
  const users = useSyncExternalStore(subscribe, getActiveUsers, getActiveUsers);
  const connected = useSyncExternalStore(subscribe, getIsConnected, getIsConnected);

  useEffect(() => {
    // Always connect to receive game status events (even for unauthenticated users)
    if (!enabled) {
      return;
    }

    refCount++;
    if (refCount === 1) {
      initAbly(userId, displayName);
    }

    return () => {
      refCount--;
      // Only cleanup when all components unmount and after a delay
      // to handle Strict Mode remounting
      if (refCount === 0) {
        setTimeout(() => {
          if (refCount === 0) {
            cleanupAbly();
          }
        }, 100);
      }
    };
  }, [enabled, userId, displayName]);

  return {
    activeUsers: users,
    activeUserCount: users.length,
    isConnected: connected,
  };
}
