import express from 'express';
import { createMatch, getMatches, getMatch, deleteMatch } from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getMatches).post(createMatch);
router.route('/:id').get(getMatch).delete(deleteMatch);

export default router;
