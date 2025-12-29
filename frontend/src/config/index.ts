export const config = {
  ablyKey: process.env.NEXT_PUBLIC_ABLY_KEY || '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  stage: process.env.NEXT_PUBLIC_STAGE || 'dev',
};
