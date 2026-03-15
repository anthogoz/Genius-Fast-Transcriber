<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import {
  fetchArtistImageFromApi,
  getContrastColor,
  getDominantColor,
  renderLyricCardToCanvas,
  searchArtistCandidates,
  type ArtistSearchCandidate,
} from '@/utils/lyricCard';

const props = defineProps<{
  text: string;
  artistName: string;
  songTitle: string;
  albumUrl: string;
  artistUrl: string | null;
  unknownArtistLabel: string;
  mainArtists: string[];
  featuringArtists: string[];
  isDarkMode: boolean;
  version: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const imageSource = ref('ALBUM');
const format = ref<'1:1' | '16:9' | '9:16'>('1:1');
const zoom = ref(1);
const searchQuery = ref('');
const searchLoading = ref(false);
const searchResults = ref<ArtistSearchCandidate[]>([]);
const searchError = ref(false);
const showSearch = computed(() => imageSource.value === 'MANUAL_SEARCH');
const currentUploadedImage = ref<string | null>(null);
const artistImageCache = ref<Record<string, string>>({});
const artistImageLabels = ref<Record<string, string>>({});

const displayArtist = ref(props.artistName);
const displayTitle = ref(props.songTitle);
const showMetaEditor = ref(false);

const allArtists = computed(() => {
  return [...new Set([...props.mainArtists, ...props.featuringArtists])].filter(Boolean);
});

const filteredArtistImageCache = computed(() => {
  const filtered: Record<string, string> = {};
  for (const key in artistImageCache.value) {
    if (!allArtists.value.some(a => a.toLowerCase() === key.toLowerCase()) && !['ALBUM', 'CUSTOM', 'MANUAL_SEARCH'].includes(key)) {
      filtered[key] = artistImageCache.value[key];
    }
  }
  return filtered;
});

function closeModal() {
  emit('close');
}

function renderFallback(displayArtistName: string) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  renderLyricCardToCanvas(
    canvas,
    props.text,
    displayArtistName,
    props.songTitle,
    null,
    '#111',
    'white',
    null,
    format.value,
    zoom.value,
  );
}

function updateCard(imageUrl: string) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  renderFallback(displayArtist.value);

  const image = new Image();
  let isTimedOut = false;

  const timeout = window.setTimeout(() => {
    isTimedOut = true;
    renderFallback(displayArtist.value);
  }, 4000);

  if (imageUrl.startsWith('data:')) {
    image.src = imageUrl;
  } else {
    image.crossOrigin = 'Anonymous';
    const separator = imageUrl.includes('?') ? '&' : '?';
    image.src = `${imageUrl}${separator}t=${Date.now()}`;
  }

  image.onload = () => {
    if (isTimedOut) return;
    window.clearTimeout(timeout);

    const dominantColor = getDominantColor(image);
    const contrastColor = getContrastColor(dominantColor);

    const logo = new Image();
    const logoPath =
      contrastColor === 'white' ? '/images/geniuslogowhite.png' : '/images/geniuslogoblack.png';
    logo.src = browser.runtime.getURL(logoPath);

    logo.onload = () => {
      renderLyricCardToCanvas(
        canvas,
        props.text,
        displayArtist.value,
        displayTitle.value,
        image,
        dominantColor,
        contrastColor,
        logo,
        format.value,
        zoom.value,
      );
    };

    logo.onerror = () => {
      renderLyricCardToCanvas(
        canvas,
        props.text,
        displayArtist.value,
        displayTitle.value,
        image,
        dominantColor,
        contrastColor,
        null,
        format.value,
        zoom.value,
      );
    };
  };

  image.onerror = () => {
    if (isTimedOut) return;
    window.clearTimeout(timeout);
    renderFallback(displayArtist.value); // Use displayArtist.value here
  };
}

function refreshCurrentSelection() {
  void applySelectedSource();
}

async function applySelectedSource() {
  const selected = imageSource.value;

  if (selected === 'MANUAL_SEARCH') {
    return;
  }

  if (selected === 'ALBUM') {
    updateCard(props.albumUrl);
    return;
  }

  if (selected === 'CUSTOM') {
    if (currentUploadedImage.value) {
      updateCard(currentUploadedImage.value);
    }
    return;
  }

  const cached = artistImageCache.value[selected];
  if (cached) {
    updateCard(cached);
    return;
  }

  const fetchedUrl = await fetchArtistImageFromApi(selected, props.unknownArtistLabel, true);
  if (fetchedUrl) {
    artistImageCache.value[selected] = fetchedUrl;
    updateCard(fetchedUrl);
    showFeedback(`✅ ${t('lc_img_found')}`);
    return;
  }

  updateCard(props.albumUrl);
}

