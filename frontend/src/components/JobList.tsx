import type { Job } from '../types';
import { useDeleteJob, useUpdateJobStatus } from '../hooks/useJobs';
import { useEffect, useState } from 'react';

type JobViewMode = 'auto' | 'table' | 'cards';
type JobOptionalColumn = 'location' | 'experience' | 'skills';
const JOB_DEFAULT_ORDER: JobOptionalColumn[] = ['location','experience','skills'];
interface JobListProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onCreateJob: () => void;
  onEditJob?: (job: Job) => void;
  view?: JobViewMode;
}

export default function JobList({ jobs, onJobClick, onCreateJob, onEditJob, view = 'auto' }: JobListProps) {
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();
  const [sortKey, setSortKey] = useState<'title'|'status'|'location'|'experience'|'skills'>('title' as any);
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columns, setColumns] = useState<{location: boolean; experience: boolean; skills: boolean}>({ location: true, experience: true, skills: true });
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [optionalOrder, setOptionalOrder] = useState<JobOptionalColumn[]>(JOB_DEFAULT_ORDER);
  const [dragKey, setDragKey] = useState<JobOptionalColumn | null>(null);

  // Load/save preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem('jobs_table_prefs');
      if (raw) {
        const prefs = JSON.parse(raw);
        if (typeof prefs.page === 'number' && prefs.page > 0) setPage(prefs.page);
        if (prefs.pageSize) setPageSize(prefs.pageSize);
        if (prefs.columns) setColumns(prefs.columns);
        if (prefs.sortKey) setSortKey(prefs.sortKey);
        if (prefs.sortDir) setSortDir(prefs.sortDir);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('jobs_table_prefs', JSON.stringify({ page, pageSize, columns, sortKey, sortDir }));
    } catch {}
  }, [page, pageSize, columns, sortKey, sortDir]);

  // Load/save column widths
  useEffect(() => {
    try {
      const raw = localStorage.getItem('jobs_table_widths');
      if (raw) setColWidths(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('jobs_table_widths', JSON.stringify(colWidths)); } catch {}
  }, [colWidths]);

  // Load/save optional column order
  useEffect(() => {
    try {
      const raw = localStorage.getItem('jobs_table_order');
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        const valid = JOB_DEFAULT_ORDER.filter(k => Array.isArray(arr) && arr.includes(k));
        const missing = JOB_DEFAULT_ORDER.filter(k => !valid.includes(k));
        setOptionalOrder([...valid, ...missing]);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('jobs_table_order', JSON.stringify(optionalOrder)); } catch {}
  }, [optionalOrder]);

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

  const onDragStart = (key: JobOptionalColumn) => (e: any) => {
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
  const onDrop = (targetKey: JobOptionalColumn) => (e: any) => {
    e.preventDefault();
    const source = (dragKey as JobOptionalColumn) || (e.dataTransfer?.getData('text/plain') as JobOptionalColumn);
    if (!source || source === targetKey) return;
    setOptionalOrder(prev => {
      const arr = prev.filter(k => k !== source);
      const idx = arr.indexOf(targetKey);
      if (idx === -1) return prev;
      arr.splice(idx, 0, source);
      return arr as JobOptionalColumn[];
    });
    setDragKey(null);
  };

  const resetColumns = () => {
    setColumns({ location: true, experience: true, skills: true });
    setOptionalOrder(JOB_DEFAULT_ORDER);
    setColWidths(w => {
      const next = { ...w } as Record<string, number>;
      delete next.location; delete next.experience; delete next.skills; delete next.actions;
      return next;
    });
  };

  const toCsvValue = (v: unknown) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const exportCsv = () => {
    const headers: string[] = ['Title','Status'];
    optionalOrder.forEach(k => { if ((columns as any)[k]) headers.push(k === 'location' ? 'Location' : k === 'experience' ? 'Experience' : 'Skills'); });
    const rows = sorted.map(j => {
      const base = [j.title, j.status];
      const rest: string[] = [];
      optionalOrder.forEach(k => {
        if (!(columns as any)[k]) return;
        if (k === 'location') rest.push(j.location || 'Remote');
        else if (k === 'experience') rest.push(`${j.experience_min}-${j.experience_max} yrs`);
        else if (k === 'skills') rest.push((j.skills || []).join(', '));
      });
      return [...base, ...rest];
    });
    const csv = [headers, ...rows].map(r => r.map(toCsvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Ensure current page stays in range when data/pageSize changes
  useEffect(() => {
    const total = Math.max(1, Math.ceil(jobs.length / pageSize));
    if (page > total) setPage(total);
    if (page < 1) setPage(1);
  }, [jobs.length, pageSize, page]);

  const sorted = [...jobs].sort((a,b)=>{
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'title': return a.title.localeCompare(b.title) * dir;
      case 'status': return a.status.localeCompare(b.status) * dir;
      case 'location': return (a.location||'').localeCompare(b.location||'') * dir;
      case 'experience': return ((a.experience_min||0)-(b.experience_min||0)) * dir;
      case 'skills': return ((a.skills?.length||0)-(b.skills?.length||0)) * dir;
      default: return 0;
    }
  });

  const setSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-text mb-3">No jobs yet</h3>
        <p className="text-muted text-lg mb-8 max-w-md mx-auto">Create your first job posting to start attracting top talent and building your team.</p>
        <button
          onClick={onCreateJob}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-button hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Job
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Job Postings</h2>
          <p className="text-muted mt-1">{jobs.length} active job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={onCreateJob} className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Job
        </button>
      </div>

      {/* Compact table view */}
      <div className={`${view === 'cards' ? 'hidden' : view === 'table' ? 'block' : 'hidden lg:block'} bg-white rounded-card border border-gray-200 overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">Columns:</span>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={columns.location} onChange={e=>setColumns({...columns, location: e.target.checked})} /> Location</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={columns.experience} onChange={e=>setColumns({...columns, experience: e.target.checked})} /> Experience</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={columns.skills} onChange={e=>setColumns({...columns, skills: e.target.checked})} /> Skills</label>
            <button className="ml-2 text-blue-600 hover:underline" onClick={resetColumns}>Reset</button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <select className="input py-1 h-8 w-24" value={pageSize} onChange={e=>{ setPageSize(parseInt(e.target.value)||10); setPage(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={safePage<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
              <span className="text-gray-600">{safePage}/{totalPages}</span>
              <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={safePage>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
            </div>
            <button className="px-3 py-1 border rounded hover:bg-gray-50" onClick={exportCsv}>Export CSV</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="sticky top-[56px] bg-gray-50 z-10">
            <tr className="text-left">
              <th className="px-4 py-3 cursor-pointer relative" style={{ width: colWidths.title ? colWidths.title : undefined }} onClick={()=>setSort('title')}>
                Title
                <span className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize" onMouseDown={startResize('title')} />
              </th>
              <th className="px-4 py-3 cursor-pointer relative" style={{ width: colWidths.status ? colWidths.status : undefined }} onClick={()=>setSort('status')}>
                Status
                <span className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize" onMouseDown={startResize('status')} />
              </th>
              {optionalOrder.map((key) => (
                columns[key] ? (
                  <th
                    key={key}
                    className="px-4 py-3 cursor-pointer relative"
                    style={{ width: (colWidths as any)[key] ? (colWidths as any)[key] : undefined }}
                    onClick={()=>setSort(key as any)}
                    draggable
                    onDragStart={onDragStart(key)}
                    onDragOver={onDragOver}
                    onDrop={onDrop(key)}
                  >
                    {key === 'location' ? 'Location' : key === 'experience' ? 'Experience' : 'Skills'}
                    <span className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize" onMouseDown={startResize(key)} />
                  </th>
                ) : null
              ))}
              <th className="px-4 py-3 relative" style={{ width: colWidths.actions ? colWidths.actions : undefined }}>
                <span className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize" onMouseDown={startResize('actions')} />
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(job => (
              <tr key={job.id} className="border-t hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onJobClick(job)}>
                <td className="px-4 py-3 font-medium text-slate-800">{job.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    job.status === 'published' ? 'bg-green-100 text-green-700' : job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>{job.status}</span>
                </td>
                {optionalOrder.map((key) => (
                  columns[key] ? (
                    <td key={key} className="px-4 py-3">
                      {key === 'location' && (job.location || 'Remote')}
                      {key === 'experience' && (`${job.experience_min}-${job.experience_max} yrs`)}
                      {key === 'skills' && (
                        <span className="text-slate-600">{job.skills.slice(0,3).join(', ')}{job.skills.length>3?'…':''}</span>
                      )}
                    </td>
                  ) : null
                ))}
                <td className="px-4 py-3 text-right">
                  {onEditJob && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditJob(job); }}
                      className="px-3 py-1 text-xs rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 mr-2"
                      title="Edit job"
                    >Edit</button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: job.id, status: job.status === 'published' ? 'closed' : 'published' })}}
                    className="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 mr-2"
                  >{job.status === 'published' ? 'Close' : 'Publish'}</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteJob.mutate(job.id)}}
                    className="px-3 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card grid */}
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${view === 'table' ? 'hidden' : view === 'cards' ? 'block' : 'block lg:hidden'}`}>
        {jobs.map((job) => (
          <div
            key={job.id}
            className="group bg-white rounded-card border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <button onClick={() => onJobClick(job)} className="text-left w-full">
                    <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors mb-2">
                      {job.title}
                    </h3>
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : job.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className="text-sm text-muted">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-start gap-2">
                  {onEditJob && (
                    <button
                      onClick={() => onEditJob(job)}
                      className="px-3 py-1 text-xs rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50"
                      title="Edit job"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus.mutate({ id: job.id, status: job.status === 'published' ? 'closed' : 'published' })}
                    className="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50"
                    title={job.status === 'published' ? 'Close job' : 'Publish job'}
                  >
                    {job.status === 'published' ? 'Close' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deleteJob.mutate(job.id)}
                    className="px-3 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    title="Delete job"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-muted mb-4 line-clamp-3 leading-relaxed">
                {job.description || 'No description provided'}
              </p>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-muted text-sm rounded-lg">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-muted">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location || 'Remote'}
                  </div>
                  <div className="text-sm font-medium text-text">
                    {job.experience_min}-{job.experience_max} years
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
