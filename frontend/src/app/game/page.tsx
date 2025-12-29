import { Suspense } from 'react';
import { Spinner } from '@nextui-org/react';
import GamePageContent from './GamePageContent';
import { GameBackground } from '@/components/GameBackground';

/**
 * Game page wrapper with Suspense boundary
 *
 * This page wraps GamePageContent in a Suspense boundary because
 * it uses useSearchParams, which requires Suspense in Next.js.
 */
export default function GamePage() {
  return (
    <Suspense
      fallback={
        <GameBackground className="flex items-center justify-center">
          <Spinner size="lg" />
        </GameBackground>
      }
    >
      <GamePageContent />
    </Suspense>
  );
}
