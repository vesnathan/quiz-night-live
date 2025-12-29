'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AwardBadge } from '@quiz/shared';
import { getRarityGradient, getRarityColor } from '@quiz/shared';

export interface BadgeWithCount {
  badge: AwardBadge;
  count: number;
}

interface BadgeRevolverProps {
  badges: AwardBadge[];
  onAllBadgesShown?: () => void;
}

// Helper function to count and deduplicate badges
function countBadges(badges: AwardBadge[]): BadgeWithCount[] {
  const countMap = new Map<string, { badge: AwardBadge; count: number }>();

  for (const badge of badges) {
    const existing = countMap.get(badge.id);
    if (existing) {
      existing.count++;
    } else {
      countMap.set(badge.id, { badge, count: 1 });
    }
  }

  return Array.from(countMap.values());
}

// Sparkle component for the explosion effect
function Sparkle({ delay, angle, distance }: { delay: number; angle: number; distance: number }) {
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [1, 0.5, 0],
        x: [0, x * 0.5, x],
        y: [0, y * 0.5, y],
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

// Star burst effect for badge unlock
function StarBurst() {
  const sparkles = [];
  const numSparkles = 8;

  for (let i = 0; i < numSparkles; i++) {
    const angle = (i / numSparkles) * Math.PI * 2;
    const distance = 40 + Math.random() * 20;
    sparkles.push(
      <Sparkle key={i} delay={i * 0.02} angle={angle} distance={distance} />
    );
  }

  return <>{sparkles}</>;
}

// Individual badge in the revolver
function RevolverBadge({
  badge,
  count,
  index,
  isAnimating,
  onAnimationComplete
}: {
  badge: AwardBadge;
  count: number;
  index: number;
  isAnimating: boolean;
  onAnimationComplete: () => void;
}) {
  const rarityGradient = getRarityGradient(badge.rarity);
  const rarityColor = getRarityColor(badge.rarity);
  const [phase, setPhase] = useState<'center' | 'moving' | 'settled'>('center');

  useEffect(() => {
    if (!isAnimating) return;

    // Phase 1: Show in center with explosion (1s)
    setPhase('center');
    const moveTimer = setTimeout(() => {
      setPhase('moving');
    }, 1000);

    // Phase 2: Move to position (0.5s)
    const settleTimer = setTimeout(() => {
      setPhase('settled');
      onAnimationComplete();
    }, 1500);

    return () => {
      clearTimeout(moveTimer);
      clearTimeout(settleTimer);
    };
  }, [isAnimating, onAnimationComplete]);

  if (!isAnimating && phase === 'center') {
    return null;
  }

  return (
    <>
      {/* Center explosion animation */}
      <AnimatePresence>
        {phase === 'center' && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dark overlay */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Badge container in center */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              {/* Sparkles */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <StarBurst />
              </div>

              {/* Glow effect */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${rarityGradient} blur-xl`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 0.8, 0.5],
                  scale: [0.5, 1.3, 1],
                }}
                transition={{ duration: 0.4 }}
                style={{ width: 120, height: 120, marginLeft: -60, marginTop: -60 }}
              />

              {/* Badge card */}
              <motion.div
                className={`relative flex flex-col items-center justify-center rounded-xl bg-gradient-to-br ${rarityGradient} p-0.5`}
                style={{ width: 100, height: 110 }}
              >
                <div className="flex flex-col items-center justify-center w-full h-full rounded-lg bg-gray-900 p-2">
                  <motion.div
                    className="text-4xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {badge.icon}
                  </motion.div>
                  <motion.div
                    className="text-white font-bold text-center text-sm leading-tight mt-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.2 }}
                  >
                    {badge.name}
                  </motion.div>
                  <motion.div
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: rarityColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.2 }}
                  >
                    {badge.rarity}
                  </motion.div>
                </div>
              </motion.div>

              {/* "Badge Unlocked" text */}
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <span className="text-lg font-bold text-white drop-shadow-lg">
                  Badge Unlocked!{count > 1 && ` x${count}`}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge in revolver position */}
      {phase !== 'center' && (
        <motion.div
          className={`relative flex flex-col items-center justify-center rounded-lg bg-gradient-to-br ${rarityGradient} p-0.5`}
          initial={{
            scale: phase === 'moving' ? 0.8 : 1,
            opacity: phase === 'moving' ? 0.8 : 1,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut',
          }}
          style={{ width: 56, height: 64 }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full rounded-md bg-gray-900 p-1">
            <span className="text-xl">{badge.icon}</span>
            <span
              className="text-[8px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: rarityColor }}
            >
              {badge.rarity}
            </span>
          </div>
          {/* Count badge for repeatable badges */}
          {count > 1 && (
            <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-gray-900">
              x{count}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}

export function BadgeRevolver({ badges, onAllBadgesShown }: BadgeRevolverProps) {
  // Count and deduplicate badges
  const countedBadges = countBadges(badges);

  const [currentAnimatingIndex, setCurrentAnimatingIndex] = useState(0);
  const [shownBadges, setShownBadges] = useState<BadgeWithCount[]>([]);
  const animationStarted = useRef(false);

  useEffect(() => {
    if (countedBadges.length === 0 || animationStarted.current) return;
    animationStarted.current = true;

    // Start showing badges one by one
    setCurrentAnimatingIndex(0);
  }, [countedBadges.length]);

  const handleBadgeAnimationComplete = () => {
    const currentBadge = countedBadges[currentAnimatingIndex];
    if (currentBadge) {
      setShownBadges(prev => [...prev, currentBadge]);
    }

    if (currentAnimatingIndex < countedBadges.length - 1) {
      // More badges to show
      setTimeout(() => {
        setCurrentAnimatingIndex(prev => prev + 1);
      }, 300);
    } else {
      // All badges shown
      onAllBadgesShown?.();
    }
  };

  if (countedBadges.length === 0) return null;

  return (
    <div className="w-full">
      {/* Revolver container - horizontal line of badges */}
      <div className="flex items-center justify-center gap-2 min-h-[72px] py-2">
        {/* Already shown badges */}
        {shownBadges.map((item, index) => (
          <RevolverBadge
            key={`shown-${item.badge.id}`}
            badge={item.badge}
            count={item.count}
            index={index}
            isAnimating={false}
            onAnimationComplete={() => {}}
          />
        ))}

        {/* Currently animating badge */}
        {currentAnimatingIndex < countedBadges.length && (
          <RevolverBadge
            key={`animating-${countedBadges[currentAnimatingIndex].badge.id}`}
            badge={countedBadges[currentAnimatingIndex].badge}
            count={countedBadges[currentAnimatingIndex].count}
            index={shownBadges.length}
            isAnimating={true}
            onAnimationComplete={handleBadgeAnimationComplete}
          />
        )}

        {/* Placeholder slots for remaining badges */}
        {Array.from({ length: countedBadges.length - shownBadges.length - 1 }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="w-14 h-16 rounded-lg border-2 border-dashed border-gray-600/50 flex items-center justify-center"
          >
            <span className="text-gray-600 text-lg">?</span>
          </div>
        ))}
      </div>
    </div>
  );
}
