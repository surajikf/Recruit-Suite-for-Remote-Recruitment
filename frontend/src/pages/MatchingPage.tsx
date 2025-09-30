import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useJob, useJobMatches } from '../hooks/useJobs';
import { useCandidates } from '../hooks/useCandidates';
import type { Candidate } from '../types';
import MatchingEngine from '../components/MatchingEngine';
import CandidatePreview from '../components/CandidatePreview';

export default function MatchingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [threshold, setThreshold] = useState(70);
  const [useAI, setUseAI] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const { data: job, isLoading: jobLoading } = useJob(jobId || '');
  const { data: matches = [], isLoading: matchesLoading } = useJobMatches(jobId || '', threshold, useAI);
  const { data: candidates = [] } = useCandidates();

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
  };

  const handleViewCandidate = (candidate: Candidate) => {
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

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B79D0]"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Job not found</h3>
        <p className="text-slate-600">The job you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Job Matching</h1>
        <p className="text-slate-600">Find the best candidates for your job posting</p>
        
        {/* AI Toggle */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useAI"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="useAI" className="text-sm font-medium text-gray-700">
              🤖 Use AI-Powered Matching
            </label>
          </div>
          <div className="text-xs text-gray-500">
            {useAI ? 'AI will analyze resume content and job requirements for smarter matching' : 'Traditional keyword-based matching'}
          </div>
        </div>
      </div>

      <MatchingEngine
        job={job}
        matches={matches}
        onThresholdChange={handleThresholdChange}
        onViewCandidate={handleViewCandidate}
        useAI={useAI}
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
