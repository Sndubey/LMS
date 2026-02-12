import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js';

const app = express();

await connectDB();
await connectCloudinary();


// webhooks route (requires raw req.body)
app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);
app.post('/stripe',express.raw({type: 'application/json'}), stripeWebhooks);

// 1. Define your allowed origins in an array
// Note: Ensure there are NO trailing slashes (e.g., use .app NOT .app/)
const allowedOrigins = [
  'http://localhost:5173', // Vite's default port (seen in your screenshot)
  'https://lms-frontend-three-chi.vercel.app' // Your actual FRONTEND URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json()); //use it after webhook routes, webhook config need raw data not json 
app.use(clerkMiddleware());  //applying clerk middleware to all routes (user data in req.auth)

app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter)


app.get('/', (req, res) => res.send("api working"));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});