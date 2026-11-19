import express from 'express';
import multer from 'multer';
import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  uploadResume,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  },
});

router.use(protect);

router.route('/').get(getResumes).post(createResume);
router.post('/upload', upload.single('resume'), uploadResume);
router.route('/:id').get(getResume).put(updateResume).delete(deleteResume);

export default router;
