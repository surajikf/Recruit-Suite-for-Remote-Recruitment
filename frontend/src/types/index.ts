export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  experience_min: number;
  experience_max: number;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  created_by: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience_years: number;
  status: 'new' | 'screened' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired';
  resumes: string[];
  parsed_text: string;
  created_at: string;
}

export interface MatchScore {
  candidate: Candidate;
  match_score: number;
  breakdown: {
    skills: number;
    experience: number;
    location: number;
    role_fit: number;
  };
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  data: T | null;
  errors: Array<{ code: string; message?: string }>;
}

export interface JobCreateRequest {
  title: string;
  description: string;
  skills: string[];
  location: string;
  experience_min: number;
  experience_max: number;
  auto_match?: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  signup_method: 'email' | 'google';
  role: 'user' | 'admin' | 'hr';
  is_approved: boolean;
  created_at?: string;
  updated_at?: string;
}