import { useCandidates, useUpdateCandidateStatus, useDeleteCandidate } from '../hooks/useCandidates';
import type { Candidate } from '../types';
import ShortlistKanban from '../components/ShortlistKanban';
import CandidatePreview from '../components/CandidatePreview';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from '../components/Toast';

export default function ShortlistPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [query, setQuery] = useState('');
  const [compact, setCompact] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'skill'>('none');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [quickAdd, setQuickAdd] = useState<{name: string; email: string; experience_years: number; skills: string}>({ 
    name: '', 
    email: '', 
    experience_years: 0, 
    skills: '' 
  });
  const [minExp, setMinExp] = useState(0);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'experience'>('recent');
  
  const { data: candidates = [], isLoading } = useCandidates();
  const updateStatusMutation = useUpdateCandidateStatus();
  const deleteCandidate = useDeleteCandidate();
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  // Extract all unique skills for filter
  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    candidates.forEach(c => {
      (c.skills || []).forEach(skill => skillSet.add(skill));
    });
    return Array.from(skillSet).sort();
  }, [candidates]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCandidateMove = async (candidateId: string, newStatus: Candidate['status']) => {
    try {
      // The mutation will optimistically update the UI immediately
      await updateStatusMutation.mutateAsync({
        candidateId,
        status: newStatus
      });
      
      // Show success notification
      const candidate = candidates.find(c => c.id === candidateId);
      const statusLabels: Record<string, string> = {
        'new': 'New',
        'screened': 'Screened',
        'shortlisted': 'Shortlisted',
        'interviewed': 'Interviewed',
        'rejected': 'Rejected',
        'hired': 'Hired'
      };
      showToast(`${candidate?.name || 'Candidate'} moved to ${statusLabels[newStatus]}`, 'success');
    } catch (error) {
      console.error('❌ Failed to update candidate status:', error);
      // The mutation will automatically rollback on error
      showToast('Failed to update candidate. Please try again.', 'error');
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

  const handleArchive = async (candidateId: string) => {
    try {
      await deleteCandidate.mutateAsync(candidateId);
    } catch (e) {
      console.error('Archive failed', e);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
      // Cmd/Ctrl + N for quick add
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      // Cmd/Ctrl + F for filters
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowFilters(!showFilters);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
        setShowFilters(false);
        setSelectedCandidate(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFilters]);

  // Persist compact/minExp preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pipeline_prefs');
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.compact === 'boolean') setCompact(p.compact);
        if (typeof p.minExp === 'number') setMinExp(p.minExp);
        if (typeof p.sortBy === 'string') setSortBy(p.sortBy);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pipeline_prefs', JSON.stringify({ compact, minExp, sortBy }));
    } catch {}
  }, [compact, minExp, sortBy]);

  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(c => (c.experience_years || 0) >= minExp);
    
    // Skill filter
    if (selectedSkillFilter !== 'all') {
      filtered = filtered.filter(c => 
        (c.skills || []).some(skill => skill === selectedSkillFilter)
      );
    }

    // Sort
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'experience') {
      filtered = [...filtered].sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
    }

    return filtered;
  }, [candidates, minExp, selectedSkillFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0B79D0] mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-6 py-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <PageHeader 
            title="🎯 Candidate Pipeline" 
            subtitle="Drag candidates across stages, Jira-style." 
          />
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`btn flex items-center gap-2 ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              <kbd className="hidden md:inline px-1.5 py-0.5 text-xs bg-white/20 rounded">⌘F</kbd>
            </motion.button>
          </div>
        </div>

        {/* Search and Quick Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidates by name, email, or skills... (⌘K)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0] transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <span className="font-semibold text-blue-900">{filteredCandidates.length}</span>
                <span className="text-blue-600">shown</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <span className="font-semibold text-slate-900">{candidates.length}</span>
                <span className="text-slate-600">total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Min Experience: {minExp} years
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={minExp}
                      onChange={(e) => setMinExp(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B79D0]"
                    />
                  </div>

                  {/* Skill Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Filter by Skill
                    </label>
                    <select
                      value={selectedSkillFilter}
                      onChange={(e) => setSelectedSkillFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]"
                    >
                      <option value="all">All Skills</option>
                      {allSkills.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="experience">Experience (High to Low)</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(minExp > 0 || selectedSkillFilter !== 'all' || sortBy !== 'recent') && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setMinExp(0);
                        setSelectedSkillFilter('all');
                        setSortBy('recent');
                      }}
                      className="text-sm text-[#0B79D0] hover:text-[#0a6cb9] font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Kanban Board */}
      <ShortlistKanban
        candidates={filteredCandidates}
        onCandidateMove={handleCandidateMove}
        onCandidateClick={handleCandidateClick}
        searchQuery={query}
        compact={compact}
        groupBy={groupBy}
        onArchive={handleArchive}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      />

      {/* Floating Quick Add Button */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-8 right-8 z-40"
      >
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="btn btn-primary shadow-2xl flex items-center gap-2 px-6 py-4 text-base font-semibold"
          onClick={() => setShowQuickAdd(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Quick Add
          <kbd className="hidden md:inline px-2 py-1 text-xs bg-white/20 rounded">⌘N</kbd>
        </motion.button>
      </motion.div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowQuickAdd(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Quick Add Candidate</h3>
                  <p className="text-sm text-slate-500 mt-1">Add a new candidate to the pipeline</p>
                </div>
                <button 
                  onClick={() => setShowQuickAdd(false)} 
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]" 
                    placeholder="John Doe" 
                    value={quickAdd.name} 
                    onChange={e => setQuickAdd(v => ({...v, name: e.target.value}))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]" 
                    placeholder="john@example.com" 
                    type="email"
                    value={quickAdd.email} 
                    onChange={e => setQuickAdd(v => ({...v, email: e.target.value}))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Skills (comma separated)</label>
                  <input 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]" 
                    placeholder="React, Node.js, TypeScript" 
                    value={quickAdd.skills} 
                    onChange={e => setQuickAdd(v => ({...v, skills: e.target.value}))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Years of Experience: {quickAdd.experience_years}
                  </label>
                  <input 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B79D0]" 
                    type="range" 
                    min={0} 
                    max={30}
                    value={quickAdd.experience_years} 
                    onChange={e => setQuickAdd(v => ({...v, experience_years: parseInt(e.target.value)}))} 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    className="flex-1 btn btn-secondary" 
                    onClick={() => setShowQuickAdd(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="flex-1 btn btn-primary" 
                    onClick={async () => {
                      try {
                        const payload = {
                          name: quickAdd.name || 'Unnamed',
                          email: quickAdd.email || `${Date.now()}@placeholder.local`,
                          phone: '',
                          skills: quickAdd.skills.split(',').map(s => s.trim()).filter(Boolean),
                          experience_years: quickAdd.experience_years || 0,
                          status: 'new' as const,
                          resumes: [],
                          parsed_text: ''
                        };
                        await fetch('/api/candidates', { 
                          method: 'POST', 
                          headers: { 'Content-Type': 'application/json' }, 
                          body: JSON.stringify(payload)
                        });
                        setShowQuickAdd(false);
                        setQuickAdd({ name: '', email: '', experience_years: 0, skills: '' });
                      } catch (e) {
                        console.error('Failed to add candidate', e);
                      }
                    }}
                  >
                    Add Candidate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Preview Modal */}
      {selectedCandidate && (
        <CandidatePreview
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onMessage={handleMessage}
          onSchedule={handleSchedule}
          onShortlist={handleShortlist}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}