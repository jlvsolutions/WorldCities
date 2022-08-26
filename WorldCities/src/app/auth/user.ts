/**
 *  Interface used to xfer user data to/from web API
 */
export interface User {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  roles: string[];
}
