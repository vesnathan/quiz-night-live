'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { useGameStore } from '@/stores/gameStore';
import { NotificationButton } from './NotificationButton';
import { useNotifications, useCountdownNotifications } from '@/hooks/useNotifications';

export function GameStatus() {
  const {
    isSetActive,
    nextSetTime,
    questionIndex,
    buzzerWinner,
    players,
    updateSetTiming,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState<string>('');

  const {
    notificationsEnabled,
    sendNotification,
  } = useNotifications();

  const { checkNotifications } = useCountdownNotifications(
    nextSetTime,
    isSetActive,
    notificationsEnabled,
    sendNotification
  );

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = nextSetTime - now;

      if (diff <= 0) {
        // Update set timing state when countdown reaches zero
        updateSetTiming();
        const status = isSetActive ? 'In progress' : 'Starting soon...';
        setTimeLeft(status);
        document.title = isSetActive ? '🟢 LIVE - Quiz' : '⏳ Starting... - Quiz';
        checkNotifications(diff);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const time = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      setTimeLeft(time);

      // Update browser tab title
      if (isSetActive) {
        document.title = `🟢 ${time} - Quiz`;
      } else {
        document.title = `⏳ ${time} - Quiz`;
      }

      checkNotifications(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
      document.title = 'Live Pub Quiz';
    };
  }, [nextSetTime, isSetActive, checkNotifications]);

  return (
    <Card className="bg-gray-800/50 backdrop-blur">
      <CardBody className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Set Status */}
          <div className="flex items-center space-x-3">
            <Chip
              color={isSetActive ? 'success' : 'warning'}
              variant="flat"
              size="sm"
            >
              {isSetActive ? 'LIVE' : 'BREAK'}
            </Chip>
            {isSetActive && (
              <span className="text-gray-400">
                Question {questionIndex + 1} / 20
              </span>
            )}
            <span className={isSetActive ? 'text-green-400' : 'text-yellow-400'}>
              {isSetActive ? `${timeLeft} left` : `Next set: ${timeLeft}`}
            </span>
          </div>

          {/* Player Count & Notifications */}
          <div className="flex items-center space-x-4">
            <NotificationButton />

            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">{players.length}</span>
              {players.length === 1 ? ' player' : ' players'}
            </div>

            {/* Buzzer Winner Indicator */}
            {buzzerWinner && (
              <Chip color="primary" variant="flat" size="sm">
                Buzz!
              </Chip>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
