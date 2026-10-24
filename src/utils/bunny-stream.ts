/**
 * Bunny Stream helpers for `video-coach` videos.
 *
 * Videos are stored in Strapi as Bunny "play" links (`player.mediadelivery.net/play/<libraryId>/
 * <videoId>`). The thumbnail file name is not predictable from that link: it is `thumbnail.jpg`
 * only while the auto-generated one is in use, and becomes `thumbnail_<hash>.jpg` once a custom
 * thumbnail is set in the Bunny dashboard. The real name comes from the Bunny Stream API.
 */

const BUNNY_PLAY_URL = /^https:\/\/player\.mediadelivery\.net\/play\/(\d+)\/([0-9a-f-]+)/i;

const CACHE_TTL_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 3000;

const thumbnailCache = new Map<string, { url: string | null; expiresAt: number }>();

async function fetchThumbnailUrl(
  libraryId: string,
  videoId: string,
  apiKey: string,
  cdnHostname: string,
): Promise<string | null> {
  const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
    headers: { AccessKey: apiKey, Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Bunny Stream API responded ${res.status} for video ${videoId}`);
  }
  const body = (await res.json()) as { thumbnailFileName?: string | null };
  return body.thumbnailFileName
    ? `https://${cdnHostname}/${videoId}/${body.thumbnailFileName}`
    : null;
}

/**
 * Thumbnail URL of a Bunny "play" link, or `null` when it can't be resolved (link in another
 * format, Bunny Stream env vars missing, API error) — the client then falls back to a placeholder.
 * Results are cached in memory for an hour so `me` doesn't hit the API on every request; failures
 * are cached too, so a misconfigured key doesn't slow every response down.
 */
export async function resolveThumbnailUrl(
  videoUrl: string,
  log?: { warn: (msg: string) => void },
): Promise<string | null> {
  const match = videoUrl.match(BUNNY_PLAY_URL);
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;
  if (!match || !apiKey || !cdnHostname) {
    return null;
  }
  const [, libraryId, videoId] = match;

  const cached = thumbnailCache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  let url: string | null = null;
  try {
    url = await fetchThumbnailUrl(libraryId, videoId, apiKey, cdnHostname);
  } catch (err) {
    log?.warn(`[bunny-stream] Thumbnail lookup failed: ${(err as Error).message}`);
  }
  thumbnailCache.set(videoId, { url, expiresAt: Date.now() + CACHE_TTL_MS });
  return url;
}
