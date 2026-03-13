<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Theme } from '@/types';

const { t } = useI18n();

const props = defineProps<{
  modelValue: Theme;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Theme];
}>();

function select(theme: Theme) {
  if (props.modelValue !== theme) {
    emit('update:modelValue', theme);
  }
}
</script>

<template>
  <div class="gft-u-popup-section-title">{{ t('popup_theme_title') }}</div>
  <div class="gft-u-popup-btn-group">
    <button
      type="button"
      class="gft-u-popup-pill"
      :class="{ active: modelValue === 'light' }"
      @click="select('light')"
    >
      ☀️ {{ t('popup_light') }}
    </button>
    <button
      type="button"
      class="gft-u-popup-pill"
      :class="{ active: modelValue === 'dark' }"
      @click="select('dark')"
    >
      🌙 {{ t('popup_dark') }}
    </button>
  </div>
</template>
