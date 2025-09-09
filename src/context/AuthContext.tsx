
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { environment } from '@/environment';
import { login as loginApi } from '../services/login';
import { Router, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  user_name: string;
  email: string;
  name: string;
  role: string;
  schoolId?: string;
  classId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
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
    user_name: 'superadmin',
    email: 'superadmin@gmail.com',
    password: 'superadmin',
    name: 'Super Administrator',
    role: 'Super Admin'
  },
  {
    id: '2',
    user_name: 'admin1',
    email: 'admin@greenwood.edu',
    password: 'admin123',
    name: 'John Smith',
    role: 'Admin',
    schoolId: '1'
  },
  {
    id: '3',
    user_name: 'teacher1',
    email: 'teacher@greenwood.edu',
    password: 'teacher123',
    name: 'Jane Doe',
    role: 'Teacher',
    schoolId: '1',
    classId: '1'
  },
  {
    id: '4',
    user_name: 'student1',
    email: 'student@greenwood.edu',
    password: 'student123',
    name: 'Alice Johnson',
    role: 'Student',
    schoolId: '1',
    classId: '1'
  }
];
const baseurl = environment.baseurl;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    // Always reset users to ensure they have the latest structure with username
    // localStorage.setItem('vigniq_users', JSON.stringify(defaultUsers));

    // Check for existing session
    const savedUser = localStorage.getItem('vigniq_current_user');
    const token = sessionStorage.getItem('access_token');
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (savedUser && token && refreshToken) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }>  => {
    try {
      const res = await loginApi({ user_name: username, password });

      sessionStorage.setItem('access_token', res.access);
      sessionStorage.setItem('refresh_token', res.refresh);
      localStorage.setItem('vigniq_current_user', JSON.stringify(res.user));

      const foundUser = res.user;

      if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Login error:', error);

      let errorMsg = 'Login failed. Please try again.';
      if (error.response && error.response.data) {
        errorMsg =
          error.response.data.detail || // Django REST default
          error.response.data.error ||  // Common custom key
          JSON.stringify(error.response.data);
      }

      return { success: false, error: errorMsg };
    }
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

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
