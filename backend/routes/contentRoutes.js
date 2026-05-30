import express from 'express';
import content from '../controllers/contentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.post('/uploads', authMiddleware, uploadMiddleware.single('file'), content);
// Content
router.post('/uploads', uploadMiddleware.single('file'), content);

export { router }