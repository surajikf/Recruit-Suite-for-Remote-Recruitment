import { useState } from 'react';
import type { Job, MatchScore } from '../types';

interface MatchingEngineProps {
  job: Job;
  matches: MatchScore[];
  onThresholdChange: (threshold: number) => void;
  onViewCandidate: (candidate: any) => void;
}

export default function MatchingEngine({ 
  job, 
  matches, 
  onThresholdChange, 
  onViewCandidate 
}: MatchingEngineProps) {
  const [threshold, setThreshold] = useState(70);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    onThresholdChange(newThreshold);
  };

  const filteredMatches = matches
    .filter(match => match.match_score >= threshold)
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.match_score - a.match_score;
      }
      return a.candidate.name.localeCompare(b.candidate.name);
    });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Matching Results</h2>
          <p className="text-slate-600">Candidates matched for "{job.title}"</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700">Min Score:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-slate-600 w-8">{threshold}%</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Job Requirements Summary */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 mb-3">Job Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Required Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#0B79D0]/10 text-[#0B79D0] text-xs rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Experience & Location</p>
            <p className="text-sm text-slate-900">
              {job.experience_min}-{job.experience_max} years • {job.location || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {filteredMatches.length} candidate{filteredMatches.length !== 1 ? 's' : ''} found above {threshold}% match
        </p>
        <div className="text-sm text-slate-500">
          Total candidates: {matches.length}
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-600">Try lowering the match threshold or upload more resumes</p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div
              key={match.candidate.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-[#0B79D0] hover:shadow-sm transition-all"
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#0B79D0] rounded-full flex items-center justify-center text-white font-medium">
                    {getInitials(match.candidate.name)}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-slate-900">
                      {match.candidate.name}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm rounded-full ${getScoreColor(match.match_score)}`}>
                        {match.match_score}% match
                      </span>
                      <button
                        onClick={() => onViewCandidate(match.candidate)}
                        className="text-[#0B79D0] hover:text-[#0a6cb9] text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{match.candidate.email}</p>
                    <p className="text-sm text-slate-600">
                      {match.candidate.experience_years} years experience
                    </p>
                  </div>

                  {/* Skills Match */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">Skills Match</p>
                    <div className="flex flex-wrap gap-1">
                      {match.candidate.skills.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded ${
                            job.skills.includes(skill)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                      {match.candidate.skills.length > 6 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                          +{match.candidate.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Score Breakdown</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">
                          {match.breakdown.skills}%
                        </div>
                        <div className="text-xs text-slate-500">Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">
                          {match.breakdown.experience}%
                        </div>
                        <div className="text-xs text-slate-500">Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">
                          {match.breakdown.location}%
                        </div>
                        <div className="text-xs text-slate-500">Location</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">
                          {match.breakdown.role_fit}%
                        </div>
                        <div className="text-xs text-slate-500">Role Fit</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
