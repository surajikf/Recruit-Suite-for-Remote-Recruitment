import { useEffect, useState } from 'react';
import type { Candidate } from '../types';
import { useDeleteCandidate } from '../hooks/useCandidates';

type CandidateViewMode = 'auto' | 'table' | 'cards'
type CandidateOptionalColumn = 'email' | 'status' | 'experience' | 'skills';
const CANDIDATE_DEFAULT_ORDER: CandidateOptionalColumn[] = ['email','status','experience','skills'];
interface CandidateListProps {
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onUploadResumes: () => void;
  selectedJobId?: string;
  minimal?: boolean; // when true, parent controls filtering/search; render grid only
  view?: CandidateViewMode;
}

export default function CandidateList({ 
  candidates, 
  onCandidateClick, 
  onUploadResumes, 
  selectedJobId,
  minimal = false,
  view = 'auto',
}: CandidateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [tableSort, setTableSort] = useState<{key:'name'|'status'|'experience'|'skills', dir:'asc'|'desc'}>({key:'name', dir:'asc'});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columns, setColumns] = useState<{email:boolean; status:boolean; experience:boolean; skills:boolean}>({ email: true, status: true, experience: true, skills: true });
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [optionalOrder, setOptionalOrder] = useState<CandidateOptionalColumn[]>(CANDIDATE_DEFAULT_ORDER);
  const [dragKey, setDragKey] = useState<CandidateOptionalColumn | null>(null);
  const deleteMutation = useDeleteCandidate();
  
  const handleDelete = async (e: React.MouseEvent, candidateId: string, candidateName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${candidateName}?`)) {
      try {
        await deleteMutation.mutateAsync(candidateId);
      } catch (error) {
        alert('Failed to delete candidate');
      }
    }
  };

  // Load/save preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem('candidates_table_prefs');
      if (raw) {
        const prefs = JSON.parse(raw);
        if (typeof prefs.page === 'number' && prefs.page > 0) setPage(prefs.page);
        if (prefs.pageSize) setPageSize(prefs.pageSize);
        if (prefs.columns) setColumns(prefs.columns);
        if (prefs.tableSort) setTableSort(prefs.tableSort);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('candidates_table_prefs', JSON.stringify({ page, pageSize, columns, tableSort }));
    } catch {}
  }, [page, pageSize, columns, tableSort]);

  // Load/save column widths
  useEffect(() => {
    try {
      const raw = localStorage.getItem('candidates_table_widths');
      if (raw) setColWidths(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('candidates_table_widths', JSON.stringify(colWidths)); } catch {}
  }, [colWidths]);

  // Load/save optional column order
  useEffect(() => {
    try {
      const raw = localStorage.getItem('candidates_table_order');
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        const valid = CANDIDATE_DEFAULT_ORDER.filter(k => Array.isArray(arr) && arr.includes(k));
        const missing = CANDIDATE_DEFAULT_ORDER.filter(k => !valid.includes(k));
        setOptionalOrder([...valid, ...missing]);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('candidates_table_order', JSON.stringify(optionalOrder)); } catch {}
  }, [optionalOrder]);

  // Compute filtered candidates BEFORE any effect depends on it
  const filteredCandidates = minimal
    ? candidates
    : candidates
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

  const startResize = (col: string) => (e: any) => {
    e.preventDefault();
    const th = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    const startX = e.clientX as number;
    const startWidth = th.getBoundingClientRect().width;
    const onMove = (ev: MouseEvent) => {
      const newWidth = Math.max(80, Math.round(startWidth + (ev.clientX - startX)));
      setColWidths(w => ({ ...w, [col]: newWidth }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onDragStart = (key: CandidateOptionalColumn) => (e: any) => {
    setDragKey(key);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', key);
      e.dataTransfer.effectAllowed = 'move';
    }
  };
  const onDragOver = (e: any) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (targetKey: CandidateOptionalColumn) => (e: any) => {
    e.preventDefault();
    const source = (dragKey as CandidateOptionalColumn) || (e.dataTransfer?.getData('text/plain') as CandidateOptionalColumn);
    if (!source || source === targetKey) return;
    setOptionalOrder(prev => {
      const arr = prev.filter(k => k !== source);
      const idx = arr.indexOf(targetKey);
      if (idx === -1) return prev;
      arr.splice(idx, 0, source);
      return arr as CandidateOptionalColumn[];
    });
    setDragKey(null);
  };

  const resetColumns = () => {
    setColumns({ email: true, status: true, experience: true, skills: true });
    setOptionalOrder(CANDIDATE_DEFAULT_ORDER);
    setColWidths(w => {
      const next = { ...w } as Record<string, number>;
      delete next.email; delete next.status; delete next.experience; delete next.skills;
      return next;
    });
  };

  const toCsvValue = (v: unknown) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const exportCsv = () => {
    const headers: string[] = ['Name'];
    optionalOrder.forEach(k => { if ((columns as any)[k]) headers.push(k[0].toUpperCase()+k.slice(1)); });
    const sortedRows = [...filteredCandidates].sort((a,b)=>{
      const dir = tableSort.dir==='asc'?1:-1;
      switch (tableSort.key) {
        case 'name': return a.name.localeCompare(b.name)*dir;
        case 'status': return a.status.localeCompare(b.status)*dir;
        case 'experience': return ((a.experience_years||0)-(b.experience_years||0))*dir;
        case 'skills': return ((a.skills?.length||0)-(b.skills?.length||0))*dir;
      }
    });
    const rows = sortedRows.map(c => {
      const base = [c.name];
      const rest: string[] = [];
      optionalOrder.forEach(k => {
        if (!(columns as any)[k]) return;
        if (k === 'email') rest.push(c.email || '');
        else if (k === 'status') rest.push(c.status);
        else if (k === 'experience') rest.push(String(c.experience_years || 0));
        else if (k === 'skills') rest.push((c.skills || []).join(', '));
      });
      return [...base, ...rest];
    });
    const csv = [headers, ...rows].map(r => r.map(toCsvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clamp page within available range when list or pageSize changes
  useEffect(() => {
    const total = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
    if (page > total) setPage(total);
    if (page < 1) setPage(1);
  }, [filteredCandidates.length, pageSize, page]);

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
      <div className="text-center py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
            <svg className="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">No candidates yet</h3>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">Upload resumes to start building your talent pipeline and find the perfect match for your roles.</p>
          <button
            onClick={onUploadResumes}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg transform hover:scale-105"
          >
            <svg className="w-6 h-6 mr-3 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Resumes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!minimal && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text">Candidate Pool</h2>
              <p className="text-muted mt-1">{candidates.length} total candidates</p>
            </div>
        <button onClick={onUploadResumes} className="btn btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload More Resumes
            </button>
          </div>

          <div className="bg-white rounded-card border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search candidates by name, email, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
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
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="experience">Sort by Experience</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-muted">
              {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
            </p>
            <div className="text-sm text-muted">
              Showing {filteredCandidates.length} of {candidates.length}
            </div>
          </div>
        </>
      )}

      {/* Enhanced table view */}
      <div className={`${view === 'cards' ? 'hidden' : ''} ${view === 'table' ? '' : 'hidden lg:block'} bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg animate-fade`}>        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-700 font-semibold">Columns:</span>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input type="checkbox" checked={columns.email} onChange={e=>setColumns({...columns, email: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/> 
              <span>Email</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input type="checkbox" checked={columns.status} onChange={e=>setColumns({...columns, status: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/> 
              <span>Status</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input type="checkbox" checked={columns.experience} onChange={e=>setColumns({...columns, experience: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/> 
              <span>Experience</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <input type="checkbox" checked={columns.skills} onChange={e=>setColumns({...columns, skills: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/> 
              <span>Skills</span>
            </label>
            <button className="ml-2 text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors" onClick={resetColumns}>Reset</button>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={pageSize} onChange={e=>{ setPageSize(parseInt(e.target.value)||10); setPage(1); }}>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg">
              <button className="px-3 py-1 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-700" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-slate-700 font-medium min-w-[60px] text-center">{page} / {Math.max(1,Math.ceil(filteredCandidates.length/pageSize))}</span>
              <button className="px-3 py-1 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-700" disabled={page>=Math.ceil(filteredCandidates.length/pageSize)} onClick={()=>setPage(p=>Math.min(Math.ceil(filteredCandidates.length/pageSize),p+1))}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow transition-all flex items-center gap-2" onClick={exportCsv}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="sticky top-[56px] bg-gradient-to-r from-slate-100 to-slate-50 z-10">
            <tr className="text-left border-b border-slate-200">
              <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer relative hover:text-blue-600 transition-colors" style={{ width: colWidths.name ? colWidths.name : undefined }} onClick={()=>setTableSort(s=>({key:'name', dir: s.key==='name'&&s.dir==='asc'?'desc':'asc'}))}>
                <div className="flex items-center gap-2">
                  Name
                  {tableSort.key === 'name' && (
                    <svg className={`w-4 h-4 transition-transform ${tableSort.dir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
                <span className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300" onMouseDown={startResize('name')} />
              </th>
              {optionalOrder.map((key) => (
                columns[key] ? (
                  <th
                    key={key}
                    className={`px-6 py-4 font-bold text-slate-700 relative ${key !== 'email' ? 'cursor-pointer hover:text-blue-600' : ''} transition-colors`}
                    style={{ width: (colWidths as any)[key] ? (colWidths as any)[key] : undefined }}
                    onClick={key === 'email' ? undefined : () => setTableSort(s=>({key: key as any, dir: s.key===key && s.dir==='asc' ? 'desc' : 'asc'}))}
                    draggable
                    onDragStart={onDragStart(key)}
                    onDragOver={onDragOver}
                    onDrop={onDrop(key)}
                  >
                    <div className="flex items-center gap-2">
                      {key === 'email' ? 'Email' : key === 'status' ? 'Status' : key === 'experience' ? 'Experience' : 'Skills'}
                      {tableSort.key === key && key !== 'email' && (
                        <svg className={`w-4 h-4 transition-transform ${tableSort.dir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                    <span className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300" onMouseDown={startResize(key)} />
                  </th>
                ) : null
              ))}
              <th className="px-6 py-4 font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredCandidates].sort((a,b)=>{
              const dir = tableSort.dir==='asc'?1:-1;
              switch (tableSort.key) {
                case 'name': return a.name.localeCompare(b.name)*dir;
                case 'status': return a.status.localeCompare(b.status)*dir;
                case 'experience': return ((a.experience_years||0)-(b.experience_years||0))*dir;
                case 'skills': return ((a.skills?.length||0)-(b.skills?.length||0))*dir;
              }
            }).slice((page-1)*pageSize, (page-1)*pageSize+pageSize).map(c => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-blue-50/50 transition-all group">
                <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-700 cursor-pointer" onClick={() => onCandidateClick(c)}>{c.name}</td>
                {optionalOrder.map((key) => (
                  columns[key] ? (
                    <td key={key} className="px-6 py-4 cursor-pointer" onClick={() => onCandidateClick(c)}>
                      {key === 'email' && <span className="text-slate-600">{c.email}</span>}
                      {key === 'status' && <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(c.status)} shadow-sm`}>{c.status}</span>}
                      {key === 'experience' && <span className="text-slate-700 font-medium">{c.experience_years} yrs</span>}
                      {key === 'skills' && <span className="text-slate-600">{(c.skills||[]).slice(0,3).join(', ')}{(c.skills||[]).length>3?' +' + ((c.skills||[]).length-3) + ' more':''}</span>}
                    </td>
                  ) : null
                ))}
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => handleDelete(e, c.id, c.name)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete candidate"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Card grid */}
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${view === 'table' ? 'hidden' : ''} ${view === 'cards' ? '' : 'lg:hidden'}`}>
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => onCandidateClick(candidate)}
            className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
          >
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:via-transparent group-hover:to-blue-50/50 transition-all duration-500 pointer-events-none"></div>
            
            <div className="relative p-6">
              <div className="flex items-start space-x-4 mb-5">
                {/* Enhanced Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 ring-4 ring-blue-100">
                    {getInitials(candidate.name)}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {candidate.name}
                    </h3>
                    <span className={`flex-shrink-0 ml-2 px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(candidate.status)} shadow-sm`}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="truncate text-sm">{candidate.email}</p>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <p className="truncate text-sm">{candidate.phone}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 font-medium text-slate-900 mt-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{candidate.experience_years} years experience</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="mb-5">
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 4 && (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg border border-slate-200">
                      +{candidate.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-200">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement message functionality
                    }}
                    className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
                    title="Message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement schedule functionality
                    }}
                    className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
                    title="Schedule"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, candidate.id, candidate.name)}
                    className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(candidate.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
