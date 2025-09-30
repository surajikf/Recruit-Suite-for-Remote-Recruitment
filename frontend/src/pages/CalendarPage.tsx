import { useEffect, useMemo, useState } from 'react'
import { useCandidates } from '../hooks/useCandidates'
import { useJobs } from '../hooks/useJobs'

function encodeDateRangeISO(start: string, end: string) {
  // expects local datetime strings (YYYY-MM-DDTHH:mm)
  const s = new Date(start)
  const e = new Date(end)
  const pad = (n: number) => String(n).padStart(2, '0')
  const z = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  return `${z(s)}/${z(e)}`
}

export default function CalendarPage() {
  const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID as string | undefined
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const src = useMemo(() => {
    if (!calendarId) return ''
    const id = encodeURIComponent(calendarId.trim())
    const tzq = encodeURIComponent(tz)
    return `https://calendar.google.com/calendar/embed?src=${id}&ctz=${tzq}`
  }, [calendarId, tz])

  const [title, setTitle] = useState('Interview')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [location, setLocation] = useState('Google Meet')
  const [details, setDetails] = useState('')
  const [duration, setDuration] = useState(45) // minutes
  const { data: candidates = [] } = useCandidates()
  const { data: jobs = [] } = useJobs()
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')

  const eventUrl = useMemo(() => {
    if (!start || !end) return '#'
    const dates = encodeDateRangeISO(start, end)
    const q = new URLSearchParams({
      text: title || 'Interview',
      dates,
      details,
      location
    }).toString()
    return `https://calendar.google.com/calendar/u/0/r/eventedit?${q}`
  }, [title, start, end, details, location])

  // Initialize default start/end to nearest next hour
  useEffect(() => {
    if (!start || !end) {
      const now = new Date()
      now.setMinutes(0, 0, 0)
      const s = new Date(now.getTime() + 60 * 60 * 1000) // next hour
      const e = new Date(s.getTime() + duration * 60 * 1000)
      const fmt = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
      setStart(fmt(s))
      setEnd(fmt(e))
    }
  }, [])

  // Update end when duration changes
  useEffect(() => {
    if (start) {
      const sDate = new Date(start)
      const e = new Date(sDate.getTime() + duration * 60 * 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      setEnd(fmt(e))
    }
  }, [duration, start])

  // Prefill from candidate and job
  useEffect(() => {
    const candidate = candidates.find(c => c.id === selectedCandidateId)
    const job = jobs.find(j => j.id === selectedJobId)
    if (candidate || job) {
      const t = `${candidate ? candidate.name : 'Candidate'} — Interview${job ? ` for ${job.title}` : ''}`
      setTitle(t)
      const d = `Interview with ${candidate ? candidate.name : 'candidate'}${job ? ` for the ${job.title} position` : ''}.`
      setDetails(d)
    }
  }, [selectedCandidateId, selectedJobId, candidates, jobs])

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-gray-600">Schedule interviews and hiring events.</p>
        </div>
      </div>

      {!calendarId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
          <p className="font-medium mb-1">Google Calendar not configured</p>
          <p>Set <code className="px-1 bg-yellow-100 rounded">VITE_GOOGLE_CALENDAR_ID</code> in <code className="px-1 bg-yellow-100 rounded">frontend/.env</code> with a public calendar ID (e.g., <em>yourname@gmail.com</em> or <em>your_calendar_id@group.calendar.google.com</em>) and make it public in Google Calendar → Settings → Access permissions → Make available to public.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <iframe title="Google Calendar" src={src} className="w-full h-[720px]" frameBorder="0" scrolling="no"></iframe>
        </div>
      )}

      <div className="bg-white border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Quick add to Google Calendar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <select className="input" value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)}>
            <option value="">Select candidate (optional)</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
            ))}
          </select>
          <select className="input" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
            <option value="">Select job (optional)</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="input" type="datetime-local" placeholder="Start" value={start} onChange={e => setStart(e.target.value)} />
          <input className="input" type="datetime-local" placeholder="End" value={end} onChange={e => setEnd(e.target.value)} />
          <input className="input" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <textarea className="input md:col-span-2" placeholder="Details / agenda" value={details} onChange={e => setDetails(e.target.value)} />
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Duration</label>
            <select className="input" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 30)}>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <a className={`btn btn-primary ${(!start || !end) ? 'pointer-events-none opacity-50' : ''}`} href={eventUrl} target="_blank" rel="noreferrer">Open in Google Calendar</a>
          {calendarId && (
            <a className="btn btn-secondary" href={`https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(calendarId)}`} target="_blank" rel="noreferrer">Subscribe</a>
          )}
        </div>
      </div>
    </div>
  )
}


