export type UserRole = 'ADMIN' | 'OPERATOR' | 'AUDITOR' | 'USER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
