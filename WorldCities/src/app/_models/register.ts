export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
}
