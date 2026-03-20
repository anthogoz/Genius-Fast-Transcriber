<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/composables/useSettings';
import type { CorrectionCounts, CorrectionOptions, CorrectionResult, SongData } from '@/types';
import { applyAllTextCorrectionsToString } from '@/utils/corrections';
import { highlightDifferences } from '@/utils/diff';

const { t } = useI18n();
const { isDarkMode, locale } = useSettings();

const props = defineProps<{
  originalText: string;
  correctionResult: CorrectionResult;
  songData?: SongData;
}>();

const emit = defineEmits<{
  apply: [result: CorrectionResult];
  cancel: [];
}>();

const options = ref<CorrectionOptions>({
  yPrime: true,
  apostrophes: true,
  oeuLigature: true,
  frenchQuotes: true,
  longDash: true,
  punctuation: true,
  doubleSpaces: true,
  spacing: true,
  quoteSpaces: true,
  majuscules: true,
  songHeader: true,
  repetitions: true,
  tagSeparator: true,
  englishAbbreviations: true,
});

const currentResult = ref<CorrectionResult>(props.correctionResult);

const diffHtml = computed(() =>
  highlightDifferences(props.originalText, currentResult.value.newText),
);

const showPunctuation = computed(() => locale.value !== 'pl' && locale.value !== 'en');

interface OptionDef {
  key: keyof CorrectionOptions;
  labelKey: string;
  statKey: keyof CorrectionCounts;
  statLabelKey: string;
  icon: string;
  show?: boolean;
}

const optionDefs = computed<OptionDef[]>(() => [
  { key: 'repetitions', labelKey: 'preview_opt_repetitions', statKey: 'repetitions', statLabelKey: 'preview_stat_repetitions', icon: '🔁' },
  { key: 'tagSeparator', labelKey: 'preview_opt_tag_separator', statKey: 'tagSeparator', statLabelKey: 'preview_stat_tag_separator', icon: '🏷️' },
  { key: 'songHeader', labelKey: 'preview_opt_songHeader', statKey: 'songHeader', statLabelKey: 'preview_stat_songHeader', icon: '📝' },
  { key: 'majuscules', labelKey: 'preview_opt_majuscules', statKey: 'majuscules', statLabelKey: 'preview_stat_majuscules', icon: '⇧A' },
  { key: 'apostrophes', labelKey: 'preview_opt_apostrophes', statKey: 'apostrophes', statLabelKey: 'preview_stat_apostrophes', icon: ' \'' },
  { key: 'punctuation', labelKey: 'preview_opt_punctuation', statKey: 'punctuation', statLabelKey: 'preview_stat_punctuation', icon: ' !?', show: showPunctuation.value },
  { key: 'spacing', labelKey: 'preview_opt_spacing', statKey: 'spacing', statLabelKey: 'preview_stat_spacing', icon: '↕️' },
  { key: 'quoteSpaces', labelKey: 'preview_opt_quote_spaces', statKey: 'quoteSpaces', statLabelKey: 'preview_stat_quote_spaces', icon: ' " ' },
  { key: 'doubleSpaces', labelKey: 'preview_opt_spaces', statKey: 'doubleSpaces', statLabelKey: 'preview_stat_spaces', icon: ' ␣ ' },
  { key: 'frenchQuotes', labelKey: 'preview_opt_quotes', statKey: 'frenchQuotes', statLabelKey: 'preview_stat_quotes', icon: ' «» ' },
  { key: 'longDash', labelKey: 'preview_opt_dash', statKey: 'longDash', statLabelKey: 'preview_stat_dash', icon: ' — ' },
  { key: 'oeuLigature', labelKey: 'preview_opt_oeu', statKey: 'oeuLigature', statLabelKey: 'preview_stat_oeu', icon: ' Œ ' },
  { key: 'yPrime', labelKey: 'preview_opt_yprime', statKey: 'yPrime', statLabelKey: 'preview_stat_yprime', icon: ' Y ' },
  { key: 'englishAbbreviations', labelKey: 'preview_opt_en_abbrev', statKey: 'englishAbbreviations', statLabelKey: 'preview_stat_en_abbrev', icon: ' US ', show: locale.value === 'en' },
]);

