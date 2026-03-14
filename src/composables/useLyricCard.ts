import { createApp } from 'vue';
import LyricCardModal from '@/components/content/LyricCardModal.vue';
import { i18n } from '@/locales';
import { extractArtistImage, fetchArtistImageFromApi } from '@/utils/lyricCard';

type LyricCardConfig = {
  getSelectedText: () => string;
  hideToolbar: () => void;
  isDarkMode: () => boolean;
  version: string;
  t: (key: string) => string;
  getSongTitle: () => string;
  getMainArtists: () => string[];
  getFeaturingArtists: () => string[];
};

function getFallbackSelectionText(): string {
  const selection = window.getSelection();
  return selection?.toString().trim() ?? '';
}

function findAlbumUrl(): string | null {
  const candidateUrls: string[] = [];

  const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
  if (ogImage?.content) candidateUrls.push(ogImage.content);

  const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
  if (twitterImage?.content) candidateUrls.push(twitterImage.content);

  const headerImage = document.querySelector<HTMLImageElement>(
    'div[class*="SongHeader"] img, img[class*="CoverArt"]',
  );
  if (headerImage?.src) candidateUrls.push(headerImage.src);

  const uniqueUrls = [...new Set(candidateUrls)];
  return uniqueUrls[0] ?? null;
}

function mountLyricCardModal(
  config: LyricCardConfig,
  payload: {
    text: string;
    songTitle: string;
    artistName: string;
    albumUrl: string;
    artistUrl: string | null;
    mainArtists: string[];
    featuringArtists: string[];
  },
) {
  const existing = document.getElementById('gft-lyric-card-modal-root');
  existing?.remove();

  const container = document.createElement('div');
  container.id = 'gft-lyric-card-modal-root';
  document.body.appendChild(container);

  const app = createApp(LyricCardModal, {
    text: payload.text,
    songTitle: payload.songTitle,
    artistName: payload.artistName,
    albumUrl: payload.albumUrl,
    artistUrl: payload.artistUrl,
    unknownArtistLabel: config.t('lc_unknown_artist'),
    mainArtists: payload.mainArtists,
    featuringArtists: payload.featuringArtists,
    isDarkMode: config.isDarkMode(),
    version: config.version,
    onClose: () => {
      app.unmount();
      container.remove();
    },
  });

  app.use(i18n);
  app.mount(container);
}

export function useLyricCard(config: LyricCardConfig) {
  async function generateLyricsCard() {
    const selectedText = config.getSelectedText().trim() || getFallbackSelectionText();
    if (!selectedText) {
      config.hideToolbar();
      window.alert(config.t('lc_select_text_error'));
      return;
    }

    const songTitle = config.getSongTitle() || config.t('lc_unknown_title');
    const mainArtists = config.getMainArtists();
    const featuringArtists = config.getFeaturingArtists();
    const artistName =
      mainArtists.length > 0 ? mainArtists.join(' & ') : config.t('lc_unknown_artist');

    const albumUrl = findAlbumUrl();
    if (!albumUrl) {
      config.hideToolbar();
      window.alert(config.t('lc_error_album_not_found'));
      return;
    }

    const primaryArtistName = mainArtists[0] ?? null;
    let artistUrl = await fetchArtistImageFromApi(primaryArtistName, config.t('lc_unknown_artist'));
    if (!artistUrl) {
      artistUrl = extractArtistImage(albumUrl, mainArtists);
    }

    config.hideToolbar();

    mountLyricCardModal(config, {
      text: selectedText,
      songTitle,
      artistName,
      albumUrl,
      artistUrl,
      mainArtists,
      featuringArtists,
    });
  }

  return { generateLyricsCard };
}
