import { supabase } from '../lib/supabase';
import type { ApiResponse, Job, Candidate, MatchScore, JobCreateRequest } from '../types';

export const supabaseApi = {
  // Jobs
  jobs: {
    getAll: async (): Promise<ApiResponse<Job[]>> => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { status: 'ok', data: data || [], errors: [] };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        return { status: 'error', data: null, errors: [{ code: 'FETCH_JOBS_ERROR' }] };
      }
    },

    create: async (job: JobCreateRequest): Promise<ApiResponse<Job>> => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .insert([{
            title: job.title,
            description: job.description,
            skills: job.skills || [],
            location: job.location,
            experience_min: job.experience_min || 0,
            experience_max: job.experience_max || 10,
            salary_band: job.salary_band,
            status: 'draft',
            auto_match: job.auto_match !== false
          }])
          .select()
          .single();

        if (error) throw error;
        return { status: 'ok', data, errors: [] };
      } catch (error) {
        console.error('Error creating job:', error);
        return { status: 'error', data: null, errors: [{ code: 'CREATE_JOB_ERROR' }] };
      }
    },

    getById: async (id: string): Promise<ApiResponse<Job>> => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          return { status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] };
        }
        return { status: 'ok', data, errors: [] };
      } catch (error) {
        console.error('Error fetching job:', error);
        return { status: 'error', data: null, errors: [{ code: 'FETCH_JOB_ERROR' }] };
      }
    },

    getMatches: async (jobId: string, threshold: number = 70): Promise<ApiResponse<MatchScore[]>> => {
      try {
        // Get job details
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (jobError || !job) {
          return { status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] };
        }

        // Get all candidates
        const { data: candidates, error: candidatesError } = await supabase
          .from('candidates')
          .select('*');

        if (candidatesError) throw candidatesError;

        // Calculate matches
        const result = (candidates || []).map(candidate => {
          // Calculate skill match
          const jobSkills = job.skills || [];
          const candidateSkills = candidate.skills || [];
          const matchingSkills = jobSkills.filter(skill => 
            candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs.toLowerCase()))
          );
          const skillScore = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 100 : 0;

          // Calculate experience match
          const candidateExp = candidate.experience_years || 0;
          const minExp = job.experience_min || 0;
          const maxExp = job.experience_max || 10;
          let expScore = 0;
          if (candidateExp >= minExp && candidateExp <= maxExp) {
            expScore = 100;
          } else if (candidateExp < minExp) {
            expScore = Math.max(0, (candidateExp / minExp) * 80);
          } else {
            expScore = Math.max(0, 100 - ((candidateExp - maxExp) / maxExp) * 50);
          }

          // Calculate location match (simplified)
          const locationScore = job.location === 'Remote' ? 100 : 80;

          // Calculate role fit (based on job title keywords)
          const jobTitle = job.title.toLowerCase();
          const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
          let roleFitScore = 50; // Base score
          if (jobTitle.includes('react') && candidateSkillsLower.some(s => s.includes('react'))) roleFitScore += 30;
          if (jobTitle.includes('full stack') && candidateSkillsLower.length >= 4) roleFitScore += 20;
          if (jobTitle.includes('frontend') && candidateSkillsLower.some(s => ['css', 'html', 'javascript', 'vue', 'angular'].includes(s))) roleFitScore += 20;
          if (jobTitle.includes('backend') && candidateSkillsLower.some(s => ['python', 'java', 'node', 'django', 'spring'].includes(s))) roleFitScore += 20;
          roleFitScore = Math.min(100, roleFitScore);

          // Calculate overall score
          const overallScore = Math.round(
            (skillScore * 0.4) + 
            (expScore * 0.3) + 
            (locationScore * 0.1) + 
            (roleFitScore * 0.2)
          );

          return {
            candidate_id: candidate.id,
            score: Math.max(0, Math.min(100, overallScore)),
            breakdown: {
              skills: Math.round(skillScore),
              experience: Math.round(expScore),
              location: Math.round(locationScore),
              role_fit: Math.round(roleFitScore)
            }
          };
        })
        .filter(m => m.score >= threshold)
        .sort((a, b) => b.score - a.score);

        return { status: 'ok', data: result, errors: [] };
      } catch (error) {
        console.error('Error calculating matches:', error);
        return { status: 'error', data: null, errors: [{ code: 'CALCULATE_MATCHES_ERROR' }] };
      }
    }
  },

  // Candidates
  candidates: {
    getAll: async (): Promise<ApiResponse<Candidate[]>> => {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { status: 'ok', data: data || [], errors: [] };
      } catch (error) {
        console.error('Error fetching candidates:', error);
        return { status: 'error', data: null, errors: [{ code: 'FETCH_CANDIDATES_ERROR' }] };
      }
    },

    create: async (candidate: Omit<Candidate, 'id' | 'created_at'>): Promise<ApiResponse<Candidate>> => {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .insert([candidate])
          .select()
          .single();

        if (error) throw error;
        return { status: 'ok', data, errors: [] };
      } catch (error) {
        console.error('Error creating candidate:', error);
        return { status: 'error', data: null, errors: [{ code: 'CREATE_CANDIDATE_ERROR' }] };
      }
    },

    updateStatus: async (candidateId: string, status: Candidate['status']): Promise<ApiResponse<Candidate>> => {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .update({ status })
          .eq('id', candidateId)
          .select()
          .single();

        if (error) throw error;
        return { status: 'ok', data, errors: [] };
      } catch (error) {
        console.error('Error updating candidate status:', error);
        return { status: 'error', data: null, errors: [{ code: 'UPDATE_CANDIDATE_ERROR' }] };
      }
    }
    ,
    delete: async (candidateId: string): Promise<ApiResponse<null>> => {
      try {
        const { error } = await supabase
          .from('candidates')
          .delete()
          .eq('id', candidateId);
        if (error) throw error;
        return { status: 'ok', data: null, errors: [] };
      } catch (error) {
        console.error('Error deleting candidate:', error);
        return { status: 'error', data: null, errors: [{ code: 'DELETE_CANDIDATE_ERROR' }] };
      }
    }
  }
};
