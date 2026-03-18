import { Router } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import * as transactionsService from '../services/transactionsService';
import { NotFoundError } from '../services/transactionsService';

const router = Router();

router.post('/', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const transactions = await transactionsService.getTransactions(req.user!.id, {
            start_date: req.body.start_date,
            end_date: req.body.end_date,
        });
        res.json({ transactions });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error getting transactions:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

export default router;
