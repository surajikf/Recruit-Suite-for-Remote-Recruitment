import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/client';

// AI-powered job description generation
export function useGenerateJobDescription() {
  return useMutation({
    mutationFn: async ({ title, requirements }: { title: string; requirements: string[] }) => {
      const response = await aiApi.generateJobDescription(title, requirements);
      if (response.status === 'error') {
        throw new Error(response.errors[0]?.message || 'Failed to generate job description');
      }
      return response.data!;
    },
  });
}

// AI-powered interview questions generation
export function useGenerateInterviewQuestions() {
  return useMutation({
    mutationFn: async ({ jobTitle, skills }: { jobTitle: string; skills: string[] }) => {
      const response = await aiApi.generateInterviewQuestions(jobTitle, skills);
      if (response.status === 'error') {
        throw new Error(response.errors[0]?.message || 'Failed to generate interview questions');
      }
      return response.data!;
    },
  });
}

// AI-powered hiring insights
export function useAIInsights() {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const response = await aiApi.getInsights();
      if (response.status === 'error') {
        throw new Error(response.errors[0]?.message || 'Failed to get AI insights');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
