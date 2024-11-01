/**
 * Enum representing reason why a token might be revoked.
 */
export enum RevokeReason {
  /**
  * The token has expired and is no longer valid for use.
  */
  Expired = "Expired",

  /**
   * The user requested a new token, invalidating the previous one.
   */
  NewTokenRequested = "New Token Requested",

  /**
   * The token was revoked due to suspected malicious activity.
   */
  SecurityIssue = "Security Issue",

  /**
   * The user cancelled the password reset or email verification process.
   */
  Cancelled = "Cancelled",

  /**
   * The token has already been used and cannot be reused.
   */
  AlreadyUsed = "Already Used",

  /**
   * The token was revoked because the user changed their password.
   */
  PasswordChanged = "Password Changed",

  /**
   * The email verification token was revoked due to an email change.
   */
  EmailChanged = "Email Changed",

  /**
   * An admin revoked the token due to account concerns.
   */
  AdminRevoked = "Admin Revoked"
}