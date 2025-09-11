import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesApi } from '../api/client';
import type { Candidate } from '../types';

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await candidatesApi.getAll();
      return response.data || [];
    },
  });
}

export function useUploadResumes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (files: File[]) => {
      // Mock upload - in real app, this would upload files and parse them
      const mockCandidates: Candidate[] = files.map((file, index) => ({
        id: `candidate-${Date.now()}-${index}`,
        name: `Candidate ${index + 1}`,
        email: `candidate${index + 1}@example.com`,
        phone: `+1-555-000${index + 1}`,
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        experience_years: Math.floor(Math.random() * 10) + 1,
        status: 'new' as const,
        resumes: [file.name],
        parsed_text: `Parsed content from ${file.name}\n\nThis is a mock parsed resume content. In a real application, this would contain the extracted text from the uploaded resume file.`,
        created_at: new Date().toISOString(),
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockCandidates;
    },
    onSuccess: (newCandidates) => {
      // Add new candidates to the existing list
      queryClient.setQueryData(['candidates'], (oldCandidates: Candidate[] = []) => [
        ...oldCandidates,
        ...newCandidates
      ]);
    },
  });
}

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ candidateId, status }: { candidateId: string; status: Candidate['status'] }) => {
      // Mock update - in real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 500));
      return { candidateId, status };
    },
    onSuccess: ({ candidateId, status }) => {
      // Update the candidate in the cache
      queryClient.setQueryData(['candidates'], (oldCandidates: Candidate[] = []) =>
        oldCandidates.map(candidate =>
          candidate.id === candidateId
            ? { ...candidate, status }
            : candidate
        )
      );
    },
  });
}
