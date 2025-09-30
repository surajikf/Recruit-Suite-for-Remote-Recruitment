import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'
import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'

export default function ReportsPage() {
  const { data: candidates = [] } = useCandidates()
  const { data: jobs = [] } = useJobs()

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [candidateStatus, setCandidateStatus] = useState<'all' | 'new' | 'screened' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired'>('all')
  const [jobLocation, setJobLocation] = useState('all')
  const [activeTab, setActiveTab] = useState<'overview'|'candidates'|'jobs'>('overview')

  // Load/save preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem('reports_filters')
      if (raw) {
        const f = JSON.parse(raw)
        if (typeof f.startDate === 'string') setStartDate(f.startDate)
        if (typeof f.endDate === 'string') setEndDate(f.endDate)
        if (['all','new','screened','shortlisted','interviewed','rejected','hired'].includes(f.candidateStatus)) setCandidateStatus(f.candidateStatus)
        if (typeof f.jobLocation === 'string') setJobLocation(f.jobLocation)
      }
    } catch {}
    try {
      const tab = localStorage.getItem('reports_active_tab')
      if (tab === 'overview' || tab === 'candidates' || tab === 'jobs') setActiveTab(tab)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('reports_filters', JSON.stringify({ startDate, endDate, candidateStatus, jobLocation })) } catch {}
  }, [startDate, endDate, candidateStatus, jobLocation])
  useEffect(() => {
    try { localStorage.setItem('reports_active_tab', activeTab) } catch {}
  }, [activeTab])

  const inRange = (iso?: string) => {
    if (!iso) return true
    const d = new Date(iso).getTime()
    if (startDate && d < new Date(startDate).getTime()) return false
    if (endDate && d > new Date(endDate).getTime()) return false
    return true
  }

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => inRange(c.created_at) && (candidateStatus === 'all' || c.status === candidateStatus))
  }, [candidates, startDate, endDate, candidateStatus])

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => inRange(j.created_at) && (jobLocation === 'all' || (j.location || '').toLowerCase() === jobLocation.toLowerCase()))
  }, [jobs, startDate, endDate, jobLocation])

  const publishedJobs = filteredJobs.filter(j => j.status === 'published')
  const countsByStatus = filteredCandidates.reduce<Record<string, number>>((acc, c) => { acc[c.status] = (acc[c.status]||0)+1; return acc }, {})
  const topSkills = useMemo(() => {
    const map: Record<string, number> = {}
    filteredCandidates.forEach(c => (c.skills||[]).forEach(s => { map[s] = (map[s]||0)+1 }))
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5)
  }, [filteredCandidates])

  // Time series (last 30 days)
  const days = useMemo(() => {
    const arr: string[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      arr.push(d.toISOString().slice(0,10))
    }
    return arr
  }, [])
  const candidatesByDay = useMemo(() => {
    const map: Record<string, number> = {}
    filteredCandidates.forEach(c => {
      const key = (c.created_at ? new Date(c.created_at) : new Date()).toISOString().slice(0,10)
      map[key] = (map[key]||0) + 1
    })
    return days.map(d => map[d] || 0)
  }, [filteredCandidates, days])
  const jobsByWeek = useMemo(() => {
    // collapse into 6 weeks buckets for display
    const buckets = new Array(6).fill(0)
    const now = new Date()
    filteredJobs.forEach(j => {
      const dt = j.created_at ? new Date(j.created_at) : new Date()
      const diffDays = Math.floor((now.getTime() - dt.getTime())/86400000)
      const w = Math.min(5, Math.max(0, Math.floor(diffDays/7)))
      buckets[5 - w] += 1
    })
    return buckets
  }, [filteredJobs])

  // Coverage: % of jobs that have at least one candidate beyond "new" (screened/shortlisted/interviewed/hired)
  const jobIdToAdvanced = new Set<string>()
  filteredCandidates.forEach(c => {
    if (['screened','shortlisted','interviewed','hired'].includes(c.status as any)) {
      // We may not have job_id on candidate; treat coverage as jobs with any candidates beyond new if we had job link.
      // Fallback: approximate by count of candidates in advanced statuses relative to jobs
    }
  })
  const coveragePct = Math.min(100, Math.round(((countsByStatus['screened']||0)+(countsByStatus['shortlisted']||0)+(countsByStatus['interviewed']||0)+(countsByStatus['hired']||0)) / Math.max(1, filteredJobs.length) * 100))

  // Export helpers
  const exportCsv = (rows: any[], filename: string) => {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g,'""')}"`
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc((r as any)[h])).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCandidates = () => {
    const rows = filteredCandidates.map(c => ({
      name: c.name, email: c.email, status: c.status, experience_years: c.experience_years, skills: (c.skills||[]).join('|'), created_at: c.created_at
    }))
    exportCsv(rows, 'candidates.csv')
  }

  const exportJobs = () => {
    const rows = filteredJobs.map(j => ({ title: j.title, status: j.status, location: j.location, exp_min: j.experience_min, exp_max: j.experience_max, skills: (j.skills||[]).join('|'), created_at: j.created_at }))
    exportCsv(rows, 'jobs.csv')
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Reports" subtitle="Key metrics for HR and leadership." />
        <div className="flex items-center gap-2">
          <input className="input" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
          <span className="text-sm text-gray-500">to</span>
          <input className="input" type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          <select className="input" value={candidateStatus} onChange={e=>setCandidateStatus(e.target.value as any)}>
            <option value="all">All candidates</option>
            <option value="new">New</option>
            <option value="screened">Screened</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
          <select className="input" value={jobLocation} onChange={e=>setJobLocation(e.target.value)}>
            <option value="all">All locations</option>
            {Array.from(new Set(jobs.map(j=>j.location||'Remote'))).map(loc => (
              <option key={loc} value={loc}>{loc||'Remote'}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={()=>{ setStartDate(''); setEndDate(''); setCandidateStatus('all'); setJobLocation('all') }}>Clear</button>
          <button className="btn btn-primary" onClick={()=>window.print()}>Print</button>
          <button className="btn btn-primary" onClick={exportCandidates}>Export Candidates CSV</button>
          <button className="btn btn-primary" onClick={exportJobs}>Export Jobs CSV</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-card border border-gray-200 p-2">
        <div className="flex gap-2">
          {(['overview','candidates','jobs'] as const).map(t => (
            <button
              key={t}
              onClick={()=>setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab===t ? 'bg-[#0A66C2] text-white' : 'hover:bg-gray-100'}`}
            >{t[0].toUpperCase()+t.slice(1)}</button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIWithSpark title="Total Candidates" value={candidates.length} series={candidatesByDay} />
            <KPI title="Published Jobs" value={String(publishedJobs.length)} sub="live now" />
            <KPI title="Shortlist Rate" value={`${Math.round(((countsByStatus['shortlisted']||0)/Math.max(1, filteredCandidates.length))*100)}%`} sub="of filtered" />
            <KPI title="Hire Rate" value={`${Math.round(((countsByStatus['hired']||0)/Math.max(1, filteredCandidates.length))*100)}%`} sub="of filtered" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-4 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Candidates (last 30 days)</h2>
              <Sparkline series={candidatesByDay} height={120} />
            </div>
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-3">Status Breakdown</h2>
              <Donut data={Object.entries(countsByStatus).map(([k,v])=>({label:k,value:v}))} />
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-3">Top Skills</h2>
            <Bar title="" items={topSkills.map(([k,v])=>({label:k,value:v}))} />
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="space-y-6 animate-fade">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-4 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Pipeline Funnel</h2>
              <Funnel items={[
                { label: 'New', value: countsByStatus['new']||0, color: '#60A5FA' },
                { label: 'Screened', value: countsByStatus['screened']||0, color: '#F59E0B' },
                { label: 'Shortlisted', value: countsByStatus['shortlisted']||0, color: '#10B981' },
                { label: 'Interviewed', value: countsByStatus['interviewed']||0, color: '#8B5CF6' },
                { label: 'Hired', value: countsByStatus['hired']||0, color: '#059669' },
              ]} />
            </div>
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-3">By Status</h2>
              <Bar title="" items={Object.entries(countsByStatus).map(([k,v])=>({label:k,value:v}))} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6 animate-fade">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-4 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Jobs Created (last ~6 weeks)</h2>
              <Bar title="" items={jobsByWeek.map((v,i)=>({label:`W${i+1}`, value:v}))} />
            </div>
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-3">Top Locations</h2>
              <Bar title="" items={Array.from(new Map(filteredJobs.reduce((acc: [string,number][], j) => {
                const key = j.location || 'Remote';
                const idx = acc.findIndex(([k])=>k===key); if (idx>-1) acc[idx][1]++; else acc.push([key,1]);
                return acc
              }, []))).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>({label:k,value:v}))} />
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-3">Jobs Overview</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Title</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Location</th>
                  <th className="py-2">Experience</th>
                  <th className="py-2">Skills</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(j => (
                  <tr key={j.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{j.title}</td>
                    <td className="py-2 capitalize">{j.status}</td>
                    <td className="py-2">{j.location||'Remote'}</td>
                    <td className="py-2">{j.experience_min}-{j.experience_max} yrs</td>
                    <td className="py-2">{(j.skills||[]).slice(0,3).join(', ')}{(j.skills||[]).length>3?'…':''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function KPI({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

function KPIWithSpark({ title, value, series }: { title: string; value: number; series: number[] }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className="ml-4">
          <Sparkline series={series} width={120} height={40} />
        </div>
      </div>
    </div>
  )
}

function Bar({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map(i=>i.value))
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.label} className="flex items-center gap-3">
            <div className="w-28 text-sm text-gray-600 truncate">{i.label}</div>
            <div className="flex-1 h-2 bg-gray-100 rounded">
              <div className="h-2 bg-[#0A66C2] rounded" style={{ width: `${(i.value/max)*100}%` }} />
            </div>
            <div className="w-10 text-right text-sm">{i.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Sparkline({ series, width = 300, height = 120 }: { series: number[]; width?: number; height?: number }) {
  const max = Math.max(1, ...series)
  const step = series.length > 1 ? width / (series.length - 1) : width
  const path = series.map((v,i) => `${i===0?'M':'L'} ${i*step} ${height - (v/max)*height}`).join(' ')
  const area = `M 0 ${height} ${path} L ${width} ${height} Z`
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={area} fill="#0A66C220" />
      <path d={path} fill="none" stroke="#0A66C2" strokeWidth={2} />
    </svg>
  )
}

function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s,d)=>s+d.value,0) || 1
  let offset = 0
  const radius = 40
  const circumference = 2 * Math.PI * radius
  return (
    <div className="flex items-center gap-4">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <g transform="translate(60,60)">
          <circle r={radius} fill="none" stroke="#E5E7EB" strokeWidth={16} />
          {data.map((d, idx) => {
            const frac = d.value / total
            const len = frac * circumference
            const circle = (
              <circle
                key={d.label}
                r={radius}
                fill="none"
                stroke={palette(idx)}
                strokeWidth={16}
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90)"
              />
            )
            offset += len
            return circle
          })}
        </g>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: palette(i) }} />
            <span className="capitalize">{d.label}</span>
            <span className="text-gray-500">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function palette(i: number) {
  const colors = ['#0A66C2', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#14B8A6']
  return colors[i % colors.length]
}

function Funnel({ items }: { items: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...items.map(i=>i.value))
  return (
    <div className="space-y-3">
      {items.map(i => (
        <div key={i.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">{i.label}</div>
            <div className="text-gray-500">{i.value}</div>
          </div>
          <div className="h-3 bg-gray-100 rounded">
            <div className="h-3 rounded" style={{ width: `${(i.value/max)*100}%`, background: i.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}


