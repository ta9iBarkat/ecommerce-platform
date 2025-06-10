import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import connectDB  from './config/db.js';

connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));


// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;