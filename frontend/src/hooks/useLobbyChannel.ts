import { useEffect, useState, useCallback } from 'react';
import Ably from 'ably';
import { ABLY_CHANNELS } from '@quiz/shared';
import type { RoomListItem } from '@quiz/shared';
import { useAuth } from '@/contexts/AuthContext';

interface UseLobbyChannelReturn {
  rooms: RoomListItem[];
  isConnected: boolean;
  joinRoom: (roomId: string) => Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string }>;
  autoJoin: () => Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string }>;
}

export function useLobbyChannel(): UseLobbyChannelReturn {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const { user } = useAuth();

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
      const { rooms: roomList } = message.data;
      setRooms(roomList || []);
    });

    return () => {
      lobbyChannel.presence.leave();
      lobbyChannel.unsubscribe();
      ablyClient.close();
    };
  }, [user?.userId, user?.name, user?.email]);

  const joinRoom = useCallback(async (roomId: string): Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string }> => {
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

  const autoJoin = useCallback(async (): Promise<{ success: boolean; roomId?: string; roomName?: string; error?: string }> => {
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
    joinRoom,
    autoJoin,
  };
}
