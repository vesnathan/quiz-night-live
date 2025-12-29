'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Progress, Chip, Spinner, CircularProgress } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGameStore } from '@/stores/gameStore';
import { useLobbyChannel } from '@/hooks/useLobbyChannel';
import { MAX_PLAYERS_PER_ROOM } from '@quiz/shared';
import type { RoomListItem } from '@quiz/shared';

interface RoomListProps {
  canJoin?: boolean;
  nextSetTime?: number;
  onJoinRoom?: (roomId: string) => void;
}

// Calculate time until join window opens (1 minute before set)
const JOIN_WINDOW_MS = 60 * 1000;

export function RoomList({ canJoin = true, nextSetTime, onJoinRoom }: RoomListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { setPlayer, setCurrentRoomId } = useGameStore();
  const { rooms, isConnected, joinRoom, autoJoin } = useLobbyChannel();
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilJoin, setTimeUntilJoin] = useState<number>(0);

  // Update countdown timer
  useEffect(() => {
    if (!nextSetTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const joinOpenTime = nextSetTime - JOIN_WINDOW_MS;
      const remaining = Math.max(0, joinOpenTime - now);
      setTimeUntilJoin(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextSetTime]);

  const handleJoinRoom = async (roomId: string) => {
    if (!user || !canJoin) return;

    setJoining(roomId);
    setError(null);

    const result = await joinRoom(roomId);

    if (result.success && result.roomId) {
      setPlayer({
        id: user.userId,
        displayName: user.name || user.email.split('@')[0],
        isAI: false,
        latency: 0,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        joinedAt: Date.now(),
      });
      setCurrentRoomId(result.roomId, result.roomName);

      if (onJoinRoom) {
        onJoinRoom(result.roomId);
      } else {
        router.push(`/game?roomId=${result.roomId}`);
      }
    } else {
      setError(result.error || 'Failed to join room');
      setJoining(null);
    }
  };

  const handleAutoJoin = async () => {
    if (!user || !canJoin) return;

    setJoining('auto');
    setError(null);

    const result = await autoJoin();

    if (result.success && result.roomId) {
      setPlayer({
        id: user.userId,
        displayName: user.name || user.email.split('@')[0],
        isAI: false,
        latency: 0,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        joinedAt: Date.now(),
      });
      setCurrentRoomId(result.roomId, result.roomName);

      if (onJoinRoom) {
        onJoinRoom(result.roomId);
      } else {
        router.push(`/game?roomId=${result.roomId}`);
      }
    } else {
      setError(result.error || 'Failed to join room');
      setJoining(null);
    }
  };

  const getRoomStatusColor = (room: RoomListItem): 'success' | 'warning' | 'danger' | 'default' => {
    if (room.status === 'in_progress') return 'warning';
    if (room.currentPlayers >= room.maxPlayers) return 'danger';
    if (room.currentPlayers > room.maxPlayers * 0.7) return 'warning';
    return 'success';
  };

  const getRoomStatusText = (room: RoomListItem): string => {
    if (room.status === 'in_progress') return 'In Progress';
    if (room.currentPlayers >= room.maxPlayers) return 'Full';
    return 'Waiting';
  };

  // Format time as mm:ss
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (for 30 min countdown to join window)
  const maxWaitTime = 30 * 60 * 1000 - JOIN_WINDOW_MS; // 29 minutes max wait
  const progressValue = canJoin ? 100 : Math.max(0, 100 - (timeUntilJoin / maxWaitTime) * 100);

  return (
    <Card className="bg-gray-900/70 backdrop-blur-sm">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Quiz Rooms</h2>
          <Chip color={isConnected ? 'success' : 'default'} variant="flat" size="sm">
            {isConnected ? 'Live' : 'Connecting...'}
          </Chip>
        </div>

        {/* Join Timer or Quick Join */}
        {canJoin ? (
          <>
            <Button
              color="primary"
              size="md"
              className="w-full font-semibold mb-4"
              onPress={handleAutoJoin}
              isLoading={joining === 'auto'}
              isDisabled={joining !== null || !isConnected}
            >
              Quick Join
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <CircularProgress
              size="lg"
              value={progressValue}
              color="primary"
              showValueLabel={false}
              classNames={{
                svg: "w-24 h-24",
                track: "stroke-gray-700",
              }}
              aria-label="Time until join"
            />
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-primary-400">
                {formatTime(timeUntilJoin)}
              </div>
              <div className="text-sm text-gray-400">until rooms open</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-danger-100 text-danger-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Room List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {!isConnected ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
              <span className="ml-2 text-gray-400">Connecting...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No rooms available</p>
              <p className="text-sm mt-1">
                {canJoin ? 'Click Quick Join to create one!' : 'Rooms will appear when join opens'}
              </p>
            </div>
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                canJoin={canJoin}
                joining={joining}
                onJoin={handleJoinRoom}
              />
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
}

interface RoomCardProps {
  room: RoomListItem;
  canJoin: boolean;
  joining: string | null;
  onJoin: (roomId: string) => void;
}

function RoomCard({ room, canJoin, joining, onJoin }: RoomCardProps) {
  const getRoomStatusColor = (room: RoomListItem): 'success' | 'warning' | 'danger' | 'default' => {
    if (room.status === 'in_progress') return 'warning';
    if (room.currentPlayers >= room.maxPlayers) return 'danger';
    if (room.currentPlayers > room.maxPlayers * 0.7) return 'warning';
    return 'success';
  };

  const isJoinable = canJoin && room.status === 'waiting' && room.currentPlayers < room.maxPlayers;

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{room.name}</span>
        {room.status === 'in_progress' ? (
          <Chip color="warning" variant="flat" size="sm">
            In Progress
          </Chip>
        ) : room.currentPlayers >= room.maxPlayers ? (
          <Chip color="danger" variant="flat" size="sm">
            Full
          </Chip>
        ) : (
          <Chip color="success" variant="flat" size="sm">
            Waiting
          </Chip>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Players</span>
          <span>{room.currentPlayers}/{room.maxPlayers}</span>
        </div>
        <Progress
          value={(room.currentPlayers / room.maxPlayers) * 100}
          color={getRoomStatusColor(room)}
          size="sm"
          className="h-1"
        />
      </div>

      <Button
        color={isJoinable ? 'primary' : 'default'}
        variant="flat"
        size="sm"
        className="w-full"
        isDisabled={!isJoinable || joining !== null}
        isLoading={joining === room.id}
        onPress={() => onJoin(room.id)}
      >
        {!canJoin
          ? 'Opens Soon'
          : room.status === 'in_progress'
          ? 'In Progress'
          : room.currentPlayers >= room.maxPlayers
          ? 'Full'
          : 'Join'}
      </Button>
    </div>
  );
}
