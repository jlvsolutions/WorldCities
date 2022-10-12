/**
 *  Interface used to xfer user data to/from web API
 */
export interface User {
  /** The Id of the user. */
  id: string;
  /** The friendly display name for the user. */
  name: string;
  /** The unique email that belongs to the user. */
  email: string;
  /** Indicates whether the email address for the user has been confirmed. */
  emailConfirmed: boolean;
  /** Indicates whether lockout has been enabled. */
  lockoutEnabled: boolean;
  /** The new password when requesting to change the existing password. */
  newPassword: string;
  /** The roles the user belongs to. */
  roles: string[];
}
