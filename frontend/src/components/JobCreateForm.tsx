import { useState, useEffect } from 'react';
import type { JobCreateRequest, Job } from '../types';

interface JobCreateFormProps {
  onSubmit: (job: JobCreateRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Job | null;
  mode?: 'create' | 'edit';
}

export default function JobCreateForm({ onSubmit, onCancel, isLoading, initialData, mode = 'create' }: JobCreateFormProps) {
  const [formData, setFormData] = useState<JobCreateRequest>({
    title: '',
    description: '',
    skills: [],
    location: '',
    experience_min: 0,
    experience_max: 10,
    auto_match: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        skills: initialData.skills || [],
        location: initialData.location || '',
        experience_min: initialData.experience_min || 0,
        experience_max: initialData.experience_max || 10,
        salary_band: initialData.salary_band,
        auto_match: initialData.auto_match !== false,
      });
    }
  }, [initialData, mode]);

  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.skills.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{mode === 'edit' ? 'Edit Job' : 'Create New Job'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
                placeholder="e.g., Senior React Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Job Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
                rows={4}
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Required Skills *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
                  placeholder="Add a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#0B79D0]/10 text-[#0B79D0] rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
                  placeholder="e.g., Remote, New York, NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Experience Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.experience_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_min: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
                    placeholder="Min"
                    min="0"
                  />
                  <span className="flex items-center text-slate-500">to</span>
                  <input
                    type="number"
                    value={formData.experience_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_max: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B79D0] focus:border-transparent"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_match"
                checked={formData.auto_match}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_match: e.target.checked }))}
                className="h-4 w-4 text-[#0B79D0] focus:ring-[#0B79D0] border-slate-300 rounded"
              />
              <label htmlFor="auto_match" className="ml-2 text-sm text-slate-700">
                Enable auto-matching with uploaded resumes
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title || formData.skills.length === 0}
                className="px-4 py-2 bg-[#0B79D0] text-white rounded-lg hover:bg-[#0a6cb9] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Job' : 'Create Job')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
