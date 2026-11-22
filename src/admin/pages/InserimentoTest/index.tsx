import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Layouts,
  Page,
  useAPIErrorHandler,
  useFetchClient,
  useNotification,
} from '@strapi/strapi/admin';
import {
  Box,
  Button,
  Combobox,
  ComboboxOption,
  DatePicker,
  Field,
  Flex,
  Grid,
  Table,
  Tbody,
  Td,
  TextInput,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';

import {
  type Atleta,
  type Misurazione,
  type Pagination,
  type TipoTest,
  createMisurazione,
  listAtleti,
  listMisurazioni,
  listTipiTest,
} from './api';

const TEST_FISICO_EDIT_URL = '/content-manager/collection-types/api::test-fisico.test-fisico';

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const numberFormatter = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 3 });

// `YYYY-MM-DD` from the local calendar day (toISOString would shift to UTC and can change the day).
const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const formatIsoDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
};

// Admins type Italian decimals ("42,5"): accept both comma and dot.
const parseValore = (raw: string): number | null => {
  const normalized = raw.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
};

const tipoLabel = (tipo: TipoTest) =>
  `${tipo.nome} (${tipo.unita}, ${tipo.direzioneMigliora === 'su' ? '↑' : '↓'} meglio)`;

const InserimentoTestPage = () => {
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const { formatAPIError } = useAPIErrorHandler();

  const [atleti, setAtleti] = React.useState<Atleta[]>([]);
  const [tipiTest, setTipiTest] = React.useState<TipoTest[]>([]);
  const [catalogsLoading, setCatalogsLoading] = React.useState(true);

  const [atletaId, setAtletaId] = React.useState<string>();
  const [tipoTestId, setTipoTestId] = React.useState<string>();

  const [dal, setDal] = React.useState<Date>();
  const [al, setAl] = React.useState<Date>();
  const [page, setPage] = React.useState(1);

  const [misurazioni, setMisurazioni] = React.useState<Misurazione[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({ page: 1, pageCount: 1 });
  const [listLoading, setListLoading] = React.useState(false);

  const [data, setData] = React.useState<Date>(() => new Date());
  const [valore, setValore] = React.useState('');
  const [note, setNote] = React.useState('');
  const [valoreError, setValoreError] = React.useState<string>();
  const [saving, setSaving] = React.useState(false);

  const notifyError = React.useCallback(
    (error: unknown) =>
      toggleNotification({
        type: 'danger',
        message: formatAPIError(error as Parameters<typeof formatAPIError>[0]),
      }),
    [toggleNotification, formatAPIError],
  );

  React.useEffect(() => {
    Promise.all([listAtleti(get), listTipiTest(get)])
      .then(([atletiResult, tipiResult]) => {
        setAtleti(atletiResult);
        setTipiTest(tipiResult);
      })
      .catch(notifyError)
      .finally(() => setCatalogsLoading(false));
  }, [get, notifyError]);

  const loadMisurazioni = React.useCallback(async () => {
    if (!atletaId || !tipoTestId) return;
    setListLoading(true);
    try {
      const result = await listMisurazioni(get, {
        atletaId,
        tipoTestId,
        dal: dal ? toIsoDate(dal) : undefined,
        al: al ? toIsoDate(al) : undefined,
        page,
      });
      setMisurazioni(result.results);
      setPagination(result.pagination);
    } catch (error) {
      notifyError(error);
    } finally {
      setListLoading(false);
    }
  }, [get, notifyError, atletaId, tipoTestId, dal, al, page]);

  React.useEffect(() => {
    loadMisurazioni();
  }, [loadMisurazioni]);

  // A new athlete/type/period starts again from the first page; the period filter is kept.
  const selectAtleta = (value?: string) => {
    setAtletaId(value);
    setPage(1);
  };
  const selectTipo = (value?: string) => {
    setTipoTestId(value);
    setPage(1);
  };
  const selectDal = (value?: Date) => {
    setDal(value);
    setPage(1);
  };
  const selectAl = (value?: Date) => {
    setAl(value);
    setPage(1);
  };

  const tipo = tipiTest.find((t) => t.documentId === tipoTestId);
  const ready = Boolean(atletaId && tipo);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!atletaId || !tipoTestId) return;

    const parsed = parseValore(valore);
    if (parsed === null) {
      setValoreError('Inserisci un numero, es. 42,5');
      return;
    }
    setValoreError(undefined);

    setSaving(true);
    try {
      await createMisurazione(post, {
        atletaId,
        tipoTestId,
        data: toIsoDate(data),
        valore: parsed,
        note: note.trim() || undefined,
      });
      toggleNotification({ type: 'success', message: 'Misurazione aggiunta' });
      setValore('');
      setNote('');
      await loadMisurazioni();
    } catch (error) {
      // Keep the typed values so the admin can retry.
      notifyError(error);
    } finally {
      setSaving(false);
    }
  };

  if (catalogsLoading) {
    return <Page.Loading />;
  }

  return (
    <Page.Main>
      <Page.Title>Inserimento test fisici</Page.Title>
      <Layouts.Header
        title="Inserimento test fisici"
        subtitle="Scegli atleta e tipo di test per vedere lo storico e aggiungere una misurazione"
      />
      <Layouts.Content>
        <Flex direction="column" alignItems="stretch" gap={6}>
          <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
            <Grid.Root gap={4}>
              <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
                <Field.Root name="atleta">
                  <Field.Label>Atleta</Field.Label>
                  <Combobox
                    value={atletaId}
                    onChange={selectAtleta}
                    onClear={() => selectAtleta(undefined)}
                    placeholder="Seleziona un atleta"
                  >
                    {atleti.map((atleta) => (
                      <ComboboxOption key={atleta.documentId} value={atleta.documentId}>
                        {atleta.nomeCompleto}
                      </ComboboxOption>
                    ))}
                  </Combobox>
                </Field.Root>
              </Grid.Item>
              <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
                <Field.Root name="tipoTest">
                  <Field.Label>Tipo test</Field.Label>
                  <Combobox
                    value={tipoTestId}
                    onChange={selectTipo}
                    onClear={() => selectTipo(undefined)}
                    placeholder="Seleziona un tipo di test"
                  >
                    {tipiTest.map((t) => (
                      <ComboboxOption key={t.documentId} value={t.documentId}>
                        {tipoLabel(t)}
                      </ComboboxOption>
                    ))}
                  </Combobox>
                </Field.Root>
              </Grid.Item>
            </Grid.Root>
          </Box>

          {!ready || !tipo ? (
            <Typography textColor="neutral600">Seleziona atleta e tipo di test</Typography>
          ) : (
            <>
              <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
                <form onSubmit={handleAdd}>
                  <Flex direction="column" alignItems="stretch" gap={4}>
                    <Typography variant="delta" tag="h2">
                      Nuova misurazione
                    </Typography>
                    <Grid.Root gap={4}>
                      <Grid.Item col={3} s={12} direction="column" alignItems="stretch">
                        <Field.Root name="data" required>
                          <Field.Label>Data</Field.Label>
                          <DatePicker
                            value={data}
                            onChange={(value) => value && setData(value)}
                            locale="it-IT"
                          />
                        </Field.Root>
                      </Grid.Item>
                      <Grid.Item col={3} s={12} direction="column" alignItems="stretch">
                        <Field.Root name="valore" required error={valoreError}>
                          <Field.Label>{`Valore (${tipo.unita})`}</Field.Label>
                          <TextInput
                            inputMode="decimal"
                            value={valore}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setValore(e.target.value)
                            }
                          />
                          <Field.Error />
                        </Field.Root>
                      </Grid.Item>
                      <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
                        <Field.Root name="note">
                          <Field.Label>Note</Field.Label>
                          <TextInput
                            value={note}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setNote(e.target.value)
                            }
                          />
                        </Field.Root>
                      </Grid.Item>
                    </Grid.Root>
                    <Flex justifyContent="flex-end">
                      <Button type="submit" loading={saving} disabled={!valore.trim()}>
                        Aggiungi
                      </Button>
                    </Flex>
                  </Flex>
                </form>
              </Box>

              <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
                <Flex direction="column" alignItems="stretch" gap={4}>
                  <Flex gap={4} alignItems="flex-end" wrap="wrap">
                    <Field.Root name="dal">
                      <Field.Label>Dal</Field.Label>
                      <DatePicker
                        value={dal}
                        onChange={selectDal}
                        onClear={() => selectDal(undefined)}
                        clearLabel="Rimuovi"
                        locale="it-IT"
                      />
                    </Field.Root>
                    <Field.Root name="al">
                      <Field.Label>Al</Field.Label>
                      <DatePicker
                        value={al}
                        onChange={selectAl}
                        onClear={() => selectAl(undefined)}
                        clearLabel="Rimuovi"
                        locale="it-IT"
                      />
                    </Field.Root>
                  </Flex>

                  {!listLoading && misurazioni.length === 0 ? (
                    <Typography textColor="neutral600">
                      Nessuna misurazione per questo periodo
                    </Typography>
                  ) : (
                    <Table colCount={4} rowCount={misurazioni.length + 1}>
                      <Thead>
                        <Tr>
                          <Th>
                            <Typography variant="sigma">Data</Typography>
                          </Th>
                          <Th>
                            <Typography variant="sigma">Valore</Typography>
                          </Th>
                          <Th>
                            <Typography variant="sigma">Note</Typography>
                          </Th>
                          <Th>
                            <Typography variant="sigma">Azioni</Typography>
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {misurazioni.map((m) => (
                          <Tr key={m.documentId}>
                            <Td>
                              <Typography>{formatIsoDate(m.data)}</Typography>
                            </Td>
                            <Td>
                              <Typography>{`${numberFormatter.format(Number(m.valore))} ${tipo.unita}`}</Typography>
                            </Td>
                            <Td>
                              <Typography>{m.note ?? ''}</Typography>
                            </Td>
                            <Td>
                              <Link to={`${TEST_FISICO_EDIT_URL}/${m.documentId}`}>Modifica</Link>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}

                  {pagination.pageCount > 1 && (
                    <Flex justifyContent="flex-end" gap={2} alignItems="center">
                      <Button
                        variant="tertiary"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Precedente
                      </Button>
                      <Typography>{`Pagina ${pagination.page} di ${pagination.pageCount}`}</Typography>
                      <Button
                        variant="tertiary"
                        disabled={page >= pagination.pageCount}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Successiva
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Box>
            </>
          )}
        </Flex>
      </Layouts.Content>
    </Page.Main>
  );
};

export default InserimentoTestPage;