let searchDebounce: number | undefined;
function onSearchInput() {
  if (searchDebounce) window.clearTimeout(searchDebounce);

  const query = searchQuery.value.trim();
  if (!query) {
    searchResults.value = [];
    searchError.value = false;
    return;
  }

  searchDebounce = window.setTimeout(async () => {
    searchLoading.value = true;
    searchError.value = false;

    try {
      searchResults.value = await searchArtistCandidates(query);
    } catch {
      searchError.value = true;
      searchResults.value = [];
    } finally {
      searchLoading.value = false;
    }
  }, 300);
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function buildSearchResultKey(candidate: ArtistSearchCandidate): string {
  const normalizedName = candidate.name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const normalizedUrl = candidate.image_url.trim().toLowerCase();
  return `SEARCH_RESULT_${normalizedName}_${hashString(normalizedUrl)}`;
}

function applySearchResult(candidate: ArtistSearchCandidate) {
  const key = buildSearchResultKey(candidate);
  artistImageCache.value[key] = candidate.image_url;
  artistImageLabels.value[key] = candidate.name;
  imageSource.value = key;
  searchResults.value = [];
  searchQuery.value = '';
  updateCard(candidate.image_url);
  showFeedback(`✨ ${t('lc_img_applied')} ${candidate.name}`);
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    currentUploadedImage.value = String(loadEvent.target?.result ?? '');
    imageSource.value = 'CUSTOM';
    if (currentUploadedImage.value) {
      updateCard(currentUploadedImage.value);
      showFeedback(`📂 ${t('lc_img_loaded')}`);
    }
  };
  reader.readAsDataURL(file);
}

function showFeedback(message: string) {
  window.dispatchEvent(new CustomEvent('gft-show-feedback', { detail: { message } }));
}

function downloadCard() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = `genius_lyric_card_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showFeedback(`✅ ${t('lc_download_done')}`);
}

async function shareToX() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const clipboardCtor = (window as typeof window & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
  if (!clipboardCtor || !navigator.clipboard?.write) {
    showFeedback(`❌ ${t('lc_error_copy')}`);
    return;
  }

  showFeedback(`📋 ${t('lc_share_copying')}`);

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    try {
      const item = new clipboardCtor({ 'image/png': blob });
      await navigator.clipboard.write([item]);

      showFeedback(`✅ ${t('lc_share_copied')}`);

      const tweetText = `${props.songTitle} by ${props.artistName}\n\n${window.location.href}\n\n#Genius #Lyrics`;
      const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      const width = 600;
      const height = 450;
      const left = window.innerWidth / 2 - width / 2 + window.screenX;
      const top = window.innerHeight / 2 - height / 2 + window.screenY;
      window.open(
        intentUrl,
        'share-x',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
      );
    } catch {
      showFeedback(`❌ ${t('lc_error_copy')}`);
    }
  }, 'image/png');
}

watch([displayArtist, displayTitle], () => {
  refreshCurrentSelection();
});

onMounted(() => {
  updateCard(props.albumUrl);
});
</script>

