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
const diffMode = ref<'unified' | 'final'>('unified');

const diffHtml = computed(() =>
  highlightDifferences(props.originalText, currentResult.value.newText),
);

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
  { key: 'punctuation', labelKey: 'preview_opt_punctuation', statKey: 'punctuation', statLabelKey: 'preview_stat_punctuation', icon: ' !?' },
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

function toggleAllOptions(enable: boolean) {
  for (const o of visibleOptions.value) {
    options.value[o.key] = enable;
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="gft-u-overlay gft-preview-overlay" @click="emit('cancel')" />
    <div class="gft-u-modal gft-preview-modal" :class="{ 'gft-u-modal--dark gft-dark-mode': isDarkMode }">
      
      <!-- Header Area -->
      <div class="gft-preview-modal__header">
        <h2 class="gft-preview-modal__title">{{ t('preview_title') }}</h2>
        
        <!-- Tab selector for Diff View vs Final Text -->
        <div class="gft-preview-modal__tabs">
          <button 
            type="button" 
            class="gft-tab-btn" 
            :class="{ 'gft-tab-btn--active': diffMode === 'unified' }"
            @click="diffMode = 'unified'"
          >
            📊 {{ t('preview_diff_mode_unified') !== 'preview_diff_mode_unified' ? t('preview_diff_mode_unified') : 'Vue comparée' }}
          </button>
          <button 
            type="button" 
            class="gft-tab-btn" 
            :class="{ 'gft-tab-btn--active': diffMode === 'final' }"
            @click="diffMode = 'final'"
          >
            📄 {{ t('preview_diff_mode_final') !== 'preview_diff_mode_final' ? t('preview_diff_mode_final') : 'Texte final' }}
          </button>
        </div>
      </div>

      <!-- Main Layout Body -->
      <div class="gft-preview-modal__layout">
        
        <!-- Left Sidebar: Controls -->
        <div class="gft-preview-modal__sidebar">
          
          <!-- Bulk toggles header -->
          <div class="gft-sidebar__header">
            <span class="gft-sidebar__header-title">Correction</span>
            <div class="gft-sidebar__actions">
              <button 
                type="button" 
                class="gft-sidebar__action-btn"
                @click="toggleAllOptions(true)"
              >
                {{ t('preview_action_enable_all') !== 'preview_action_enable_all' ? t('preview_action_enable_all') : 'Tout activer' }}
              </button>
              <span class="gft-sidebar__divider">|</span>
              <button 
                type="button" 
                class="gft-sidebar__action-btn"
                @click="toggleAllOptions(false)"
              >
                {{ t('preview_action_disable_all') !== 'preview_action_disable_all' ? t('preview_action_disable_all') : 'Tout désactiver' }}
              </button>
            </div>
          </div>

          <!-- Options list with custom toggles -->
          <div class="gft-preview-modal__options-list">
            <div 
              v-for="opt in visibleOptions" 
              :key="opt.key" 
              class="gft-preview-modal__option-row"
              :class="{ 'gft-option-row--active': options[opt.key] }"
            >
              <!-- Sleek CSS Switch Slider -->
              <label class="gft-switch">
                <input 
                  type="checkbox" 
                  v-model="options[opt.key]"
                />
                <span class="gft-switch__slider"></span>
              </label>

              <span class="gft-option-row__icon">{{ opt.icon }}</span>
              <span class="gft-option-row__label" :title="t(opt.labelKey)">{{ t(opt.labelKey) }}</span>
              
              <!-- Badge indicator for modification count -->
              <span 
                class="gft-option-row__badge"
                :class="{ 'gft-badge-zero': currentResult.corrections[opt.statKey] === 0 }"
              >
                {{ currentResult.corrections[opt.statKey] > 0 ? `+${currentResult.corrections[opt.statKey]}` : '0' }}
              </span>
            </div>
          </div>

          <!-- Realtime stats summary block -->
          <div class="gft-preview-modal__summary">
            <strong>{{ t('preview_summary', { count: currentResult.correctionsCount }) }}</strong>
            <div class="gft-summary-details" v-if="summaryDetails.length > 0">
              {{ summaryDetails.join(', ') }}
            </div>
            <div class="gft-summary-details gft-summary-details--empty" v-else>
              {{ t('preview_no_corrections') }}
            </div>
          </div>
        </div>

        <!-- Right Main Panel: Text Diff and Actions -->
        <div class="gft-preview-modal__main">
          <div class="gft-preview-modal__diff-container">
            <!-- Unified Diff Mode -->
            <div 
              v-if="diffMode === 'unified'" 
              class="gft-preview-modal__diff" 
              v-html="diffHtml" 
            />
            <!-- Final Text Mode -->
            <pre 
              v-else 
              class="gft-preview-modal__final-text"
            >{{ currentResult.newText }}</pre>
          </div>

          <!-- Actions buttons row -->
          <div class="gft-preview-modal__buttons">
            <button type="button" class="gft-preview-btn gft-u-btn" @click="emit('cancel')">
              {{ t('preview_btn_cancel') }}
            </button>
            <button type="button" class="gft-preview-btn gft-preview-btn--apply" @click="handleApply">
              {{ t('preview_btn_apply') }}
            </button>
          </div>
        </div>

      </div>

    </div>
  </Teleport>
</template>

<style scoped>
.gft-preview-modal {
  max-width: 1000px;
  width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.gft-preview-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.gft-dark-mode .gft-preview-modal__header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.gft-preview-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.gft-preview-modal__layout {
  display: flex;
  flex: 1;
  gap: 16px;
  min-height: 0;
}

/* Sidebar Option controls */
.gft-preview-modal__sidebar {
  width: 310px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.gft-dark-mode .gft-preview-modal__sidebar {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.gft-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  opacity: 0.9;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 6px;
}

.gft-dark-mode .gft-sidebar__header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.gft-sidebar__actions {
  display: flex;
  gap: 6px;
  font-size: 11px;
}

.gft-sidebar__action-btn {
  background: none;
  border: none;
  color: #ffde00;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-family: inherit;
}

.gft-dark-mode .gft-sidebar__action-btn {
  color: #ffff64;
}

.gft-sidebar__action-btn:hover {
  opacity: 0.8;
}

.gft-sidebar__divider {
  opacity: 0.5;
}

.gft-preview-modal__options-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
}

.gft-preview-modal__option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.gft-dark-mode .gft-preview-modal__option-row {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.03);
}

.gft-option-row--active {
  background: rgba(255, 222, 0, 0.03);
  border-color: rgba(255, 222, 0, 0.15);
}

.gft-dark-mode .gft-option-row--active {
  background: rgba(255, 255, 100, 0.02);
  border-color: rgba(255, 255, 100, 0.08);
}

.gft-option-row__icon {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
}

.gft-option-row__label {
  font-size: 11.5px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.85;
}

.gft-option-row--active .gft-option-row__label {
  opacity: 1;
  font-weight: 500;
}

.gft-option-row__badge {
  font-size: 10px;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 10px;
  background: #ffde00;
  color: #000;
  transition: all 0.2s ease;
}

.gft-dark-mode .gft-option-row__badge {
  background: #ffff64;
}

.gft-badge-zero {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #888 !important;
  opacity: 0.5;
  font-weight: normal;
}

.gft-dark-mode .gft-badge-zero {
  background: rgba(255, 255, 255, 0.06) !important;
  color: #999 !important;
}

/* Custom Switches */
.gft-switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
  flex-shrink: 0;
}

.gft-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.gft-switch__slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .2s;
  border-radius: 18px;
}

