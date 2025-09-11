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
const jobs: any[] = [];
app.post('/api/jobs', (req: Request, res: Response) => {
  const id = String(jobs.length + 1);
  const job = { id, status: 'draft', created_at: new Date().toISOString(), ...req.body };
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
  const threshold = Number(req.query.threshold ?? 70);
  const result = candidates
    .map(c => ({
      candidate: c,
      match_score: Math.floor(60 + Math.random() * 40),
      breakdown: { skills: 30, experience: 30, location: 20, role_fit: 20 }
    }))
    .filter(m => m.match_score >= threshold);
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


