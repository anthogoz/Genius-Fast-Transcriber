<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Locale } from '@/types';

const { t } = useI18n();

const props = defineProps<{
  modelValue: Locale;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Locale];
}>();

const locales: { id: Locale; label: string }[] = [
  { id: 'fr', label: '🇫🇷 Français' },
  { id: 'en', label: '🇬🇧 English' },
  { id: 'pl', label: '🇵🇱 Polski' },
  { id: 'es', label: '🇪🇸 Español' },
  { id: 'de', label: '🇩🇪 Deutsch' },
  { id: 'it', label: '🇮🇹 Italiano' },
  { id: 'pt', label: '🇧🇷 Português' },
  { id: 'ru', label: '🇷🇺 Русский' },
];

function onSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value as Locale;
  if (props.modelValue !== value) {
    emit('update:modelValue', value);
  }
}
</script>

<template>
  <div class="gft-u-popup-section-title">{{ t('lang_select_title') }}</div>
  <select
    class="gft-u-popup-select"
    :value="modelValue"
    @change="onSelect"
  >
    <option
      v-for="loc in locales"
      :key="loc.id"
      :value="loc.id"
    >
      {{ loc.label }}
    </option>
  </select>
</template>

<style scoped>
.gft-u-popup-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text);
  cursor: pointer;
  appearance: auto;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.gft-u-popup-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--accent-shadow);
}
</style>
