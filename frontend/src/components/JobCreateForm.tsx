import { useState, useEffect } from 'react';
import type { JobCreateRequest, Job } from '../types';
import { useGenerateJobDescription } from '../hooks/useAI';

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

  const generateJobDescriptionMutation = useGenerateJobDescription();

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

  const handleGenerateDescription = async () => {
    if (!formData.title || formData.skills.length === 0) {
      alert('Please enter a job title and at least one skill before generating description');
      return;
    }

    try {
      const result = await generateJobDescriptionMutation.mutateAsync({
        title: formData.title,
        requirements: formData.skills
      });
      
      setFormData(prev => ({
        ...prev,
        description: result.description
      }));
    } catch (error) {
      console.error('Failed to generate job description:', error);
      alert('Failed to generate job description. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.skills.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Job' : 'Create New Job'}</h2>
          <button 
            onClick={onCancel} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Senior React Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <div className="flex gap-3">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  rows={5}
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generateJobDescriptionMutation.isPending || !formData.title || formData.skills.length === 0}
                  className="btn btn-secondary self-start shrink-0"
                  title="Generate AI-powered job description"
                >
                  {generateJobDescriptionMutation.isPending ? (
                    <div className="loading-spinner w-5 h-5"></div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>AI</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Type a skill and press Enter or click Add"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-primary shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-blue-200 rounded transition-colors p-0.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Remote, New York, NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Range (years)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={formData.experience_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_min: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Min"
                    min="0"
                  />
                  <span className="text-gray-500 font-medium">to</span>
                  <input
                    type="number"
                    value={formData.experience_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_max: parseInt(e.target.value) || 10 }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="auto_match"
                checked={formData.auto_match}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_match: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="auto_match" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                Enable auto-matching with uploaded resumes
              </label>
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.title || formData.skills.length === 0}
            className="btn btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="loading-spinner w-4 h-4"></div>
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              mode === 'edit' ? 'Update Job' : 'Create Job'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
