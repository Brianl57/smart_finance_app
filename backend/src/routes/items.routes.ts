import { Router } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import * as plaidItemsRepo from '../repositories/plaidItemsRepository';

const router = Router();

router.get('/', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const items = await plaidItemsRepo.getItemsWithStatus(req.user!.id);
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

export default router;
