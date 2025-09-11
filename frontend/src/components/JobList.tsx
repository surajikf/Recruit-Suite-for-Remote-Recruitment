import type { Job } from '../types';

interface JobListProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onCreateJob: () => void;
}

export default function JobList({ jobs, onJobClick, onCreateJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-text mb-3">No jobs yet</h3>
        <p className="text-muted text-lg mb-8 max-w-md mx-auto">Create your first job posting to start attracting top talent and building your team.</p>
        <button
          onClick={onCreateJob}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-button hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Job
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Job Postings</h2>
          <p className="text-muted mt-1">{jobs.length} active job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onCreateJob}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-button hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Job
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onJobClick(job)}
            className="group bg-white rounded-card border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : job.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className="text-sm text-muted">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <svg className="w-5 h-5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <p className="text-muted mb-4 line-clamp-3 leading-relaxed">
                {job.description || 'No description provided'}
              </p>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-muted text-sm rounded-lg">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-muted">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location || 'Remote'}
                  </div>
                  <div className="text-sm font-medium text-text">
                    {job.experience_min}-{job.experience_max} years
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
