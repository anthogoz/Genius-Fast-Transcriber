<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  buttonClass: string;
  labelClass: string;
}>();

const { t } = useI18n();

const isOpen = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

function getCoverUrl(): string | null {
  const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
  if (ogImage?.content) return ogImage.content;

  const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
  if (twitterImage?.content) return twitterImage.content;

  const headerImg = document.querySelector<HTMLImageElement>(
    'img[class*="CoverArt"], div[class*="SizedImage"] img, div[class*="album_info"] img',
  );
  if (headerImg?.src) return headerImg.src;

  return null;
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function closeDropdown() {
  isOpen.value = false;
}

async function handleCopyLink() {
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

async function handleDownload() {
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

    const pageTitle = document.title.replace(/\s*\|.*$/, '').trim() || 'album-cover';
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
  <div ref="wrapperRef" class="gft-album-tools-wrapper">
    <button
      type="button"
      :class="buttonClass"
      @click.stop="toggleDropdown"
      title="GFT Tools"
    >
      <span :class="labelClass">GFT {{ isOpen ? '▲' : '⚡' }}</span>
    </button>

    <div v-if="isOpen" class="gft-album-tools-dropdown">
      <div class="gft-album-tools-caret"></div>
      <a
        class="gft-album-tools-dropdown__item"
        href="javascript:void(0)"
        @click.prevent.stop="handleCopyLink"
      >
        {{ t('album_copy_cover_link') }}
      </a>
      <a
        class="gft-album-tools-dropdown__item"
        href="javascript:void(0)"
        @click.prevent.stop="handleDownload"
      >
        {{ t('album_download_cover') }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.gft-album-tools-wrapper {
  position: relative;
  display: inline-block;
}

.gft-album-tools-dropdown {
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

.gft-album-tools-caret {
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

.gft-album-tools-caret::after {
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

.gft-album-tools-dropdown__item {
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

.gft-album-tools-dropdown__item:hover {
  background: #f0f0f0;
  text-decoration: none;
  color: #000;
}
</style>
