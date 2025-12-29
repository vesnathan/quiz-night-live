import { useEffect, useState, useCallback } from 'react';
import Ably from 'ably';
import { ABLY_CHANNELS } from '@quiz/shared';
import type { RoomListItem } from '@quiz/shared';
import { useAuth } from '@/contexts/AuthContext';

interface UseLobbyChannelReturn {
  rooms: RoomListItem[];
  isConnected: boolean;
  joinWindowOpen: boolean;
  secondsUntilJoinOpen: number | null;
  joinRoom: (roomId: string) => Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string; secondsUntilOpen?: number }>;
  autoJoin: () => Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string; secondsUntilOpen?: number }>;
}

export function useLobbyChannel(): UseLobbyChannelReturn {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [joinWindowOpen, setJoinWindowOpen] = useState(false);
  const [serverSecondsUntilJoinOpen, setServerSecondsUntilJoinOpen] = useState<number | null>(null);
  const [lastServerUpdate, setLastServerUpdate] = useState<number>(Date.now());
  const [interpolatedSeconds, setInterpolatedSeconds] = useState<number | null>(null);
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const { user } = useAuth();

  // Interpolate seconds between server updates for smooth countdown
  useEffect(() => {
    if (serverSecondsUntilJoinOpen === null || joinWindowOpen) {
      setInterpolatedSeconds(null);
      return;
    }

    const updateInterpolated = () => {
      const elapsed = Math.floor((Date.now() - lastServerUpdate) / 1000);
      const remaining = Math.max(0, serverSecondsUntilJoinOpen - elapsed);
      setInterpolatedSeconds(remaining);

      // If countdown reaches 0, assume window opened
      if (remaining === 0) {
        setJoinWindowOpen(true);
      }
    };

    updateInterpolated();
    const interval = setInterval(updateInterpolated, 1000);
    return () => clearInterval(interval);
  }, [serverSecondsUntilJoinOpen, lastServerUpdate, joinWindowOpen]);

  useEffect(() => {
    const ablyKey = process.env.NEXT_PUBLIC_ABLY_KEY;
    if (!ablyKey || !user?.userId) return;

    const clientId = user.userId;
    const ablyClient = new Ably.Realtime({
      key: ablyKey,
      clientId,
    });

    ablyClient.connection.on('connected', () => {
      setIsConnected(true);
    });

    ablyClient.connection.on('disconnected', () => {
      setIsConnected(false);
    });

    const lobbyChannel = ablyClient.channels.get(ABLY_CHANNELS.LOBBY);
    setChannel(lobbyChannel);
    setAbly(ablyClient);

    // Enter presence in lobby
    lobbyChannel.presence.enter({ displayName: user.name || user.email?.split('@')[0] || 'Anonymous' });

    // Subscribe to room list updates
    lobbyChannel.subscribe('room_list', (message) => {
      const { rooms: roomList, joinWindowOpen: windowOpen, secondsUntilJoinOpen: secondsUntil } = message.data;
      setRooms(roomList || []);
      setJoinWindowOpen(windowOpen ?? false);
      setServerSecondsUntilJoinOpen(secondsUntil ?? null);
      setLastServerUpdate(Date.now());
    });

    return () => {
      lobbyChannel.presence.leave();
      lobbyChannel.unsubscribe();
      ablyClient.close();
    };
  }, [user?.userId, user?.name, user?.email]);

  const joinRoom = useCallback(async (roomId: string): Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string; secondsUntilOpen?: number }> => {
    if (!channel || !user) {
      return { success: false, error: 'Not connected to lobby' };
    }

    return new Promise((resolve) => {
      const handleResult = (message: Ably.Message) => {
        const data = message.data;
        if (data.playerId === user.userId) {
          channel.unsubscribe('join_room_result', handleResult);
          resolve({
            success: data.success,
            roomId: data.roomId,
            roomName: data.roomName,
            error: data.error,
            secondsUntilOpen: data.secondsUntilOpen,
          });
        }
      };

      channel.subscribe('join_room_result', handleResult);
      channel.publish('join_room', {
        playerId: user.userId,
        roomId,
        displayName: user.name || user.email?.split('@')[0] || 'Anonymous',
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        channel.unsubscribe('join_room_result', handleResult);
        resolve({ success: false, error: 'Request timed out' });
      }, 5000);
    });
  }, [channel, user]);

  const autoJoin = useCallback(async (): Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string; secondsUntilOpen?: number }> => {
    if (!channel || !user) {
      return { success: false, error: 'Not connected to lobby' };
    }

    return new Promise((resolve) => {
      const handleResult = (message: Ably.Message) => {
        const data = message.data;
        if (data.playerId === user.userId) {
          channel.unsubscribe('join_room_result', handleResult);
          resolve({
            success: data.success,
            roomId: data.roomId,
            roomName: data.roomName,
            error: data.error,
            secondsUntilOpen: data.secondsUntilOpen,
          });
        }
      };

      channel.subscribe('join_room_result', handleResult);
      channel.publish('auto_join', {
        playerId: user.userId,
        displayName: user.name || user.email?.split('@')[0] || 'Anonymous',
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        channel.unsubscribe('join_room_result', handleResult);
        resolve({ success: false, error: 'Request timed out' });
      }, 5000);
    });
  }, [channel, user]);

  return {
    rooms,
    isConnected,
    joinWindowOpen,
    secondsUntilJoinOpen: interpolatedSeconds,
    joinRoom,
    autoJoin,
  };
}
