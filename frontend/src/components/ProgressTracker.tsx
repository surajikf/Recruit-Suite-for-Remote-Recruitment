import { useJobs } from '../hooks/useJobs';
import { useCandidates } from '../hooks/useCandidates';

export default function ProgressTracker() {
  const { data: jobs = [] } = useJobs();
  const { data: candidates = [] } = useCandidates();

  const published = jobs.filter(j => j.status === 'published').length;
  const drafts = jobs.filter(j => j.status === 'draft').length;
  const shortlisted = candidates.filter(c => c.status === 'shortlisted').length;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-semibold mb-4">Progress</h3>

      <div className="space-y-3 text-sm">
        <Stat label="Total Jobs" value={jobs.length} badgeClass="bg-blue-100 text-blue-700" />
        <Stat label="Published" value={published} badgeClass="bg-green-100 text-green-700" />
        <Stat label="Drafts" value={drafts} badgeClass="bg-yellow-100 text-yellow-800" />
        <div className="h-px bg-gray-100 my-2" />
        <Stat label="Candidates" value={candidates.length} badgeClass="bg-indigo-100 text-indigo-700" />
        <Stat label="Shortlisted" value={shortlisted} badgeClass="bg-emerald-100 text-emerald-700" />
      </div>

      <div className="mt-4">
        <a href="/candidates" className="btn btn-secondary w-full text-center">Manage Candidates</a>
      </div>
    </div>
  );
}

function Stat({ label, value, badgeClass }: { label: string; value: number | string; badgeClass: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${badgeClass}`}>{value}</span>
    </div>
  );
}


