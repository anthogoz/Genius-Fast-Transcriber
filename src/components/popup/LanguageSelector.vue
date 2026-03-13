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
  { id: 'fr', label: 'FR' },
  { id: 'en', label: 'EN' },
  { id: 'pl', label: 'PL' },
];

function select(locale: Locale) {
  if (props.modelValue !== locale) {
    emit('update:modelValue', locale);
  }
}
</script>

<template>
  <div class="gft-u-popup-section-title">{{ t('lang_select_title') }}</div>
  <div class="gft-u-popup-btn-group">
    <button
      v-for="loc in locales"
      :key="loc.id"
      type="button"
      class="gft-u-popup-pill"
      :class="{ active: modelValue === loc.id }"
      @click="select(loc.id)"
    >
      {{ loc.label }}
    </button>
  </div>
</template>
