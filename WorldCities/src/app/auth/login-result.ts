import { RegisterResult } from "./register-result";
import { User } from './user';

export interface LoginResult extends RegisterResult {
  token?: string;
  user: User;
}
