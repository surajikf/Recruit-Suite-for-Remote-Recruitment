import type { Candidate } from '../types';

interface CandidatePreviewProps {
  candidate: Candidate | null;
  onClose: () => void;
  onMessage: (candidate: Candidate) => void;
  onSchedule: (candidate: Candidate) => void;
  onShortlist: (candidate: Candidate) => void;
}

export default function CandidatePreview({ 
  candidate, 
  onClose, 
  onMessage, 
  onSchedule, 
  onShortlist 
}: CandidatePreviewProps) {
  if (!candidate) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'badge-primary',
      'screened': 'badge-warning',
      'shortlisted': 'badge-success',
      'interviewed': 'badge-primary',
      'rejected': 'badge-danger',
      'hired': 'badge-success',
    };
    return colors[status as keyof typeof colors] || 'badge-gray';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                {getInitials(candidate.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
                <p className="text-gray-600">{candidate.email}</p>
                {candidate.phone && <p className="text-gray-600">{candidate.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${getStatusColor(candidate.status)}`}>
                {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
              </span>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Experience */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Experience
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary-600">{candidate.experience_years}</p>
                    <p className="text-sm text-gray-600 mt-1">years</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills ({candidate.skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="badge badge-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Files */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume Files
                </h3>
                {candidate.resumes.length > 0 ? (
                  <div className="space-y-2">
                    {candidate.resumes.map((resume, index) => {
                      // Extract filename from URL or use as-is
                      const fileName = resume.startsWith('http') 
                        ? decodeURIComponent(resume.split('/').pop() || resume)
                        : resume;
                      
                      return (
                        <div key={index} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                            <span className="text-sm text-gray-700 font-medium truncate" title={fileName}>
                              {fileName}
                            </span>
                          </div>
                          <button 
                            onClick={() => {
                              // Check if it's a URL (starts with http)
                              if (resume.startsWith('http')) {
                                // Open the actual PDF/resume in a new tab
                                const opened = window.open(resume, '_blank', 'noopener,noreferrer');
                                if (!opened) {
                                  alert('Please allow popups for this site to view the PDF');
                                }
                              } else {
                                // Old data without URL - show detailed instructions
                                alert('⚠️ This resume was uploaded before PDF storage was enabled.\n\n' +
                                  'To view this resume:\n' +
                                  '1. Go to Supabase Dashboard\n' +
                                  '2. Create a "resumes" storage bucket\n' +
                                  '3. Re-upload this resume\n\n' +
                                  'Or check: SUPABASE_STORAGE_SETUP.md for instructions');
                              }
                            }}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-primary-600 hover:text-white hover:bg-primary-600 border border-primary-600 rounded-lg text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No resume uploaded</p>
                )}
              </div>
            </div>

            {/* Right Column - Parsed Content */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume Content
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[400px] overflow-y-auto">
                {candidate.parsed_text ? (
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {candidate.parsed_text}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-8">No parsed content available</p>
                )}
              </div>
            </div>
          </div>

          {/* Added Date */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Added on {new Date(candidate.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button
            onClick={() => onMessage(candidate)}
            className="btn btn-secondary"
          >
            Message
          </button>
          <button
            onClick={() => onSchedule(candidate)}
            className="btn btn-primary"
          >
            Schedule Interview
          </button>
          <button
            onClick={() => onShortlist(candidate)}
            className="btn btn-success"
          >
            Move to Shortlist
          </button>
        </div>
      </div>
    </div>
  );
}