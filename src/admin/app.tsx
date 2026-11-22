import * as React from 'react';
import { Navigate } from 'react-router-dom';
import type { StrapiApp } from '@strapi/strapi/admin';
import { ProfootLab } from './icons/ProfootLab';

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

    // "Profoot Lab" section: custom tools plus links to the Profoot Lab content-types, grouped
    // under one menu entry (see src/admin/pages/ProfootLab). Shown only to admins who can read
    // Test fisico in the Content Manager, the data its landing page works on.
    app.addMenuLink({
      to: 'profoot-lab',
      icon: ProfootLab,
      intlLabel: { id: 'profoot-lab.menu', defaultMessage: 'Profoot Lab' },
      permissions: [
        {
          action: 'plugin::content-manager.explorer.read',
          subject: 'api::test-fisico.test-fisico',
        },
      ],
      Component: () => import('./pages/ProfootLab'),
    });

    // The data-entry page used to live at /admin/inserimento-test: keep old links and bookmarks
    // working. `router.addRoute` is marked @alpha in Strapi 5.52.
    app.router.addRoute({
      path: 'inserimento-test/*',
      element: <Navigate to="/profoot-lab/test-fisici" replace />,
    });
  },
  bootstrap(_app: StrapiApp) {},
};
