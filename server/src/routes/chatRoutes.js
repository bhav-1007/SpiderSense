import express from 'express';
import { chat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat — send a message to J.A.R.V.I.S
router.post('/chat', chat);

export default router;
