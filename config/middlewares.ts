import type { Core } from '@strapi/strapi';

const bunnyPullZone = process.env.BUNNY_PULL_ZONE;

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', bunnyPullZone],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', bunnyPullZone],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      // Explicit origin list + credentials: true are required for the users-permissions
      // httpOnly refresh-token cookie to be set/sent cross-origin from the frontend.
      origin: env.array('CORS_ORIGINS', ['http://localhost:8080']),
      credentials: true,
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
