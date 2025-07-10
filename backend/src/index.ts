import express from 'express';
import './config/config'

import { plaidClient } from './config/plaidClient';
console.log(`Plaid client ${plaidClient}`);

const app = express();


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Listening to server on port: ${port}`)
})