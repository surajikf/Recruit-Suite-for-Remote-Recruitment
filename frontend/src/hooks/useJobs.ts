import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '../api/supabase';
import { supabase } from '../lib/supabase';
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

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    enabled: !!id,
    queryFn: async () => {
      const response = await supabaseApi.jobs.getById(id);
      return response.data || null;
    },
  });
}

export function useJobMatches(id: string, threshold: number = 70) {
  return useQuery({
    queryKey: ['job-matches', id, threshold],
    enabled: !!id,
    queryFn: async () => {
      const response = await supabaseApi.jobs.getMatches(id, threshold);
      return response.data || [];
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'published' | 'closed' }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}