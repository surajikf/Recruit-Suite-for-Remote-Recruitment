import { useCandidates, useUpdateCandidateStatus } from '../hooks/useCandidates';
import type { Candidate } from '../types';
import ShortlistKanban from '../components/ShortlistKanban';
import CandidatePreview from '../components/CandidatePreview';
import { useState } from 'react';

export default function ShortlistPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const { data: candidates = [], isLoading } = useCandidates();
  const updateStatusMutation = useUpdateCandidateStatus();

  const handleCandidateMove = async (candidateId: string, newStatus: Candidate['status']) => {
    try {
      await updateStatusMutation.mutateAsync({
        candidateId,
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to update candidate status:', error);
    }
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleMessage = (candidate: Candidate) => {
    // TODO: Implement message functionality
    console.log('Message candidate:', candidate.name);
    setSelectedCandidate(null);
  };

  const handleSchedule = (candidate: Candidate) => {
    // TODO: Implement schedule functionality
    console.log('Schedule interview for:', candidate.name);
    setSelectedCandidate(null);
  };

  const handleShortlist = (candidate: Candidate) => {
    // TODO: Implement shortlist functionality
    console.log('Shortlist candidate:', candidate.name);
    setSelectedCandidate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B79D0]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Candidate Pipeline</h1>
        <p className="text-slate-600">Manage candidates through your recruitment process</p>
      </div>

      <ShortlistKanban
        candidates={candidates}
        onCandidateMove={handleCandidateMove}
        onCandidateClick={handleCandidateClick}
      />

      {selectedCandidate && (
        <CandidatePreview
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onMessage={handleMessage}
          onSchedule={handleSchedule}
          onShortlist={handleShortlist}
        />
      )}
    </div>
  );
}
