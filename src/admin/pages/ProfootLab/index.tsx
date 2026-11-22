import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layouts, Page, SubNav } from '@strapi/strapi/admin';
import { Divider } from '@strapi/design-system';

/**
 * "Profoot Lab" admin section: a Settings-like side navigation that groups the custom tools
 * (rendered inside the section) and links to the Content Manager lists of the Profoot Lab
 * content-types (clicking those leaves the section — Strapi cannot embed its list views).
 */

// Path of the section, relative to the admin root (`/admin`).
export const SECTION_PATH = 'profoot-lab';

const InserimentoTestPage = React.lazy(() => import('../InserimentoTest'));

// Custom pages rendered inside the section. The first one is the section's landing page.
const TOOLS = [{ path: 'test-fisici', label: 'Aggiungi test fisico' }];

// Content Manager lists of the Profoot Lab content-types (Strapi's own types left out on
// purpose). Keep in sync when a content-type is added or removed.
const CONTENT_LINKS = [
  { uid: 'api::atleta.atleta', label: 'Atleti' },
  { uid: 'api::calendario-partite.calendario-partite', label: 'Calendario partite' },
  { uid: 'api::highlight.highlight', label: 'Highlight' },
  { uid: 'api::infortunio.infortunio', label: 'Infortuni' },
  { uid: 'api::piano-alimentare.piano-alimentare', label: 'Piani alimentari' },
  { uid: 'api::test-fisico.test-fisico', label: 'Test fisici' },
  { uid: 'api::tipo-test.tipo-test', label: 'Tipi di test' },
  { uid: 'api::video-coach-atleta.video-coach-atleta', label: 'Video Coach' },
];

const ProfootLabNav = () => (
  <SubNav.Main aria-label="Profoot Lab">
    <SubNav.Header label="Profoot Lab" />
    <Divider />
    <SubNav.Content>
      <SubNav.Sections>
        <SubNav.Section label="Strumenti">
          {TOOLS.map((tool) => (
            <SubNav.Link key={tool.path} to={`/${SECTION_PATH}/${tool.path}`} label={tool.label} />
          ))}
        </SubNav.Section>
        <SubNav.Section label="Contenuti">
          {CONTENT_LINKS.map((link) => (
            <SubNav.Link
              key={link.uid}
              to={`/content-manager/collection-types/${link.uid}`}
              label={link.label}
            />
          ))}
        </SubNav.Section>
      </SubNav.Sections>
    </SubNav.Content>
  </SubNav.Main>
);

const ProfootLabSection = () => (
  <Layouts.Root sideNav={<ProfootLabNav />}>
    <React.Suspense fallback={<Page.Loading />}>
      <Routes>
        <Route index element={<Navigate to={TOOLS[0].path} replace />} />
        <Route path="test-fisici" element={<InserimentoTestPage />} />
      </Routes>
    </React.Suspense>
  </Layouts.Root>
);

export default ProfootLabSection;
