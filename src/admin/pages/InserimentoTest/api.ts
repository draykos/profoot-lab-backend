import type { useFetchClient } from '@strapi/strapi/admin';

/**
 * Thin wrappers over the Content Manager admin API used by the "Inserimento test" page. Going
 * through the Content Manager (instead of custom routes) means the logged-in admin's RBAC
 * permissions apply to every read and write.
 */

type FetchClient = ReturnType<typeof useFetchClient>;
type Get = FetchClient['get'];
type Post = FetchClient['post'];

const CM = '/content-manager/collection-types';
const ATLETA_UID = 'api::atleta.atleta';
const TIPO_TEST_UID = 'api::tipo-test.tipo-test';
const TEST_FISICO_UID = 'api::test-fisico.test-fisico';

export const MISURAZIONI_PAGE_SIZE = 50;

export interface Atleta {
  documentId: string;
  nomeCompleto: string;
}

export interface TipoTest {
  documentId: string;
  nome: string;
  codice: string;
  unita: 'cm' | 's' | 'm';
  direzioneMigliora: 'su' | 'giu';
}

export interface Misurazione {
  documentId: string;
  data: string;
  valore: number;
  note: string | null;
}

export interface Pagination {
  page: number;
  pageCount: number;
}

interface ListResponse<T> {
  results: T[];
  pagination: Pagination;
}

// Fetches every page of a Content Manager collection (catalogs are small: athletes, test types).
async function listAll<T>(get: Get, uid: string, sort: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let pageCount: number;
  do {
    const { data } = await get<ListResponse<T>>(`${CM}/${uid}`, {
      params: { page, pageSize: 100, sort },
    });
    all.push(...data.results);
    pageCount = data.pagination.pageCount;
    page += 1;
  } while (page <= pageCount);
  return all;
}

export const listAtleti = (get: Get) => listAll<Atleta>(get, ATLETA_UID, 'nomeCompleto:ASC');

export const listTipiTest = (get: Get) => listAll<TipoTest>(get, TIPO_TEST_UID, 'nome:ASC');

export async function listMisurazioni(
  get: Get,
  {
    atletaId,
    tipoTestId,
    dal,
    al,
    page,
  }: { atletaId: string; tipoTestId: string; dal?: string; al?: string; page: number },
): Promise<ListResponse<Misurazione>> {
  const conditions: Record<string, unknown>[] = [
    { atleta: { documentId: { $eq: atletaId } } },
    { tipoTest: { documentId: { $eq: tipoTestId } } },
  ];
  if (dal) conditions.push({ data: { $gte: dal } });
  if (al) conditions.push({ data: { $lte: al } });

  const { data } = await get<ListResponse<Misurazione>>(`${CM}/${TEST_FISICO_UID}`, {
    params: {
      page,
      pageSize: MISURAZIONI_PAGE_SIZE,
      sort: 'data:DESC',
      filters: { $and: conditions },
    },
  });
  return data;
}

export async function createMisurazione(
  post: Post,
  {
    atletaId,
    tipoTestId,
    data,
    valore,
    note,
  }: { atletaId: string; tipoTestId: string; data: string; valore: number; note?: string },
): Promise<void> {
  await post(`${CM}/${TEST_FISICO_UID}`, {
    atleta: { connect: [{ documentId: atletaId }] },
    tipoTest: { connect: [{ documentId: tipoTestId }] },
    data,
    valore,
    note: note || null,
  });
}
