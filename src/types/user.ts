
export interface User {
  id: string;
  username: string;
  role: UserRole;
  isAdmin: boolean;
}

export type UserRole = 'General' | 'QA' | 'Qualified Auditor' | 'Admin';

export interface UserWithPassword extends User {
  password: string;
}
