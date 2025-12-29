import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Query.getMyConversations
 *
 * Fetches all conversations for the authenticated user.
 *
 * @module resolvers/chat/Queries
 */

type Identity = {
  sub: string;
};

type Args = {
  limit?: number;
};

/**
 * Prepares DynamoDB Query operation for user conversations.
 *
 * @param ctx - AppSync context containing limit argument and user identity
 * @returns DynamoDB Query request configuration
 */
export function request(ctx: Context<Args>) {
  const identity = ctx.identity as Identity;
  const { limit } = ctx.arguments;
  const queryLimit = limit ?? 20;

  return {
    operation: "Query",
    query: {
      expression: "PK = :pk",
      expressionValues: util.dynamodb.toMapValues({
        ":pk": `USERCONV#${identity.sub}`,
      }),
    },
    scanIndexForward: false,
    limit: queryLimit,
  };
}

/**
 * Processes DynamoDB response and returns list of conversations.
 *
 * @param ctx - AppSync context containing query result
 * @returns Array of conversation objects
 */
export function response(ctx: Context<Args>) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result.items;
}
