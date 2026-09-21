import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
        // Default is 10 minutes; the frontend transparently refreshes the access token using the
        // httpOnly refresh cookie (see profoot-lab-frontend's src/lib/auth.tsx), so this mostly
        // controls how often that silent refresh happens, not how long the user stays logged in.
        accessTokenLifespan: 30 * 60,
        // The frontend and backend live on different Render subdomains; onrender.com is on the
        // Public Suffix List, so browsers treat them as different "sites" even though both are
        // HTTPS. The plugin's default `SameSite=Lax` refresh cookie is never attached to a
        // cross-site fetch/XHR request, so /api/auth/refresh always looked cookie-less and the
        // user was silently logged out once the short-lived access token expired. `None` fixes
        // that, but requires HTTPS (`Secure`) — keep the default `Lax` for local http://localhost
        // dev, where frontend and backend already share the same site anyway.
        //
        // `maxAge` (ms) must be set explicitly and kept aligned with the default
        // `maxRefreshTokenLifespan` (30 days, in seconds) — otherwise the plugin issues the
        // refresh cookie with no Max-Age/Expires at all, i.e. a browser-session cookie. Mobile
        // browsers/PWAs routinely discard session cookies when the app is backgrounded and the
        // process is reclaimed, so the next silent refresh (e.g. after the 30-minute access token
        // expires while backgrounded) finds no cookie to send and force-logs-out the user even
        // though the refresh token was still valid server-side.
        cookie:
          env('NODE_ENV', 'development') === 'production'
            ? { sameSite: 'none', maxAge: 30 * 24 * 60 * 60 * 1000 }
            : undefined,
      },
    },
  },
  upload: {
    config: {
      provider: '@nexide/strapi-provider-bunny',
      providerOptions: {
        api_key: env('BUNNY_API_KEY'),
        storage_zone: env('BUNNY_STORAGE_ZONE'),
        pull_zone: env('BUNNY_PULL_ZONE'),
        hostname: env('BUNNY_HOSTNAME'),
        upload_path: env('BUNNY_UPLOAD_PATH'),
      },
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
