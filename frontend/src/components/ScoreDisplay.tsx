'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const [previousScore, setPreviousScore] = useState(score);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);

  useEffect(() => {
    if (score !== previousScore) {
      setScoreDelta(score - previousScore);
      setPreviousScore(score);

      // Clear delta after animation
      const timer = setTimeout(() => setScoreDelta(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [score, previousScore]);

  return (
    <div className="relative">
      <div
        className={`
          text-4xl font-bold
          ${score >= 0 ? 'text-green-400' : 'text-red-400'}
        `}
      >
        {score >= 0 ? '+' : ''}{score.toLocaleString()}
      </div>

      <AnimatePresence>
        {scoreDelta !== null && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`
              absolute -top-2 right-0
              text-2xl font-bold
              ${scoreDelta >= 0 ? 'text-green-300' : 'text-red-300'}
            `}
          >
            {scoreDelta >= 0 ? '+' : ''}{scoreDelta}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-gray-500 mt-1">Your Score</div>
    </div>
  );
}
