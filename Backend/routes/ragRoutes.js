import express from 'express';
import { chat } from '../controllers/ragController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/rag/chat
router.post('/chat', protect, chat);

export default router;
