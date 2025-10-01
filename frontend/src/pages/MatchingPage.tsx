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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🎯 Job Matching</h1>
          <p className="text-base text-slate-600">Find the best candidates for your job posting</p>
        </div>

        {/* AI Toggle Card */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useAI"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="useAI" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    🤖 Use AI-Powered Matching
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  {useAI ? 'AI will analyze resume content and job requirements for smarter matching' : 'Traditional keyword-based matching'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${useAI ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              {useAI ? 'AI Mode Active' : 'Standard Mode'}
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
    </div>
  );
}
