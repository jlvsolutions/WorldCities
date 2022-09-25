/**
 *  Interface used to xfer user data to/from web API
 */
export interface User {
  id: string;
  /**The friendly display name for the user. */
  name: string;
  /**The unique email that belongs to the user. */
  email: string;
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  /**The new password when requesting to change the existing password. */
  newPassword: string;
  /**The roles the user belongs to. */
  roles: string[];
  /**Not used, needed for serialization. */
  RefreshTokens?: string[];
}
