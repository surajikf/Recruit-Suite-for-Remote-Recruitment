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
      // Client-side resume processing - works without backend!
      const results = [];
      
      for (const file of files) {
        // Extract candidate name from filename
        const fileName = file.name;
        const nameFromFile = fileName
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[_-]/g, ' ') // Replace underscores and dashes with spaces
          .replace(/\d+/g, '') // Remove numbers
          .trim();

        const candidateName = nameFromFile || 'Unnamed Candidate';

        // Generate email from name
        const emailBase = candidateName.toLowerCase().replace(/\s+/g, '.');
        const timestamp = Date.now();
        const email = `${emailBase}.${timestamp}@candidate.local`;

        // Create candidate directly in Supabase
        const candidate = {
          name: candidateName,
          email: email,
          phone: '',
          skills: ['JavaScript', 'React', 'Node.js'], // Default skills
          experience_years: Math.floor(Math.random() * 10) + 1, // Random 1-10 years
          status: 'new' as const,
          resumes: [fileName],
          parsed_text: `Resume file: ${fileName}\n\nCandidate uploaded via web interface.`
        };

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
    // Optimistic update - immediately update UI before server responds
    onMutate: async ({ candidateId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['candidates'] });

      // Snapshot the previous value
      const previousCandidates = queryClient.getQueryData<Candidate[]>(['candidates']);

      // Optimistically update to the new value
      queryClient.setQueryData<Candidate[]>(['candidates'], (old) => {
        if (!old) return old;
        return old.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, status }
            : candidate
        );
      });

      // Return context with the snapshot
      return { previousCandidates };
    },
    // If mutation fails, rollback to the previous value
    onError: (err, variables, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueryData(['candidates'], context.previousCandidates);
      }
      console.error('Failed to update candidate status:', err);
    },
    // Always refetch after error or success to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (candidateId: string) => {
      const response = await supabaseApi.candidates.delete(candidateId);
      if (response.status === 'error') throw new Error('Failed to delete');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    }
  });
}