import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
} from '../controllers/staff.controller';

const router = Router();
router.use(authenticate);

// GET /api/staff?projectId=xxx&includeInactive=true
router.get('/', getAllStaff);

// GET /api/staff/:id
router.get('/:id', getStaffById);

// POST /api/staff
router.post('/', createStaff);

// PUT /api/staff/:id
router.put('/:id', updateStaff);

// PATCH /api/staff/:id/toggle-status
router.patch('/:id/toggle-status', toggleStaffStatus);

// DELETE /api/staff/:id (use with caution)
router.delete('/:id', deleteStaff);

export default router;
