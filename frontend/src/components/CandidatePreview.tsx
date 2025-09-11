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
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'screened':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#0B79D0] rounded-full flex items-center justify-center text-white font-medium text-xl">
              {getInitials(candidate.name)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{candidate.name}</h2>
              <p className="text-slate-600">{candidate.email}</p>
              <p className="text-slate-600">{candidate.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(candidate.status)}`}>
              {candidate.status}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Candidate Details */}
            <div className="space-y-6">
              {/* Experience */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Experience</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Years of Experience</span>
                    <span className="text-lg font-semibold text-slate-900">{candidate.experience_years} years</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#0B79D0]/10 text-[#0B79D0] rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600">{candidate.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-slate-600">{candidate.phone}</span>
                  </div>
                </div>
              </div>

              {/* Resume Files */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Resume Files</h3>
                <div className="space-y-2">
                  {candidate.resumes.map((resume, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-slate-600">{resume}</span>
                      <button className="ml-auto text-[#0B79D0] hover:text-[#0a6cb9] text-sm">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Parsed Resume Content */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-3">Parsed Resume Content</h3>
              <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {candidate.parsed_text || 'No parsed content available'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-500">
            Added {new Date(candidate.created_at).toLocaleDateString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => onMessage(candidate)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
            <button
              onClick={() => onSchedule(candidate)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule
            </button>
            <button
              onClick={() => onShortlist(candidate)}
              className="px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9]"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Shortlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
