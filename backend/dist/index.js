"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase_1 = require("./lib/supabase");
const gemini_1 = require("./lib/gemini");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '2mb' }));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:4000';
const uploadsRoot = path_1.default.resolve('uploads');
const resumesDir = path_1.default.join(uploadsRoot, 'resumes');
try {
    fs_1.default.mkdirSync(resumesDir, { recursive: true });
}
catch { }
app.use('/uploads', express_1.default.static(uploadsRoot));
// Serve frontend static build
const frontendDist = path_1.default.resolve('../frontend/dist');
try {
    app.use(express_1.default.static(frontendDist));
}
catch { }
// Ensure default admin exists in Supabase Auth and app_users
async function ensureDefaultAdmin() {
    const adminEmail = 'admin@admin.com';
    const adminPassword = '12345';
    try {
        // Try to create user; if exists, this will error with duplicate
        // We ignore duplicate errors by checking error.message
        const createRes = await supabase_1.supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        });
        if (createRes.error && !String(createRes.error.message || '').toLowerCase().includes('already registered')) {
            console.warn('Admin createUser error (ignored if already exists):', createRes.error.message);
        }
        // Fetch the auth user by listing and filtering by email (no direct getByEmail in v2)
        let authUser = null;
        const { data: listData, error: listError } = await supabase_1.supabase.auth.admin.listUsers({ perPage: 1000, page: 1 });
        if (listError) {
            console.warn('listUsers error:', listError.message);
        }
        else {
            authUser = (listData?.users || []).find((u) => u.email?.toLowerCase() === adminEmail) || null;
        }
        // Upsert into app_users with approved admin role
        const { error: upsertError } = await supabase_1.supabase
            .from('app_users')
            .upsert({
            id: authUser?.id,
            email: adminEmail,
            name: 'Administrator',
            signup_method: 'email',
            role: 'admin',
            is_approved: true
        }, { onConflict: 'email' });
        if (upsertError) {
            console.error('Error upserting admin into app_users:', upsertError);
        }
        else {
            console.log('Default admin is ensured.');
        }
    }
    catch (err) {
        console.error('ensureDefaultAdmin failed:', err.message || err);
    }
}
// Healthcheck
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', data: { service: 'ikf-recruit-backend' }, errors: [] });
});
// Skip cloud Storage ensure in dev; we write locally under /uploads
// Jobs endpoints with Supabase
app.get('/api/jobs', async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({ status: 'ok', data: data || [], errors: [] });
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'FETCH_JOBS_ERROR' }] });
    }
});
app.post('/api/jobs', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.status(201).json({ status: 'ok', data, errors: [] });
    }
    catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'CREATE_JOB_ERROR' }] });
    }
});
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('jobs')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (error)
            throw error;
        if (!data) {
            return res.status(404).json({ status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] });
        }
        res.json({ status: 'ok', data, errors: [] });
    }
    catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'FETCH_JOB_ERROR' }] });
    }
});
// Candidates endpoints with Supabase
app.get('/api/candidates', async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({ status: 'ok', data: data || [], errors: [] });
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'FETCH_CANDIDATES_ERROR' }] });
    }
});
app.post('/api/candidates', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.status(201).json({ status: 'ok', data, errors: [] });
    }
    catch (error) {
        console.error('Error creating candidate:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'CREATE_CANDIDATE_ERROR' }] });
    }
});
// Upload resumes and create candidates with AI processing
app.post('/api/upload/resumes', upload.array('files'), async (req, res) => {
    try {
        const files = req.files || [];
        if (files.length === 0)
            return res.json({ status: 'ok', data: [], errors: [] });
        const created = [];
        for (const file of files) {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const objectPath = `${Date.now()}-${safeName}`;
            // Always save locally for reliability
            const localPath = path_1.default.join(resumesDir, objectPath);
            fs_1.default.writeFileSync(localPath, file.buffer);
            const publicUrl = `${publicBaseUrl}/uploads/resumes/${objectPath}`;
            // Extract text from resume (simplified - in production, use a proper PDF parser)
            let resumeText = '';
            if (file.mimetype === 'text/plain') {
                resumeText = file.buffer.toString('utf-8');
            }
            else {
                // For PDFs and other formats, we'll use a placeholder
                resumeText = `Resume: ${file.originalname}\n\nThis is a placeholder for resume content. In a production environment, you would use a proper PDF parser to extract text from the uploaded file.`;
            }
            // Use AI to analyze the resume
            let analysis;
            try {
                analysis = await gemini_1.geminiService.analyzeResume(resumeText);
            }
            catch (aiError) {
                console.warn('AI analysis failed, using fallback:', aiError);
                // Fallback to basic parsing
                const baseName = safeName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
                analysis = {
                    name: baseName || 'Unnamed Candidate',
                    email: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@placeholder.local`,
                    phone: '',
                    skills: [],
                    experience_years: 0,
                    education: [],
                    summary: '',
                    achievements: [],
                    parsed_text: resumeText
                };
            }
            const { data, error } = await supabase_1.supabase
                .from('candidates')
                .insert([
                {
                    name: analysis.name,
                    email: analysis.email,
                    phone: analysis.phone,
                    skills: analysis.skills,
                    experience_years: analysis.experience_years,
                    status: 'new',
                    resumes: [publicUrl],
                    parsed_text: analysis.parsed_text
                }
            ])
                .select()
                .single();
            if (error)
                throw error;
            created.push(data);
        }
        res.status(201).json({ status: 'ok', data: created, errors: [] });
    }
    catch (error) {
        console.error('Error uploading resumes:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'UPLOAD_RESUMES_ERROR', message: error.message }] });
    }
});
// Users management endpoints (Admin UI)
app.get('/api/users', async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('app_users')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({ status: 'ok', data: data || [], errors: [] });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'FETCH_USERS_ERROR' }] });
    }
});
app.post('/api/users/:id/approve', async (req, res) => {
    try {
        const { approved } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('app_users')
            .update({ is_approved: !!approved })
            .eq('id', req.params.id)
            .select('*')
            .single();
        if (error)
            throw error;
        res.json({ status: 'ok', data, errors: [] });
    }
    catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'APPROVE_USER_ERROR' }] });
    }
});
app.post('/api/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('app_users')
            .update({ role })
            .eq('id', req.params.id)
            .select('*')
            .single();
        if (error)
            throw error;
        res.json({ status: 'ok', data, errors: [] });
    }
    catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'UPDATE_USER_ROLE_ERROR' }] });
    }
});
// AI-Powered Smart Matching
app.get('/api/jobs/:id/matches', async (req, res) => {
    try {
        const jobId = req.params.id;
        const threshold = Number(req.query.threshold ?? 70);
        const useAI = req.query.ai === 'true';
        // Get job details
        const { data: job, error: jobError } = await supabase_1.supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
        if (jobError || !job) {
            return res.status(404).json({ status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] });
        }
        // Get all candidates
        const { data: candidates, error: candidatesError } = await supabase_1.supabase
            .from('candidates')
            .select('*');
        if (candidatesError)
            throw candidatesError;
        let result;
        if (useAI) {
            // Use AI-powered matching
            const aiMatches = [];
            for (const candidate of candidates || []) {
                try {
                    const candidateText = candidate.parsed_text || '';
                    const jobDescription = job.description || '';
                    const jobSkills = job.skills || [];
                    const match = await gemini_1.geminiService.matchCandidateToJob(candidateText, jobDescription, jobSkills);
                    match.candidate_id = candidate.id;
                    match.candidate_name = candidate.name;
                    if (match.match_score >= threshold) {
                        aiMatches.push({
                            candidate,
                            match_score: match.match_score,
                            ai_analysis: {
                                matching_skills: match.matching_skills,
                                missing_skills: match.missing_skills,
                                reasons: match.reasons
                            }
                        });
                    }
                }
                catch (aiError) {
                    console.warn('AI matching failed for candidate:', candidate.id, aiError);
                    // Fallback to basic matching
                }
            }
            result = aiMatches.sort((a, b) => b.match_score - a.match_score);
        }
        else {
            // Use traditional matching algorithm
            result = (candidates || []).map(candidate => {
                // Calculate skill match
                const jobSkills = job.skills || [];
                const candidateSkills = candidate.skills || [];
                const matchingSkills = jobSkills.filter((skill) => candidateSkills.some((cs) => cs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs.toLowerCase())));
                const skillScore = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 100 : 0;
                // Calculate experience match
                const candidateExp = candidate.experience_years || 0;
                const minExp = job.experience_min || 0;
                const maxExp = job.experience_max || 10;
                let expScore = 0;
                if (candidateExp >= minExp && candidateExp <= maxExp) {
                    expScore = 100;
                }
                else if (candidateExp < minExp) {
                    expScore = Math.max(0, (candidateExp / minExp) * 80);
                }
                else {
                    expScore = Math.max(0, 100 - ((candidateExp - maxExp) / maxExp) * 50);
                }
                // Calculate location match (simplified)
                const locationScore = job.location === 'Remote' ? 100 : 80;
                // Calculate role fit (based on job title keywords)
                const jobTitle = job.title.toLowerCase();
                const candidateSkillsLower = candidateSkills.map((s) => s.toLowerCase());
                let roleFitScore = 50; // Base score
                if (jobTitle.includes('react') && candidateSkillsLower.some((s) => s.includes('react')))
                    roleFitScore += 30;
                if (jobTitle.includes('full stack') && candidateSkillsLower.length >= 4)
                    roleFitScore += 20;
                if (jobTitle.includes('frontend') && candidateSkillsLower.some((s) => ['css', 'html', 'javascript', 'vue', 'angular'].includes(s)))
                    roleFitScore += 20;
                if (jobTitle.includes('backend') && candidateSkillsLower.some((s) => ['python', 'java', 'node', 'django', 'spring'].includes(s)))
                    roleFitScore += 20;
                roleFitScore = Math.min(100, roleFitScore);
                // Calculate overall score
                const overallScore = Math.round((skillScore * 0.4) +
                    (expScore * 0.3) +
                    (locationScore * 0.1) +
                    (roleFitScore * 0.2));
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
        }
        res.json({ status: 'ok', data: result, errors: [] });
    }
    catch (error) {
        console.error('Error calculating matches:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'CALCULATE_MATCHES_ERROR' }] });
    }
});
// AI-Powered Job Description Generation
app.post('/api/ai/generate-job-description', async (req, res) => {
    try {
        const { title, requirements } = req.body;
        if (!title || !requirements) {
            return res.status(400).json({ status: 'error', data: null, errors: [{ code: 'MISSING_PARAMETERS' }] });
        }
        const description = await gemini_1.geminiService.generateJobDescription(title, requirements);
        res.json({ status: 'ok', data: { description }, errors: [] });
    }
    catch (error) {
        console.error('Error generating job description:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'GENERATE_JOB_DESCRIPTION_ERROR' }] });
    }
});
// AI-Powered Interview Questions Generation
app.post('/api/ai/generate-interview-questions', async (req, res) => {
    try {
        const { jobTitle, skills } = req.body;
        if (!jobTitle || !skills) {
            return res.status(400).json({ status: 'error', data: null, errors: [{ code: 'MISSING_PARAMETERS' }] });
        }
        const questions = await gemini_1.geminiService.generateInterviewQuestions(jobTitle, skills);
        res.json({ status: 'ok', data: { questions }, errors: [] });
    }
    catch (error) {
        console.error('Error generating interview questions:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'GENERATE_INTERVIEW_QUESTIONS_ERROR' }] });
    }
});
// AI-Powered Hiring Insights
app.get('/api/ai/insights', async (_req, res) => {
    try {
        // Get all candidates and jobs
        const { data: candidates, error: candidatesError } = await supabase_1.supabase
            .from('candidates')
            .select('*');
        const { data: jobs, error: jobsError } = await supabase_1.supabase
            .from('jobs')
            .select('*');
        if (candidatesError || jobsError) {
            throw candidatesError || jobsError;
        }
        const insights = await gemini_1.geminiService.analyzeHiringTrends(candidates || [], jobs || []);
        res.json({ status: 'ok', data: { insights }, errors: [] });
    }
    catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({ status: 'error', data: null, errors: [{ code: 'GENERATE_INSIGHTS_ERROR' }] });
    }
});
// Serve SPA index.html for non-API routes
app.get(/^(?!\/api).*/, (_req, res) => {
    try {
        const indexPath = path_1.default.join(frontendDist, 'index.html');
        res.sendFile(indexPath);
    }
    catch {
        res.status(404).send('Not Found');
    }
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'INTERNAL_ERROR' }] });
});
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    if (hasServiceKey) {
        ensureDefaultAdmin();
    }
    else {
        console.log('Skipping admin bootstrap (no valid service role key).');
    }
});
//# sourceMappingURL=index.js.map