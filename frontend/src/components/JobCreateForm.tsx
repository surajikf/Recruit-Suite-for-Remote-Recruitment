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
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-gray-900">{mode === 'edit' ? 'Edit Job' : 'Create New Job'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input"
                placeholder="e.g., Senior React Developer"
                required
              />
            </div>

            <div>
              <label className="label">
                Job Description
              </label>
              <div className="flex gap-2">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input resize-none flex-1"
                  rows={4}
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generateJobDescriptionMutation.isPending || !formData.title || formData.skills.length === 0}
                  className="btn btn-secondary self-start"
                  title="Generate AI-powered job description"
                >
                  {generateJobDescriptionMutation.isPending ? (
                    <div className="loading-spinner w-4 h-4"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="label">
                Required Skills *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="input flex-1"
                  placeholder="Add a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-primary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge badge-primary"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-danger-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="input"
                  placeholder="e.g., Remote, New York, NY"
                />
              </div>
              <div>
                <label className="label">
                  Experience Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.experience_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_min: parseInt(e.target.value) || 0 }))}
                    className="input"
                    placeholder="Min"
                    min="0"
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <input
                    type="number"
                    value={formData.experience_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_max: parseInt(e.target.value) || 10 }))}
                    className="input"
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
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="auto_match" className="ml-2 text-sm text-gray-700">
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
            {isLoading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Job' : 'Create Job')}
          </button>
        </div>
      </div>
    </div>
  );
}
