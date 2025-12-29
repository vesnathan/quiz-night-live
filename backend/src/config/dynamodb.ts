import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-west-2',
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const stage = process.env.STAGE || 'dev';

export const TableNames = {
  USERS: `quiz-users-${stage}`,
  QUESTIONS: `quiz-questions-${stage}`,
  SETS: `quiz-sets-${stage}`,
  SCORES: `quiz-scores-${stage}`,
  LEADERBOARDS: `quiz-leaderboards-${stage}`,
} as const;
