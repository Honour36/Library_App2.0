import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const getClient = async (tokenFromCaller?: string | null) => {
  const storedToken = await SecureStore.getItemAsync('token');
  const token = tokenFromCaller || storedToken;

  if (!token) {
    throw new Error('Missing authentication token');
  }

  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const askGemini = async (prompt: string, token?: string | null) => {
  try {
    const client = await getClient(token);
    const response = await client.post('/ai/ask', { prompt });
    return response.data?.data;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};
