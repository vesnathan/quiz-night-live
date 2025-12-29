import { util, Context } from "@aws-appsync/utils";

/**
 * GraphQL resolver: Query.getAblyToken
 *
 * Invokes Lambda to get an Ably token for real-time communication.
 *
 * @module resolvers/ably/Queries
 */

type Identity = {
  sub: string;
  username: string;
};

type RequestHeaders = {
  "x-forwarded-for"?: string;
};

/**
 * Prepares Lambda invocation payload for Ably token generation.
 *
 * @param ctx - AppSync context containing user identity and request headers
 * @returns Lambda invoke request configuration
 */
export function request(ctx: Context) {
  const identity = ctx.identity as Identity;
  const headers = ctx.request.headers as RequestHeaders;

  return {
    operation: "Invoke",
    payload: {
      userId: identity.sub,
      username: identity.username,
      sourceIp: headers["x-forwarded-for"] ?? "",
    },
  };
}

/**
 * Processes Lambda response and returns the Ably token.
 *
 * @param ctx - AppSync context containing Lambda result
 * @returns Ably token response
 */
export function response(ctx: Context) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
