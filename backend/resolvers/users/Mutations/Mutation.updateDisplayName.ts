import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Mutation.updateDisplayName
 *
 * Updates the authenticated user's display name.
 *
 * @module resolvers/users/Mutations
 */

type Identity = {
  sub: string;
};

type Args = {
  displayName: string;
};

/**
 * Prepares DynamoDB UpdateItem operation for display name update.
 *
 * @param ctx - AppSync context containing displayName argument and user identity
 * @returns DynamoDB UpdateItem request configuration
 */
export function request(ctx: Context<Args>) {
  const identity = ctx.identity as Identity;
  const { displayName } = ctx.arguments;

  return {
    operation: "UpdateItem",
    key: util.dynamodb.toMapValues({
      PK: `USER#${identity.sub}`,
      SK: "PROFILE",
    }),
    update: {
      expression: "SET displayName = :displayName, updatedAt = :updatedAt",
      expressionValues: util.dynamodb.toMapValues({
        ":displayName": displayName,
        ":updatedAt": util.time.nowISO8601(),
      }),
    },
  };
}

/**
 * Processes DynamoDB response and returns the updated user profile.
 *
 * @param ctx - AppSync context containing DynamoDB result
 * @returns Updated user profile
 */
export function response(ctx: Context<Args>) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
