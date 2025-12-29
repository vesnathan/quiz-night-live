import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Query.checkDisplayNameAvailable
 *
 * Checks if a display name is available (not already taken).
 * Uses GSI2 to query by normalized (lowercase) display name.
 *
 * @module resolvers/users/Queries
 */

type Args = {
  displayName: string;
};

/**
 * Prepares DynamoDB Query operation to check for existing display name.
 *
 * @param ctx - AppSync context containing displayName argument
 * @returns DynamoDB Query request configuration
 */
export function request(ctx: Context<Args>) {
  const { displayName } = ctx.arguments;
  // Normalize display name to lowercase for case-insensitive comparison
  const normalizedName = displayName.toLowerCase();

  return {
    operation: "Query",
    index: "GSI2",
    query: {
      expression: "GSI2PK = :displayNamePK",
      expressionValues: util.dynamodb.toMapValues({
        ":displayNamePK": `DISPLAYNAME#${normalizedName}`,
      }),
    },
    limit: 1,
  };
}

/**
 * Processes DynamoDB response and returns availability status.
 *
 * @param ctx - AppSync context containing query result
 * @returns true if display name is available, false otherwise
 */
export function response(ctx: Context<Args>) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }

  // Return true if no items found (display name is available)
  return ctx.result.items.length === 0;
}
