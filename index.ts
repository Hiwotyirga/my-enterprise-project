import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import postgres from 'postgres';
import { createClient } from 'redis';
// import { kratos } from './src/backend/services/kratos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// PostgreSQL Connection
const sql = postgres(process.env.DATABASE_URL || 'postgres://root:secretpassword@localhost:5432/enterprise_db');

// Redis Client Connection
const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis on startup
async function startServer() {
  await redisClient.connect();
  console.log('[server]: Connected to Redis successfully!');

  app.use(express.json());

  // Comprehensive Health Check Endpoint
  app.get('/', async (req: Request, res: Response) => {
    try {
      // Test Postgres
      const pgResult = await sql`SELECT NOW() as current_time;`;
      const dbTime = pgResult[0]?.current_time || 'No time returned';

      // Test Redis (set and get a test key)
      await redisClient.set('health_check', 'OK');
      const redisVal = await redisClient.get('health_check');

      res.status(200).json({
        status: 'success',
        message: 'Backend server is fully operational!',
        services: {
          postgres: { status: 'connected', databaseTime: dbTime },
          redis: { status: 'connected', testKeyVal: redisVal },
          kratos: { publicApi: 'http://localhost:4433', adminApi: 'http://localhost:4434' },
          storage: { api: 'http://localhost:3900' }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Server is running, but one or more infrastructure services failed.',
        error: String(error),
      });
    }
  });

  // 1. Initialize a Registration Flow
app.get('/auth/register', async (req: Request, res: Response) => {
  try {
    const flow = await kratos.createBrowserRegistrationFlow();
    res.json({
      status: 'success',
      message: 'Registration flow initialized',
      flowId: flow.data.id,
      submitTo: flow.data.ui.action, // The URL to send user form data to
      methods: flow.data.ui.nodes,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: String(error) });
  }
});

// 2. Initialize a Login Flow
app.get('/auth/login', async (req: Request, res: Response) => {
  try {
    const flow = await kratos.createBrowserLoginFlow();
    res.json({
      status: 'success',
      message: 'Login flow initialized',
      flowId: flow.data.id,
      submitTo: flow.data.ui.action,
      methods: flow.data.ui.nodes,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: String(error) });
  }
});

// Mount Kratos routes
   app.use('/auth', kratosRouets);

  app.listen(PORT, () => {
    console.log(`[server]: Server is successfully running at http://localhost:${PORT}`);
  });
}

startServer();