<template>
  <div class="gft-u-overlay gft-u-overlay--center gft-u-overlay--blur gft-lc-overlay" @click.self="closeModal">
    <div class="gft-lc-modal" :class="{ 'gft-lc-modal--dark': isDarkMode }">
      <button type="button" class="gft-lc-close" @click="closeModal">&times;</button>

      <h3 class="gft-lc-title">
        {{ t('lc_modal_title') }}
        <span class="gft-lc-version">v{{ version }}</span>
      </h3>

      <div class="gft-lc-canvas-wrap">
        <canvas ref="canvasRef" class="gft-lc-canvas" />

        <button
          type="button"
          class="gft-lc-meta-toggle gft-u-hover-lift"
          :class="{ 'gft-lc-meta-toggle--active': showMetaEditor }"
          @click="showMetaEditor = !showMetaEditor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" role="img">
            <title>{{ t('lc_edit_meta_btn') }}</title>
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>
          <span class="gft-lc-meta-toggle-label">{{ t('lc_edit_meta_btn') }}</span>
        </button>

        <Transition name="gft-lc-meta-fade">
          <div v-if="showMetaEditor" class="gft-lc-meta-overlay">
            <div class="gft-lc-meta-field">
              <label>{{ t('lc_artist_label') }}</label>
              <input v-model="displayArtist" type="text" spellcheck="false" />
            </div>
            <div class="gft-lc-meta-field">
              <label>{{ t('lc_title_label') }}</label>
              <input v-model="displayTitle" type="text" spellcheck="false" />
            </div>
          </div>
        </Transition>
      </div>

      <div class="gft-lc-row">
        <select
          v-model="imageSource"
          class="gft-lc-input gft-u-pill-control gft-u-hover-lift"
          @change="applySelectedSource"
        >
          <option value="ALBUM">{{ t('lc_album_default') }}</option>
          <option v-for="artist in allArtists" :key="artist" :value="artist">{{ artist }}</option>
          <option value="MANUAL_SEARCH">{{ t('lc_manual_search') }}</option>
          <option v-if="currentUploadedImage" value="CUSTOM">{{ t('lc_custom_img') }}</option>
          <option
            v-for="(url, key) in filteredArtistImageCache"
            :key="key"
            :value="key"
          >
            {{ artistImageLabels[key] || key }}
          </option>
        </select>

        <select
          v-model="format"
          class="gft-lc-input gft-u-pill-control gft-u-hover-lift"
          @change="refreshCurrentSelection"
        >
          <option value="1:1">1:1</option>
          <option value="16:9">16:9</option>
          <option value="9:16">9:16</option>
        </select>

        <label class="gft-lc-zoom">
          <span>{{ zoom.toFixed(1) }}x</span>
          <input v-model.number="zoom" type="range" min="0.5" max="2" step="0.1" @input="refreshCurrentSelection" />
        </label>
      </div>

      <div v-if="showSearch" class="gft-lc-search">
        <input
          v-model="searchQuery"
          class="gft-lc-input"
          type="text"
          :placeholder="t('lc_search_placeholder')"
          @input="onSearchInput"
        />

        <div v-if="searchLoading" class="gft-lc-search-state">{{ t('lc_search_searching') }}</div>
        <div v-else-if="searchError" class="gft-lc-search-state gft-lc-search-state--error">{{ t('lc_error_search') }}</div>
        <div v-else-if="searchQuery && !searchResults.length" class="gft-lc-search-state">{{ t('lc_search_none') }}</div>

        <button
          v-for="candidate in searchResults"
          :key="candidate.name + candidate.image_url"
          type="button"
          class="gft-lc-result"
          @click="applySearchResult(candidate)"
        >
          <img :src="candidate.image_url" alt="" />
          <span>{{ candidate.name }}</span>
        </button>
      </div>

      <div class="gft-lc-row gft-lc-row--actions">
        <label class="gft-lc-upload gft-u-pill-control gft-u-pill-control--inline gft-u-hover-lift">
          {{ t('lc_upload_btn') }}
          <input type="file" accept="image/*" @change="onFileChange" />
        </label>

        <button
          type="button"
          class="gft-lc-btn gft-u-pill-control gft-u-pill-control--inline gft-u-hover-lift gft-lc-btn--primary"
          @click="downloadCard"
        >
          {{ t('lc_download_btn') }}
        </button>
        <button
          type="button"
          class="gft-lc-btn gft-u-pill-control gft-u-pill-control--inline gft-u-hover-lift gft-lc-btn--x"
          @click="shareToX"
        >
          {{ t('lc_share_btn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gft-lc-overlay {
  z-index: 2147483640;
  background: rgba(0, 0, 0, 0.85);
}

.gft-lc-modal {
  position: relative;
  width: min(1200px, 95vw);
  max-height: 90vh;
  overflow: hidden auto;
  background: #fff;
  color: #222;
  border-radius: 12px;
  padding: 30px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.gft-lc-modal--dark {
  background: #222;
  color: #eee;
}

.gft-lc-close {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: none;
  color: #666;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.gft-lc-modal--dark .gft-lc-close {
  color: #aaa;
}

.gft-lc-close:hover {
  color: #000;
}

.gft-lc-modal--dark .gft-lc-close:hover {
  color: #fff;
}

.gft-lc-title {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.gft-lc-version {
  font-size: 11px;
  color: #aaa;
  font-family: monospace;
  font-weight: 400;
}

.gft-lc-modal--dark .gft-lc-version {
  color: #888;
}

.gft-lc-canvas {
  max-width: 100%;
  max-height: 60vh;
  display: block;
  background: #111;
}

.gft-lc-canvas-wrap {
  position: relative;
  margin-top: 4px;
  border: 2px solid #555;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.gft-lc-meta-toggle {
  position: absolute;
  bottom: 12px;
  right: 12px;
  height: 36px;
  border-radius: 999px;
  padding: 0 14px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gft-lc-meta-toggle-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.gft-lc-meta-toggle:hover, .gft-lc-meta-toggle--active {
  background: #f9ff55;
  color: black;
  border-color: #f9ff55;
}

.gft-lc-meta-overlay {
  position: absolute;
  bottom: 60px;
  right: 12px;
  width: min(240px, 80vw);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.gft-lc-meta-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gft-lc-meta-field label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  opacity: 0.7;
  color: white;
}

.gft-lc-meta-field input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
  color: white;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.gft-lc-meta-field input:focus {
  border-color: #f9ff55;
}

.gft-lc-meta-fade-enter-active,
.gft-lc-meta-fade-leave-active {
  transition: all 0.3s ease;
}

.gft-lc-meta-fade-enter-from,
.gft-lc-meta-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.gft-lc-row {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.gft-lc-input {
  appearance: none;
  min-width: 80px;
  max-width: 250px;
  padding: 11px 36px 11px 20px;
  background-color: rgba(128, 128, 128, 0.12);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 14px) center;
  outline: none;
  border: 1px solid rgba(128, 128, 128, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.gft-lc-input--text-edit {
  background-image: none;
  padding-right: 20px;
  cursor: text;
  flex: 1;
}

.gft-lc-modal--dark .gft-lc-input {
  background-color: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.1);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23aaa' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
}

.gft-lc-input:hover {
  background-color: rgba(128, 128, 128, 0.18);
  border-color: rgba(128, 128, 128, 0.3);
}

.gft-lc-modal--dark .gft-lc-input:hover {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.gft-lc-input:focus {
  border-color: #f9ff55;
  box-shadow: 0 0 0 2px rgba(249, 255, 85, 0.15);
}

.gft-lc-search .gft-lc-input {
  max-width: none;
  width: 100%;
  border-radius: 999px;
  padding-right: 20px;
  background-image: none;
  cursor: text;
}

.gft-lc-input option {
  background: #fff;
  color: #000;
}

.gft-lc-modal--dark .gft-lc-input option {
  background: #333;
  color: #fff;
}

.gft-lc-zoom {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  box-sizing: border-box;
  border-radius: 999px;
  padding: 4px 16px;
  background: rgba(128, 128, 128, 0.08);
}

.gft-lc-zoom span {
  min-width: 40px;
  font-size: 12px;
  font-weight: 700;
}

.gft-lc-zoom input[type='range'] {
  -webkit-appearance: none;
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: rgba(128, 128, 128, 0.2);
  outline: none;
}

.gft-lc-zoom input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f9ff55;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(249, 255, 85, 0.4);
  transition: all 0.2s;
}

.gft-lc-zoom input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 12px rgba(249, 255, 85, 0.6);
}

.gft-lc-search {
  margin-top: 2px;
  display: grid;
  gap: 6px;
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 8px;
}

.gft-lc-modal--dark .gft-lc-search {
  background: rgba(255, 255, 255, 0.06);
}

.gft-lc-search-state {
  opacity: 0.75;
  text-align: center;
  padding: 6px;
}

.gft-lc-search-state--error {
  color: #ff6b6b;
}

.gft-lc-result {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.05);
  color: inherit;
  cursor: pointer;
  transition: background 0.1s;
  text-align: left;
}

.gft-lc-modal--dark .gft-lc-result {
  background: rgba(255, 255, 255, 0.05);
}

.gft-lc-result:hover {
  background: rgba(0, 0, 0, 0.1);
}

.gft-lc-modal--dark .gft-lc-result:hover {
  background: rgba(255, 255, 255, 0.15);
}

.gft-lc-result img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.gft-lc-row--actions {
  justify-content: center;
  gap: 15px;
}

.gft-lc-modal--dark .gft-lc-upload {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.gft-lc-upload input {
  display: none;
}

.gft-lc-btn {
  outline: none;
}

.gft-lc-btn--primary {
  background: #f9ff55;
  color: #000;
  border: none;
  font-weight: 700;
}

.gft-lc-btn--x {
  background: #000;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .gft-lc-modal {
    width: 98vw;
    padding: 22px 12px 12px;
  }

  .gft-lc-row {
    gap: 10px;
  }

  .gft-lc-input {
    max-width: 100%;
  }
}
</style>
