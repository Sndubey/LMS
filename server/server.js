import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js'

const app = express();

await connectDB();
await connectCloudinary();

app.use(cors());
app.use(clerkMiddleware());  //applying clerk middleware to all routes (user data in req.auth)

app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);

app.use(express.json());

app.get('/', (req, res) => res.send("api working"));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});