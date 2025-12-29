import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Query.getChatMessages
 *
 * Fetches chat messages for a specific channel with pagination support.
 *
 * @module resolvers/chat/Queries
 */

type Args = {
  channelId: string;
  limit?: number;
  nextToken?: string;
};

/**
 * Prepares DynamoDB Query operation for chat messages.
 *
 * @param ctx - AppSync context containing channelId, limit, and nextToken arguments
 * @returns DynamoDB Query request configuration
 */
export function request(ctx: Context<Args>) {
  const { channelId, limit, nextToken } = ctx.arguments;
  const queryLimit = limit ?? 50;

  const request: Record<string, unknown> = {
    operation: "Query",
    query: {
      expression: "PK = :pk",
      expressionValues: util.dynamodb.toMapValues({
        ":pk": `CHAT#${channelId}`,
      }),
    },
    scanIndexForward: false,
    limit: queryLimit,
  };

  if (nextToken) {
    request.nextToken = nextToken;
  }

  return request;
}

/**
 * Processes DynamoDB response and returns chat messages connection.
 *
 * @param ctx - AppSync context containing query result
 * @returns ChatMessageConnection with items and optional nextToken
 */
export function response(ctx: Context<Args>) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  return {
    items: ctx.result.items,
    nextToken: ctx.result.nextToken ?? null,
  };
}
