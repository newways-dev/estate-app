import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import {
  createApplication,
  listApplications,
  updateApplicationStatus,
} from '../controllers/applicationControllers'

const router = express.Router()

router.put('/:id/status', authMiddleware(['manager']), updateApplicationStatus)
router.get('/', authMiddleware(['manager', 'tenant']), listApplications)
router.post('/', authMiddleware(['tenant']), createApplication)

export default router
