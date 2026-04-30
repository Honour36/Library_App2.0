import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const academicApi = axios.create({
  baseURL: API_URL,
});

export const getAcademicCatalog = async () => {
  const response = await academicApi.get('/academic/catalog');
  return response.data;
};

export const getFaculties = async () => {
  const response = await academicApi.get('/academic/faculties');
  return response.data;
};

export const getProgramsByFaculty = async (facultyId: string) => {
  const response = await academicApi.get(`/academic/faculties/${facultyId}/programs`);
  return response.data;
};

export const getModulesByProgram = async (programId: string) => {
  const response = await academicApi.get(`/academic/programs/${programId}/modules`);
  return response.data;
};

export default {
  getAcademicCatalog,
  getFaculties,
  getProgramsByFaculty,
  getModulesByProgram,
};
