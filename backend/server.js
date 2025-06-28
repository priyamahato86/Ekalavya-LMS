import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
//import { clerkMiddleware } from '@clerk/express'
import {  stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'

// Initialize Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors())
//app.use(clerkMiddleware())
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

app.use(express.json());
// Routes
app.get('/', (req, res) => res.send("API Working"))
//app.post('/clerk', express.json() , clerkWebhooks)
app.use('/api/auth', authRouter);
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})