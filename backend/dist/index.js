"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '2mb' }));
// Healthcheck
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', data: { service: 'ikf-recruit-backend' }, errors: [] });
});
// Jobs endpoints (MVP stubs)
const jobs = [];
app.post('/api/jobs', (req, res) => {
    const id = String(jobs.length + 1);
    const job = { id, status: 'draft', created_at: new Date().toISOString(), ...req.body };
    jobs.push(job);
    res.status(201).json({ status: 'ok', data: job, errors: [] });
});
app.get('/api/jobs/:id', (req, res) => {
    const job = jobs.find(j => j.id === req.params.id);
    if (!job)
        return res.status(404).json({ status: 'error', data: null, errors: [{ code: 'JOB_NOT_FOUND' }] });
    res.json({ status: 'ok', data: job, errors: [] });
});
// Candidates endpoints (mock)
const candidates = [];
app.get('/api/candidates', (_req, res) => {
    res.json({ status: 'ok', data: candidates, errors: [] });
});
// Matches (mock scoring)
app.get('/api/jobs/:id/matches', (req, res) => {
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
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ status: 'error', data: null, errors: [{ code: 'INTERNAL_ERROR' }] });
});
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map