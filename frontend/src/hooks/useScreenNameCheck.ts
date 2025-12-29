import { useState, useEffect, useRef, useCallback } from 'react';
import { graphqlClient } from '@/lib/graphql';
import { CHECK_DISPLAY_NAME_AVAILABLE } from '@/graphql';

export type ScreenNameStatus = 'idle' | 'checking' | 'available' | 'taken';

interface UseScreenNameCheckReturn {
  status: ScreenNameStatus;
  checkName: (name: string) => void;
  reset: () => void;
}

const MIN_NAME_LENGTH = 3;
const DEBOUNCE_MS = 500;

export function useScreenNameCheck(): UseScreenNameCheckReturn {
  const [status, setStatus] = useState<ScreenNameStatus>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const checkAvailability = useCallback(async (name: string) => {
    if (name.length < MIN_NAME_LENGTH) {
      setStatus('idle');
      return;
    }

    setStatus('checking');

    try {
      const result = await graphqlClient.graphql({
        query: CHECK_DISPLAY_NAME_AVAILABLE,
        variables: { displayName: name },
        authMode: 'iam',
      }) as { data: { checkDisplayNameAvailable: boolean } };

      setStatus(result.data.checkDisplayNameAvailable ? 'available' : 'taken');
    } catch (error) {
      console.error('Error checking screen name:', error);
      setStatus('idle');
    }
  }, []);

  const checkName = useCallback((name: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (name.length >= MIN_NAME_LENGTH) {
      debounceRef.current = setTimeout(() => {
        checkAvailability(name);
      }, DEBOUNCE_MS);
    } else {
      setStatus('idle');
    }
  }, [checkAvailability]);

  const reset = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { status, checkName, reset };
}
