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

export const getBookmarks = async () => {
  const client = await getClient();
  const response = await client.get('/bookmarks');
  return response.data;
};

export const addBookmark = async (documentId: string) => {
  const client = await getClient();
  const response = await client.post('/bookmarks', { documentId });
  return response.data;
};

export const removeBookmark = async (id: string) => {
  const client = await getClient();
  const response = await client.delete(`/bookmarks/${id}`);
  return response.data;
};

export default {
  getBookmarks,
  addBookmark,
  removeBookmark
};
