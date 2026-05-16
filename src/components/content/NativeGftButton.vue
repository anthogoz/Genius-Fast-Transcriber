<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useExport } from '@/composables/useExport';

const props = defineProps<{
  buttonClass: string;
  labelClass: string;
  isLyricsPage: boolean;
}>();

const { t } = useI18n();

// --- Dropdown state ---
const isDropdownOpen = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

// --- Export modal state (lyrics pages only) ---
const isExportModalOpen = ref(false);
const optNoTags = ref(false);
const optNoSpacing = ref(false);
const previewText = ref('');

// Only initialise useExport on lyrics pages to avoid errors on album pages
// where no editor/lyrics container exists.
const exportApi = props.isLyricsPage ? useExport() : null;

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function closeDropdown() {
  isDropdownOpen.value = false;
}

// --- Cover helpers (shared between lyrics & album pages) ---
function getCoverUrl(): string | null {
  const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
  if (ogImage?.content) return ogImage.content;

  const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
  if (twitterImage?.content) return twitterImage.content;

  const headerImg = document.querySelector<HTMLImageElement>(
    'img[class*="CoverArt"], div[class*="SizedImage"] img, div[class*="SongHeader"] img',
  );
  if (headerImg?.src) return headerImg.src;

  return null;
}

async function handleCopyCoverLink() {
  const url = getCoverUrl();
  if (!url) {
    showFeedback(`❌ ${t('album_cover_not_found')}`);
    closeDropdown();
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    showFeedback(`📋 ${t('feedback_copied')}`);
  } catch {
    showFeedback(`❌ ${t('lc_error_copy')}`);
  }
  closeDropdown();
}

async function handleDownloadCover() {
  const url = getCoverUrl();
  if (!url) {
    showFeedback(`❌ ${t('album_cover_not_found')}`);
    closeDropdown();
    return;
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const pageTitle = document.title.replace(/\s*\|.*$/, '').trim() || 'cover';
    const safeFilename = pageTitle.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '_');
    const ext = blob.type.includes('png') ? 'png' : 'jpg';

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${safeFilename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    showFeedback(`✅ ${t('album_cover_downloaded')}`);
  } catch {
    showFeedback(`❌ ${t('album_cover_download_error')}`);
  }
  closeDropdown();
}

// --- Export TXT helpers (lyrics pages only) ---
function openExportModal() {
  closeDropdown();
  if (!exportApi) return;
  isExportModalOpen.value = true;
  updatePreview();
}

function closeExportModal() {
  isExportModalOpen.value = false;
}

function updatePreview() {
  if (!exportApi) return;
  previewText.value = exportApi.getPreviewText({
    removeTags: optNoTags.value,
    removeSpacing: optNoSpacing.value,
  });
}

function handleExportDownload() {
  if (!exportApi) return;
  exportApi.exportLyrics({
    removeTags: optNoTags.value,
    removeSpacing: optNoSpacing.value,
  });
  closeExportModal();
}

async function handleExportCopy() {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('No clipboard API');
    await navigator.clipboard.writeText(previewText.value);
    showFeedback(`📋 ${t('feedback_copied')}`);
  } catch {
    showFeedback(`❌ ${t('lc_error_copy')}`);
  }
}

watch([optNoTags, optNoSpacing], () => {
  updatePreview();
});

// --- Shared ---
function showFeedback(message: string) {
  window.dispatchEvent(
    new CustomEvent('gft-show-feedback', { detail: { message } }),
  );
}

function onClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside, true);
});
</script>

