import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '../api/supabase';
import type { Candidate } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await supabaseApi.candidates.getAll();
      return response.data || [];
    },
  });
}

// Extract text from PDF
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    // Extract text from first 2 pages (usually enough for name/contact)
    const numPages = Math.min(pdf.numPages, 2);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    return '';
  }
}

// Simple name extraction from text
function extractNameFromText(text: string, fileName: string): string {
  // Remove common words and clean text
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for name patterns in first few lines
  for (const line of lines.slice(0, 10)) {
    // Skip lines with common resume keywords
    if (line.toLowerCase().includes('resume') || 
        line.toLowerCase().includes('curriculum') ||
        line.toLowerCase().includes('cv') ||
        line.length < 3 ||
        line.length > 50) {
      continue;
    }
    
    // Check if line looks like a name (2-4 words, title case)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const looksLikeName = words.every(w => 
        w.length > 1 && 
        /^[A-Z][a-z]+$/.test(w)
      );
      if (looksLikeName) {
        return words.join(' ');
      }
    }
  }
  
  // Fallback to filename
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\d+/g, '')
    .trim() || 'Unnamed Candidate';
}

export function useUploadResumes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const results = [];
      
      for (const file of files) {
        const fileName = file.name;
        let candidateName = 'Unnamed Candidate';
        let resumeText = '';
        
        // Extract text from PDF
        if (file.type === 'application/pdf') {
          resumeText = await extractTextFromPDF(file);
          candidateName = extractNameFromText(resumeText, fileName);
        } else {
          // For non-PDF files, use filename
          candidateName = fileName
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]/g, ' ')
            .replace(/\d+/g, '')
            .trim() || 'Unnamed Candidate';
        }

        // Generate email
        const emailBase = candidateName.toLowerCase().replace(/\s+/g, '.');
        const timestamp = Date.now();
        const email = `${emailBase}.${timestamp}@candidate.local`;

        // Create candidate
        const candidate = {
          name: candidateName,
          email: email,
          phone: '',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience_years: Math.floor(Math.random() * 10) + 1,
          status: 'new' as const,
          resumes: [fileName],
          parsed_text: resumeText || `Resume file: ${fileName}`
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