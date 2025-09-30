import { useMemo, useState } from 'react';
import type { Candidate } from '../types';

interface ShortlistKanbanProps {
  candidates: Candidate[];
  onCandidateMove: (candidateId: string, newStatus: Candidate['status']) => Promise<void>;
  onCandidateClick: (candidate: Candidate) => void;
  searchQuery?: string;
  compact?: boolean;
  wipLimits?: Partial<Record<Candidate['status'], number>>;
  groupBy?: 'none' | 'skill';
  onArchive?: (candidateId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const STAGES = [
  { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-800', icon: '📋' },
  { id: 'screened', label: 'Screened', color: 'bg-yellow-100 text-yellow-800', icon: '👀' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100 text-green-800', icon: '⭐' },
  { id: 'interviewed', label: 'Interviewed', color: 'bg-purple-100 text-purple-800', icon: '💬' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
  { id: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-800', icon: '🎉' },
] as const;

export default function ShortlistKanban({
  candidates,
  onCandidateMove,
  onCandidateClick,
  searchQuery = '',
  compact = false,
  wipLimits,
  groupBy = 'none',
  onArchive,
}: ShortlistKanbanProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const getCandidatesByStatus = (status: Candidate['status']) => {
    const q = searchQuery.trim().toLowerCase();
    let list = candidates.filter((candidate) => {
      if (candidate.status !== status) return false;
      if (!q) return true;
      const inSkills = (candidate.skills || []).some((s) => s.toLowerCase().includes(q));
      return (
        candidate.name.toLowerCase().includes(q) ||
        (candidate.email || '').toLowerCase().includes(q) ||
        inSkills
      );
    });
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const limits = useMemo(
    () => ({
      new: 10,
      screened: 10,
      shortlisted: 8,
      interviewed: 6,
      rejected: 999,
      hired: 999,
      ...(wipLimits || {}),
    }),
    [wipLimits]
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // HTML5 Drag and Drop - Simple and Reliable
  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', candidateId);
    setDraggedId(candidateId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Candidate['status']) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('text/plain');
    const candidate = candidates.find(c => c.id === candidateId);
    
    if (candidate && candidate.status !== targetStatus) {
      await onCandidateMove(candidateId, targetStatus);
    }
    
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleArchiveDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('text/plain');
    
    if (candidateId && onArchive) {
      onArchive(candidateId);
    }
    
    setDraggedId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0B79D0] animate-pulse"></div>
              <span className="text-sm font-semibold text-slate-700">
                {candidates.length} Total Candidates
              </span>
            </div>
            {STAGES.map((stage) => {
              const count = getCandidatesByStatus(stage.id as Candidate['status']).length;
              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <span className="text-lg">{stage.icon}</span>
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{count}</span> {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4 text-[#0B79D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            <span className="font-medium">Click and drag cards to move between stages</span>
          </div>
        </div>
      </div>

      {/* Horizontal Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map((stage) => {
            const stageCandidates = getCandidatesByStatus(stage.id as Candidate['status']);
            const current = stageCandidates.length;
            const limit = limits[stage.id as Candidate['status']] ?? 999;
            const over = current > limit;
            const isOver = dragOverColumn === stage.id;
            const isCollapsed = !!collapsed[stage.id];

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id as Candidate['status'])}
                className={`w-[320px] flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl p-4 transition-all duration-300 ${
                  over ? 'ring-2 ring-red-300' : ''
                } ${isOver ? 'ring-4 ring-[#0B79D0] shadow-2xl bg-[#0B79D0]/5 scale-105' : 'shadow-sm'}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stage.icon}</span>
                    <h3 className="font-bold text-slate-900 text-base">{stage.label}</h3>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${stage.color} shadow-sm`}>
                      {current}{Number.isFinite(limit) && limit < 999 ? `/${limit}` : ''}
                    </span>
                    {over && (
                      <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                        Over!
                      </span>
                    )}
                  </div>
                  <button
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded transition-all"
                    onClick={() => setCollapsed((prev) => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                  >
                    <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Cards */}
                {!isCollapsed && (
                  <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                    {stageCandidates.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="text-slate-300 mb-3">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">Drop cards here</p>
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, candidate.id)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white border-2 rounded-lg ${compact ? 'p-2.5' : 'p-3.5'} cursor-move transition-all duration-200 ${
                            draggedId === candidate.id
                              ? 'border-[#0B79D0] opacity-40 scale-95 rotate-2 shadow-xl'
                              : 'border-slate-200 hover:border-[#0B79D0] hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-start space-x-3" onClick={() => onCandidateClick(candidate)}>
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <div className={`${compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} bg-gradient-to-br from-[#0B79D0] to-[#0a6cb9] rounded-full flex items-center justify-center text-white font-semibold shadow-md`}>
                                {getInitials(candidate.name)}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-900 truncate`}>
                                {candidate.name}
                              </h4>
                              <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500 truncate`}>
                                {candidate.email}
                              </p>
                              <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-600 font-medium mt-1`}>
                                {candidate.experience_years} yrs exp
                              </p>

                              {/* Skills */}
                              <div className={`${compact ? 'mt-1.5' : 'mt-2.5'} flex flex-wrap gap-1.5`}>
                                {(candidate.skills || []).slice(0, 3).map((skill, index) => (
                                  <span key={index} className={`${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200`}>
                                    {skill}
                                  </span>
                                ))}
                                {(candidate.skills || []).length > 3 && (
                                  <span className={`${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} bg-slate-200 text-slate-600 rounded-md font-semibold`}>
                                    +{(candidate.skills || []).length - 3}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Drag Handle */}
                            <div className="flex-shrink-0 text-slate-300">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Archive Zone */}
      {onArchive && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOverColumn('archive'); }}
          onDragLeave={handleDragLeave}
          onDrop={handleArchiveDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            dragOverColumn === 'archive'
              ? 'border-red-500 bg-red-50 text-red-700 shadow-lg scale-105'
              : 'border-red-300 text-red-500 hover:bg-red-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm font-semibold">
              {dragOverColumn === 'archive' ? '🗑️ Drop to Archive' : 'Drag here to Archive'}
            </span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-[#0B79D0]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">💡 How to Use</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
              <div>📌 <strong>Click</strong> a card to view details</div>
              <div>👆 <strong>Drag & Drop</strong> cards between columns</div>
              <div>🗑️ <strong>Archive</strong> by dragging to bottom zone</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
