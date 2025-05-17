
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('auditFlowUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    // For this version, we'll use hardcoded users
    // In a real app, this would validate against the users stored in localStorage
    if (username === 'Jwo' && password === 'ADMIN') {
      const user = { 
        id: 'admin-1',
        username, 
        role: 'Admin' as UserRole,
        isAdmin: true 
      };
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('auditFlowUser', JSON.stringify(user));
      return true;
    }
    
    // Check for other users stored in localStorage
    const storedUsers = localStorage.getItem('auditUsers');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const foundUser = users.find((u: any) => 
        u.username === username && u.password === password
      );
      
      if (foundUser) {
        const user = { 
          id: foundUser.id,
          username: foundUser.username, 
          role: foundUser.role,
          isAdmin: foundUser.role === 'Admin'
        };
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('auditFlowUser', JSON.stringify(user));
        return true;
      }
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auditFlowUser');
  };
  
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
