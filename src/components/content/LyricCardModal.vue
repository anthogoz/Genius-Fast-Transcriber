<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import {
  fetchArtistImageFromApi,
  getContrastColor,
  getDominantColor,
  renderLyricCardToCanvas,
  rgbToHex,
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
const isAutoColor = ref(true);
const isDarkLyrics = ref(true);
const isBlackFooter = ref(false);
const customColor = ref('#111111');
const lastDominantSource = ref('');
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
    isAutoColor.value,
    isDarkLyrics.value,
    isBlackFooter.value,
    customColor.value,
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
    const hexColor = rgbToHex(dominantColor);
    
    // Assign hex custom color dynamically if the source image itself changed
    if (lastDominantSource.value !== imageUrl) {
      customColor.value = hexColor;
      lastDominantSource.value = imageUrl;
    }

    const contrastColor = getContrastColor(dominantColor);

    let effectiveFooterColor = dominantColor;
    if (!isAutoColor.value) {
      effectiveFooterColor = isBlackFooter.value ? '#000000' : customColor.value;
    }
    const effectiveTextColor = getContrastColor(effectiveFooterColor);

    const logo = new Image();
    const logoPath =
      effectiveTextColor === 'white' ? '/images/geniuslogowhite.png' : '/images/geniuslogoblack.png';
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
        isAutoColor.value,
        isDarkLyrics.value,
        isBlackFooter.value,
        customColor.value,
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
        isAutoColor.value,
        isDarkLyrics.value,
        isBlackFooter.value,
        customColor.value,
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
  showFeedback(t('lc_download_done'));
}

