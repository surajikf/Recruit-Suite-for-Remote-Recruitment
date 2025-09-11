import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';

const queryClient = new QueryClient();

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/candidates', label: 'Candidates' },
    { path: '/calendar', label: 'Calendar' },
  ];

  return (
    <nav className="space-x-4 text-sm">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`${
            location.pathname === item.path
              ? 'text-[#0B79D0] font-medium'
              : 'text-slate-600 hover:text-[#0B79D0]'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
          <Link
            to="/jobs"
            className="rounded-lg bg-[#0B79D0] px-4 py-2 text-white shadow hover:bg-[#0a6cb9]"
          >
            Create Job
          </Link>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-slate-800 hover:bg-slate-50">
            Upload Resumes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
          <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <Link to="/" className="text-xl font-semibold">
                IKF Recruit Suite
              </Link>
              <Navigation />
            </div>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/calendar" element={<div className="p-8 text-center">Calendar page coming soon</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}