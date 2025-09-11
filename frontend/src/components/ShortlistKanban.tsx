import { useState } from 'react';
import type { Candidate } from '../types';

interface ShortlistKanbanProps {
  candidates: Candidate[];
  onCandidateMove: (candidateId: string, newStatus: Candidate['status']) => void;
  onCandidateClick: (candidate: Candidate) => void;
}

const STAGES = [
  { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { id: 'screened', label: 'Screened', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100 text-green-800' },
  { id: 'interviewed', label: 'Interviewed', color: 'bg-purple-100 text-purple-800' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { id: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
] as const;

export default function ShortlistKanban({ 
  candidates, 
  onCandidateMove, 
  onCandidateClick 
}: ShortlistKanbanProps) {
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);

  const getCandidatesByStatus = (status: Candidate['status']) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Candidate['status']) => {
    e.preventDefault();
    if (draggedCandidate && draggedCandidate.status !== targetStatus) {
      onCandidateMove(draggedCandidate.id, targetStatus);
    }
    setDraggedCandidate(null);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Candidate Pipeline</h2>
        <div className="text-sm text-slate-600">
          {candidates.length} total candidates
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const stageCandidates = getCandidatesByStatus(stage.id as Candidate['status']);
          
          return (
            <div
              key={stage.id}
              className="bg-slate-50 rounded-lg p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id as Candidate['status'])}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-900">{stage.label}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${stage.color}`}>
                  {stageCandidates.length}
                </span>
              </div>

              {/* Candidates in this stage */}
              <div className="space-y-3">
                {stageCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-500">Drop candidates here</p>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onCandidateClick(candidate)}
                      className="bg-white border border-slate-200 rounded-lg p-3 cursor-move hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-[#0B79D0] rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(candidate.name)}
                          </div>
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 truncate">
                            {candidate.name}
                          </h4>
                          <p className="text-xs text-slate-600 truncate">
                            {candidate.email}
                          </p>
                          <p className="text-xs text-slate-500">
                            {candidate.experience_years} years exp
                          </p>

                          {/* Top Skills */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">How to use the pipeline</h3>
            <p className="text-sm text-blue-700 mt-1">
              Drag and drop candidates between stages to update their status. Click on any candidate to view their details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
