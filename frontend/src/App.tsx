export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold">IKF Recruit Suite</div>
          <nav className="space-x-4 text-sm">
            <a className="text-slate-600 hover:text-[#0B79D0]" href="#">Dashboard</a>
            <a className="text-slate-600 hover:text-[#0B79D0]" href="#">Jobs</a>
            <a className="text-slate-600 hover:text-[#0B79D0]" href="#">Candidates</a>
            <a className="text-slate-600 hover:text-[#0B79D0]" href="#">Calendar</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Open Positions', value: 0 },
            { label: 'Applications (30d)', value: 0 },
            { label: 'Shortlisted', value: 0 },
            { label: 'Upcoming Interviews (7d)', value: 0 },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-3xl font-bold">{kpi.value}</div>
              <div className="mt-1 text-xs text-slate-500">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Welcome</h2>
          <p className="mt-2 text-sm text-slate-600">Start by creating your first job or uploading resumes.</p>
          <div className="mt-4 flex gap-3">
            <button className="rounded-lg bg-[#0B79D0] px-4 py-2 text-white shadow hover:bg-[#0a6cb9]">Create Job</button>
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-slate-800 hover:bg-slate-50">Upload Resumes</button>
          </div>
        </div>
      </main>
    </div>
  )
}
