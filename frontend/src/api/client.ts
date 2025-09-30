import axios from 'axios';
import type { ApiResponse, Job, Candidate, MatchScore, JobCreateRequest, AppUser } from '../types';

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

  getMatches: async (jobId: string, threshold: number = 70, useAI: boolean = false): Promise<ApiResponse<MatchScore[]>> => {
    const response = await api.get(`/jobs/${jobId}/matches?threshold=${threshold}&ai=${useAI}`);
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

export const usersApi = {
  getAll: async (): Promise<ApiResponse<AppUser[]>> => {
    const response = await api.get('/users');
    return response.data;
  },
  approve: async (id: string, approved: boolean): Promise<ApiResponse<AppUser>> => {
    const response = await api.post(`/users/${id}/approve`, { approved });
    return response.data;
  },
  updateRole: async (id: string, role: 'user' | 'admin'): Promise<ApiResponse<AppUser>> => {
    const response = await api.post(`/users/${id}/role`, { role });
    return response.data;
  },
};

// AI-powered API endpoints
export const aiApi = {
  generateJobDescription: async (title: string, requirements: string[]): Promise<ApiResponse<{ description: string }>> => {
    const response = await api.post('/ai/generate-job-description', { title, requirements });
    return response.data;
  },

  generateInterviewQuestions: async (jobTitle: string, skills: string[]): Promise<ApiResponse<{ questions: string[] }>> => {
    const response = await api.post('/ai/generate-interview-questions', { jobTitle, skills });
    return response.data;
  },

  getInsights: async (): Promise<ApiResponse<{ insights: string }>> => {
    const response = await api.get('/ai/insights');
    return response.data;
  },
};
