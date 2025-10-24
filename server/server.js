import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';

const app = express();

app.use(cors());

app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);

app.use(express.json());

app.get('/', (req, res) => res.send("api working"));

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});