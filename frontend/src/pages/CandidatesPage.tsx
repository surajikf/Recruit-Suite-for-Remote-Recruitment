import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCandidates, useUploadResumes, useUpdateCandidateStatus } from '../hooks/useCandidates';
import type { Candidate } from '../types';
import CandidateList from '../components/CandidateList';
import CandidatePreview from '../components/CandidatePreview';
import ResumeUpload from '../components/ResumeUpload';
import PageHeader from '../components/PageHeader';

export default function CandidatesPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const { data: candidates = [], isLoading } = useCandidates();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState<'all' | 'new' | 'screened' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired'>('all');
  const [view, setView] = useState<'auto' | 'table' | 'cards'>('auto');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('candidates_view_mode');
      if (saved === 'auto' || saved === 'table' || saved === 'cards') setView(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('candidates_view_mode', view); } catch {}
  }, [view]);

  // Load saved search/status (prefer URL param if present)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('candidates_filters');
      if (raw) {
        const f = JSON.parse(raw);
        if (!searchParams.get('q') && typeof f.search === 'string') setSearch(f.search);
        const valid = ['all','new','screened','shortlisted','interviewed','rejected','hired'];
        if (valid.includes(f.status)) setStatus(f.status);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save search/status
  useEffect(() => {
    try { localStorage.setItem('candidates_filters', JSON.stringify({ search, status })); } catch {}
  }, [search, status]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (ctrl && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setShowUpload(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Reflect search to URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (search) next.set('q', search); else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [search]);

  // Open upload modal via URL ?upload=1
  useEffect(() => {
    if (searchParams.get('upload') === '1') setShowUpload(true);
  }, [searchParams]);
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

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return candidates.filter(c => {
      const matchText = !s || c.name.toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s) || (c.skills || []).some(sk => sk.toLowerCase().includes(s));
      const matchStatus = status === 'all' || c.status === status;
      return matchText && matchStatus;
    });
  }, [candidates, search, status]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i)=>(<div key={i} className="card skeleton h-28" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container py-10 px-6 max-w-[1400px] mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Candidate Management
              </h1>
              <p className="text-lg text-slate-600">
                Upload, review, and manage candidate applications
              </p>
            </div>
            <button 
              onClick={() => setShowUpload(true)} 
              className="group relative px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Resumes
              <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Candidates
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, or skills…"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status Filter
              </label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)} 
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="screened">Screened</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                View Mode
              </label>
              <select 
                value={view} 
                onChange={e=>setView(e.target.value as any)} 
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 cursor-pointer"
              >
                <option value="auto">Auto</option>
                <option value="table">Table</option>
                <option value="cards">Cards</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-5 pt-5 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-700">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold text-lg">{filtered.length}</span>
                <span className="text-slate-600">candidate{filtered.length !== 1 ? 's' : ''} found</span>
              </div>
            </div>
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                Clear search
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Candidate List */}
        <CandidateList
          candidates={filtered}
          onCandidateClick={handleCandidateClick}
          onUploadResumes={() => setShowUpload(true)}
          minimal
          view={view}
        />

      {/* Upload Modal - Simplified & Scrollable */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header - Sticky */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Upload Resumes
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    AI will automatically extract skills and experience
                  </p>
                </div>
                <button
                  onClick={() => setShowUpload(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content - Scrollable */}
              <div className="p-6">
                <ResumeUpload
                  onUpload={handleUpload}
                  isLoading={uploadMutation.isPending}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
