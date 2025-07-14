// src/services/login.ts
import api from '../api/api';
import { environment } from '@/environment';

export interface LoginCredentials {
  user_name: string;
  password: string;
}

// export interface User {
//   id: number;
//   email: string;
//   name: string;
//   role: 'Super Admin' | 'Admin' | 'Teacher' | 'Student';
//   schoolId?: string;
//   classId?: string;
// }

export interface LoginResponse {
  access: string;
  refresh: string;
  user: object;
}

const baseurl = environment.baseurl;

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(baseurl+'/auth/login/', credentials);
  return response.data;
};
