import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useJobs } from './hooks/useJobs';
import { useCandidates } from './hooks/useCandidates';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import MatchingPage from './pages/MatchingPage';
import ShortlistPage from './pages/ShortlistPage';
import ReportsPage from './pages/ReportsPage';
import { useState, useEffect } from 'react';
import { ProgressProvider } from './context/ProgressContext';
import AppErrorBoundary from './components/AppErrorBoundary';
import ProgressTracker from './components/ProgressTracker';
import TopNav from './components/TopNav';
import SectionCard from './components/SectionCard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
// Auth removed – routes are now open
import CommandPalette from './components/CommandPalette';
import { UIProvider, useUI } from './components/UIProvider';

const queryClient = new QueryClient();

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { path: '/jobs', label: 'Jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6' },
    { path: '/candidates', label: 'Candidates', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/shortlist', label: 'Pipeline', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <nav className="flex space-x-1" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${
              isActive ? 'nav-item-active' : 'nav-item-inactive'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Dashboard() {
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates();
  const [insights, setInsights] = useState<{
    avgTimeToHire: number;
    topSkills: string[];
    recommendations: string[];
  }>({
    avgTimeToHire: 0,
    topSkills: [],
    recommendations: []
  });

  useEffect(() => {
    // Smart insights calculation
    const publishedJobs = jobs.filter(j => j.status === 'published');
    const shortlistedCount = candidates.filter(c => c.status === 'shortlisted').length;
    
    // Calculate average time to hire (mock data for now)
    const avgTimeToHire = Math.floor(Math.random() * 15) + 7;
    
    // Extract top skills from all candidates
    const skillCounts: Record<string, number> = {};
    candidates.forEach(c => {
      c.skills?.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([skill]) => skill);

    // Generate smart recommendations
    const recommendations: string[] = [];
    if (publishedJobs.length === 0) {
      recommendations.push("Create your first job posting to start attracting candidates");
    } else if (candidates.length === 0) {
      recommendations.push("Upload candidate resumes to begin the matching process");
    } else if (shortlistedCount === 0) {
      recommendations.push("Review candidates and move qualified ones to shortlist");
    } else {
      recommendations.push("Schedule interviews with shortlisted candidates");
    }

    setInsights({ avgTimeToHire, topSkills, recommendations });
  }, [jobs, candidates]);

  const publishedJobs = jobs.filter(j => j.status === 'published');
  const shortlistedCount = candidates.filter(c => c.status === 'shortlisted').length;

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const topCandidates = candidates.slice(0, 3);

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-900 text-white overflow-hidden border border-white/10 rounded-2xl shadow-lg mx-4 lg:mx-0">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative container py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6 text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" aria-hidden="true"></div>
              AI-Powered Recruitment Platform
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-balance text-white">
              Welcome to <span className="text-yellow-300 font-bold">IKF Recruit Suite</span>
            </h1>
            <p className="text-base md:text-lg text-blue-50 mb-8 md:mb-10 max-w-2xl mx-auto text-balance">
              Streamline your remote hiring process with intelligent candidate matching, 
              automated workflows, and data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/jobs" 
                className="btn btn-lg bg-white text-primary-700 hover:bg-gray-50 hover:text-primary-800 shadow-xl"
                aria-label="Create your first job posting"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Job
              </Link>
              <Link 
                to="/candidates" 
                className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-700 shadow-lg"
                aria-label="Upload candidate resumes"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Resumes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card group p-6 transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Open Positions</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{publishedJobs.length}</p>
                <div className="flex items-center mt-2">
                  <span className="badge badge-success text-xs">+2 this week</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card group p-6 transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Candidates</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{candidates.length}</p>
                <div className="flex items-center mt-2">
                  <span className="badge badge-primary text-xs">+5 today</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card group p-6 transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Shortlisted</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-600">{shortlistedCount}</p>
                <div className="flex items-center mt-2">
                  <span className="badge badge-warning text-xs">+1 today</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card group p-6 transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Interviews (7d)</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-600">0</p>
                <div className="flex items-center mt-2">
                  <span className="badge badge-gray text-xs">Schedule interviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <SectionCard className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Recent Jobs</h3>
                <p className="text-sm text-gray-500">Latest job postings</p>
              </div>
            </div>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner h-8 w-8"></div>
                <span className="ml-3 text-gray-500">Loading jobs…</span>
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="empty-state">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No jobs yet</h3>
                <p className="empty-state-description">Create your first job posting to start attracting candidates</p>
                <Link to="/jobs" className="btn btn-primary mt-4">
                  Create Your First Job
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1 text-base">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.location || 'Remote'} • {job.experience_min}-{job.experience_max} years</p>
                    </div>
                    <span className={`badge text-xs ${
                      job.status === 'published' ? 'badge-success' : 
                      job.status === 'draft' ? 'badge-warning' : 
                      'badge-gray'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {recentJobs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link to="/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  View all jobs
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </SectionCard>

          <SectionCard className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Top Candidates</h3>
                <p className="text-sm text-gray-500">Best matches</p>
              </div>
            </div>
            {candidatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner h-8 w-8"></div>
                <span className="ml-3 text-gray-500">Loading candidates…</span>
              </div>
            ) : topCandidates.length === 0 ? (
              <div className="empty-state">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No candidates yet</h3>
                <p className="empty-state-description">Upload resumes to start building your talent pipeline</p>
                <Link to="/candidates" className="btn btn-primary mt-4">
                  Upload Resumes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topCandidates.map(c => (
                  <div key={c.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {getInitials(c.name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1 text-base">{c.name}</p>
                      <p className="text-sm text-gray-600">{(c.skills || []).slice(0,3).join(', ')}</p>
                    </div>
                    <span className={`badge text-xs ${
                      c.status === 'new' ? 'badge-primary' : 
                      c.status === 'screened' ? 'badge-warning' : 
                      c.status === 'shortlisted' ? 'badge-success' : 
                      'badge-gray'
                    }`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {topCandidates.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link to="/candidates" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
                  View all candidates
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
      <Router basename="/Recruit-Suite-for-Remote-Recruitment">
        <ProgressProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <TopNav />

          <AppErrorBoundary>
            <MainWithSidebar sidebarOpen={sidebarOpen} />
          </AppErrorBoundary>
          <CommandPalette />
        </div>
        </ProgressProvider>
      </Router>
      </UIProvider>
    </QueryClientProvider>
  );
}

function SidebarToggle({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const location = useLocation();
  const showButton = location.pathname !== '/';
  if (!showButton) return null;
  return (
    <button
      aria-label="Toggle progress sidebar"
      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
      onClick={() => setOpen(!open)}
    >
      {open ? 'Hide Panel' : 'Show Panel'}
        </button>
  );
}

function MainWithSidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
  const location = useLocation();
  // Sidebar and progress panel removed globally for a cleaner, full-width layout
  return (
    <main className="w-full px-6 lg:px-10 py-6">
      <section className="w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId/matches" element={<MatchingPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/shortlist" element={<ShortlistPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </section>
    </main>
  );
}

function DensitySwitcher() {
  const { density, setDensity } = useUI()
  return (
    <select value={density} onChange={e=>setDensity(e.target.value as any)} className="input py-1 px-2 h-9">
      <option value="comfortable">Comfortable</option>
      <option value="cozy">Cozy</option>
      <option value="compact">Compact</option>
    </select>
  )
}