.gft-dark-mode .gft-switch__slider {
  background-color: rgba(255, 255, 255, 0.12);
}

.gft-switch__slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}

.gft-switch input:checked + .gft-switch__slider {
  background-color: #ffde00;
}

.gft-dark-mode .gft-switch input:checked + .gft-switch__slider {
  background-color: #ffff64;
}

.gft-switch input:checked + .gft-switch__slider:before {
  transform: translateX(14px);
  background-color: #000;
}

/* Summary Box */
.gft-preview-modal__summary {
  font-size: 12px;
  padding: 10px;
  background: rgba(255, 222, 0, 0.06);
  border: 1px solid rgba(255, 222, 0, 0.15);
  border-radius: 6px;
  box-sizing: border-box;
}

.gft-dark-mode .gft-preview-modal__summary {
  background: rgba(255, 255, 100, 0.04);
  border-color: rgba(255, 255, 100, 0.1);
}

.gft-summary-details {
  margin-top: 4px;
  color: #666;
  max-height: 50px;
  overflow-y: auto;
  line-height: 1.4;
}

.gft-dark-mode .gft-summary-details {
  color: #aaa;
}

.gft-summary-details--empty {
  opacity: 0.6;
}

/* Main column text preview & buttons */
.gft-preview-modal__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 12px;
}

.gft-preview-modal__diff-container {
  flex: 1;
  min-height: 0;
  display: flex;
}

.gft-preview-modal__diff,
.gft-preview-modal__final-text {
  flex: 1;
  overflow-y: auto;
  white-space: pre-wrap;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  font-family: Consolas, Monaco, monospace;
  font-size: 11.5px;
  line-height: 1.5;
  margin: 0;
  box-sizing: border-box;
}

.gft-dark-mode .gft-preview-modal__diff,
.gft-dark-mode .gft-preview-modal__final-text {
  border-color: #3a3a3a;
  background: rgba(0, 0, 0, 0.2);
  color: #e0e0e0;
}

/* Tabs selectors */
.gft-preview-modal__tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 3px;
  border-radius: 6px;
}

.gft-dark-mode .gft-preview-modal__tabs {
  background: rgba(255, 255, 255, 0.05);
}

.gft-tab-btn {
  background: none;
  border: none;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  color: #555;
  transition: all 0.2s ease;
  font-family: inherit;
}

.gft-dark-mode .gft-tab-btn {
  color: #aaa;
}

.gft-tab-btn--active {
  background: #fff;
  color: #000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gft-dark-mode .gft-tab-btn--active {
  background: #2a2a2a;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.gft-preview-modal__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.gft-preview-btn {
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  height: auto;
  transition: opacity 0.2s ease;
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
  background: #ffde00;
  color: #000;
  border: 1px solid #ffde00;
}

.gft-dark-mode .gft-preview-btn--apply {
  background: #ffff64;
  color: #000;
  border: 1px solid #ffff64;
}

/* Responsiveness for smaller windows */
@media (max-width: 768px) {
  .gft-preview-modal {
    max-height: 95vh;
  }
  .gft-preview-modal__layout {
    flex-direction: column;
    overflow-y: auto;
  }
  .gft-preview-modal__sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  .gft-preview-modal__main {
    height: 300px;
    flex: none;
  }
}
</style>
