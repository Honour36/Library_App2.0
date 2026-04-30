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

export const uploadDocument = async (formData: FormData) => {
  const client = await getClient();
  const response = await client.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateDocument = async (
  id: string,
  payload: {
    title: string;
    author?: string;
    academic_year?: string;
    description?: string;
  }
) => {
  const client = await getClient();
  const response = await client.put(`/documents/${id}`, payload);
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const client = await getClient();
  const response = await client.delete(`/documents/${id}`);
  return response.data;
};

export default {
  getDocuments,
  getDocumentById,
  getCategories,
  uploadDocument,
  updateDocument,
  deleteDocument
};
