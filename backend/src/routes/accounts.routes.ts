import { Router } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import * as accountsService from '../services/accountsService';

const router = Router();

router.get('/', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const accounts = await accountsService.getAccounts(req.user!.id);
        res.json(accounts);
    } catch (error) {
        console.error('Error in get accounts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/sync', authenticateUser, async (req: AuthRequest, res) => {
    try {
        await accountsService.syncAccounts(req.user!.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in sync accounts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
