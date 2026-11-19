import express from 'express';
import {
  startInterview,
  submitAnswer,
  getSessions,
  getSession,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/start', startInterview);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);
router.post('/sessions/:id/answer', submitAnswer);

export default router;
