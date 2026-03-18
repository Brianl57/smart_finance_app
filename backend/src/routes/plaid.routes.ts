import { Router } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import * as plaidLinkService from '../services/plaidLinkService';

const router = Router();

router.post('/create_link_token', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const data = await plaidLinkService.createLinkToken(req.user!.id);
        res.json(data);
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).json({ error: 'Failed to create link token' });
    }
});

router.post('/create_update_link_token', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const { plaid_item_id } = req.body;
        if (!plaid_item_id) {
            return res.status(400).json({ error: 'plaid_item_id is required' });
        }
        const data = await plaidLinkService.createUpdateLinkToken(req.user!.id, plaid_item_id);
        res.json(data);
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error creating update link token:', error);
        res.status(500).json({ error: 'Failed to create update link token' });
    }
});

router.post('/update_success', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const { plaid_item_id } = req.body;
        if (!plaid_item_id) {
            return res.status(400).json({ error: 'plaid_item_id is required' });
        }
        await plaidLinkService.onUpdateSuccess(req.user!.id, plaid_item_id);
        res.json({ success: true });
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error handling update success:', error);
        res.status(500).json({ error: 'Failed to process update success' });
    }
});

router.post('/set_access_token', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const result = await plaidLinkService.exchangePublicToken(req.user!.id, req.body.public_token);
        res.json({ success: true, item_id: result.item_id });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).json({ error: 'Failed to exchange public token' });
    }
});

export default router;
