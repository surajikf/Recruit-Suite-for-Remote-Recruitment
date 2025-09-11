import axios from 'axios';
import type { ApiResponse, Job, Candidate, MatchScore, JobCreateRequest } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobsApi = {
  getAll: async (): Promise<ApiResponse<Job[]>> => {
    const response = await api.get('/jobs');
    return response.data;
  },

  create: async (job: JobCreateRequest): Promise<ApiResponse<Job>> => {
    const response = await api.post('/jobs', job);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Job>> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  getMatches: async (jobId: string, threshold: number = 70): Promise<ApiResponse<MatchScore[]>> => {
    const response = await api.get(`/jobs/${jobId}/matches?threshold=${threshold}`);
    return response.data;
  },
};

export const candidatesApi = {
  getAll: async (): Promise<ApiResponse<Candidate[]>> => {
    const response = await api.get('/candidates');
    return response.data;
  },
};

export const healthApi = {
  check: async (): Promise<ApiResponse<{ service: string }>> => {
    const response = await api.get('/health');
    return response.data;
  },
};
