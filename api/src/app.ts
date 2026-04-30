import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFound } from './middleware/notFound';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import documentRoutes from './routes/document.routes';
import aiRoutes from './routes/ai.routes';
import academicRoutes from './routes/academic.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/academic', academicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(notFound);

export default app;
