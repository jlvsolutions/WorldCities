import { RegisterResult } from "./register-result";

export interface LoginResult extends RegisterResult {
  name?: string;
  token?: string;
}
