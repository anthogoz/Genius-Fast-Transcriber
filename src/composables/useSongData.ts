import type { SongData, SongDataRaw } from '@/types';
import {
  extractArtistsFromMetaContent,
  decodeHtmlEntities,
  formatArtistList,
  cleanArtistName,
  escapeRegExp,
} from '@/utils/artists';

const SELECTORS = {
  TITLE: [
    'h1[class*="SongHeader-desktop_Title"] span[class*="SongHeader-desktop_HiddenMask"]',
    'h1[class*="SongHeader-desktop_Title"]',
    'h1[class*="SongHeader__Title"]',
    '.song_header-primary_info-title',
  ],
  OG_TITLE_META: 'meta[property="og:title"]',
  TWITTER_TITLE_META: 'meta[name="twitter:title"]',
  CREDITS_ARTIST_LIST: 'div[class*="TrackCreditsPage__CreditList"]',
  CREDITS_ARTIST_NAME: 'a[class*="Credit-sc"] span[class*="Name-sc"]',
  MAIN_ARTISTS_CONTAINER: 'div[class*="HeaderArtistAndTracklist-desktop__ListArtists"]',
  MAIN_ARTIST_LINK: 'a[class*="StyledLink"]',
  FALLBACK_ARTIST_LINKS: 'a[class*="SongHeader__Artist"], a[data-testid="ArtistLink"]',
  TEXTAREA_EDITOR: 'textarea[class*="ExpandingTextarea__Textarea"]',
  DIV_EDITOR: 'div[data-testid="lyrics-input"]',
  CONTROLS_STICKY: 'div[class^="LyricsEdit-desktop__Controls-sc-"]',
  GENIUS_HELPER:
    'div[class*="LyricsEditExplainer__Container-sc-"][class*="LyricsEdit-desktop__Explainer-sc-"]',
  LYRICS_CONTAINER: '[data-lyrics-container="true"]',
} as const;

export { SELECTORS };

export function useSongData() {
  function extractSongData(): SongDataRaw {
    const songData: SongDataRaw = {
      title: 'TITRE INCONNU',
      mainArtists: [],
      featuringArtists: [],
      _rawMainArtists: [],
      _rawFeaturingArtistsFromSection: [],
      _rawFeaturingArtistsFromTitleExtract: [],
    };

    let rawTitleText: string | null = null;
    let artistsFromMeta = { main: [] as string[], ft: [] as string[] };

    const ogTitleMeta = document.querySelector<HTMLMetaElement>(SELECTORS.OG_TITLE_META);
    if (ogTitleMeta?.content) {
      artistsFromMeta = extractArtistsFromMetaContent(ogTitleMeta.content);
      songData._rawMainArtists = [...artistsFromMeta.main];
      songData._rawFeaturingArtistsFromTitleExtract = [...artistsFromMeta.ft];
      const titleParts = decodeHtmlEntities(ogTitleMeta.content).split(/\s[–-]\s/);
      if (titleParts.length > 1) {
        rawTitleText = titleParts.slice(1).join(' – ').trim();
        if (artistsFromMeta.main.length > 0) {
          const mainArtistString = formatArtistList(artistsFromMeta.main);
          if (rawTitleText.toLowerCase().endsWith(mainArtistString.toLowerCase())) {
            rawTitleText = rawTitleText
              .substring(0, rawTitleText.length - mainArtistString.length)
              .replace(/\s*-\s*$/, '')
              .trim();
          }
        }
      }
    } else {
      const twitterMeta = document.querySelector<HTMLMetaElement>(SELECTORS.TWITTER_TITLE_META);
      if (twitterMeta?.content) {
        artistsFromMeta = extractArtistsFromMetaContent(twitterMeta.content);
        songData._rawMainArtists = [...artistsFromMeta.main];
        songData._rawFeaturingArtistsFromTitleExtract = [...artistsFromMeta.ft];
        const titleParts = decodeHtmlEntities(twitterMeta.content).split(/\s[–-]\s/);
        if (titleParts.length > 1) {
          rawTitleText = titleParts.slice(1).join(' – ').trim();
        }
      }
    }

    if (songData._rawMainArtists.length === 0) {
      const container = document.querySelector(SELECTORS.MAIN_ARTISTS_CONTAINER);
      if (container) {
        container.querySelectorAll(SELECTORS.MAIN_ARTIST_LINK).forEach((link) => {
          const n = link.textContent?.trim();
          if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n);
        });
      } else {
        document.querySelectorAll(SELECTORS.FALLBACK_ARTIST_LINKS).forEach((link) => {
          const n = link.textContent?.trim();
          if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n);
        });
      }
    }

    document.querySelectorAll(SELECTORS.CREDITS_ARTIST_LIST).forEach((listContainer) => {
      const lt = listContainer.previousElementSibling;
      if (!lt) return;
      const txt = lt.textContent?.trim().toLowerCase() ?? '';
      const isFt = txt.includes('featuring') || txt.includes('feat') || txt.includes('avec');
      if (!isFt) return;

      listContainer.querySelectorAll(SELECTORS.CREDITS_ARTIST_NAME).forEach((s) => {
        const n = s.textContent?.trim();
        if (
          n &&
          !songData._rawFeaturingArtistsFromSection.includes(n) &&
          !songData._rawMainArtists.includes(n)
        ) {
          songData._rawFeaturingArtistsFromSection.push(n);
        }
      });
    });

    if (!rawTitleText) {
      for (const sel of SELECTORS.TITLE) {
        const el = document.querySelector(sel);
        if (el?.textContent) {
          rawTitleText = el.textContent;
          break;
        }
      }
    }

    if (rawTitleText) {
      let ttc = decodeHtmlEntities(rawTitleText.trim())
        .replace(/\s+Lyrics$/i, '')
        .trim();
      if (artistsFromMeta.main.length === 0 && songData._rawMainArtists.length > 0) {
        const blk = formatArtistList(songData._rawMainArtists.map((a) => cleanArtistName(a)));
        if (blk) {
          const esc = escapeRegExp(blk);
          let m = ttc.match(new RegExp(`^${esc}\\s*-\\s*(.+)$`, 'i'));
          if (m?.[1]) {
            ttc = m[1].trim();
          } else {
            m = ttc.match(new RegExp(`^(.+?)\\s*-\\s*${esc}$`, 'i'));
            if (m?.[1]) ttc = m[1].trim();
          }
        }
      }
      ttc = ttc
        .replace(/\s*\((?:Ft\.|Featuring)[^)]+\)\s*/gi, ' ')
        .trim()
        .replace(/^[\s,-]+|[\s,-]+$/g, '')
        .replace(/\s\s+/g, ' ');
      songData.title = ttc;
    }

    if (!songData.title || songData.title.length === 0) {
      songData.title = 'TITRE INCONNU';
    }

    songData.mainArtists = [...new Set(songData._rawMainArtists.map(cleanArtistName))].filter(
      Boolean,
    );

    const seenFt = new Set<string>();
    const rawFtSource =
      songData._rawFeaturingArtistsFromTitleExtract.length > 0
        ? songData._rawFeaturingArtistsFromTitleExtract
        : songData._rawFeaturingArtistsFromSection;

    songData.featuringArtists = rawFtSource.map(cleanArtistName).filter((name) => {
      if (
        !name ||
        seenFt.has(name.toLowerCase()) ||
        songData.mainArtists.some((m) => m.toLowerCase() === name.toLowerCase())
      ) {
        return false;
      }
      seenFt.add(name.toLowerCase());
      return true;
    });

    return songData;
  }

  return { extractSongData, SELECTORS };
}
