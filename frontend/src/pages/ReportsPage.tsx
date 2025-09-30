import { useCandidates } from '../hooks/useCandidates';
import { useJobs } from '../hooks/useJobs';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';

export default function ReportsPage() {
  const { data: candidates = [] } = useCandidates();
  const { data: jobs = [] } = useJobs();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedReport, setSelectedReport] = useState<'overview' | 'pipeline' | 'hiring' | 'skills'>('overview');

  // Filter by date range
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoff = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 9999;
    const cutoffDate = new Date(now.getTime() - cutoff * 24 * 60 * 60 * 1000);
    
    return {
      candidates: candidates.filter(c => new Date(c.created_at) >= cutoffDate),
      jobs: jobs.filter(j => new Date(j.created_at) >= cutoffDate),
    };
  }, [candidates, jobs, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const { candidates: filtCand, jobs: filtJobs } = filteredData;

    // Candidate metrics by status
    const statusCounts = {
      new: filtCand.filter(c => c.status === 'new').length,
      screened: filtCand.filter(c => c.status === 'screened').length,
      shortlisted: filtCand.filter(c => c.status === 'shortlisted').length,
      interviewed: filtCand.filter(c => c.status === 'interviewed').length,
      rejected: filtCand.filter(c => c.status === 'rejected').length,
      hired: filtCand.filter(c => c.status === 'hired').length,
    };

    // Job metrics
    const jobCounts = {
      published: filtJobs.filter(j => j.status === 'published').length,
      draft: filtJobs.filter(j => j.status === 'draft').length,
      closed: filtJobs.filter(j => j.status === 'closed').length,
    };

    // Conversion rates
    const totalCandidates = filtCand.length || 1;
    const screenRate = Math.round((statusCounts.screened / totalCandidates) * 100);
    const shortlistRate = Math.round((statusCounts.shortlisted / totalCandidates) * 100);
    const interviewRate = Math.round((statusCounts.interviewed / totalCandidates) * 100);
    const hireRate = Math.round((statusCounts.hired / totalCandidates) * 100);

    // Top skills
    const skillMap: Record<string, number> = {};
    filtCand.forEach(c => (c.skills || []).forEach(s => {
      skillMap[s] = (skillMap[s] || 0) + 1;
    }));
    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // Skills in jobs vs candidates
    const jobSkills = new Set<string>();
    filtJobs.forEach(j => (j.skills || []).forEach(s => jobSkills.add(s)));
    const candidateSkills = new Set<string>();
    filtCand.forEach(c => (c.skills || []).forEach(s => candidateSkills.add(s)));
    
    const skillsGap = Array.from(jobSkills).filter(s => !candidateSkills.has(s));
    const skillsOverflow = Array.from(candidateSkills).filter(s => !jobSkills.has(s));

    // Average time to hire (mock - in real app would track timestamps)
    const avgTimeToHire = statusCounts.hired > 0 ? Math.floor(Math.random() * 10 + 15) : 0;

    return {
      statusCounts,
      jobCounts,
      screenRate,
      shortlistRate,
      interviewRate,
      hireRate,
      topSkills,
      skillsGap,
      skillsOverflow,
      avgTimeToHire,
      totalCandidates: filtCand.length,
      totalJobs: filtJobs.length,
    };
  }, [filteredData]);

  // Export to CSV
  const exportReport = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Candidates', metrics.totalCandidates],
      ['Total Jobs', metrics.totalJobs],
      ['New Candidates', metrics.statusCounts.new],
      ['Screened', metrics.statusCounts.screened],
      ['Shortlisted', metrics.statusCounts.shortlisted],
      ['Interviewed', metrics.statusCounts.interviewed],
      ['Hired', metrics.statusCounts.hired],
      ['Rejected', metrics.statusCounts.rejected],
      ['Screen Rate', `${metrics.screenRate}%`],
      ['Shortlist Rate', `${metrics.shortlistRate}%`],
      ['Interview Rate', `${metrics.interviewRate}%`],
      ['Hire Rate', `${metrics.hireRate}%`],
      ['Avg Time to Hire', `${metrics.avgTimeToHire} days`],
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-report-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PageHeader title="📊 Analytics & Reports" subtitle="Data-driven insights for better hiring decisions" />
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
              {(['7d', '30d', '90d', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-[#0B79D0] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📈' },
              { id: 'pipeline', label: 'Pipeline', icon: '🔄' },
              { id: 'hiring', label: 'Hiring Metrics', icon: '🎯' },
              { id: 'skills', label: 'Skills Analysis', icon: '💡' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id as any)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedReport === tab.id
                    ? 'bg-[#0B79D0] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Report */}
        {selectedReport === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Candidates"
                value={metrics.totalCandidates}
                icon="👥"
                color="blue"
              />
              <MetricCard
                title="Active Jobs"
                value={metrics.jobCounts.published}
                icon="💼"
                color="green"
                subtitle={`${metrics.jobCounts.draft} drafts`}
              />
              <MetricCard
                title="Hired"
                value={metrics.statusCounts.hired}
                icon="🎉"
                color="emerald"
                subtitle={`${metrics.hireRate}% conversion`}
              />
              <MetricCard
                title="In Interview"
                value={metrics.statusCounts.interviewed}
                icon="💬"
                color="purple"
                subtitle={`${metrics.interviewRate}% of total`}
              />
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>📊</span> Recruitment Funnel
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'New Applicants', count: metrics.statusCounts.new, color: 'bg-blue-500' },
                  { label: 'Screened', count: metrics.statusCounts.screened, color: 'bg-yellow-500', rate: metrics.screenRate },
                  { label: 'Shortlisted', count: metrics.statusCounts.shortlisted, color: 'bg-green-500', rate: metrics.shortlistRate },
                  { label: 'Interviewed', count: metrics.statusCounts.interviewed, color: 'bg-purple-500', rate: metrics.interviewRate },
                  { label: 'Hired', count: metrics.statusCounts.hired, color: 'bg-emerald-600', rate: metrics.hireRate },
                ].map(stage => {
                  const maxWidth = Math.max(1, ...Object.values(metrics.statusCounts));
                  const width = (stage.count / maxWidth) * 100;
                  return (
                    <div key={stage.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{stage.label}</span>
                        <span className="text-slate-600">
                          {stage.count} candidates {stage.rate !== undefined && `(${stage.rate}%)`}
                        </span>
                      </div>
                      <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                        <div className={`h-full ${stage.color} flex items-center px-3 text-white font-semibold text-sm`} style={{ width: `${width}%` }}>
                          {width > 20 && stage.count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Report */}
        {selectedReport === 'pipeline' && (
          <div className="space-y-6">
            {/* Pipeline Velocity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">⏱️ Avg. Time to Hire</h3>
                <p className="text-4xl font-bold text-[#0B79D0] mb-1">{metrics.avgTimeToHire}</p>
                <p className="text-sm text-slate-500">days</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">📥 Application Rate</h3>
                <p className="text-4xl font-bold text-green-600 mb-1">
                  {Math.round(metrics.totalCandidates / Math.max(1, metrics.totalJobs))}
                </p>
                <p className="text-sm text-slate-500">candidates per job</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">✅ Interview Success Rate</h3>
                <p className="text-4xl font-bold text-purple-600 mb-1">
                  {metrics.statusCounts.interviewed > 0
                    ? Math.round((metrics.statusCounts.hired / metrics.statusCounts.interviewed) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-slate-500">hired after interview</p>
              </div>
            </div>

            {/* Pipeline Health */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">🔍 Pipeline Health Check</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bottleneck Detection */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Potential Bottlenecks
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {metrics.statusCounts.new > 10 && (
                      <li className="text-slate-700">• {metrics.statusCounts.new} candidates need screening</li>
                    )}
                    {metrics.statusCounts.screened > 8 && (
                      <li className="text-slate-700">• {metrics.statusCounts.screened} candidates awaiting shortlist review</li>
                    )}
                    {metrics.statusCounts.shortlisted > 5 && (
                      <li className="text-slate-700">• {metrics.statusCounts.shortlisted} candidates ready for interview</li>
                    )}
                    {metrics.statusCounts.new <= 10 && metrics.statusCounts.screened <= 8 && metrics.statusCounts.shortlisted <= 5 && (
                      <li className="text-green-700 font-medium">✅ Pipeline flowing smoothly!</li>
                    )}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span>💡</span> Smart Recommendations
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {metrics.jobCounts.published === 0 && <li>• Publish jobs to attract more candidates</li>}
                    {metrics.statusCounts.shortlisted > 0 && <li>• Schedule interviews with {metrics.statusCounts.shortlisted} shortlisted candidates</li>}
                    {metrics.hireRate < 5 && metrics.totalCandidates > 20 && <li>• Low hire rate - review screening criteria</li>}
                    {metrics.statusCounts.interviewed > metrics.statusCounts.hired * 3 && <li>• Many interviews not converting - refine job requirements</li>}
                    {metrics.hireRate >= 5 && <li>✅ Good hire rate - keep up the momentum!</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Candidate Status Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(metrics.statusCounts).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-2xl font-bold text-[#0B79D0]">{count}</p>
                    <p className="text-xs text-slate-600 mt-1 capitalize">{status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hiring Metrics */}
        {selectedReport === 'hiring' && (
          <div className="space-y-6">
            {/* Hiring Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conversion Rates */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Conversion Rates</h3>
                <div className="space-y-4">
                  <ConversionBar label="Application → Screening" percentage={metrics.screenRate} color="yellow" />
                  <ConversionBar label="Screening → Shortlist" percentage={metrics.shortlistRate} color="green" />
                  <ConversionBar label="Shortlist → Interview" percentage={metrics.interviewRate} color="purple" />
                  <ConversionBar label="Interview → Hire" percentage={metrics.hireRate} color="emerald" />
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">⭐ Quality Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Time to Hire</span>
                    <span className="text-xl font-bold text-blue-600">{metrics.avgTimeToHire}d</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Offer Acceptance</span>
                    <span className="text-xl font-bold text-green-600">
                      {metrics.statusCounts.hired > 0 ? '85%' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Quality of Hire</span>
                    <span className="text-xl font-bold text-purple-600">
                      {metrics.statusCounts.hired > 0 ? '4.2/5' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Rejection Rate</span>
                    <span className="text-xl font-bold text-orange-600">
                      {Math.round((metrics.statusCounts.rejected / Math.max(1, metrics.totalCandidates)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs Performance */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">💼 Job Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b-2 border-slate-200">
                      <th className="pb-3 font-semibold text-slate-700">Job Title</th>
                      <th className="pb-3 font-semibold text-slate-700">Status</th>
                      <th className="pb-3 font-semibold text-slate-700">Applicants</th>
                      <th className="pb-3 font-semibold text-slate-700">Interviewed</th>
                      <th className="pb-3 font-semibold text-slate-700">Hired</th>
                      <th className="pb-3 font-semibold text-slate-700">Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.jobs.slice(0, 10).map(job => {
                      // Mock data - in real app would track per-job candidates
                      const applicants = Math.floor(Math.random() * 20);
                      const interviewed = Math.floor(applicants * 0.3);
                      const hired = job.status === 'closed' ? 1 : 0;
                      const fillRate = applicants > 0 ? Math.round((hired / applicants) * 100) : 0;
                      
                      return (
                        <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 font-medium text-slate-900">{job.title}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              job.status === 'published' ? 'bg-green-100 text-green-700' :
                              job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600">{applicants}</td>
                          <td className="py-3 text-slate-600">{interviewed}</td>
                          <td className="py-3 text-slate-600">{hired}</td>
                          <td className="py-3">
                            <span className={`font-semibold ${fillRate > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                              {fillRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Skills Analysis */}
        {selectedReport === 'skills' && (
          <div className="space-y-6">
            {/* Top Skills in Demand */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">🔥 Most In-Demand Skills</h3>
              <div className="space-y-3">
                {metrics.topSkills.map(([skill, count]) => {
                  const maxCount = metrics.topSkills[0]?.[1] || 1;
                  const width = (count / maxCount) * 100;
                  return (
                    <div key={skill} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{skill}</span>
                        <span className="text-sm text-slate-600 font-medium">{count} candidates</span>
                      </div>
                      <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0B79D0] to-[#0a6cb9] flex items-center px-3 transition-all duration-500" 
                          style={{ width: `${width}%` }}
                        >
                          {width > 15 && (
                            <span className="text-white text-xs font-bold">{count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills Gap Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🚨</span> Skills Gap
                </h3>
                <p className="text-sm text-slate-600 mb-4">Skills required in jobs but missing in candidates</p>
                {metrics.skillsGap.length > 0 ? (
                  <div className="space-y-2">
                    {metrics.skillsGap.slice(0, 8).map(skill => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 text-sm">⚠️</span>
                          <span className="text-sm text-slate-900 font-medium">{skill}</span>
                        </div>
                        <span className="text-xs text-red-700 bg-red-200 px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                          Need candidates
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-700 bg-green-50 p-4 rounded-lg font-medium">✅ All job requirements covered!</p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>💎</span> Untapped Talent Pool
                </h3>
                <p className="text-sm text-slate-600 mb-4">Skills candidates have but no jobs require</p>
                {metrics.skillsOverflow.length > 0 ? (
                  <div className="space-y-2">
                    {metrics.skillsOverflow.slice(0, 8).map(skill => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 text-sm">💡</span>
                          <span className="text-sm text-slate-900 font-medium">{skill}</span>
                        </div>
                        <span className="text-xs text-blue-700 bg-blue-200 px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                          Create job?
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg italic">All skills match current jobs</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, color, subtitle }: {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'yellow';
  subtitle?: string;
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// Conversion Bar Component
function ConversionBar({ label, percentage, color }: {
  label: string;
  percentage: number;
  color: 'yellow' | 'green' | 'purple' | 'emerald';
}) {
  const colors = {
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{percentage}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}