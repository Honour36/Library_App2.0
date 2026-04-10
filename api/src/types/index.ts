export type UserRole = 'student' | 'lecturer' | 'admin';

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
}
