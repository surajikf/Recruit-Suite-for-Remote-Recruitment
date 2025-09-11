import type { Job } from '../types';

interface JobListProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onCreateJob: () => void;
}

export default function JobList({ jobs, onJobClick, onCreateJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs yet</h3>
        <p className="text-slate-600 mb-4">Create your first job to start recruiting</p>
        <button
          onClick={onCreateJob}
          className="inline-flex items-center px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Job
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Jobs ({jobs.length})</h2>
        <button
          onClick={onCreateJob}
          className="inline-flex items-center px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Job
        </button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onJobClick(job)}
            className="p-4 border border-slate-200 rounded-lg hover:border-[#0B79D0] hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-slate-900">{job.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                job.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : job.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {job.status}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {job.description || 'No description provided'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {job.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                  +{job.skills.length - 5} more
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>{job.location || 'Location not specified'}</span>
              <span>{job.experience_min}-{job.experience_max} years exp</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
