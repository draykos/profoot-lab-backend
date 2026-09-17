import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  // Trust X-Forwarded-* headers from Render's reverse proxy, so secure/httpOnly
  // session cookies are set correctly even though TLS is terminated upstream.
  proxy: env.bool('IS_PROXIED', false),
});

export default config;
