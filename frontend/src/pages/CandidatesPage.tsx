import { useState } from 'react';
import { useCandidates, useUploadResumes, useUpdateCandidateStatus } from '../hooks/useCandidates';
import type { Candidate } from '../types';
import CandidateList from '../components/CandidateList';
import CandidatePreview from '../components/CandidatePreview';
import ResumeUpload from '../components/ResumeUpload';

export default function CandidatesPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const { data: candidates = [], isLoading } = useCandidates();
  const uploadMutation = useUploadResumes();
  const updateStatusMutation = useUpdateCandidateStatus();

  const handleUpload = async (files: File[]) => {
    try {
      await uploadMutation.mutateAsync(files);
      setShowUpload(false);
    } catch (error) {
      console.error('Failed to upload resumes:', error);
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

  const handleShortlist = async (candidate: Candidate) => {
    try {
      await updateStatusMutation.mutateAsync({
        candidateId: candidate.id,
        status: 'shortlisted'
      });
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Failed to shortlist candidate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B79D0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Candidate Management</h1>
          <p className="text-muted text-lg">Upload, review, and manage candidate applications</p>
        </div>

      <CandidateList
        candidates={candidates}
        onCandidateClick={handleCandidateClick}
        onUploadResumes={() => setShowUpload(true)}
      />

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Upload Resumes</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ResumeUpload
                onUpload={handleUpload}
                isLoading={uploadMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

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
