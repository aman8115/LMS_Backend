import { config } from 'dotenv';
config()
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import errorMiddleware from './middleware/error.js';
import routers from './routers/userRouter.js';
import courseRouter from './routers/course.router.js';
import paymentRouter from './routers/paymet.routr.js'
import messageroute from './routers/message.route.js';
import statesrouter  from './routers/States.router.js'

const app = express();
app.use(express.json({ limit: '10mb' })); // Set maximum payload size to 10MB (adjust as needed)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
console.log("frontend url",process.env.FORNTEND_URL);
app.use(
  cors({
    origin: [process.env.FORNTENDURL],
    credentials: true,
  })
);
app.use(morgan('dev'));

import dbConnection from './config/config.js';
dbConnection();

app.use('/api/v1/user', routers);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/payments',paymentRouter)
app.use('/api/v1/message', messageroute);
app.use('/api/v1',statesrouter)

// Add middleware to set the Access-Control-Allow-Credentials header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// Error handling middleware
app.use(errorMiddleware);

export default app;