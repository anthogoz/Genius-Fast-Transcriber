<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/composables/useSettings';
import { useCorrections } from '@/composables/useCorrections';
import { useEditor } from '@/composables/useEditor';
import CorrectionPreview from './CorrectionPreview.vue';
import type { CorrectionResult } from '@/types';

const { t } = useI18n();
const { locale } = useSettings();
const {
  applySyncCorrections,
  previewCorrections,
  applyAndSetCorrections,
  checkBrackets,
  capitalizeLines,
  removeEndPunctuation,
  fixSpacing,
  removeZeroWidthSpaces,
  duplicateCurrentLine,
} = useCorrections();
const { getEditorContent, wrapSelection } = useEditor();

const emit = defineEmits<{
  feedback: [message: string];
}>();

const showPreview = ref(false);
const previewOriginal = ref('');
const previewResult = ref<CorrectionResult | null>(null);

interface CleanupButton {
  id: string;
  labelKey: string;
  tooltipKey: string;
  action: () => void;
  locales?: string[];
}

const isFr = computed(() => locale.value === 'fr');
const isPl = computed(() => locale.value === 'pl');

const cleanupButtons = computed<CleanupButton[]>(() => {
  const buttons: CleanupButton[] = [];

  if (isFr.value) {
    buttons.push({
      id: 'y-prime',
      labelKey: 'btn_y_label',
      tooltipKey: 'cleanup_y_tooltip',
      action: () => applySingleCorrection({ yPrime: true }, "y'"),
    });
  }

  buttons.push({
    id: 'apostrophes',
    labelKey: 'btn_apostrophe_label',
    tooltipKey: 'cleanup_apostrophe_tooltip',
    action: () => applySingleCorrection({ apostrophes: true }, t('preview_opt_apostrophes')),
  });

  if (isFr.value) {
    buttons.push({
      id: 'oeu',
      labelKey: 'btn_oeu_label',
      tooltipKey: 'cleanup_oeu_tooltip',
      action: () => applySingleCorrection({ oeuLigature: true }, 'oeu'),
    });
    buttons.push({
      id: 'french-quotes',
      labelKey: 'btn_french_quotes_label',
      tooltipKey: 'cleanup_french_quotes_tooltip',
      action: () => applySingleCorrection({ frenchQuotes: true }, '«»'),
    });
  }

  if (isPl.value) {
    buttons.push({
      id: 'polish-quotes',
      labelKey: 'btn_polish_quotes_label',
      tooltipKey: 'cleanup_polish_quotes_tooltip',
      action: () => applySingleCorrection({ frenchQuotes: true }, '„"'),
    });
    buttons.push({
      id: 'em-dash',
      labelKey: 'btn_em_dash_label',
      tooltipKey: 'cleanup_em_dash_tooltip',
      action: () => applySingleCorrection({ longDash: true }, '—'),
    });
    buttons.push({
      id: 'ellipsis',
      labelKey: 'btn_ellipsis_label',
      tooltipKey: 'cleanup_ellipsis_tooltip',
      action: () => applySingleCorrection({ longDash: true }, '…'),
    });
  }

  if (!isPl.value) {
    buttons.push({
      id: 'long-dash',
      labelKey: 'btn_long_dash_label',
      tooltipKey: 'cleanup_long_dash_tooltip',
      action: () => applySingleCorrection({ longDash: true }, '—'),
    });
  }

  buttons.push({
    id: 'double-spaces',
    labelKey: 'btn_double_spaces_label',
    tooltipKey: 'cleanup_double_spaces_tooltip',
    action: () => applySingleCorrection({ doubleSpaces: true }, t('btn_double_spaces_label')),
  });

  buttons.push({
    id: 'spacing',
    labelKey: 'btn_spacing_label',
    tooltipKey: 'cleanup_spacing_tooltip',
    action: () => {
      const result = fixSpacing();
      if (result.correctionsCount > 0) {
        emit('feedback', t('feedback_corrected', { count: result.correctionsCount, item: t('btn_spacing_short') }));
      } else {
        emit('feedback', t('feedback_no_correction_needed', { item: t('btn_spacing_short') }));
      }
    },
  });

  buttons.push({
    id: 'capitalize',
    labelKey: 'btn_capitalize_short',
    tooltipKey: 'cleanup_capitalize_tooltip',
    action: () => {
      const changed = capitalizeLines();
      emit('feedback', changed
        ? t('feedback_corrected', { count: '', item: t('btn_capitalize_short') })
        : t('feedback_no_correction_needed', { item: t('btn_capitalize_short') }),
      );
    },
  });

  if (locale.value === 'fr') {
    buttons.push({
      id: 'punctuation-spacing',
      labelKey: 'btn_punctuation_spacing_label',
      tooltipKey: 'cleanup_punctuation_spacing_tooltip',
      action: () => applySingleCorrection({ punctuation: true }, t('btn_punctuation_spacing_label')),
    });
  }

  buttons.push({
    id: 'punctuation',
    labelKey: 'btn_punctuation_short',
    tooltipKey: 'cleanup_punct_tooltip',
    action: () => {
      const changed = removeEndPunctuation();
      emit('feedback', changed
        ? t('feedback_corrected', { count: '', item: t('btn_punctuation_short') })
        : t('feedback_no_correction_needed', { item: t('btn_punctuation_short') }),
      );
    },
  });

  buttons.push({
    id: 'adlib',
    labelKey: 'btn_adlib_label',
    tooltipKey: 'cleanup_adlib_tooltip',
    action: () => {
      wrapSelection('(', ')');
      emit('feedback', t('feedback_adlib_added'));
    },
  });

  buttons.push({
    id: 'duplicate-line',
    labelKey: 'btn_duplicate_line_label',
    tooltipKey: 'cleanup_duplicate_line_tooltip',
    action: () => {
      duplicateCurrentLine();
      emit('feedback', t('feedback_duplicate_line'));
    },
  });

  buttons.push({
    id: 'zws',
    labelKey: 'btn_zws_remove',
    tooltipKey: 'btn_zws_remove_tooltip',
    action: () => {
      const count = removeZeroWidthSpaces();
      emit('feedback', count > 0
        ? t('feedback_corrected', { count, item: 'ZWS' })
        : t('feedback_no_correction_needed', { item: 'ZWS' }),
      );
    },
  });

  if (isPl.value) {
    buttons.push({
      id: 'orphans',
      labelKey: 'btn_orphans_label',
      tooltipKey: 'cleanup_orphans_tooltip',
      action: () => emit('feedback', t('feedback_no_correction_needed', { item: t('btn_orphans_label') })),
    });
  }

  return buttons;
});

