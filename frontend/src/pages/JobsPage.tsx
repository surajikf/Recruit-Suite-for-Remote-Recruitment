import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useJobs, useCreateJob, useUpdateJob } from '../hooks/useJobs';
import type { JobCreateRequest, Job } from '../types';
import JobList from '../components/JobList';
import JobCreateForm from '../components/JobCreateForm';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from '../components/Toast';

// Job Templates for quick creation
const JOB_TEMPLATES = [
  {
    name: 'Frontend Developer',
    template: {
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced Frontend Developer to join our team...',
      skills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
      location: 'Remote',
      experience_min: 3,
      experience_max: 7,
      auto_match: true,
    }
  },
  {
    name: 'Backend Developer',
    template: {
      title: 'Backend Developer',
      description: 'Join our backend team to build scalable APIs and microservices...',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
      location: 'Remote',
      experience_min: 2,
      experience_max: 6,
      auto_match: true,
    }
  },
  {
    name: 'Full Stack Developer',
    template: {
      title: 'Full Stack Developer',
      description: 'Looking for a versatile developer comfortable with both frontend and backend...',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      location: 'Remote',
      experience_min: 4,
      experience_max: 8,
      auto_match: true,
    }
  },
];

export default function JobsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  
  const { data: jobs = [], isLoading } = useJobs();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
  const [view, setView] = useState<'auto' | 'table' | 'cards'>('cards');
  const [experienceFilter, setExperienceFilter] = useState<number>(0);
  const [skillFilter, setSkillFilter] = useState<string>('all');

  // Extract all unique skills
  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    jobs.forEach(j => (j.skills || []).forEach(skill => skillSet.add(skill)));
    return Array.from(skillSet).sort();
  }, [jobs]);

  // Statistics
  const stats = useMemo(() => {
    const published = jobs.filter(j => j.status === 'published').length;
    const draft = jobs.filter(j => j.status === 'draft').length;
    const closed = jobs.filter(j => j.status === 'closed').length;
    const totalSkills = new Set(jobs.flatMap(j => j.skills || [])).size;
    return { published, draft, closed, totalSkills, total: jobs.length };
  }, [jobs]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobs_view_mode');
      if (saved === 'auto' || saved === 'table' || saved === 'cards') setView(saved);
    } catch {}
  }, []);
  
  useEffect(() => {
    try { localStorage.setItem('jobs_view_mode', view); } catch {}
  }, [view]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('jobs_filters');
      if (raw) {
        const f = JSON.parse(raw);
        if (!searchParams.get('q') && typeof f.search === 'string') setSearch(f.search);
        if (['all','draft','published','closed'].includes(f.status)) setStatus(f.status);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem('jobs_filters', JSON.stringify({ search, status })); } catch {}
  }, [search, status]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (ctrl && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setShowCreateForm(true);
      }
      if (ctrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
      if (e.key === 'Escape') {
        setShowCreateForm(false);
        setEditingJob(null);
        setSelectedJob(null);
        setShowTemplates(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (search) next.set('q', search); else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [search, searchParams, setSearchParams]);

  useEffect(() => {
    if (searchParams.get('new') === 'job') setShowCreateForm(true);
  }, [searchParams]);

  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();

  const handleCreateJob = async (jobData: JobCreateRequest) => {
    try {
      await createJobMutation.mutateAsync(jobData);
      setShowCreateForm(false);
      showToast('Job created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create job:', error);
      showToast('Failed to create job. Please try again.', 'error');
    }
  };

  const handleUpdateJob = async (jobData: JobCreateRequest) => {
    if (!editingJob) return;
    try {
      await updateJobMutation.mutateAsync({ id: editingJob.id, data: jobData });
      setEditingJob(null);
      showToast('Job updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update job:', error);
      showToast('Failed to update job. Please try again.', 'error');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setSelectedJob(null);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleUseTemplate = (template: typeof JOB_TEMPLATES[0]) => {
    setShowTemplates(false);
    setShowCreateForm(true);
    // Template will be passed to form - we'll handle this in the form component
  };

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const s = search.trim().toLowerCase();
      const matchText = !s || j.title.toLowerCase().includes(s) || (j.description || '').toLowerCase().includes(s) || (j.skills || []).some(sk => sk.toLowerCase().includes(s));
      const matchStatus = status === 'all' || j.status === status;
      const matchExperience = experienceFilter === 0 || (j.experience_min || 0) >= experienceFilter;
      const matchSkill = skillFilter === 'all' || (j.skills || []).includes(skillFilter);
      return matchText && matchStatus && matchExperience && matchSkill;
    });
  }, [jobs, search, status, experienceFilter, skillFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0B79D0] mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader title="💼 Job Management" subtitle="Create, manage, and track your job postings with AI-powered insights" />
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
                <p className="text-sm text-slate-600 font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Published</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.published}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Draft</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.draft}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                placeholder="Search jobs by title, description, or skills... (⌘K)"
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
              <option value="draft">📝 Draft</option>
              <option value="published">✅ Published</option>
              <option value="closed">🔒 Closed</option>
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

            {/* Advanced Filters Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${showFilters ? 'bg-[#0B79D0] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </motion.button>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-slate-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Min Experience: {experienceFilter} years
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(parseInt(e.target.value))}
                      className="w-full accent-[#0B79D0]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Filter by Skill
                    </label>
                    <select
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20"
                    >
                      <option value="all">All Skills</option>
                      {allSkills.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {(experienceFilter > 0 || skillFilter !== 'all') && (
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => { setExperienceFilter(0); setSkillFilter('all'); }} className="text-sm text-[#0B79D0] font-medium hover:underline">
                      Clear filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of <span className="font-semibold">{jobs.length}</span> jobs
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Templates
            </motion.button>
          </div>
        </motion.div>

        {/* Job List */}
        <JobList
          jobs={filtered}
          onJobClick={handleJobClick}
          onCreateJob={() => setShowCreateForm(true)}
          onEditJob={handleEditJob}
          view={view}
        />

        {/* Floating Action Button */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-[#0B79D0] to-[#0a6cb9] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl flex items-center gap-2 font-semibold"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="pr-2">New Job</span>
            <kbd className="hidden md:inline px-2 py-1 text-xs bg-white/20 rounded">⌘J</kbd>
          </motion.button>
        </motion.div>

        {/* Templates Modal */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowTemplates(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Job Templates</h2>
                    <p className="text-slate-600 mt-1">Start with a pre-configured template</p>
                  </div>
                  <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {JOB_TEMPLATES.map((template, index) => (
                    <motion.div
                      key={template.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-slate-200 rounded-xl p-6 hover:border-[#0B79D0] cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0B79D0] to-[#0a6cb9] rounded-xl mx-auto mb-4 flex items-center justify-center text-white text-2xl">
                          💼
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{template.name}</h3>
                        <p className="text-sm text-slate-600 mb-4">{template.template.experience_min}-{template.template.experience_max} yrs</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {template.template.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="text-xs px-2 py-1 bg-slate-100 rounded-full">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                  <button
                    onClick={() => { setShowTemplates(false); setShowCreateForm(true); }}
                    className="text-[#0B79D0] font-medium hover:underline"
                  >
                    Or create a custom job from scratch →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Form */}
        {showCreateForm && (
          <JobCreateForm
            onSubmit={handleCreateJob}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createJobMutation.isPending}
            mode="create"
          />
        )}

        {/* Edit Form */}
        {editingJob && (
          <JobCreateForm
            onSubmit={handleUpdateJob}
            onCancel={() => setEditingJob(null)}
            isLoading={updateJobMutation.isPending}
            initialData={editingJob}
            mode="edit"
          />
        )}

        {/* Job Detail Modal */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedJob(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0B79D0] to-[#0a6cb9] p-8 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedJob.title}</h2>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-xl font-semibold text-sm ${
                          selectedJob.status === 'published' ? 'bg-green-100 text-green-800' : 
                          selectedJob.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedJob.status.toUpperCase()}
                        </span>
                        <span className="text-white/80">📅 {new Date(selectedJob.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedJob(null)} className="text-white/80 hover:text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Description
                        </h3>
                        <p className="text-slate-700 leading-relaxed">{selectedJob.description || 'No description provided'}</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          Location
                        </h3>
                        <p className="text-slate-700 font-medium">{selectedJob.location || 'Remote'}</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Required Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.map((skill) => (
                            <motion.span
                              key={skill}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              className="px-3 py-1.5 bg-white text-purple-700 rounded-lg text-sm font-semibold shadow-sm border border-purple-200"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Experience Required
                        </h3>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <p className="text-3xl font-bold text-orange-600">{selectedJob.experience_min} - {selectedJob.experience_max}</p>
                          <p className="text-sm text-slate-600 mt-1">years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <button
                    onClick={() => { setSelectedJob(null); handleEditJob(selectedJob); }}
                    className="px-6 py-3 border-2 border-[#0B79D0] text-[#0B79D0] rounded-xl hover:bg-[#0B79D0]/5 font-semibold flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Job
                  </button>
                  <Link
                    to={`/jobs/${selectedJob.id}/matches`}
                    className="px-6 py-3 bg-gradient-to-r from-[#0B79D0] to-[#0a6cb9] text-white rounded-xl hover:shadow-lg font-semibold flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    View Matches
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
}