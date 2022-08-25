import { LoginRequest } from "./login-request";

export interface RegisterRequest extends LoginRequest {
  name: string;
}