function applySingleCorrection(opts: Record<string, boolean>, itemName: string) {
  const disableAll = {
    yPrime: false,
    apostrophes: false,
    oeuLigature: false,
    frenchQuotes: false,
    longDash: false,
    punctuation: false,
    doubleSpaces: false,
    spacing: false,
  };
  const result = applySyncCorrections({ ...disableAll, ...opts });
  if (result.correctionsCount > 0) {
    applyAndSetCorrections(result);
    emit('feedback', t('feedback_corrected', { count: result.correctionsCount, item: itemName }));
  } else {
    emit('feedback', t('feedback_no_correction_needed', { item: itemName }));
  }
}

function handleCheckBrackets() {
  const issues = checkBrackets();
  if (issues.length === 0) {
    emit('feedback', t('feedback_brackets_ok'));
  } else {
    emit('feedback', t('feedback_brackets_issue', { count: issues.length }));
  }
}

function handleFixAll() {
  const original = getEditorContent();
  const result = previewCorrections();
  previewOriginal.value = original;
  previewResult.value = result;
  showPreview.value = true;
}

function handlePreviewApply(correctedText: string) {
  showPreview.value = false;
  if (previewResult.value) {
    applyAndSetCorrections(previewResult.value);
    emit('feedback', t('feedback_summary_correction', { count: previewResult.value.correctionsCount }));
  }
}

function handlePreviewCancel() {
  showPreview.value = false;
  emit('feedback', t('feedback_corrections_cancelled'));
}
</script>

<template>
  <section class="gft-cleanup-section">
    <h3 class="gft-section-title">{{ t('section_cleanup') }}</h3>

    <div class="gft-cleanup-section__buttons">
      <button
        v-for="btn in cleanupButtons"
        :key="btn.id"
        class="gft-btn gft-btn--cleanup"
        :title="t(btn.tooltipKey)"
        @click="btn.action"
      >
        {{ t(btn.labelKey) }}
      </button>
    </div>

    <div class="gft-cleanup-section__actions">
      <button
        class="gft-btn gft-btn--check"
        :title="t('global_check_tooltip')"
        @click="handleCheckBrackets"
      >
        {{ t('btn_check_label') }}
      </button>
      <button
        class="gft-btn gft-btn--fix-all"
        :title="t('global_fix_tooltip')"
        @click="handleFixAll"
      >
        {{ t('btn_fix_all_short') }}
      </button>
    </div>

    <CorrectionPreview
      v-if="showPreview && previewResult"
      :original-text="previewOriginal"
      :correction-result="previewResult"
      @apply="handlePreviewApply"
      @cancel="handlePreviewCancel"
    />
  </section>
</template>

<style scoped>
.gft-cleanup-section {
  margin-bottom: 10px;
}

.gft-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 8px 0;
  color: #ffff64;
}

.gft-cleanup-section__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.gft-cleanup-section__actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.gft-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: inherit;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: background 0.15s, border-color 0.15s;
}

.gft-btn:hover {
  background: rgba(255, 255, 100, 0.15);
  border-color: rgba(255, 255, 100, 0.4);
}

.gft-btn--check {
  flex: 1;
}

.gft-btn--fix-all {
  flex: 1;
  background: rgba(255, 255, 100, 0.12);
  border-color: rgba(255, 255, 100, 0.35);
  font-weight: 700;
}
</style>
