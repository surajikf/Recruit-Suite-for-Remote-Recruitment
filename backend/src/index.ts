import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { supabase } from './lib/supabase';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', data: { service: 'ikf-recruit-backend' }, errors: [] });
});

// Jobs endpoints with Supabase
app.get('/api/jobs', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'ok', data: data || [], errors: [] });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'FETCH_JOBS_ERROR' }] });
  }
});

app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        title: req.body.title,
        description: req.body.description,
        skills: req.body.skills || [],
        location: req.body.location,
        experience_min: req.body.experience_min || 0,
        experience_max: req.body.experience_max || 10,
        salary_band: req.body.salary_band,
        status: 'draft',
        auto_match: req.body.auto_match !== false
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ status: 'ok', data, errors: [] });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'CREATE_JOB_ERROR' }] });
  }
});

app.get('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] });
    }
    res.json({ status: 'ok', data, errors: [] });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'FETCH_JOB_ERROR' }] });
  }
});

// Candidates endpoints with Supabase
app.get('/api/candidates', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'ok', data: data || [], errors: [] });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'FETCH_CANDIDATES_ERROR' }] });
  }
});

app.post('/api/candidates', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .insert([{
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        skills: req.body.skills || [],
        experience_years: req.body.experience_years || 0,
        status: 'new',
        resumes: req.body.resumes || [],
        parsed_text: req.body.parsed_text || ''
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ status: 'ok', data, errors: [] });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'CREATE_CANDIDATE_ERROR' }] });
  }
});

// Matches with Supabase
app.get('/api/jobs/:id/matches', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const threshold = Number(req.query.threshold ?? 70);

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] });
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
        candidate,
        match_score: Math.max(0, Math.min(100, overallScore)),
        breakdown: {
          skills: Math.round(skillScore),
          experience: Math.round(expScore),
          location: Math.round(locationScore),
          role_fit: Math.round(roleFitScore)
        }
      };
    })
    .filter(m => m.match_score >= threshold)
    .sort((a, b) => b.match_score - a.match_score);

    res.json({ status: 'ok', data: result, errors: [] });
  } catch (error) {
    console.error('Error calculating matches:', error);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'CALCULATE_MATCHES_ERROR' }] });
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ status: 'error', data: null, errors: [{ code: 'INTERNAL_ERROR' }] });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});