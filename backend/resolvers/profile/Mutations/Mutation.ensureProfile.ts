import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Mutation.ensureProfile
 *
 * Invokes Lambda to ensure user profile exists, creating if necessary.
 *
 * @module resolvers/profile/Mutations
 */

type Args = {
  displayName: string;
};

/**
 * Prepares Lambda invocation payload for profile creation/retrieval.
 *
 * @param ctx - AppSync context containing arguments and user identity
 * @returns Lambda invoke request configuration
 */
export function request(ctx: Context<Args>) {
  // Pass the full context to the Lambda for complete user information
  return {
    operation: "Invoke",
    payload: {
      arguments: ctx.arguments,
      identity: ctx.identity,
      request: ctx.request,
    },
  };
}

/**
 * Processes Lambda response and returns the user profile.
 *
 * @param ctx - AppSync context containing Lambda result
 * @returns User profile
 */
export function response(ctx: Context<Args>) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
