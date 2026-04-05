import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getResults, saveResult, getQuestionnaire } from '../controllers/assessmentController.js';

const router = express.Router();

router.get('/results',  authenticate, getResults);
router.post('/results', authenticate, saveResult);
router.get('/:type',    authenticate, getQuestionnaire);

export default router;