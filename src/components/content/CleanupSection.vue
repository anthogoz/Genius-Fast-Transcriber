<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCorrections } from '@/composables/useCorrections';
import { useEditor } from '@/composables/useEditor';
import { useGftState } from '@/composables/useGftState';
import { useSettings } from '@/composables/useSettings';
import type { CorrectionResult, CustomButton, SongData } from '@/types';
import CorrectionPreview from './CorrectionPreview.vue';
import FindReplace from './FindReplace.vue';

const { t } = useI18n();
const { locale } = useSettings();
const { state } = useGftState();
const {
  applySyncCorrections,
  previewCorrections,
  applyAndSetCorrections,
  checkBrackets,
  fixSpacing,
  removeZeroWidthSpaces,
  duplicateCurrentLine,
} = useCorrections();
const { getEditorContent, setEditorContent } = useEditor();

const emit = defineEmits<{
  feedback: [message: string];
  openCustomLibrary: [defaultType: 'cleanup' | 'structure'];
}>();

const showPreview = ref(false);
const previewOriginal = ref('');
const previewResult = ref<CorrectionResult | null>(null);
const showFindReplace = ref(false);
const customButtonsRevision = ref(0);

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

  if (locale.value === 'en') {
    buttons.push({
      id: 'english-abbreviations',
      labelKey: 'btn_en_abbrev_label',
      tooltipKey: 'cleanup_en_abbrev_tooltip',
      action: () => applySingleCorrection({ englishAbbreviations: true }, "I'ma, 'em"),
    });
  }

  if (isFr.value) {
    buttons.push({
      id: 'oeu',
      labelKey: 'btn_oeu_label',
      tooltipKey: 'cleanup_oeu_tooltip',
      action: () => applySingleCorrection({ oeuLigature: true }, 'oeu'),
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

  if (locale.value === 'fr') {
    buttons.push({
      id: 'punctuation-spacing',
      labelKey: 'btn_punctuation_spacing_label',
      tooltipKey: 'cleanup_punctuation_spacing_tooltip',
      action: () => applySingleCorrection({ punctuation: true }, t('btn_punctuation_spacing_label')),
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

  buttons.push({
    id: 'double-spaces',
    labelKey: 'btn_double_spaces_label',
    tooltipKey: 'cleanup_double_spaces_tooltip',
    action: () => applySingleCorrection({ doubleSpaces: true, quoteSpaces: true }, t('btn_double_spaces_label')),
  });

  buttons.push({
    id: 'repetitions',
    labelKey: 'btn_repetitions_label',
    tooltipKey: 'btn_repetitions_tooltip',
    action: () => applySingleCorrection({ repetitions: true }, t('btn_repetitions_label')),
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

const currentSongData = computed<SongData>(() => ({
  title: state.currentSongTitle,
  mainArtists: state.currentMainArtists,
  featuringArtists: state.currentFeaturingArtists,
}));

const customCleanupButtons = computed<CustomButton[]>(() => {
  void customButtonsRevision.value;
  try {
    const raw = localStorage.getItem('gftCustomButtons');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomButton[];
    return parsed.filter((btn) => btn.type === 'cleanup' && Boolean(btn.findPattern));
  } catch {
    return [];
  }
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
    quoteSpaces: false,
    majuscules: false,
    songHeader: false,
    repetitions: false,
    englishAbbreviations: false,
    tagSeparator: false,
  };
  const result = applySyncCorrections({ ...disableAll, ...opts });
  if (result.correctionsCount > 0) {
    applyAndSetCorrections(result);
    emit('feedback', `✨ ${t('feedback_corrected', { count: result.correctionsCount, item: itemName })}`);
  } else {
    emit('feedback', `✔️ ${t('feedback_no_correction_needed', { item: itemName })}`);
  }
}

function handleCheckBrackets() {
  const issues = checkBrackets();
  if (issues.length === 0) {
    emit('feedback', t('feedback_brackets_ok'));
  } else {
    emit('feedback', (t as any)('feedback_brackets_issue', issues.length, { count: issues.length }));
  }
}

function handleFixAll() {
  const original = getEditorContent();
  const result = previewCorrections();
  
  // Toujours vérifier les parenthèses/crochets lors d'un "Tout corriger"
  const bracketIssues = checkBrackets();
  
  if (result.correctionsCount === 0 || result.newText === original) {
    if (bracketIssues.length > 0) {
      emit('feedback', (t as any)('feedback_brackets_issue', bracketIssues.length, { count: bracketIssues.length }));
    } else {
      emit('feedback', t('feedback_no_text_corrections'));
    }
    return;
  }
  
  previewOriginal.value = original;
  previewResult.value = result;
  showPreview.value = true;
  
  if (bracketIssues.length > 0) {
    // On notifie quand même pour les brackets même si la preview s'ouvre
    emit('feedback', (t as any)('feedback_brackets_issue', bracketIssues.length, { count: bracketIssues.length }));
  }
}

function toggleFindReplace() {
  showFindReplace.value = !showFindReplace.value;
}

function openCustomLibrary() {
  emit('openCustomLibrary', 'cleanup');
}

function runCustomCleanup(btn: CustomButton) {
  const find = btn.findPattern;
  if (!find) return;

  const source = getEditorContent();
  let pattern: RegExp;
  try {
    if (btn.isRegex) {
      pattern = new RegExp(find, btn.caseSensitive ? 'g' : 'gi');
    } else {
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pattern = new RegExp(escaped, btn.caseSensitive ? 'g' : 'gi');
    }
  } catch {
    emit('feedback', t('import_failed_invalid'));
    return;
  }

  if (!pattern.test(source)) {
    emit('feedback', t('feedback_no_replacement'));
    return;
  }

  const replacement = btn.replaceWith ?? '';
  const next = source.replace(pattern, replacement);
  setEditorContent(next);
  emit('feedback', t('feedback_replaced', { count: (source.match(pattern) || []).length, item: btn.label }));
}

function handlePreviewApply(result: CorrectionResult) {
  showPreview.value = false;
  applyAndSetCorrections(result);
  emit('feedback', `🚀 ${(t as any)('feedback_summary_correction', result.correctionsCount, { count: result.correctionsCount })}`);
}

function handlePreviewCancel() {
  showPreview.value = false;
  emit('feedback', t('feedback_corrections_cancelled'));
}

function triggerFixAll() {
  handleFixAll();
}

function triggerDuplicateLine() {
  duplicateCurrentLine();
  emit('feedback', t('feedback_duplicate_line'));
}

defineExpose({
  triggerFixAll,
  triggerDuplicateLine,
});

function handleCustomButtonsUpdated() {
  customButtonsRevision.value++;
}

onMounted(() => {
  window.addEventListener('gft-custom-buttons-updated', handleCustomButtonsUpdated);
});

onUnmounted(() => {
  window.removeEventListener('gft-custom-buttons-updated', handleCustomButtonsUpdated);
});
</script>

<template>
  <section class="gft-cleanup-section">
    <h3 class="gft-u-section-title">{{ t('section_cleanup') }}</h3>

    <div class="gft-cleanup-section__buttons">
      <button
        v-for="btn in cleanupButtons"
        :key="btn.id"
        :title="t(btn.tooltipKey)"
        type="button"
        class="gft-u-btn"
        @click="btn.action"
      >
        {{ t(btn.labelKey) }}
      </button>

      <button
        v-for="btn in customCleanupButtons"
        :key="btn.id"
        type="button"
        class="gft-u-btn"
        @click="runCustomCleanup(btn)"
      >
        {{ btn.label }}
      </button>

      <button
        :title="t('global_check_tooltip')"
        type="button"
        class="gft-u-btn"
        @click="handleCheckBrackets"
      >
        {{ t('btn_check_label') }}
      </button>

      <button
        :title="t('find_replace_title')"
        type="button"
        class="gft-u-btn"
        :class="{ 'gft-u-btn--active': showFindReplace }"
        @click="toggleFindReplace"
      >
        🔍 {{ t('find_replace_title') }}
      </button>

      <button
        :title="t('btn_add_custom_cleanup_title')"
        type="button"
        class="gft-u-btn gft-u-btn--plus"
        @click="openCustomLibrary"
      >
        +
      </button>
    </div>

    <Transition name="gft-find-replace-slide">
      <div v-if="showFindReplace" class="gft-cleanup-section__find-replace">
        <FindReplace embedded @feedback="(message) => emit('feedback', message)" />
      </div>
    </Transition>

    <CorrectionPreview
      v-if="showPreview && previewResult"
      :original-text="previewOriginal"
      :correction-result="previewResult"
      :song-data="currentSongData"
      @apply="handlePreviewApply"
      @cancel="handlePreviewCancel"
    />
  </section>
</template>

<style scoped>
.gft-cleanup-section {
  margin-bottom: 8px;
}

.gft-cleanup-section__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.gft-cleanup-section__find-replace {
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 8px;
}

.gft-find-replace-slide-enter-active,
.gft-find-replace-slide-leave-active {
  transition: all 0.2s ease;
}

.gft-find-replace-slide-enter-from,
.gft-find-replace-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
