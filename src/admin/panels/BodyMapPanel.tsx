import * as React from 'react';
import { useFetchClient, useForm } from '@strapi/strapi/admin';
import { Box, Flex, Typography } from '@strapi/design-system';
import bodyFront from '../assets/body-anatomy.jpg';
import bodyBack from '../assets/body-anatomy-back.jpg';

/**
 * Edit-view side panel for Infortunio: the same front/back anatomy images the player app shows
 * (`profoot-lab-frontend/src/routes/body.tsx`), with a dot where the injury sits. It reads the
 * live form values, so the dot moves while editing; clicking the image writes `posizioneTop`,
 * `posizioneLeft` and `vista` back into the form (saving is still up to the admin). The other
 * injuries of the same athlete are drawn faded for context.
 *
 * Geometry must match the frontend: a 3:5 box with the image `object-fit: contain`, coordinates as
 * percentages of the box.
 */

const INFORTUNIO_UID = 'api::infortunio.infortunio';
const CM = '/content-manager/collection-types';

type Vista = 'fronte' | 'retro';
type Stato = 'attivo' | 'in_recupero' | 'risolto';

interface InjuryDot {
  documentId: string;
  vista: Vista;
  posizioneTop: number;
  posizioneLeft: number;
  stato: Stato;
  zona: string;
}

// Same semantics as the frontend legend: alert / recovering / resolved.
const STATO_COLOR: Record<Stato, string> = {
  attivo: '#ee5e52',
  in_recupero: '#f29d41',
  risolto: '#5cb176',
};

const STATO_LABEL: Record<Stato, string> = {
  attivo: 'Alert',
  in_recupero: 'In recupero',
  risolto: 'Risolto',
};

const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Relation values in the form are `{ connect, disconnect }` deltas; the saved value is fetched
// separately. Returns the athlete documentId the form currently points at (undefined = unknown).
function athleteFromForm(value: unknown): { connected?: string; disconnected: boolean } {
  const rel = value as
    { connect?: { documentId?: string }[]; disconnect?: { documentId?: string }[] } | undefined;
  const connected = rel?.connect?.[0]?.documentId;
  return { connected, disconnected: !connected && (rel?.disconnect?.length ?? 0) > 0 };
}

