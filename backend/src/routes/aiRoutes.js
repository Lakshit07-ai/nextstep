import express from 'express';
import { analyzeResumeHandler, improveContentHandler } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/analyze-resume', analyzeResumeHandler);
router.post('/improve-content', improveContentHandler);

export default router;
