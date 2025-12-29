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
  onJoinRoom?: (roomId: string) => void;
}

export function RoomList({ onJoinRoom }: RoomListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { setPlayer, setCurrentRoomId } = useGameStore();
  const { rooms, isConnected, joinWindowOpen, secondsUntilJoinOpen, joinRoom } = useLobbyChannel();
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use server-provided join window status
  const canJoin = joinWindowOpen;

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

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (for 29 min countdown to join window)
  const maxWaitSeconds = 29 * 60; // 29 minutes max wait
  const progressValue = canJoin ? 100 : Math.max(0, 100 - ((secondsUntilJoinOpen || 0) / maxWaitSeconds) * 100);

  return (
    <Card className="bg-gray-900/70 backdrop-blur-sm">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Quiz Rooms</h2>
          <Chip color={isConnected ? 'success' : 'default'} variant="flat" size="sm">
            {isConnected ? 'Live' : 'Connecting...'}
          </Chip>
        </div>

        {/* Join Window Timer */}
        {!canJoin && secondsUntilJoinOpen !== null && (
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
                {formatTime(secondsUntilJoinOpen)}
              </div>
              <div className="text-sm text-gray-400">until rooms open</div>
            </div>
          </div>
        )}

        {canJoin && (
          <div className="bg-success-100/20 text-success-500 px-3 py-2 rounded-lg mb-4 text-sm text-center">
            Select a room to join the quiz!
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
