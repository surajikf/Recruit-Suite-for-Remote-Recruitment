import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '../api/supabase';
import type { JobCreateRequest } from '../types';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await supabaseApi.jobs.getAll();
      return response.data || [];
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (job: JobCreateRequest) => supabaseApi.jobs.create(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}