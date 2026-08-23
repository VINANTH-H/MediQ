import express from 'express';
import { chat } from '../controllers/ragController.js';
const router = express.Router();

// POST /api/rag/chat
router.post('/chat', chat);

export default router;
