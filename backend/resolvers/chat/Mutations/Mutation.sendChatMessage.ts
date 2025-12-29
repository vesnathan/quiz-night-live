import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Mutation.sendChatMessage
 *
 * Creates a new chat message in the specified channel.
 *
 * @module resolvers/chat/Mutations
 */

type Identity = {
  sub: string;
  username: string;
  claims: {
    "custom:displayName"?: string;
  };
};

type Args = {
  channelId: string;
  content: string;
};

/**
 * Prepares DynamoDB PutItem operation for a new chat message.
 *
 * @param ctx - AppSync context containing channelId, content, and user identity
 * @returns DynamoDB PutItem request configuration
 */
export function request(ctx: Context<Args>) {
  const identity = ctx.identity as Identity;
  const { channelId, content } = ctx.arguments;
  const messageId = util.autoId();
  const timestamp = util.time.nowISO8601();

  // Get display name from claims or fall back to username
  const displayName = identity.claims["custom:displayName"] ?? identity.username;

  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({
      PK: `CHAT#${channelId}`,
      SK: `MSG#${timestamp}#${messageId}`,
    }),
    attributeValues: util.dynamodb.toMapValues({
      id: messageId,
      channelId: channelId,
      senderId: identity.sub,
      senderUsername: identity.username,
      senderDisplayName: displayName,
      content: content,
      createdAt: timestamp,
    }),
  };
}

/**
 * Processes DynamoDB response and returns the created chat message.
 *
 * @param ctx - AppSync context containing DynamoDB result
 * @returns The created chat message
 */
export function response(ctx: Context<Args>) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