<template>
  <div ref="wrapperRef" class="gft-native-btn-wrapper">
    <button
      type="button"
      :class="buttonClass"
      @click.stop="toggleDropdown"
      title="GFT Tools"
    >
      <span :class="labelClass">GFT {{ isDropdownOpen ? '▲' : '⚡' }}</span>
    </button>

    <!-- Dropdown menu -->
    <div v-if="isDropdownOpen" class="gft-native-dropdown">
      <div class="gft-native-dropdown__caret"></div>

      <a
        class="gft-native-dropdown__item"
        href="javascript:void(0)"
        @click.prevent.stop="handleCopyCoverLink"
      >
        {{ t('album_copy_cover_link') }}
      </a>
      <a
        class="gft-native-dropdown__item"
        href="javascript:void(0)"
        @click.prevent.stop="handleDownloadCover"
      >
        {{ t('album_download_cover') }}
      </a>
      <a
        v-if="isLyricsPage"
        class="gft-native-dropdown__item"
        href="javascript:void(0)"
        @click.prevent.stop="openExportModal"
      >
        Export TXT
      </a>
    </div>

    <!-- Export TXT modal (lyrics pages only) -->
    <Teleport to="body">
      <Transition name="gft-export-transition">
        <div v-if="isExportModalOpen" class="gft-export-overlay" @click.stop="closeExportModal">
          <div class="gft-export-modal" @click.stop>
            <div class="gft-export-header">
              <h3>{{ t('section_export') }}</h3>
              <button class="gft-export-close" @click="closeExportModal" type="button">×</button>
            </div>

            <div class="gft-export-body">
              <div class="gft-export-options">
                <label class="gft-export-toggle">
                  <span>{{ t('export_opt_no_tags') }}</span>
                  <div class="gft-toggle" :class="{ 'gft-toggle--active': optNoTags }">
                    <input type="checkbox" v-model="optNoTags" class="gft-toggle__input" />
                    <div class="gft-toggle__track">
                      <div class="gft-toggle__thumb"></div>
                    </div>
                  </div>
                </label>

                <label class="gft-export-toggle">
                  <span>{{ t('export_opt_no_spacing') }}</span>
                  <div class="gft-toggle" :class="{ 'gft-toggle--active': optNoSpacing }">
                    <input type="checkbox" v-model="optNoSpacing" class="gft-toggle__input" />
                    <div class="gft-toggle__track">
                      <div class="gft-toggle__thumb"></div>
                    </div>
                  </div>
                </label>
              </div>

              <div class="gft-export-preview">
                <div class="gft-export-preview-header">{{ t('export_preview') }}</div>
                <textarea class="gft-export-preview-content" readonly v-model="previewText"></textarea>
              </div>
            </div>

            <div class="gft-export-footer">
              <button class="gft-btn-secondary" @click="handleExportCopy" type="button">
                {{ t('copy') }}
              </button>
              <button class="gft-btn-download" @click="handleExportDownload" type="button">
                {{ t('export_download') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ========== Dropdown (native Genius style) ========== */
.gft-native-btn-wrapper {
  position: relative;
  display: inline-block;
}

.gft-native-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: max-content;
  padding: 4px 0;
  font-family: 'Programme', -apple-system, BlinkMacSystemFont, sans-serif;
}

.gft-native-dropdown__caret {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #ccc;
}

.gft-native-dropdown__caret::after {
  content: '';
  position: absolute;
  top: 1px;
  left: -5px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #fff;
}

.gft-native-dropdown__item {
  display: block;
  padding: 8px 16px;
  color: #000;
  font-size: 13px;
  font-weight: 400;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  line-height: 1.4;
}

.gft-native-dropdown__item:hover {
  background: #f0f0f0;
  text-decoration: none;
  color: #000;
}

/* ========== Export TXT Modal ========== */
.gft-export-overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.6);
  z-index: 2147483645;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  color: #fff;
}

.gft-export-modal {
  background: #1e1e1e;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.gft-export-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gft-export-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: inherit;
}

.gft-export-close {
  background: transparent;
  border: none;
  color: #a0a0a0;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.gft-export-close:hover {
  color: #fff;
}

.gft-export-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.gft-export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.gft-export-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.gft-export-preview {
  display: flex;
  flex-direction: column;
}

.gft-export-preview-header {
  font-size: 12px;
  text-transform: uppercase;
  color: #a0a0a0;
  margin-bottom: 8px;
  font-weight: 500;
}

.gft-export-preview-content {
  width: 100%;
  height: 200px;
  background: rgba(0, 0, 0, 0.4);
  color: #d0d0d0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  white-space: pre-wrap;
  outline: none;
}

.gft-export-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.gft-btn-secondary {
  font-family: inherit;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.gft-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.gft-btn-secondary:active {
  transform: scale(0.97);
}

.gft-btn-download {
  font-family: inherit;
  background: #f9ff55;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.gft-btn-download:hover {
  opacity: 0.9;
}

.gft-btn-download:active {
  transform: scale(0.97);
}

/* Toggle switch */
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
}

.gft-toggle__track {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.4s;
  border-radius: 20px;
}

.gft-toggle__thumb {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.gft-toggle--active .gft-toggle__track {
  background-color: #f9ff55;
}

.gft-toggle--active .gft-toggle__thumb {
  transform: translateX(16px);
  background-color: #000;
}

/* Modal transitions */
.gft-export-transition-enter-active,
.gft-export-transition-leave-active {
  transition: opacity 0.3s ease;
}

.gft-export-transition-enter-from,
.gft-export-transition-leave-to {
  opacity: 0;
}

.gft-export-transition-enter-active .gft-export-modal {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gft-export-transition-leave-active .gft-export-modal {
  transition: transform 0.2s ease-in;
}

.gft-export-transition-enter-from .gft-export-modal {
  transform: scale(0.9) translateY(10px);
}

.gft-export-transition-leave-to .gft-export-modal {
  transform: scale(0.95);
}
</style>
