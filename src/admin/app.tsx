import type { StrapiApp } from '@strapi/strapi/admin';
import { Dumbbell } from './icons/Dumbbell';

// Key the Strapi admin uses to remember the interface language in the browser.
const LANGUAGE_STORAGE_KEY = 'strapi-admin-language';
const DEFAULT_LANGUAGE = 'it';

export default {
  config: {
    // English is always available; adding Italian also makes dates show as DD/MM/YYYY.
    locales: ['it'],
  },
  register(app: StrapiApp) {
    // Strapi has no setting for the default admin language and falls back to English. Default to
    // Italian when this browser has no stored choice yet: an explicit choice made from the login
    // page or saved in the user's profile ("Interface language") still wins.
    if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
    }

    // Data-entry page for physical tests: pick athlete + test type, see the history, add one.
    // Shown only to admins who can read Test fisico in the Content Manager.
    app.addMenuLink({
      to: 'inserimento-test',
      icon: Dumbbell,
      intlLabel: { id: 'aggiungi-test-fisico.menu', defaultMessage: 'Aggiungi Test Fisico' },
      permissions: [
        {
          action: 'plugin::content-manager.explorer.read',
          subject: 'api::test-fisico.test-fisico',
        },
      ],
      Component: () => import('./pages/InserimentoTest'),
    });
  },
  bootstrap(_app: StrapiApp) {},
};
