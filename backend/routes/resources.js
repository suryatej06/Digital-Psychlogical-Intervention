import express from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource
} from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceCollegeAccess } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require authentication and college access
router.use(authenticate);
router.use(enforceCollegeAccess);

// Public routes (for authenticated users)
router.get('/', getResources);
router.get('/:id', getResourceById);

// Admin only routes
router.post('/', roleCheck(['admin']), createResource);
router.put('/:id', roleCheck(['admin']), updateResource);
router.delete('/:id', roleCheck(['admin']), deleteResource);

export default router;
