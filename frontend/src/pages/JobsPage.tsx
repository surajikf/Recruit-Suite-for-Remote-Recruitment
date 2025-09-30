import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useJobs, useCreateJob } from '../hooks/useJobs';
import type { JobCreateRequest, Job } from '../types';
import JobList from '../components/JobList';
import JobCreateForm from '../components/JobCreateForm';
import PageHeader from '../components/PageHeader';

export default function JobsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const { data: jobs = [], isLoading } = useJobs();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
  const [view, setView] = useState<'auto' | 'table' | 'cards'>('auto');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobs_view_mode');
      if (saved === 'auto' || saved === 'table' || saved === 'cards') setView(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('jobs_view_mode', view); } catch {}
  }, [view]);

  // Load saved search/status (prefer URL param if present)
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

  // Save search/status
  useEffect(() => {
    try { localStorage.setItem('jobs_filters', JSON.stringify({ search, status })); } catch {}
  }, [search, status]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (ctrl && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setShowCreateForm(true);
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

  // Open modal via URL ?new=job
  useEffect(() => {
    if (searchParams.get('new') === 'job') setShowCreateForm(true);
  }, [searchParams]);
  const createJobMutation = useCreateJob();

  const handleCreateJob = async (jobData: JobCreateRequest) => {
    try {
      await createJobMutation.mutateAsync(jobData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const s = search.trim().toLowerCase();
      const matchText = !s || j.title.toLowerCase().includes(s) || (j.description || '').toLowerCase().includes(s) || (j.skills || []).some(sk => sk.toLowerCase().includes(s));
      const matchStatus = status === 'all' || j.status === status;
      return matchText && matchStatus;
    });
  }, [jobs, search, status]);

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
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <PageHeader title="Job Management" subtitle="Create, manage, and track your job postings" />

      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search title, description, or skills…"
          className="input max-w-xl"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value as any)}
          className="input md:w-48"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
        <select value={view} onChange={e=>setView(e.target.value as any)} className="input md:w-40">
          <option value="auto">Auto view</option>
          <option value="table">Table view</option>
          <option value="cards">Card view</option>
        </select>
      </div>

      <JobList
        jobs={filtered}
        onJobClick={handleJobClick}
        onCreateJob={() => setShowCreateForm(true)}
        view={view}
      />

      {showCreateForm && (
        <JobCreateForm
          onSubmit={handleCreateJob}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createJobMutation.isPending}
        />
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600">{selectedJob.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-[#0B79D0]/10 text-[#0B79D0] rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Location</h3>
                    <p className="text-slate-600">{selectedJob.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Experience</h3>
                    <p className="text-slate-600">{selectedJob.experience_min}-{selectedJob.experience_max} years</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <Link
                    to={`/jobs/${selectedJob.id}/matches`}
                    className="px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9]"
                  >
                    View Matches
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
