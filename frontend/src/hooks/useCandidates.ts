import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '../api/supabase';
import type { Candidate } from '../types';

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await supabaseApi.candidates.getAll();
      return response.data || [];
    },
  });
}

export function useUploadResumes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      // Mock upload - in real app, this would upload files and parse them
      const mockCandidates: Omit<Candidate, 'id' | 'created_at'>[] = files.map((file, index) => ({
        name: `Candidate ${index + 1}`,
        email: `candidate${index + 1}@example.com`,
        phone: `+1-555-000${index + 1}`,
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        experience_years: Math.floor(Math.random() * 10) + 1,
        status: 'new' as const,
        resumes: [file.name],
        parsed_text: `Parsed content from ${file.name}\n\nThis is a mock parsed resume content. In a real application, this would contain the extracted text from the uploaded resume file.`,
      }));

      // Create candidates in Supabase
      const results = [];
      for (const candidate of mockCandidates) {
        const response = await supabaseApi.candidates.create(candidate);
        if (response.status === 'ok' && response.data) {
          results.push(response.data);
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, status }: { candidateId: string; status: Candidate['status'] }) => {
      const response = await supabaseApi.candidates.updateStatus(candidateId, status);
      if (response.status === 'error') {
        throw new Error(response.errors[0]?.message || 'Failed to update candidate status');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}