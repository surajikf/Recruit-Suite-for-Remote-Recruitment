-- IKF Recruit Suite Database Schema

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  skills TEXT[] DEFAULT '{}',
  location TEXT,
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER DEFAULT 10,
  salary_band TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  auto_match BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'screened', 'shortlisted', 'interviewed', 'rejected', 'hired')),
  resumes TEXT[] DEFAULT '{}',
  parsed_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job matches table
CREATE TABLE job_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize based on your auth needs)
CREATE POLICY "Allow all operations on jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all operations on candidates" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow all operations on job_matches" ON job_matches FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_created_at ON candidates(created_at);
CREATE INDEX idx_job_matches_job_id ON job_matches(job_id);
CREATE INDEX idx_job_matches_candidate_id ON job_matches(candidate_id);
CREATE INDEX idx_job_matches_score ON job_matches(match_score);
