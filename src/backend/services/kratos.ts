import { Configuration, FrontendApi } from '@ory/client';

// Public API client for browser flows (registration, login, settings)
export const kratosPublic = new FrontendApi(
  new Configuration({
    basePath: 'http://localhost:4433',
    baseOptions: {
      withCredentials: true,
    },
  })
);