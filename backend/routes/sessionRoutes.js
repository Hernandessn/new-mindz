import express from 'express';
import { startSession } from '../controllers/sessionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, startSession);

export { router };