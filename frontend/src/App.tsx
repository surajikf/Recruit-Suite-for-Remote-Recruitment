import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import MatchingPage from './pages/MatchingPage';
import ShortlistPage from './pages/ShortlistPage';

const queryClient = new QueryClient();

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/candidates', label: 'Candidates' },
    { path: '/shortlist', label: 'Pipeline' },
    { path: '/calendar', label: 'Calendar' },
  ];

  return (
    <nav className="flex space-x-1">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === item.path
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-primary hover:bg-gray-100'
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to IKF Recruit Suite</h1>
            <p className="text-xl text-blue-100 mb-8">Streamline your remote hiring process with AI-powered matching</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/jobs" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-button bg-white text-primary hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Job
              </Link>
              <Link 
                to="/candidates" 
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-button text-white hover:bg-white hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Resumes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-card shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted">Open Positions</p>
                <p className="text-2xl font-bold text-text">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted">Applications (30d)</p>
                <p className="text-2xl font-bold text-text">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted">Shortlisted</p>
                <p className="text-2xl font-bold text-text">1</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted">Interviews (7d)</p>
                <p className="text-2xl font-bold text-text">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-card shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Recent Jobs</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-text">Senior React Developer</p>
                  <p className="text-sm text-muted">Remote • 5-10 years</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Published</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-text">Full Stack Developer</p>
                  <p className="text-sm text-muted">New York, NY • 3-7 years</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Published</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-text">Frontend Developer</p>
                  <p className="text-sm text-muted">San Francisco, CA • 2-5 years</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Draft</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/jobs" className="text-primary hover:text-blue-700 text-sm font-medium">
                View all jobs →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-card shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Top Candidates</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  SJ
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text">Sarah Johnson</p>
                  <p className="text-sm text-muted">React, TypeScript, Node.js</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">New</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  MC
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text">Michael Chen</p>
                  <p className="text-sm text-muted">Python, Django, PostgreSQL</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Screened</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  ER
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text">Emily Rodriguez</p>
                  <p className="text-sm text-muted">Vue.js, JavaScript, CSS</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Shortlisted</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/candidates" className="text-primary hover:text-blue-700 text-sm font-medium">
                View all candidates →
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-card p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-text mb-4">Ready to streamline your hiring?</h3>
            <p className="text-muted mb-6">Create your first job posting or upload candidate resumes to get started with AI-powered matching.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/jobs" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-button shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Job
              </Link>
              <Link 
                to="/candidates" 
                className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-button text-primary bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Resumes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-text">
          <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-primary flex items-center">
                <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                IKF Recruit Suite
              </Link>
              <Navigation />
            </div>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:jobId/matches" element={<MatchingPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/shortlist" element={<ShortlistPage />} />
              <Route path="/calendar" element={<div className="p-8 text-center">Calendar page coming soon</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}