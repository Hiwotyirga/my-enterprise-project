import { Router } from 'express';
import { kratosPublic } from '../services/kratos';

const router = Router();

// 1. Initialize a Browser Registration Flow
router.get('/register', async (req, res) => {
  try {
    // Pass the cookie string directly as the first parameter (or leave empty if undefined)
    const flow = await kratosPublic.createBrowserRegistrationFlow(
      req.headers.cookie
    );

    res.json({
      status: 'success',
      message: 'Registration flow initialized successfully',
      flowId: flow.data.id,
      ui: flow.data.ui,
    });
  } catch (error: any) {
    console.error('Registration init error:', error?.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize registration flow with Kratos',
      error: error?.response?.data || error.message,
    });
  }
});

// 2. Check Active Session (WhoAmI)
router.get('/whoami', async (req, res) => {
  try {
    const session = await kratosPublic.toSession(
      req.headers.cookie
    );

    res.json({
      status: 'success',
      authenticated: true,
      identity: session.data.identity,
    });
  } catch (error: any) {
    res.status(401).json({
      status: 'error',
      authenticated: false,
      message: 'No active session found',
    });
  }
});

export default router;