import { User } from './user';

export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  user: User;
}
