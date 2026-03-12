<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
</template>

<style scoped>
.gft-artist-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
  align-items: center;
}

.gft-artist-selector__title {
  width: 100%;
  margin: 0 0 1px 0;
  font-size: 12px;
  font-weight: 600;
}

.gft-artist-selector__empty {
  font-style: italic;
  font-size: 12px;
  opacity: 0.7;
}

.gft-artist-selector__list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
}

.gft-artist-selector__item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  cursor: pointer;
}

.gft-artist-selector__item input[type="checkbox"] {
  cursor: pointer;
}
</style>
