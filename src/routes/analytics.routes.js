import express from 'express';
import {
  getTopEvents,
  getDailyStats,
  getCancellationRate,
} from '../controllers/analytics.controller.js';

import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin-only access
router.use(verifyJWT);
router.use(authorizeRoles('admin'));

// Routes
router.get('/top-events', getTopEvents);
router.get('/daily-stats', getDailyStats);
router.get('/cancellation-rate', getCancellationRate);

export default router;