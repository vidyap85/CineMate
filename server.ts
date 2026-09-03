import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { sanitizeRequestBodyMiddleware } from './server/middleware/sanitizer.js';
import { projectRouter } from './server/routes/projectRoutes.js';
import { geminiRouter } from './server/routes/geminiRoutes.js';
import { weatherRouter } from './server/routes/weatherRoutes.js';
import { slackRouter } from './server/routes/slackRoutes.js';
import { observabilityRouter } from './server/routes/observabilityRoutes.js';
import { threatModelRouter } from './server/routes/threatModelRoutes.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // 1. Mandatory Top-Level Request Deserialization (Ordering Guarantee)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(sanitizeRequestBodyMiddleware);

  // 2. Health & Telemetry endpoints
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'CineGemini',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      capabilities: ['SERVER_SIDE_GEMINI', 'SECRET_MANAGER', 'SOLAR_CALC', 'SLACK_COLLAB', 'WEATHER_API'],
    });
  });

  // 3. Mount Backend API Routes FIRST
  app.use('/api/projects', projectRouter);
  app.use('/api/projects', geminiRouter);
  app.use('/api/projects', weatherRouter);
  app.use('/api/projects', slackRouter);
  app.use('/api/observability', observabilityRouter);
  app.use('/api/threat-model', threatModelRouter);

  // 4. Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Start listening on 0.0.0.0:3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 CineGemini Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
