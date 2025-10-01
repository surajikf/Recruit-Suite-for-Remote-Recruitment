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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header - Simplified & Consistent */}
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                {getInitials(candidate.name)}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
            </div>
            <div className="flex items-center gap-3 ml-[52px]">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                candidate.status === 'hired' ? 'bg-green-100 text-green-800' :
                candidate.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                candidate.status === 'interviewed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">{candidate.email}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Clean Content - Simplified */}
        <div className="modal-body space-y-6">
          {/* Contact Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            {candidate.phone && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone
                </h3>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-gray-900 font-medium text-sm">{candidate.phone}</p>
                </div>
              </div>
            )}

            {/* Experience */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Experience
              </h3>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{candidate.experience_years}</p>
                <p className="text-xs text-gray-600">years</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Skills ({candidate.skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume Files */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resume Files
            </h3>
            {candidate.resumes.length > 0 ? (
              <div className="space-y-2">
                {candidate.resumes.map((resume, index) => {
                  const fileName = resume.startsWith('http') 
                    ? decodeURIComponent(resume.split('/').pop() || resume)
                    : resume;
                  
                  return (
                    <div key={index} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate" title={fileName}>
                          {fileName}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          if (resume.startsWith('http')) {
                            window.open(resume, '_blank', 'noopener,noreferrer');
                          } else {
                            alert('This resume was uploaded before PDF storage. Please re-upload.');
                          }
                        }}
                        className="btn btn-sm btn-secondary flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">No resume uploaded</p>
              </div>
            )}
          </div>

          {/* Added Date */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              📅 Added on {new Date(candidate.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Simple Footer Actions */}
        <div className="modal-footer">
          <button
            onClick={() => onMessage(candidate)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Message
          </button>
          <button
            onClick={() => onSchedule(candidate)}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule
          </button>
          <button
            onClick={() => onShortlist(candidate)}
            className="btn btn-success flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Shortlist
          </button>
        </div>
      </div>
    </div>
  );
}