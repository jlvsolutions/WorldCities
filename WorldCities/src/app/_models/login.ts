import { User } from '@app/_models/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  /** Indicates whether the login request was successful. */
  success: boolean;
  /** Login request's result message. */
  message: string;
  /** On successful login, the JWT provided by the API. */
  jwtToken?: string;
  /** Data describing the user. */
  user: User;
}
