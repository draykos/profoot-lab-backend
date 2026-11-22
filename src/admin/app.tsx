import type { StrapiApp } from '@strapi/strapi/admin';

// Key the Strapi admin uses to remember the interface language in the browser.
const LANGUAGE_STORAGE_KEY = 'strapi-admin-language';
const DEFAULT_LANGUAGE = 'it';

export default {
  config: {
    // English is always available; adding Italian also makes dates show as DD/MM/YYYY.
    locales: ['it'],
  },
  register() {
    // Strapi has no setting for the default admin language and falls back to English. Default to
    // Italian when this browser has no stored choice yet: an explicit choice made from the login
    // page or saved in the user's profile ("Interface language") still wins.
    if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
    }
  },
  bootstrap(_app: StrapiApp) {},
};
