import Ably from 'ably';

let ablyClient: Ably.Rest | null = null;

export function getAblyClient(): Ably.Rest {
  if (!ablyClient) {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) {
      throw new Error('ABLY_API_KEY environment variable not set');
    }
    ablyClient = new Ably.Rest({ key: apiKey });
  }
  return ablyClient;
}

export const CHANNELS = {
  GAME: 'quiz:game',
  PRESENCE: 'quiz:presence',
  BUZZER: 'quiz:buzzer',
} as const;
