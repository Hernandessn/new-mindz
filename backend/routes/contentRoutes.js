import express from 'express';
import { content, confirmContent, getContents, getContentById } from '../controllers/contentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();


// Content
router.post('/uploads', authMiddleware, uploadMiddleware.single('file'), content);
router.post('/confirm', authMiddleware, confirmContent);
router.get('/', authMiddleware, getContents);
router.get('/:id', authMiddleware, getContentById);

export { router }