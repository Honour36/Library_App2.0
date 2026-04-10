import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const getClient = async () => {
  const token = await SecureStore.getItemAsync('token');
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getStats = async () => {
  const client = await getClient();
  const response = await client.get('/admin/stats');
  return response.data;
};

export const getPendingDocuments = async () => {
  const client = await getClient();
  const response = await client.get('/admin/documents/pending');
  return response.data;
};

export const approveDocument = async (id: string) => {
  const client = await getClient();
  const response = await client.patch(`/admin/documents/${id}/approve`);
  return response.data;
};

export const rejectDocument = async (id: string, reason: string) => {
  const client = await getClient();
  const response = await client.patch(`/admin/documents/${id}/reject`, { reason });
  return response.data;
};

export const getUsers = async () => {
  const client = await getClient();
  const response = await client.get('/admin/users');
  return response.data;
};

export default {
  getStats,
  getPendingDocuments,
  approveDocument,
  rejectDocument,
  getUsers
};
