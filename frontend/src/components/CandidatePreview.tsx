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
      'new': 'bg-blue-100 text-blue-800',
      'screened': 'bg-yellow-100 text-yellow-800',
      'shortlisted': 'bg-green-100 text-green-800',
      'interviewed': 'bg-purple-100 text-purple-800',
      'rejected': 'bg-red-100 text-red-800',
      'hired': 'bg-emerald-100 text-emerald-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0B79D0] to-[#0a6cb9] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                {getInitials(candidate.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{candidate.name}</h2>
                <p className="text-slate-600">{candidate.email}</p>
                {candidate.phone && <p className="text-slate-600">{candidate.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${getStatusColor(candidate.status)}`}>
                {candidate.status.toUpperCase()}
              </span>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Experience */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Experience
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#0B79D0]">{candidate.experience_years}</p>
                    <p className="text-sm text-slate-600 mt-1">years</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills ({candidate.skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[#0B79D0]/10 text-[#0B79D0] rounded-lg text-sm font-medium border border-[#0B79D0]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Files */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume Files
                </h3>
                {candidate.resumes.length > 0 ? (
                  <div className="space-y-2">
                    {candidate.resumes.map((resume, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-sm text-slate-700 font-medium">{resume}</span>
                        <button className="text-[#0B79D0] hover:text-[#0a6cb9] text-sm font-medium">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No resume uploaded</p>
                )}
              </div>
            </div>

            {/* Right Column - Parsed Content */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume Content
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-[400px] overflow-y-auto">
                {candidate.parsed_text ? (
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {candidate.parsed_text}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-500 italic text-center py-8">No parsed content available</p>
                )}
              </div>
            </div>
          </div>

          {/* Added Date */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Added on {new Date(candidate.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={() => onMessage(candidate)}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
          >
            Message
          </button>
          <button
            onClick={() => onSchedule(candidate)}
            className="px-4 py-2 border border-[#0B79D0] text-[#0B79D0] rounded-lg hover:bg-[#0B79D0]/5 font-medium"
          >
            Schedule Interview
          </button>
          <button
            onClick={() => onShortlist(candidate)}
            className="px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9] font-medium"
          >
            Move to Shortlist
          </button>
        </div>
      </div>
    </div>
  );
}