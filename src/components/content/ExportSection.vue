<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useExport } from '@/composables/useExport';

const { t } = useI18n();
const { exportStandard, exportNoTags, exportNoSpacing, exportRaw } = useExport();

const exportButtons = [
  { key: 'export_opt_standard', action: exportStandard },
  { key: 'export_opt_no_tags', action: exportNoTags },
  { key: 'export_opt_no_spacing', action: exportNoSpacing },
  { key: 'export_opt_raw', action: exportRaw },
] as const;
</script>

<template>
  <section class="gft-export-section">
    <h3 class="gft-section-title">{{ t('section_export') }}</h3>
    <div class="gft-export-section__buttons">
      <button
        v-for="btn in exportButtons"
        :key="btn.key"
        type="button"
        class="gft-btn gft-btn--export"
        @click="btn.action"
      >
        {{ t(btn.key) }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.gft-export-section {
  margin-bottom: 10px;
}

.gft-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 8px 0;
  color: var(--gft-title-color, #0e0e0e);
}

.gft-export-section__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.gft-btn--export {
  background: var(--gft-btn-bg, #fffdef);
  border: 1px solid var(--gft-btn-border, #adadad);
  color: inherit;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: background 0.15s, border-color 0.15s;
}

.gft-btn--export:hover {
  background: var(--gft-btn-hover-bg, #0e0e0e);
  border-color: var(--gft-btn-hover-border, #0e0e0e);
  color: var(--gft-btn-hover-text, #f9ff55);
}
</style>
