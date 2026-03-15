<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGftState } from '@/composables/useGftState';

const { t } = useI18n();
const { detectedArtists } = useGftState();

const emit = defineEmits<{
  artistsSelected: [artists: string[]];
}>();

const selected = ref<Set<string>>(new Set());

const hasArtists = computed(() => detectedArtists.value.length > 0);

function toggle(artist: string) {
  const next = new Set(selected.value);
  if (next.has(artist)) {
    next.delete(artist);
  } else {
    next.add(artist);
  }
  selected.value = next;
  emit('artistsSelected', [...next]);
}

watch(detectedArtists, () => {
  selected.value = new Set();
});

function getSelectedArtists(): string[] {
  return [...selected.value];
}

defineExpose({ getSelectedArtists });
</script>

<template>
  <div class="gft-artist-selector">
    <div class="gft-artist-selector__content">
      <p class="gft-artist-selector__title">{{ t('artist_selection') }}</p>
      <span v-if="!hasArtists" class="gft-artist-selector__empty">
        {{ t('no_artist') }}
      </span>
      <div v-else class="gft-artist-selector__list">
        <label
          v-for="artist in detectedArtists"
          :key="artist"
          class="gft-artist-selector__item"
        >
          <input
            type="checkbox"
            :checked="selected.has(artist)"
            @change="toggle(artist)"
          />
          <span>{{ artist }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gft-artist-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
  align-items: center;
}

.gft-artist-selector__title {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gft-title-color, #777);
  letter-spacing: 0.5px;
  white-space: nowrap;
}


.gft-artist-selector__content {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  align-items: center;
}

.gft-artist-selector__empty {
  font-style: italic;
  font-size: 11px;
  opacity: 0.7;
}

.gft-artist-selector__list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 8px;
}

.gft-artist-selector__item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  cursor: pointer;
  background: var(--gft-btn-bg, rgba(255, 255, 255, 0.05));
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--gft-btn-border, rgba(255, 255, 255, 0.1));
  transition: all 0.2s ease;
}

.gft-artist-selector__item:hover {
  background: var(--gft-btn-hover-bg, #ffff64);
  color: var(--gft-btn-hover-text, #000);
}

.gft-artist-selector__item input[type="checkbox"] {
  cursor: pointer;
  margin: 0;
  width: 12px;
  height: 12px;
}
</style>

