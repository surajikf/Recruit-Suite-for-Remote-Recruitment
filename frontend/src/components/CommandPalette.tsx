import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const entries = [
  { label: 'Go to Dashboard', action: (nav: any) => nav('/') },
  { label: 'Go to Jobs', action: (nav: any) => nav('/jobs') },
  { label: 'Create Job (Ctrl/Cmd+J)', action: (nav: any) => nav('/jobs') },
  { label: 'Go to Candidates', action: (nav: any) => nav('/candidates') },
  { label: 'Upload Resumes (Ctrl/Cmd+U)', action: (nav: any) => nav('/candidates') },
  { label: 'Open Pipeline', action: (nav: any) => nav('/shortlist') },
  { label: 'Open Admin', action: (nav: any) => nav('/admin') },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const [jobResults, setJobResults] = useState<{ id: string; title: string }[]>([])
  const [candidateResults, setCandidateResults] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    let active = true
    const run = async () => {
      const q = query.trim().toLowerCase()
      if (!q) {
        setJobResults([]); setCandidateResults([])
        return
      }
      const { data: jobs } = await supabase.from('jobs').select('id,title').ilike('title', `%${q}%`).limit(5)
      const { data: cands } = await supabase.from('candidates').select('id,name').ilike('name', `%${q}%`).limit(5)
      if (!active) return
      setJobResults(jobs || [])
      setCandidateResults(cands || [])
    }
    run()
    return () => { active = false }
  }, [query])

  const filtered = useMemo(() => entries.filter(e => e.label.toLowerCase().includes(query.toLowerCase())), [query])

  const run = (fn: (nav: any) => void) => {
    fn(navigate)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="absolute inset-0 flex items-start justify-center mt-24 px-4">
        <div className="w-full max-w-xl rounded-xl bg-white shadow-lg border border-gray-100">
          <div className="p-3 border-b">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type a command or search…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0A66C2] focus:ring-[#0A66C2] focus:outline-none focus:ring-2"
            />
          </div>
          <ul className="max-h-80 overflow-auto">
            {filtered.length === 0 && <li className="p-3 text-sm text-gray-500">No commands</li>}
            {filtered.map(item => (
              <li key={item.label}>
                <button onClick={() => run(item.action)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  {item.label}
                </button>
              </li>
            ))}
            {(jobResults.length > 0 || candidateResults.length > 0) && (
              <li className="px-4 py-2 text-xs text-gray-500">Results</li>
            )}
            {jobResults.map(j => (
              <li key={j.id}>
                <button onClick={() => { navigate(`/jobs/${j.id}/matches`); setOpen(false) }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  Job: {j.title}
                </button>
              </li>
            ))}
            {candidateResults.map(c => (
              <li key={c.id}>
                <button onClick={() => { navigate('/candidates'); setOpen(false) }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  Candidate: {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}