function BodyMap({ documentId }: { documentId?: string }) {
  const { get } = useFetchClient();
  const values = useForm('BodyMapPanel', (s) => s.values) as Record<string, unknown>;
  const onChange = useForm('BodyMapPanel', (s) => s.onChange);

  const formVista = values.vista as Vista | null | undefined;
  const [view, setView] = React.useState<Vista>(formVista ?? 'fronte');
  // Follow the form when the admin changes "vista" from the dropdown.
  React.useEffect(() => {
    if (formVista) setView(formVista);
  }, [formVista]);

  const top = toNumber(values.posizioneTop);
  const left = toNumber(values.posizioneLeft);
  const stato = (values.stato as Stato | null) ?? 'attivo';

  // Athlete currently linked: unsaved form change first, otherwise the saved relation.
  const [savedAthlete, setSavedAthlete] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (!documentId) return;
    let cancelled = false;
    get<{ results: { documentId: string }[] }>(
      `/content-manager/relations/${INFORTUNIO_UID}/${documentId}/atleta`,
    )
      .then(({ data }) => !cancelled && setSavedAthlete(data.results[0]?.documentId))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [documentId, get]);

  const fromForm = athleteFromForm(values.atleta);
  const athleteId = fromForm.connected ?? (fromForm.disconnected ? undefined : savedAthlete);

  const [others, setOthers] = React.useState<InjuryDot[]>([]);
  React.useEffect(() => {
    if (!athleteId) {
      setOthers([]);
      return;
    }
    let cancelled = false;
    get<{ results: InjuryDot[] }>(`${CM}/${INFORTUNIO_UID}`, {
      params: {
        page: 1,
        pageSize: 100,
        filters: { atleta: { documentId: { $eq: athleteId } } },
      },
    })
      .then(({ data }) => {
        if (cancelled) return;
        setOthers(data.results.filter((i) => i.documentId !== documentId));
      })
      .catch(() => !cancelled && setOthers([]));
    return () => {
      cancelled = true;
    };
  }, [athleteId, documentId, get]);

  const boxRef = React.useRef<HTMLDivElement>(null);
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const round = (n: number) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
    onChange('posizioneTop', round(((e.clientY - rect.top) / rect.height) * 100));
    onChange('posizioneLeft', round(((e.clientX - rect.left) / rect.width) * 100));
    if (formVista !== view) onChange('vista', view);
  };

  const showCurrent = top !== null && left !== null && (formVista ?? view) === view;
  const visibleOthers = others.filter((o) => o.vista === view);

  return (
    <Flex direction="column" alignItems="stretch" gap={3} width="100%">
      <Flex gap={1} background="neutral150" padding={1} hasRadius>
        {(['fronte', 'retro'] as const).map((v) => {
          const active = v === view;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                flex: 1,
                border: 0,
                borderRadius: 4,
                padding: '6px 0',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: active ? '#d9f24f' : 'transparent',
                color: active ? '#1a1a1a' : 'inherit',
              }}
            >
              {v === 'fronte' ? 'Fronte' : 'Retro'}
            </button>
          );
        })}
      </Flex>

      <div
        ref={boxRef}
        onClick={handleClick}
        title="Clicca per posizionare l'infortunio"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 5',
          background: '#000',
          borderRadius: 8,
          overflow: 'hidden',
          cursor: 'crosshair',
        }}
      >
        <img
          src={view === 'fronte' ? bodyFront : bodyBack}
          alt={view === 'fronte' ? 'Fronte' : 'Retro'}
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
        {visibleOthers.map((o) => (
          <Dot
            key={o.documentId}
            top={o.posizioneTop}
            left={o.posizioneLeft}
            color={STATO_COLOR[o.stato]}
            title={`${o.zona} — ${STATO_LABEL[o.stato]}`}
            faded
          />
        ))}
        {showCurrent && (
          <Dot top={top} left={left} color={STATO_COLOR[stato]} title="Questo infortunio" />
        )}
      </div>

      <Typography variant="pi" textColor="neutral600">
        {top !== null && left !== null
          ? `Top ${top}% · Left ${left}% · ${formVista === 'retro' ? 'Retro' : 'Fronte'}`
          : 'Clicca sul corpo per impostare la posizione.'}
        {visibleOthers.length > 0 &&
          ` · ${visibleOthers.length} altr${visibleOthers.length === 1 ? 'o' : 'i'} dell'atleta`}
      </Typography>

      <Flex justifyContent="space-between">
        {(Object.keys(STATO_COLOR) as Stato[]).map((s) => (
          <Flex key={s} gap={1} alignItems="center">
            <span
              style={{ width: 6, height: 6, borderRadius: '50%', background: STATO_COLOR[s] }}
            />
            <Typography variant="pi" textColor="neutral600">
              {STATO_LABEL[s]}
            </Typography>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}

function Dot({
  top,
  left,
  color,
  title,
  faded = false,
}: {
  top: number;
  left: number;
  color: string;
  title: string;
  faded?: boolean;
}) {
  return (
    <span
      title={title}
      style={{
        position: 'absolute',
        top: `${top}%`,
        left: `${left}%`,
        transform: 'translate(-50%, -50%)',
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}40`,
        boxShadow: faded ? 'none' : '0 0 0 2px #fff',
        opacity: faded ? 0.5 : 1,
        pointerEvents: faded ? 'auto' : 'none',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
    </span>
  );
}

// Side panel description for `addEditViewSidePanel`; returns null for every other content-type.
export const BodyMapPanel = ({ model, documentId }: { model: string; documentId?: string }) => {
  if (model !== INFORTUNIO_UID) return null;
  return {
    title: 'Mappa corporea',
    content: (
      <Box width="100%">
        <BodyMap documentId={documentId} />
      </Box>
    ),
  };
};
