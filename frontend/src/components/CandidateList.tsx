import { useState } from 'react';
import type { Candidate } from '../types';

interface CandidateListProps {
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onUploadResumes: () => void;
  selectedJobId?: string;
}

export default function CandidateList({ 
  candidates, 
  onCandidateClick, 
  onUploadResumes, 
  selectedJobId 
}: CandidateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'experience':
          return b.experience_years - a.experience_years;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No candidates yet</h3>
        <p className="text-slate-600 mb-4">Upload resumes to start building your candidate pool</p>
        <button
          onClick={onUploadResumes}
          className="inline-flex items-center px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Resumes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search candidates by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="screened">Screened</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="experience">Sort by Experience</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
        </p>
        <button
          onClick={onUploadResumes}
          className="inline-flex items-center px-3 py-2 bg-[#0B79D0] text-white text-sm rounded-lg hover:bg-[#0a6cb9]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload More
        </button>
      </div>

      {/* Candidate Grid */}
      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => onCandidateClick(candidate)}
            className="p-4 border border-slate-200 rounded-lg hover:border-[#0B79D0] hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#0B79D0] rounded-full flex items-center justify-center text-white font-medium">
                  {getInitials(candidate.name)}
                </div>
              </div>

              {/* Candidate Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-slate-900 truncate">
                    {candidate.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-slate-600">
                  <p className="truncate">{candidate.email}</p>
                  <p className="truncate">{candidate.phone}</p>
                  <p>{candidate.experience_years} years experience</p>
                </div>

                {/* Skills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 5 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                      +{candidate.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement message functionality
                  }}
                  className="p-2 text-slate-400 hover:text-[#0B79D0]"
                  title="Message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement schedule functionality
                  }}
                  className="p-2 text-slate-400 hover:text-[#0B79D0]"
                  title="Schedule"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
