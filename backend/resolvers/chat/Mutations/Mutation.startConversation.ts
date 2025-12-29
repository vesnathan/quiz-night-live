import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Mutation.startConversation
 *
 * Creates or retrieves a direct message conversation between two users.
 * Uses a deterministic conversation ID based on sorted user IDs.
 *
 * @module resolvers/chat/Mutations
 */

type Identity = {
  sub: string;
};

type Args = {
  targetUserId: string;
};

/**
 * Prepares DynamoDB PutItem operation for a new conversation.
 * Uses condition expression to prevent overwriting existing conversations.
 *
 * @param ctx - AppSync context containing targetUserId and user identity
 * @returns DynamoDB PutItem request configuration
 */
export function request(ctx: Context<Args>) {
  const identity = ctx.identity as Identity;
  const { targetUserId } = ctx.arguments;
  const userId1 = identity.sub;
  const userId2 = targetUserId;
  const timestamp = util.time.nowISO8601();

  // Create a deterministic conversation ID from sorted user IDs
  let conversationId: string;
  if (userId1 < userId2) {
    conversationId = `DM#${userId1}#${userId2}`;
  } else {
    conversationId = `DM#${userId2}#${userId1}`;
  }

  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({
      PK: `CONV#${conversationId}`,
      SK: "META",
    }),
    attributeValues: util.dynamodb.toMapValues({
      id: conversationId,
      participantIds: [userId1, userId2],
      updatedAt: timestamp,
    }),
    condition: {
      expression: "attribute_not_exists(PK)",
    },
  };
}

/**
 * Processes DynamoDB response and returns the conversation.
 * If conversation already exists (condition check failed), returns the existing one.
 *
 * @param ctx - AppSync context containing DynamoDB result
 * @returns The conversation object
 */
export function response(ctx: Context<Args>) {
  // If condition check failed, the conversation already exists
  // We still return the result (existing item)
  if (ctx.error) {
    // Check if this is a condition check failure (conversation exists)
    if (ctx.error.type === "DynamoDB:ConditionalCheckFailedException") {
      // Return the result anyway - it contains the existing conversation
      return ctx.result;
    }
    return util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
