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
  const [view, setView] = useState<'auto' | 'table' | 'cards'>('table');
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

  // Calculate statistics - MUST be before any early returns
  const stats = useMemo(() => {
    const newCount = candidates.filter(c => c.status === 'new').length;
    const screenedCount = candidates.filter(c => c.status === 'screened').length;
    const shortlistedCount = candidates.filter(c => c.status === 'shortlisted').length;
    const totalSkills = new Set(candidates.flatMap(c => c.skills || [])).size;
    return { 
      total: candidates.length,
      new: newCount,
      screened: screenedCount, 
      shortlisted: shortlistedCount,
      totalSkills 
    };
  }, [candidates]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader title="👥 Candidate Management" subtitle="Upload, review, and manage candidate applications" />
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6"
        >
          <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Candidates</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">New</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Shortlisted</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.shortlisted}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Skills Pool</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalSkills}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates by name, email, or skills... (⌘K)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]"
            >
              <option value="all">All Statuses</option>
              <option value="new">🆕 New</option>
              <option value="screened">📋 Screened</option>
              <option value="shortlisted">⭐ Shortlisted</option>
              <option value="interviewed">💼 Interviewed</option>
              <option value="rejected">❌ Rejected</option>
              <option value="hired">✅ Hired</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setView('cards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'cards' ? 'bg-white text-[#0B79D0] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                title="Card view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-white text-[#0B79D0] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                title="Table view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of <span className="font-semibold">{candidates.length}</span> candidates
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#0B79D0] to-[#0a6cb9] text-white rounded-lg hover:shadow-lg font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Resumes
          </motion.button>
        </motion.div>

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
