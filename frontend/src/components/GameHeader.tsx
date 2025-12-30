'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { NotificationButton } from './NotificationButton';
import { useNotifications, useCountdownNotifications } from '@/hooks/useNotifications';

interface GameHeaderProps {
  playerScore: number;
  playerDisplayName: string;
}

export function GameHeader({ playerScore, playerDisplayName }: GameHeaderProps) {
  const {
    isSetActive,
    nextSetTime,
    questionIndex,
    buzzerWinner,
    players,
    updateSetTiming,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [previousScore, setPreviousScore] = useState(playerScore);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);

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

  // Timer logic
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = nextSetTime - now;

      if (diff <= 0) {
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
      document.title = 'Quiz Night Live';
    };
  }, [nextSetTime, isSetActive, checkNotifications, updateSetTiming]);

  // Score delta animation
  useEffect(() => {
    if (playerScore !== previousScore) {
      setScoreDelta(playerScore - previousScore);
      setPreviousScore(playerScore);

      const timer = setTimeout(() => setScoreDelta(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [playerScore, previousScore]);

  return (
    <Card className="bg-background border border-gray-700 mb-6">
      <CardBody className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="QuizNight.live"
              className="h-20 md:h-24"
            />
          </div>

          {/* Right side - All status info */}
          <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-end">
            {/* LIVE/BREAK Chip */}
            <Chip
              color={isSetActive ? 'success' : 'warning'}
              variant="flat"
              size="lg"
              className="font-bold"
            >
              {isSetActive ? 'LIVE' : 'BREAK'}
            </Chip>

            {/* Question Counter */}
            {isSetActive && (
              <div className="text-sm md:text-base text-gray-300">
                <span className="text-white font-medium">{questionIndex + 1}</span>
                <span className="text-gray-500">/20</span>
              </div>
            )}

            {/* Timer */}
            <div className={`text-sm md:text-base font-medium ${isSetActive ? 'text-green-400' : 'text-yellow-400'}`}>
              {isSetActive ? `${timeLeft} left` : timeLeft}
            </div>

            {/* Score */}
            <div className="relative">
              <div
                className={`text-xl md:text-2xl font-bold ${playerScore >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {playerScore >= 0 ? '+' : ''}{playerScore.toLocaleString()}
              </div>
              <AnimatePresence>
                {scoreDelta !== null && (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className={`absolute -top-1 right-0 text-lg font-bold ${scoreDelta >= 0 ? 'text-green-300' : 'text-red-300'}`}
                  >
                    {scoreDelta >= 0 ? '+' : ''}{scoreDelta}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <NotificationButton />

            {/* Player Count */}
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

        {/* Player name - subtle below */}
        <div className="text-xs text-gray-500 mt-2 text-right">
          Playing as {playerDisplayName}
        </div>
      </CardBody>
    </Card>
  );
}
