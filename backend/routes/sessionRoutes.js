import express from 'express';
import { getQuestion, startSession, submitAnswer } from '../controllers/sessionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, startSession);
router.get('/:sessionId/question', authMiddleware, getQuestion);
router.patch('/:sessionId', authMiddleware, submitAnswer);

export { router };