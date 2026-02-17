import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import partsRouter from './routes/parts.js';
import clientsRouter from './routes/clients.js';
import quotesRouter from './routes/quotes.js';
import suppliersRouter from './routes/suppliers.js';
import rfqsRouter from './routes/rfqs.js';
import dashboardRouter from './routes/dashboard.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/parts', partsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/rfqs', rfqsRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));

  // SPA fallback — any non-API route serves index.html
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`SuriParts running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
