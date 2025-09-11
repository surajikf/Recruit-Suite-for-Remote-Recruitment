import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs, useCreateJob } from '../hooks/useJobs';
import type { JobCreateRequest, Job } from '../types';
import JobList from '../components/JobList';
import JobCreateForm from '../components/JobCreateForm';

export default function JobsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const { data: jobs = [], isLoading } = useJobs();
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
          <h1 className="text-3xl font-bold text-text mb-2">Job Management</h1>
          <p className="text-muted text-lg">Create, manage, and track your job postings</p>
        </div>

      <JobList
        jobs={jobs}
        onJobClick={handleJobClick}
        onCreateJob={() => setShowCreateForm(true)}
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
