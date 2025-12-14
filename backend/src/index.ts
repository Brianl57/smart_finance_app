import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { CountryCode, Products } from 'plaid';
import './config/config'
import { plaidClient } from './config/plaidClient';
import { supabase } from './config/supabaseClient';
import { authenticateUser, AuthRequest } from './middleware/auth';

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * Create Plaid Link Token
 * Requires authentication - uses authenticated user ID
 */
app.post('/api/create_link_token', authenticateUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id; // Get user ID from authenticated request

        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: userId }, // Use actual authenticated user ID
            client_name: 'Smart Finance App',
            products: [Products.Auth, Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
        });
        console.log('Link token created for user:', userId);
        res.json(response.data);
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).json({ error: 'Failed to create link token' });
    }
});

/**
 * Exchange public token for access token and save to database
 * Requires authentication - associates item with authenticated user
 */
app.post('/api/set_access_token', authenticateUser, async (req: AuthRequest, res) => {
    const { public_token } = req.body;
    const userId = req.user!.id; // Get user ID from authenticated request

    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: public_token,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        console.log('Access Token:', accessToken);
        console.log('Item ID:', itemId);
        console.log('User ID:', userId);

        // Save access token AND item id to database with authenticated user id
        const { error } = await supabase
            .from('plaid_items')
            .insert({
                plaid_access_token: accessToken,
                plaid_item_id: itemId,
                user_id: userId, // Use authenticated user ID
            });

        if (error) {
            console.error('Error saving access token and item id to database:', error);
            return res.status(500).json({ error: 'Failed to save access token and item id to database' });
        }

        res.json({ success: true, item_id: itemId });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).json({ error: 'Failed to exchange public token' });
    }
});

/**
 * Get transactions for a specific Plaid item
 * Requires authentication - only returns transactions for user's items
 */
app.post('/api/get_transactions', authenticateUser, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { item_id } = req.body; // Client should send item_id instead of access_token

    try {
        // Get access token for this user's item (verifies ownership)
        const { data: item, error } = await supabase
            .from('plaid_items')
            .select('plaid_access_token')
            .eq('plaid_item_id', item_id)
            .eq('user_id', userId) // Ensure item belongs to authenticated user
            .single();

        if (error || !item) {
            return res.status(404).json({ error: 'Plaid item not found or does not belong to user' });
        }

        const response = await plaidClient.transactionsGet({
            access_token: item.plaid_access_token,
            start_date: '2025-01-01', // TODO: make these dynamic
            end_date: '2025-12-31', // TODO: make these dynamic
        });

        console.log('Transactions retrieved for user:', userId);
        res.json(response.data);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Listening to server on port: ${port}`)
})