async function shareToX() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const clipboardCtor = (window as typeof window & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
  if (!clipboardCtor || !navigator.clipboard?.write) {
    showFeedback(`❌ ${t('lc_error_copy')}`);
    return;
  }

  showFeedback(t('lc_share_copying'));

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    try {
      const item = new clipboardCtor({ 'image/png': blob });
      await navigator.clipboard.write([item]);

      showFeedback(t('lc_share_copied'));

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

      <!-- Sleek Header -->
      <div class="gft-lc-header">
        <h3 class="gft-lc-title">
          {{ t('lc_modal_title') }}
          <span class="gft-lc-version">v{{ version }}</span>
        </h3>
      </div>

      <!-- Main body flex layout -->
      <div class="gft-lc-modal-body">
        
        <!-- Left: Preview pane containing the canvas wrapper -->
        <div class="gft-lc-preview-pane">
          <div class="gft-lc-canvas-wrap">
            <canvas ref="canvasRef" class="gft-lc-canvas" />
          </div>
        </div>

        <!-- Right: Sleek Sidebar scrollable controls panel -->
        <div class="gft-lc-sidebar">
          
          <!-- Group 1: Metadata inputs -->
          <div class="gft-lc-group">
            <div class="gft-lc-group-title">📝 {{ t('lc_edit_meta_btn') }}</div>
            <div class="gft-lc-group-content">
              <div class="gft-lc-field">
                <label class="gft-lc-field-label">{{ t('lc_artist_label') }}</label>
                <input v-model="displayArtist" type="text" spellcheck="false" class="gft-lc-input-text" />
              </div>
              <div class="gft-lc-field">
                <label class="gft-lc-field-label">{{ t('lc_title_label') }}</label>
                <input v-model="displayTitle" type="text" spellcheck="false" class="gft-lc-input-text" />
              </div>
            </div>
          </div>

          <!-- Group 2: Dimension & Source -->
          <div class="gft-lc-group">
            <div class="gft-lc-group-title">🖼️ {{ t('lc_format_source') }}</div>
            <div class="gft-lc-group-content">
              <div class="gft-lc-field">
                <label class="gft-lc-field-label">{{ t('lc_image_source') }}</label>
                <select
                  v-model="imageSource"
                  class="gft-lc-input gft-lc-select-full"
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
              </div>

              <!-- Search pane inside Group 2 if showSearch is active -->
              <Transition name="gft-lc-fade">
                <div v-if="showSearch" class="gft-lc-search">
                  <input
                    v-model="searchQuery"
                    class="gft-lc-input-text gft-lc-search-input"
                    type="text"
                    :placeholder="t('lc_search_placeholder')"
                    @input="onSearchInput"
                  />
                  <div v-if="searchLoading" class="gft-lc-search-state">{{ t('lc_search_searching') }}</div>
                  <div v-else-if="searchError" class="gft-lc-search-state gft-lc-search-state--error">{{ t('lc_error_search') }}</div>
                  <div v-else-if="searchQuery && !searchResults.length" class="gft-lc-search-state">{{ t('lc_search_none') }}</div>

                  <div class="gft-lc-search-results-list">
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
                </div>
              </Transition>

              <div class="gft-lc-field">
                <label class="gft-lc-field-label">{{ t('lc_output_format') }}</label>
                <select
                  v-model="format"
                  class="gft-lc-input gft-lc-select-full"
                  @change="refreshCurrentSelection"
                >
                  <option value="1:1">1:1</option>
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                </select>
              </div>

              <div class="gft-lc-field">
                <label class="gft-lc-field-label">
                  {{ t('lc_zoom_field') }} : <strong>{{ zoom.toFixed(1) }}x</strong>
                </label>
                <div class="gft-lc-slider-container">
                  <input v-model.number="zoom" type="range" min="0.5" max="2" step="0.1" @input="refreshCurrentSelection" class="gft-lc-slider" />
                </div>
              </div>
            </div>
          </div>

          <!-- Group 3: Design & Style -->
          <div class="gft-lc-group">
            <div class="gft-lc-group-title">🎨 {{ t('lc_style_colors') }}</div>
            <div class="gft-lc-group-content">
              <!-- Toggle Automatic Color -->
              <label class="gft-lc-toggle-label">
                <div class="gft-toggle" :class="{ 'gft-toggle--active': isAutoColor }">
                  <input type="checkbox" v-model="isAutoColor" class="gft-toggle__input" @change="refreshCurrentSelection" />
                  <div class="gft-toggle__track">
                    <div class="gft-toggle__thumb"></div>
                  </div>
                </div>
                <span>{{ t('lc_theme_auto') }}</span>
              </label>

              <!-- Shown only when isAutoColor is false -->
              <Transition name="gft-lc-fade">
                <div v-if="!isAutoColor" class="gft-lc-manual-options-list">
                  <!-- Toggle Dark Lyrics -->
                  <label class="gft-lc-toggle-label">
                    <div class="gft-toggle" :class="{ 'gft-toggle--active': isDarkLyrics }">
                      <input type="checkbox" v-model="isDarkLyrics" class="gft-toggle__input" @change="refreshCurrentSelection" />
                      <div class="gft-toggle__track">
                        <div class="gft-toggle__thumb"></div>
                      </div>
                    </div>
                    <span>{{ t('lc_theme_dark_lyrics') }}</span>
                  </label>

                  <!-- Toggle Black Footer -->
                  <label class="gft-lc-toggle-label">
                    <div class="gft-toggle" :class="{ 'gft-toggle--active': isBlackFooter }">
                      <input type="checkbox" v-model="isBlackFooter" class="gft-toggle__input" @change="refreshCurrentSelection" />
                      <div class="gft-toggle__track">
                        <div class="gft-toggle__thumb"></div>
                      </div>
                    </div>
                    <span>{{ t('lc_theme_black_footer') }}</span>
                  </label>

                  <!-- Custom Color Picker -->
                  <label v-if="!isBlackFooter" class="gft-lc-color-picker">
                    <span>{{ t('lc_theme_custom_color') }}</span>
                    <input type="color" v-model="customColor" @input="refreshCurrentSelection" />
                  </label>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Group 4: Actions -->
          <div class="gft-lc-group gft-lc-group--actions">
            <button
              type="button"
              class="gft-lc-btn-primary-action gft-u-hover-lift"
              @click="downloadCard"
            >
              {{ t('lc_download_btn') }}
            </button>
            <div class="gft-lc-actions-row">
              <label class="gft-lc-upload-btn-action gft-u-hover-lift">
                {{ t('lc_upload_btn') }}
                <input type="file" accept="image/*" @change="onFileChange" />
              </label>

              <button
                type="button"
                class="gft-lc-btn-secondary-action gft-u-hover-lift"
                @click="shareToX"
              >
                {{ t('lc_share_btn') }}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.gft-lc-overlay {
  z-index: 2147483640;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
}

.gft-lc-modal {
  position: relative;
  width: min(1200px, 95vw);
  max-height: 90vh;
  background: #ffffff;
  color: #1a1a1a;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  animation: gft-lc-modal-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  will-change: transform, opacity;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.gft-lc-modal--dark {
  background: #1e1e1e;
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

@keyframes gft-lc-modal-enter {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.gft-lc-close {
  position: absolute;
  top: 18px;
  right: 20px;
  border: none;
  background: none;
  color: #888;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.gft-lc-close:hover {
  color: #000;
  background: rgba(0, 0, 0, 0.05);
  transform: rotate(90deg);
}

.gft-lc-modal--dark .gft-lc-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.gft-lc-header {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 14px;
}

.gft-lc-modal--dark .gft-lc-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.gft-lc-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.gft-lc-version {
  font-size: 11px;
  color: #888;
  font-family: monospace;
  font-weight: 400;
}

/* Two-column layout */
.gft-lc-modal-body {
  display: flex;
  gap: 24px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* Left: Preview Pane */
.gft-lc-preview-pane {
  flex: 1;
  background: #121212;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.gft-lc-modal--dark .gft-lc-preview-pane {
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.gft-lc-canvas-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gft-lc-canvas {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: block;
}

/* Right: Sidebar */
.gft-lc-sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 6px;
  max-height: calc(90vh - 100px);
}

/* Custom Scrollbar for Sidebar */
.gft-lc-sidebar::-webkit-scrollbar {
  width: 6px;
}

.gft-lc-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.gft-lc-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.gft-lc-modal--dark .gft-lc-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

/* Parameter Groups */
.gft-lc-group {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gft-lc-modal--dark .gft-lc-group {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.gft-lc-group-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #666;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding-bottom: 6px;
  margin-bottom: 4px;
}

.gft-lc-modal--dark .gft-lc-group-title {
  color: #aaa;
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.gft-lc-group-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Form Fields */
.gft-lc-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gft-lc-field-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.gft-lc-modal--dark .gft-lc-field-label {
  color: #b3b3b3;
}

/* Text inputs and Selects */
.gft-lc-input-text,
.gft-lc-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #ffffff;
  color: inherit;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.gft-lc-modal--dark .gft-lc-input-text,
.gft-lc-modal--dark .gft-lc-input {
  border-color: rgba(255, 255, 255, 0.15);
  background: #2b2b2b;
}

.gft-lc-select-full {
  cursor: pointer !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: calc(100% - 12px) center !important;
  padding-right: 32px !important;
}

.gft-lc-modal--dark .gft-lc-select-full {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23aaa' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E") !important;
}

.gft-lc-input-text:focus,
.gft-lc-input:focus {
  border-color: #f9ff55;
  box-shadow: 0 0 0 2px rgba(249, 255, 85, 0.2);
}

/* Slider Controls */
.gft-lc-slider-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.gft-lc-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  margin: 8px 0;
}

.gft-lc-modal--dark .gft-lc-slider {
  background: rgba(255, 255, 255, 0.1);
}

.gft-lc-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f9ff55;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.gft-lc-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Manual search dropdown style */
.gft-lc-search {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 10px;
  margin-top: -4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gft-lc-modal--dark .gft-lc-search {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.05);
}

.gft-lc-search-state {
  font-size: 11px;
  color: #888;
  text-align: center;
  padding: 4px;
}

.gft-lc-search-state--error {
  color: #ff6b6b;
}

.gft-lc-search-results-list {
  max-height: 150px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gft-lc-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  text-align: left;
}

.gft-lc-modal--dark .gft-lc-result {
  background: #2b2b2b;
  border-color: rgba(255, 255, 255, 0.05);
}

.gft-lc-result:hover {
  background: rgba(249, 255, 85, 0.08);
  border-color: rgba(249, 255, 85, 0.3);
}

.gft-lc-result img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

/* Style & Colors Override Toggles */
.gft-lc-toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 0;
}

.gft-lc-manual-options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  padding-top: 10px;
  margin-top: 4px;
}

.gft-lc-modal--dark .gft-lc-manual-options-list {
  border-top-color: rgba(255, 255, 255, 0.08);
}

/* Custom Color Picker */
.gft-lc-color-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 0;
}

.gft-lc-color-picker input[type="color"] {
  border: none;
  background: none;
  padding: 0;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.gft-lc-color-picker input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.gft-lc-color-picker input[type="color"]::-webkit-color-swatch {
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: inset 0 0 2px rgba(0,0,0,0.2);
}

/* Toggles styling (Matching premium style) */
.gft-toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}

.gft-toggle__input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.gft-toggle__track {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.12);
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px;
}

.gft-lc-modal--dark .gft-toggle__track {
  background-color: rgba(255, 255, 255, 0.15);
}

.gft-toggle__thumb {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.gft-toggle--active .gft-toggle__track {
  background-color: #f9ff55;
}

.gft-toggle--active .gft-toggle__thumb {
  transform: translateX(16px);
  background-color: #000000;
}

/* Action Group */
.gft-lc-group--actions {
  background: transparent;
  border: none;
  padding: 0;
  gap: 10px;
}

.gft-lc-btn-primary-action {
  width: 100%;
  background: #f9ff55;
  color: #000000;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(249, 255, 85, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.gft-lc-btn-primary-action:hover {
  background: #fffc7d;
  box-shadow: 0 6px 16px rgba(249, 255, 85, 0.4);
}

.gft-lc-actions-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.gft-lc-upload-btn-action,
.gft-lc-btn-secondary-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.gft-lc-upload-btn-action {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: inherit;
  position: relative;
}

.gft-lc-modal--dark .gft-lc-upload-btn-action {
  border-color: rgba(255, 255, 255, 0.15);
}

.gft-lc-upload-btn-action input {
  display: none;
}

.gft-lc-btn-secondary-action {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: inherit;
}

.gft-lc-modal--dark .gft-lc-btn-secondary-action {
  border-color: rgba(255, 255, 255, 0.15);
}

.gft-lc-upload-btn-action:hover,
.gft-lc-btn-secondary-action:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.25);
}

.gft-lc-modal--dark .gft-lc-upload-btn-action:hover,
.gft-lc-modal--dark .gft-lc-btn-secondary-action:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Transitions */
.gft-lc-fade-enter-active,
.gft-lc-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gft-lc-fade-enter-from,
.gft-lc-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive Stack */
@media (max-width: 900px) {
  .gft-lc-modal {
    width: 95vw;
    max-height: 95vh;
  }

  .gft-lc-modal-body {
    flex-direction: column;
    overflow-y: auto;
  }

  .gft-lc-sidebar {
    width: 100%;
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }

  .gft-lc-preview-pane {
    padding: 12px;
  }

  .gft-lc-canvas {
    max-height: 45vh;
  }
}
</style>
