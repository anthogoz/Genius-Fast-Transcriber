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
    <h3 class="gft-u-section-title">{{ t('section_export') }}</h3>
    <div class="gft-export-section__buttons">
      <button
        v-for="btn in exportButtons"
        :key="btn.key"
        type="button"
        class="gft-u-btn gft-u-btn--sm"
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

.gft-export-section__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
