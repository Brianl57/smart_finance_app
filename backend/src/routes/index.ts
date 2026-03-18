import { Router } from 'express';
import plaidRoutes from './plaid.routes';
import accountsRoutes from './accounts.routes';
import transactionsRoutes from './transactions.routes';
import itemsRoutes from './items.routes';

const router = Router();

router.use('/plaid', plaidRoutes);
router.use('/accounts', accountsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/items', itemsRoutes);

export default router;
