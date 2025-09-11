import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', data: { service: 'ikf-recruit-backend' }, errors: [] });
});

// Jobs endpoints (MVP stubs)
const jobs: any[] = [
  {
    id: 'job-1',
    title: 'Senior React Developer',
    description: 'We are looking for a senior React developer to join our team. You will be responsible for building user-facing features and components.',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
    location: 'Remote',
    experience_min: 5,
    experience_max: 10,
    status: 'published',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin',
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer',
    description: 'Join our growing team as a full stack developer. You will work on both frontend and backend systems.',
    skills: ['JavaScript', 'Python', 'Django', 'PostgreSQL', 'Redis'],
    location: 'New York, NY',
    experience_min: 3,
    experience_max: 7,
    status: 'published',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin',
  },
  {
    id: 'job-3',
    title: 'Frontend Developer',
    description: 'We need a frontend developer to help us build beautiful user interfaces.',
    skills: ['Vue.js', 'CSS', 'Figma', 'Webpack', 'JavaScript'],
    location: 'San Francisco, CA',
    experience_min: 2,
    experience_max: 5,
    status: 'draft',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin',
  }
];

app.get('/api/jobs', (_req: Request, res: Response) => {
  res.json({ status: 'ok', data: jobs, errors: [] });
});

app.post('/api/jobs', (req: Request, res: Response) => {
  const id = `job-${Date.now()}`;
  const job = { id, status: 'draft', created_at: new Date().toISOString(), created_by: 'admin', ...req.body };
  jobs.push(job);
  res.status(201).json({ status: 'ok', data: job, errors: [] });
});

app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] });
  res.json({ status: 'ok', data: job, errors: [] });
});

// Candidates endpoints (mock)
const candidates: any[] = [
  {
    id: 'candidate-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0101',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
    experience_years: 5,
    status: 'new',
    resumes: ['sarah_johnson_resume.pdf'],
    parsed_text: 'Experienced Full Stack Developer with 5+ years in React and Node.js. Led development of microservices architecture serving 100k+ users. Strong background in AWS cloud infrastructure and containerization.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'candidate-2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0102',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Kubernetes'],
    experience_years: 7,
    status: 'screened',
    resumes: ['michael_chen_resume.pdf'],
    parsed_text: 'Senior Backend Engineer specializing in Python and Django. Built scalable APIs handling millions of requests. Expert in database optimization and distributed systems.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'candidate-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0103',
    skills: ['Vue.js', 'JavaScript', 'CSS', 'Figma', 'Webpack'],
    experience_years: 3,
    status: 'shortlisted',
    resumes: ['emily_rodriguez_resume.pdf'],
    parsed_text: 'Frontend Developer passionate about creating beautiful user experiences. Strong in Vue.js and modern CSS. Experience with design systems and component libraries.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'candidate-4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1-555-0104',
    skills: ['Java', 'Spring Boot', 'Microservices', 'MongoDB', 'Docker'],
    experience_years: 6,
    status: 'interviewed',
    resumes: ['david_kim_resume.pdf'],
    parsed_text: 'Java Developer with expertise in Spring Boot and microservices architecture. Led team of 5 developers in building enterprise applications. Strong background in database design and performance optimization.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'candidate-5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1-555-0105',
    skills: ['React Native', 'iOS', 'Android', 'Firebase', 'GraphQL'],
    experience_years: 4,
    status: 'hired',
    resumes: ['lisa_wang_resume.pdf'],
    parsed_text: 'Mobile Developer with cross-platform expertise in React Native. Built and launched 3 mobile apps with 50k+ downloads. Strong in native iOS and Android development.',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

app.get('/api/candidates', (_req: Request, res: Response) => {
  res.json({ status: 'ok', data: candidates, errors: [] });
});

// Matches (mock scoring)
app.get('/api/jobs/:id/matches', (req: Request, res: Response) => {
  const jobId = req.params.id;
  const threshold = Number(req.query.threshold ?? 70);
  
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] });
  }

  const result = candidates.map(candidate => {
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
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ status: 'error', data: null, errors: [{ code: 'INTERNAL_ERROR' }] });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


