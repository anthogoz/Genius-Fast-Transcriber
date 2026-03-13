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
    class="card"
    :class="{ active: modelValue === 'full' }"
    @click="select('full')"
  >
    <h3>⚡ {{ t('mode_full_title') }}</h3>
    <p>{{ t('mode_full_desc') }}</p>
  </div>
  <div
    class="card"
    :class="{ active: modelValue === 'lyric-card-only' }"
    @click="select('lyric-card-only')"
  >
    <h3>🎨 {{ t('mode_lyric_title') }}</h3>
    <p>{{ t('mode_lyric_desc') }}</p>
  </div>
</template>

<style scoped>
.card {
  background: var(--card-bg);
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.card.active {
  border-color: var(--primary);
  background: var(--card-bg);
  box-shadow: 0 0 15px var(--accent-shadow);
}

.card h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
}

.card.active h3 {
  color: var(--text-active);
}

.card p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
