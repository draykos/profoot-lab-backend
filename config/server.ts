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
  // Koa reads this from the nested `koa` key, not from `server.proxy` directly.
  proxy: {
    koa: env.bool('IS_PROXIED', false),
  },
});

export default config;
