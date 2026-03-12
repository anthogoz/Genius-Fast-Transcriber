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
  <div class="section-title">{{ t('popup_theme_title') }}</div>
  <div class="btn-group">
    <button
      type="button"
      class="btn-pill"
      :class="{ active: modelValue === 'light' }"
      @click="select('light')"
    >
      ☀️ {{ t('popup_light') }}
    </button>
    <button
      type="button"
      class="btn-pill"
      :class="{ active: modelValue === 'dark' }"
      @click="select('dark')"
    >
      🌙 {{ t('popup_dark') }}
    </button>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin: 16px 0 8px 0;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn-pill {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 10px;
  border-radius: 99px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-pill:hover {
  background: var(--border);
}

.btn-pill.active {
  border-color: var(--primary);
  background: var(--bg);
  color: var(--text);
}
</style>
