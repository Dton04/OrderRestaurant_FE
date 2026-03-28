export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterResponse {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password?: string;
  phone: string;
}

export interface RegisterResponse {
  id: string;
  full_name: string;
  email: string;
  role: string;
}
