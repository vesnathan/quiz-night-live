import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type { PreSignUpTriggerEvent, PreSignUpTriggerHandler } from 'aws-lambda';

const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env.USER_POOL_ID!;

/**
 * Pre Sign-Up Lambda Trigger
 *
 * This trigger handles the case where a user signs in with an external provider (Google)
 * but already has an existing native Cognito account with the same email.
 *
 * When this happens, we:
 * 1. Link the external provider to the existing native account
 * 2. Throw an error to prevent creating a duplicate user
 *
 * The user can then sign in with either method and get the same Cognito user.
 */
export const handler: PreSignUpTriggerHandler = async (event: PreSignUpTriggerEvent) => {
  console.log('PreSignUp trigger:', JSON.stringify(event, null, 2));

  const { triggerSource, request, userPoolId } = event;
  const email = request.userAttributes.email;

  // Only process external provider sign-ups (e.g., Google)
  if (triggerSource !== 'PreSignUp_ExternalProvider') {
    // For native sign-ups, auto-confirm if email is verified
    if (triggerSource === 'PreSignUp_SignUp') {
      // Don't auto-confirm - let the normal flow happen
      return event;
    }
    return event;
  }

  // This is an external provider sign-up (Google, etc.)
  // Check if a native user with this email already exists
  try {
    const existingUsers = await cognitoClient.send(new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
      Limit: 10,
    }));

    console.log('Existing users with email:', JSON.stringify(existingUsers.Users, null, 2));

    // Find native Cognito user (not a federated user)
    const nativeUser = existingUsers.Users?.find(user => {
      // Native users have username that matches their sub or is email-like
      // Federated users have usernames like "Google_123456789"
      const username = user.Username || '';
      return !username.startsWith('Google_') &&
             !username.startsWith('Facebook_') &&
             !username.startsWith('LoginWithAmazon_');
    });

    if (nativeUser) {
      console.log('Found existing native user:', nativeUser.Username);

      // Get the provider info from the current sign-up attempt
      // The username for external providers is like "Google_123456789"
      const externalUsername = event.userName;
      const providerMatch = externalUsername.match(/^([^_]+)_(.+)$/);

      if (providerMatch) {
        // Capitalize provider name to match Cognito's expected format
        // Username comes as "google_123..." but Cognito expects "Google"
        const rawProviderName = providerMatch[1];
        const providerName = rawProviderName.charAt(0).toUpperCase() + rawProviderName.slice(1).toLowerCase();
        const providerUserId = providerMatch[2]; // e.g., "123456789"

        // Check if this provider is already linked to the native user
        const identitiesAttr = nativeUser.Attributes?.find(a => a.Name === 'identities');
        if (identitiesAttr?.Value) {
          try {
            const identities = JSON.parse(identitiesAttr.Value);
            const alreadyLinked = identities.some((id: any) =>
              id.providerName === providerName && id.userId === providerUserId
            );
            if (alreadyLinked) {
              console.log(`${providerName} identity already linked to user ${nativeUser.Username}, allowing sign-in`);
              // Identity already linked - this is a normal sign-in, not a new sign-up
              // Return normally to allow the sign-in to proceed
              // Cognito will route this to the existing linked user
              event.response.autoVerifyEmail = true;
              event.response.autoConfirmUser = true;
              return event;
            }
          } catch (parseError) {
            // If it's our own error, re-throw it
            if (parseError instanceof Error && parseError.message === 'LINKED_TO_EXISTING_USER') {
              throw parseError;
            }
            // If parsing fails, continue with linking attempt
            console.log('Failed to parse identities attribute:', parseError);
          }
        }

        console.log(`Linking ${providerName} identity to existing user ${nativeUser.Username}`);

        // Link the external provider to the existing native user
        await cognitoClient.send(new AdminLinkProviderForUserCommand({
          UserPoolId: userPoolId,
          DestinationUser: {
            ProviderName: 'Cognito',
            ProviderAttributeValue: nativeUser.Username,
          },
          SourceUser: {
            ProviderName: providerName,
            ProviderAttributeName: 'Cognito_Subject',
            ProviderAttributeValue: providerUserId,
          },
        }));

        console.log('Successfully linked provider to existing user');

        // Throw error to prevent creating duplicate user
        // The user will be able to sign in with Google and use the linked native account
        throw new Error('LINKED_TO_EXISTING_USER');
      }
    }

    // No existing native user found - allow the external provider sign-up to proceed
    // Auto-verify email since it comes from a trusted provider
    event.response.autoVerifyEmail = true;
    event.response.autoConfirmUser = true;

    return event;
  } catch (error: any) {
    if (error.message === 'LINKED_TO_EXISTING_USER') {
      // Re-throw our custom error
      throw error;
    }
    console.error('Error in PreSignUp trigger:', error);
    // Don't block sign-up on errors - let it proceed
    event.response.autoVerifyEmail = true;
    event.response.autoConfirmUser = true;
    return event;
  }
};
