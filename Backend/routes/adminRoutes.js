import express from 'express';
import {
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,
    createDoctor,
    addKbRule
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/pending-doctors', getPendingDoctors);
router.patch('/approve-doctor/:id', approveDoctor);
router.patch('/reject-doctor/:id', rejectDoctor);
router.post('/doctors', createDoctor);
router.post('/kb-rules', addKbRule);

export default router;
