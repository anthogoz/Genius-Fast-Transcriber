<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ExtensionMode } from '@/types';

const { t } = useI18n();

const props = defineProps<{
  modelValue: ExtensionMode;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ExtensionMode];
}>();

function select(mode: ExtensionMode) {
  if (props.modelValue !== mode) {
    emit('update:modelValue', mode);
  }
}
</script>

<template>
  <div class="gft-u-popup-section-title">{{ t('mode_select_title') }}</div>
  <div
    class="gft-u-popup-card"
    :class="{ active: modelValue === 'full' }"
    @click="select('full')"
  >
    <h3 class="gft-u-popup-card-title">⚡ {{ t('mode_full_title') }}</h3>
    <p class="gft-u-popup-card-desc">{{ t('mode_full_desc') }}</p>
  </div>
  <div
    class="gft-u-popup-card"
    :class="{ active: modelValue === 'lyric-card-only' }"
    @click="select('lyric-card-only')"
  >
    <h3 class="gft-u-popup-card-title">🎨 {{ t('mode_lyric_title') }}</h3>
    <p class="gft-u-popup-card-desc">{{ t('mode_lyric_desc') }}</p>
  </div>
</template>
