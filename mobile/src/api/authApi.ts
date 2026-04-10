import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const authApi = axios.create({
  baseURL: API_URL,
});

export const register = async (userData: any) => {
  const response = await authApi.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials: any) => {
  const response = await authApi.post('/auth/login', credentials);
  return response.data;
};

export default {
  register,
  login,
};
