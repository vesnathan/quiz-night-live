'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Chip, Spinner, Progress } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGameStore } from '@/stores/gameStore';
import { useLobbyChannel } from '@/hooks/useLobbyChannel';
import { GameBackground } from '@/components/GameBackground';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MAX_PLAYERS_PER_ROOM } from '@quiz/shared';
import type { RoomListItem } from '@quiz/shared';

export default function RoomsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { nextSetTime, isSetActive, setPlayer, setCurrentRoomId } = useGameStore();
  const { rooms, isConnected, joinRoom, autoJoin } = useLobbyChannel();
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleJoinRoom = async (roomId: string) => {
    if (!user) return;

    setJoining(roomId);
    setError(null);

    const result = await joinRoom(roomId);

    if (result.success && result.roomId) {
      // Set player and room in store
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
      setCurrentRoomId(result.roomId);
      router.push(`/game?roomId=${result.roomId}`);
    } else {
      setError(result.error || 'Failed to join room');
      setJoining(null);
    }
  };

  const handleAutoJoin = async () => {
    if (!user) return;

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
      setCurrentRoomId(result.roomId);
      router.push(`/game?roomId=${result.roomId}`);
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

  if (authLoading) {
    return (
      <GameBackground className="flex items-center justify-center">
        <Spinner size="lg" />
      </GameBackground>
    );
  }

  return (
    <GameBackground>
      <main className="p-4 sm:p-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Select a Room</h1>
              <Chip color={isConnected ? 'success' : 'default'} variant="flat">
                {isConnected ? 'Connected' : 'Connecting...'}
              </Chip>
            </div>

            {/* Next Set Timer */}
            <Card className="bg-gray-900/70 backdrop-blur-sm mb-4">
              <CardBody className="p-4">
                <CountdownTimer
                  targetTime={nextSetTime}
                  isActive={isSetActive}
                />
              </CardBody>
            </Card>

            {/* Quick Join */}
            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold mb-4"
              onPress={handleAutoJoin}
              isLoading={joining === 'auto'}
              isDisabled={joining !== null}
            >
              Quick Join (Auto-Select Room)
            </Button>

            {error && (
              <div className="bg-danger-100 text-danger-700 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}
          </div>

          {/* Room List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300">Available Rooms</h2>

            {rooms.length === 0 ? (
              <Card className="bg-gray-900/70 backdrop-blur-sm">
                <CardBody className="p-8 text-center">
                  <p className="text-gray-400">
                    {isConnected ? 'No rooms available. Click Quick Join to create one!' : 'Loading rooms...'}
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <Card
                    key={room.id}
                    className="bg-gray-900/70 backdrop-blur-sm hover:bg-gray-800/70 transition-colors"
                    isPressable={room.status === 'waiting' && room.currentPlayers < room.maxPlayers}
                    onPress={() => room.status === 'waiting' && room.currentPlayers < room.maxPlayers && handleJoinRoom(room.id)}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold">{room.name}</h3>
                        <Chip
                          color={getRoomStatusColor(room)}
                          variant="flat"
                          size="sm"
                        >
                          {getRoomStatusText(room)}
                        </Chip>
                      </div>

                      {/* Player count bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Players</span>
                          <span>{room.currentPlayers}/{room.maxPlayers}</span>
                        </div>
                        <Progress
                          value={(room.currentPlayers / room.maxPlayers) * 100}
                          color={getRoomStatusColor(room)}
                          className="h-2"
                        />
                      </div>

                      {/* Join button */}
                      <Button
                        color={room.status === 'waiting' && room.currentPlayers < room.maxPlayers ? 'primary' : 'default'}
                        variant={room.status === 'waiting' && room.currentPlayers < room.maxPlayers ? 'solid' : 'flat'}
                        size="sm"
                        className="w-full"
                        isDisabled={room.status !== 'waiting' || room.currentPlayers >= room.maxPlayers || joining !== null}
                        isLoading={joining === room.id}
                        onPress={() => handleJoinRoom(room.id)}
                      >
                        {room.status === 'in_progress'
                          ? 'Game in Progress'
                          : room.currentPlayers >= room.maxPlayers
                          ? 'Room Full'
                          : 'Join Room'}
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Back button */}
          <div className="mt-8">
            <Button
              variant="light"
              onPress={() => router.push('/')}
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </main>
    </GameBackground>
  );
}