const visibleOptions = computed(() => optionDefs.value.filter((o) => o.show !== false));

const summaryDetails = computed(() => {
  const c = currentResult.value.corrections;
  return visibleOptions.value
    .filter((o) => options.value[o.key] && c[o.statKey] > 0)
    .map((o) => `${c[o.statKey]} ${t(o.statLabelKey)}`);
});

function updatePreview() {
  currentResult.value = applyAllTextCorrectionsToString(
    props.originalText,
    locale.value,
    options.value,
    props.songData,
  );
}

watch(options, updatePreview, { deep: true });

function handleApply() {
  emit('apply', currentResult.value);
}
</script>

<template>
  <Teleport to="body">
    <div class="gft-u-overlay gft-preview-overlay" @click="emit('cancel')" />
    <div class="gft-u-modal gft-preview-modal" :class="{ 'gft-u-modal--dark gft-dark-mode': isDarkMode }">
      <div class="gft-preview-modal__header">
        <h2 class="gft-preview-modal__title">{{ t('preview_title') }}</h2>

        <div class="gft-preview-modal__options">
          <label
            v-for="opt in visibleOptions"
            :key="opt.key"
            class="gft-preview-modal__option"
          >
            <input
              type="checkbox"
              v-model="options[opt.key]"
            />
            <span class="gft-preview-modal__option-icon">{{ opt.icon }}</span>
            <span class="gft-preview-modal__option-label">{{ t(opt.labelKey) }}</span>
          </label>
        </div>
      </div>

      <div class="gft-preview-modal__summary">
        <strong>{{ t('preview_summary', { count: currentResult.correctionsCount }) }}</strong>
        <br />
        <span v-if="summaryDetails.length > 0">{{ summaryDetails.join(', ') }}</span>
        <span v-else>{{ t('preview_no_corrections') }}</span>
      </div>

      <h3 class="gft-preview-modal__diff-title">{{ t('preview_diff_title') }}</h3>
      <div class="gft-preview-modal__diff" v-html="diffHtml" />

      <div class="gft-preview-modal__buttons">
        <button type="button" class="gft-preview-btn gft-u-btn" @click="emit('cancel')">
          {{ t('preview_btn_cancel') }}
        </button>
        <button type="button" class="gft-preview-btn gft-preview-btn--apply" @click="handleApply">
          {{ t('preview_btn_apply') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.gft-preview-modal {
  max-width: 700px;
  width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.gft-preview-modal__title {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.gft-preview-modal__options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 10px;
}

.gft-dark-mode .gft-preview-modal__options {
  background: rgba(255, 255, 255, 0.05);
}

.gft-preview-modal__option {
  display: flex;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
  gap: 6px;
}

.gft-preview-modal__option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-weight: bold;
  font-size: 11px;
}

.gft-dark-mode .gft-preview-modal__option-icon {
  background: rgba(255, 255, 255, 0.1);
}

.gft-preview-modal__option-label {
  flex: 1;
}

.gft-preview-modal__summary {
  font-size: 13px;
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(255, 255, 100, 0.08);
  border-radius: 5px;
}

.gft-preview-modal__diff-title {
  font-size: 14px;
  margin: 0 0 5px 0;
  color: #555;
}

.gft-dark-mode .gft-preview-modal__diff-title {
  color: #aaa;
}

.gft-preview-modal__diff {
  flex: 1;
  overflow-y: auto;
  white-space: pre-wrap;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  min-height: 100px;
}

.gft-dark-mode .gft-preview-modal__diff {
  border-color: #444;
  background: rgba(0, 0, 0, 0.2);
}

.gft-preview-modal__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.gft-preview-btn {
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  height: auto;
}

.gft-preview-btn.gft-u-btn {
  background: #efefef;
  border-color: #bdbdbd;
  color: #1d1d1d;
}

.gft-dark-mode .gft-preview-btn.gft-u-btn {
  background: #2f2f2f;
  border-color: #555;
  color: #efefef;
}

.gft-preview-btn:hover {
  opacity: 0.85;
}

.gft-preview-btn--apply {
  background: #ffff64;
  color: #000;
  border: none;
}
</style>
