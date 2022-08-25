import { RegisterResult } from "./register-result";

export interface LoginResult extends RegisterResult {
  userName?: string;
  token?: string;
}
