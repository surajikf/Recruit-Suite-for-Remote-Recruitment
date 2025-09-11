import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/client';
import { Job, JobCreateRequest } from '../types';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      // For now, return empty array since we don't have a list endpoint yet
      // In a real app, this would call jobsApi.getAll()
      return [];
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (job: JobCreateRequest) => jobsApi.create(job),
    onSuccess: () => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });
}

export function useJobMatches(jobId: string, threshold: number = 70) {
  return useQuery({
    queryKey: ['job-matches', jobId, threshold],
    queryFn: () => jobsApi.getMatches(jobId, threshold),
    enabled: !!jobId,
  });
}
