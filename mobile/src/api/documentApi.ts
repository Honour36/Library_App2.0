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

export const getDocuments = async () => {
  const client = await getClient();
  const response = await client.get('/documents');
  return response.data;
};

export const getDocumentById = async (id: string) => {
  const client = await getClient();
  const response = await client.get(`/documents/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const client = await getClient();
  const response = await client.get('/categories');
  return response.data;
};

export default {
  getDocuments,
  getDocumentById,
  getCategories
};
