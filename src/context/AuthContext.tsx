
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Teacher' | 'Student';
  schoolId?: string;
  classId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'superadmin@gmail.com',
    username: 'superadmin',
    password: 'superadmin',
    name: 'Super Administrator',
    role: 'Super Admin'
  },
  {
    id: '2',
    email: 'admin@greenwood.edu',
    username: 'admin',
    password: 'admin123',
    name: 'John Smith',
    role: 'Admin',
    schoolId: '1'
  },
  {
    id: '3',
    email: 'teacher@greenwood.edu',
    username: 'teacher',
    password: 'teacher123',
    name: 'Jane Doe',
    role: 'Teacher',
    schoolId: '1',
    classId: '1'
  },
  {
    id: '4',
    email: 'student@greenwood.edu',
    username: 'student',
    password: 'student123',
    name: 'Alice Johnson',
    role: 'Student',
    schoolId: '1',
    classId: '1'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize default users in localStorage if not exists
    const existingUsers = localStorage.getItem('vigniq_users');
    if (!existingUsers) {
      localStorage.setItem('vigniq_users', JSON.stringify(defaultUsers));
    }

    // Check for existing session
    const savedUser = localStorage.getItem('vigniq_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('vigniq_users') || '[]');
    const foundUser = users.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('vigniq_current_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('vigniq_current_user');
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('vigniq_users') || '[]');
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      role: userData.role || 'Student'
    };
    
    users.push(newUser);
    localStorage.setItem('vigniq_users', JSON.stringify(users));
    return true;
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    const users = JSON.parse(localStorage.getItem('vigniq_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('vigniq_users', JSON.stringify(users));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updatePassword, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
