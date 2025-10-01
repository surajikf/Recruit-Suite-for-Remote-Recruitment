import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useJobs } from '../hooks/useJobs'
import { useCandidates } from '../hooks/useCandidates'
import type { Job, Candidate } from '../types'

// Navigation items - Calendar removed
const nav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/jobs', label: 'Jobs', icon: '💼' },
  { to: '/candidates', label: 'Candidates', icon: '👥' },
  { to: '/shortlist', label: 'Pipeline', icon: '🔄' },
  { to: '/reports', label: 'Reports', icon: '📈' },
]

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  const { data: jobs = [] } = useJobs()
  const { data: candidates = [] } = useCandidates()

  // Filter results based on search query
  const searchResults = {
    jobs: searchQuery.trim() ? jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.skills || []).some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5) : [],
    candidates: searchQuery.trim() ? candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.skills || []).some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5) : []
  }

  const hasResults = searchResults.jobs.length > 0 || searchResults.candidates.length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleJobClick = (job: Job) => {
    setSearchQuery('')
    setShowResults(false)
    navigate(`/jobs`)
  }

  const handleCandidateClick = (candidate: Candidate) => {
    setSearchQuery('')
    setShowResults(false)
    navigate(`/candidates`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center group-hover:bg-primary-700 transition-colors duration-200">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
            </svg>
          </div>
          <div className="ml-3 hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900">IKF Recruit Suite</h1>
            <p className="text-xs text-gray-500">Professional Recruitment Platform</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map(item => {
            const active = location.pathname === item.to
            return (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center">
            <div className="relative" ref={searchRef}>
              <input 
                className="input w-72 pl-10" 
                placeholder="Search jobs, candidates, skills..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              
              {/* Search Results Dropdown */}
              {showResults && searchQuery.trim() && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {!hasResults ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <>
                      {/* Jobs Section */}
                      {searchResults.jobs.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Jobs ({searchResults.jobs.length})
                          </div>
                          {searchResults.jobs.map(job => (
                            <button
                              key={job.id}
                              onClick={() => handleJobClick(job)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="font-medium text-gray-900 text-sm">{job.title}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <span>{job.location || 'Remote'}</span>
                                {job.skills && job.skills.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{job.skills.slice(0, 3).join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Candidates Section */}
                      {searchResults.candidates.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Candidates ({searchResults.candidates.length})
                          </div>
                          {searchResults.candidates.map(candidate => (
                            <button
                              key={candidate.id}
                              onClick={() => handleCandidateClick(candidate)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="font-medium text-gray-900 text-sm">{candidate.name}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <span>{candidate.email}</span>
                                {candidate.skills && candidate.skills.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{candidate.skills.slice(0, 3).join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button className="btn btn-secondary btn-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z"/>
            </svg>
            Reminders
          </button>
          
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}


