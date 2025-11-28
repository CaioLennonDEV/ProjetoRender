import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cronogramaRoutes from './api/routes/cronograma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const distDir = join(__dirname, 'dist');

const app = express();

// Middlewares para API
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/cronograma', cronogramaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Servir arquivos estáticos
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(filePath: string, res: express.Response): void {
  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) {
      res.status(404).send('404 Not Found');
      return;
    }

    const content = readFileSync(filePath);
    const contentType = getContentType(filePath);
    
    res.setHeader('Content-Type', contentType);
    res.send(content);
  } catch (error) {
    res.status(404).send('404 Not Found');
  }
}

// Middleware para servir arquivos estáticos (após as rotas da API)
app.use((req, res, next) => {
  // Se já foi respondido pela API, não fazer nada
  if (res.headersSent) {
    return;
  }

  // Se é uma rota da API, passar para o próximo middleware
  if (req.path.startsWith('/api/')) {
    return next();
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = filePath.split('?')[0]; // Remove query string
  
  // Resolve full path
  const fullPath = join(distDir, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(distDir)) {
    res.status(403).send('403 Forbidden');
    return;
  }

  // Try to serve the file
  try {
    const stats = statSync(fullPath);
    if (stats.isFile()) {
      serveFile(fullPath, res);
      return;
    }
  } catch (error) {
    // File doesn't exist, try index.html for SPA routing
  }

  // For SPA: serve index.html for all routes
  const indexPath = join(distDir, 'index.html');
  serveFile(indexPath, res);
});

const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos estáticos de: ${distDir}`);
  console.log(`🔌 API disponível em: http://0.0.0.0:${PORT}/api`);
});

