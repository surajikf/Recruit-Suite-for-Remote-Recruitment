import { useMemo, useState } from 'react';
import type { Candidate } from '../types';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

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

// Sortable Candidate Card Component
function SortableCandidateCard({
  candidate,
  onClick,
  compact = false,
  isDragging = false
}: {
  candidate: Candidate;
  onClick: () => void;
  compact?: boolean;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isBeingDragged = isDragging || isSortableDragging;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isBeingDragged ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
      className={`bg-white border border-slate-200 rounded-lg ${compact ? 'p-2.5' : 'p-3.5'} cursor-move hover:shadow-lg transition-all duration-200 ${
        isBeingDragged ? 'opacity-50 rotate-2 scale-95 shadow-2xl ring-2 ring-[#0B79D0]/40' : ''
      }`}
    >
      <div className="flex items-start space-x-3" onClick={onClick}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`${
              compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
            } bg-gradient-to-br from-[#0B79D0] to-[#0a6cb9] rounded-full flex items-center justify-center text-white font-semibold shadow-md`}
          >
            {getInitials(candidate.name)}
          </div>
        </div>

        {/* Candidate Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-900 truncate`}>
            {candidate.name}
          </h4>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500 truncate flex items-center gap-1.5`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {candidate.email}
          </p>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-600 font-medium mt-1`}>
            {candidate.experience_years} yrs exp
          </p>

          {/* Top Skills */}
          <div className={`${compact ? 'mt-1.5' : 'mt-2.5'} flex flex-wrap gap-1.5`}>
            {(candidate.skills || []).slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className={`${
                  compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
                } bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 rounded-md font-medium border border-slate-200 hover:border-[#0B79D0]/40 transition-colors`}
              >
                {skill}
              </span>
            ))}
            {(candidate.skills || []).length > 3 && (
              <span
                className={`${
                  compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
                } bg-slate-200 text-slate-600 rounded-md font-semibold`}
              >
                +{(candidate.skills || []).length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Drag Handle Icon */}
        <div className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// Archive Zone Component
function ArchiveZone({ isOver }: { isOver: boolean }) {
  const { setNodeRef } = useDroppable({
    id: 'archive-zone',
  });

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
        isOver
          ? 'border-red-500 bg-red-50 text-red-700 shadow-lg scale-105'
          : 'border-red-300 text-red-500 hover:bg-red-50'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span className="text-sm font-semibold">
          {isOver ? 'Drop to Archive' : 'Drag here to Archive'}
        </span>
      </div>
    </motion.div>
  );
}

// Column Component
function KanbanColumn({
  stage,
  candidates,
  onCandidateClick,
  compact,
  limit,
  isOver,
  collapsed,
  onToggleCollapse,
}: {
  stage: typeof STAGES[number];
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  compact: boolean;
  limit: number;
  isOver: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const current = candidates.length;
  const over = current > limit;

  return (
    <div
      ref={setNodeRef}
      className={`w-[320px] flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl p-4 transition-all duration-300 ${
        over ? 'ring-2 ring-red-300 shadow-red-100' : ''
      } ${isOver ? 'ring-2 ring-[#0B79D0] shadow-xl scale-[1.02] bg-[#0B79D0]/5' : 'shadow-sm'}`}
    >
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">{stage.icon}</span>
          <h3 className="font-bold text-slate-900 text-base">{stage.label}</h3>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${stage.color} shadow-sm`}>
            {current}
            {Number.isFinite(limit) && limit < 999 ? `/${limit}` : ''}
          </span>
          {over && (
            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
              Over WIP!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded transition-all"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Candidates in this stage */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                {candidates.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 px-4"
                  >
                    <div className="text-slate-300 mb-3">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Drop candidates here</p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {candidates.map((candidate) => (
                      <SortableCandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onClick={() => onCandidateClick(candidate)}
                        compact={compact}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShortlistKanban({
  candidates,
  onCandidateMove,
  onCandidateClick,
  searchQuery = '',
  compact = false,
  wipLimits,
  groupBy = 'none',
  onArchive,
  onDragStart,
  onDragEnd,
}: ShortlistKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

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
    // Default sort by recent
    list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    onDragStart?.();
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setOverId(null);
      onDragEnd?.();
      return;
    }

    const activeCandidate = candidates.find((c) => c.id === active.id);
    if (!activeCandidate) {
      setActiveId(null);
      setOverId(null);
      onDragEnd?.();
      return;
    }

    // Check if dropped on archive zone
    if (over.id === 'archive-zone' && onArchive) {
      onArchive(activeCandidate.id);
      setActiveId(null);
      setOverId(null);
      onDragEnd?.();
      return;
    }

    // Check if dropped on a status column
    const targetStatus = over.id as Candidate['status'];
    if (STAGES.some((s) => s.id === targetStatus) && activeCandidate.status !== targetStatus) {
      await onCandidateMove(activeCandidate.id, targetStatus);
    }

    setActiveId(null);
    setOverId(null);
    onDragEnd?.();
  };

  const activeDragCandidate = activeId ? candidates.find((c) => c.id === activeId) : null;

  const lanes: string[] = useMemo(() => {
    if (groupBy === 'skill') {
      const keys = new Set<string>();
      candidates.forEach((c) => keys.add((c.skills || [])[0] || 'General'));
      return Array.from(keys).sort();
    }
    return ['All'];
  }, [candidates, groupBy]);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
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
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Drag cards to move between stages</span>
          </div>
        </div>
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {lanes.map((laneKey) => (
          <div key={laneKey} className="space-y-4">
            {groupBy !== 'none' && (
              <div className="text-sm font-semibold text-gray-700 px-4 py-3 bg-white border rounded-lg shadow-sm">
                {laneKey}
              </div>
            )}

            {/* Jira-like horizontal board with fixed-width columns */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {STAGES.map((stage) => {
                  const stageCandidates = getCandidatesByStatus(stage.id as Candidate['status']);
                  const displayCandidates =
                    groupBy === 'skill'
                      ? stageCandidates.filter((c) => ((c.skills || [])[0] || 'General') === laneKey)
                      : stageCandidates;

                  return (
                    <KanbanColumn
                      key={stage.id}
                      stage={stage}
                      candidates={displayCandidates}
                      onCandidateClick={onCandidateClick}
                      compact={compact}
                      limit={limits[stage.id as Candidate['status']] ?? 999}
                      isOver={overId === stage.id}
                      collapsed={!!collapsed[stage.id]}
                      onToggleCollapse={() =>
                        setCollapsed((prev) => ({ ...prev, [stage.id]: !prev[stage.id] }))
                      }
                    />
                  );
                })}
              </div>
            </div>

            {/* Archive zone */}
            {onArchive && <ArchiveZone isOver={overId === 'archive-zone'} />}
          </div>
        ))}

        <DragOverlay>
          {activeDragCandidate ? (
            <div className="rotate-3 scale-105 opacity-90">
              <SortableCandidateCard
                candidate={activeDragCandidate}
                onClick={() => {}}
                compact={compact}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Keyboard Shortcuts Help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="text-[#0B79D0]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">💡 Pro Tips</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px]">
                  Click
                </kbd>
                <span>View candidate details</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px]">
                  Drag
                </kbd>
                <span>Move between stages</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px]">
                  Archive
                </kbd>
                <span>Drag to bottom zone</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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