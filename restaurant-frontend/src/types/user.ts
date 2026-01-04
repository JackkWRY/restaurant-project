// User-related types

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'STAFF' | 'KITCHEN';
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}
