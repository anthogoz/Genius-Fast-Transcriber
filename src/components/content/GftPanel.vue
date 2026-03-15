<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import { useDraft } from '@/composables/useDraft';
import { useEditor } from '@/composables/useEditor';
import { useGftState } from '@/composables/useGftState';
import { setLocale } from '@/locales';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';
import { useSettings } from '@/composables/useSettings';
import { useYoutubeControls } from '@/composables/useYoutubeControls';
import { useUndoRedo } from '@/composables/useUndoRedo';
import CleanupSection from './CleanupSection.vue';
import CustomButtonManager from './CustomButtonManager.vue';
import DraftNotification from './DraftNotification.vue';
import ProgressBar from './ProgressBar.vue';
import SettingsMenu from './SettingsMenu.vue';
import StatsDisplay from './StatsDisplay.vue';
import StructureSection from './StructureSection.vue';

const props = defineProps<{
  version?: string;
}>();

const { t } = useI18n();
const { isPanelCollapsed, isDarkMode, locale, transcriptionMode, areTooltipsEnabled } = useSettings();
const { getEditorContent, setEditorContent } = useEditor();
const { currentActiveEditor } = useGftState();
const { togglePlayPause, seekBy } = useYoutubeControls();
const { undo, redo, canUndo, canRedo } = useUndoRedo();
const {
  hasDraft,
  draftTimestamp,
  checkForDraft,
  loadDraft,
  discardDraft,
  scheduleAutoSave,
  cancelAutoSave,
} = useDraft();

const settingsVisible = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const showStats = ref(false);
const feedbackMessage = ref('');
const progressStep = ref(0);
const progressTotal = ref(0);
const progressMessage = ref('');
const showProgress = ref(false);
const showDraftNotification = ref(false);
const draftTime = ref('');
const showCustomButtonManager = ref(false);
const customManagerDefaultType = ref<'structure' | 'cleanup'>('structure');
const structureSection = ref<{
  insertVerseByShortcut: () => void;
  insertChorusByShortcut: () => void;
  insertBridgeByShortcut: () => void;
  insertIntroByShortcut: () => void;
  insertOutroByShortcut: () => void;
} | null>(null);
const cleanupSection = ref<{
  triggerFixAll: () => void;
  triggerDuplicateLine: () => void;
} | null>(null);

const editorContent = computed(() => getEditorContent());
const panelVersion = computed(() => `v${props.version ?? '?.?.?'}`);

const logoSrc = computed(() => browser.runtime.getURL('icon/16.png' as any));

function updateTranscriptionMode(mode: 'fr' | 'en' | 'pl') {
  transcriptionMode.value = mode;
  locale.value = mode;
  setLocale(mode);
}

function togglePanel() {
  isPanelCollapsed.value = !isPanelCollapsed.value;
  if (isPanelCollapsed.value) {
    settingsVisible.value = false;
  }
}

function toggleSettings() {
  if (isPanelCollapsed.value) return;
  settingsVisible.value = !settingsVisible.value;
}

function handleDocumentClick(event: MouseEvent) {
  if (!settingsVisible.value) return;
  const target = event.target as Node | null;
  if (!target || !panelRef.value) return;
  if (!panelRef.value.contains(target)) {
    settingsVisible.value = false;
  }
}

function maybeShowDraftNotification() {
  const draft = checkForDraft();
  if (draft) {
    draftTime.value = draft.time;
    showDraftNotification.value = true;
  }
}

function restoreDraft() {
  const draft = loadDraft();
  if (!draft) {
    showDraftNotification.value = false;
    return;
  }

  setEditorContent(draft.content);
  showFeedback(t('draft_restored'));
  showDraftNotification.value = false;
}

function dismissDraftNotification() {
  discardDraft();
  showDraftNotification.value = false;
}

function handleUndo() {
  const content = getEditorContent();
  const previous = undo(content);
  if (previous !== null) {
    setEditorContent(previous);
    showFeedback(t('feedback_undo'));
  } else {
    showFeedback(t('feedback_no_changes'));
  }
}

function handleRedo() {
  const content = getEditorContent();
  const next = redo(content);
  if (next !== null) {
    setEditorContent(next);
    showFeedback(t('feedback_redo'));
  }
}

function showFeedback(message: string) {
  window.dispatchEvent(new CustomEvent('gft-show-feedback', { detail: { message } }));
}

function handleFeedback(message: string) {
  showFeedback(message);
}

function openCustomButtonManager(defaultType: 'structure' | 'cleanup' = 'structure') {
  customManagerDefaultType.value = defaultType;
  showCustomButtonManager.value = true;
  settingsVisible.value = false;
}

function closeCustomButtonManager() {
  showCustomButtonManager.value = false;
}

function handleCustomButtonsSaved() {
  window.dispatchEvent(new Event('gft-custom-buttons-updated'));
}

function handleFixAllMain() {
  cleanupSection.value?.triggerFixAll();
}

let tooltipEl: HTMLDivElement | null = null;
let tooltipObserver: MutationObserver | null = null;

function hydrateTooltips(root: HTMLElement) {
  const elements = root.querySelectorAll<HTMLElement>('[title]');
  elements.forEach((el) => {
    const title = el.getAttribute('title');
    if (!title) return; // Prevent empty titles from overriding

    // Set or update the customized tooltip text
    el.dataset.gftTooltip = title;
    
    // Only mark it as bound and remove the native title attribute once we stored it in the dataset.
    // Notice we do NOT check `if (el.dataset.gftTooltipBound === '1') return;` at the start anymore.
    // This allows dynamically updated titles (from i18n changes) to be processed.
    el.dataset.gftTooltipBound = '1';
    el.removeAttribute('title');
  });
}

function showCustomTooltip(target: HTMLElement) {
  if (!areTooltipsEnabled.value) return;
  if (!tooltipEl) return;
  const text = target.dataset.gftTooltip;
  if (!text) return;

  tooltipEl.textContent = text;
  tooltipEl.style.opacity = '1';

  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  const top = Math.max(8, rect.top - tooltipRect.height - 8);
  const left = Math.min(
    window.innerWidth - tooltipRect.width - 8,
    Math.max(8, rect.left + rect.width / 2 - tooltipRect.width / 2),
  );

  tooltipEl.style.top = `${Math.round(top)}px`;
  tooltipEl.style.left = `${Math.round(left)}px`;
}

function hideCustomTooltip() {
  if (!tooltipEl) return;
  tooltipEl.style.opacity = '0';
}

function handlePanelMouseOver(event: MouseEvent) {
  if (!areTooltipsEnabled.value) {
    hideCustomTooltip();
    return;
  }
  if (!panelRef.value) return;
  const target = event.target as HTMLElement;
  const withTooltip = target.closest<HTMLElement>('[data-gft-tooltip]');
  if (!withTooltip || !panelRef.value.contains(withTooltip)) return;
  showCustomTooltip(withTooltip);
}

function handlePanelMouseOut(event: MouseEvent) {
  const related = event.relatedTarget as HTMLElement | null;
  if (related?.closest('[data-gft-tooltip]')) return;
  hideCustomTooltip();
}

onMounted(async () => {
  await nextTick();
  if (!panelRef.value) return;

  maybeShowDraftNotification();

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'gft-custom-tooltip';
  tooltipEl.style.opacity = '0';
  document.body.appendChild(tooltipEl);

  hydrateTooltips(panelRef.value);

  panelRef.value.addEventListener('mouseover', handlePanelMouseOver);
  panelRef.value.addEventListener('mouseout', handlePanelMouseOut);
  document.addEventListener('click', handleDocumentClick, true);

  tooltipObserver = new MutationObserver(() => {
    if (!panelRef.value) return;
    hydrateTooltips(panelRef.value);
  });
  tooltipObserver.observe(panelRef.value, { childList: true, subtree: true });
});

watch(areTooltipsEnabled, (enabled) => {
  if (!enabled) {
    hideCustomTooltip();
  }
});

watch(locale, async () => {
  // Give Vue + VueI18n time to perform DOM updates 
  await nextTick();
  
  if (panelRef.value) {
    // Vue resets the `title` properties based on v-bind:title or :title.
    // We just need to search for newly added `title` attributes (or updated ones)
    // and transfer them to our custom dataset properties.
    hydrateTooltips(panelRef.value);
  }
});

let boundEditor: HTMLElement | null = null;
let boundInputHandler: ((event: Event) => void) | null = null;

function unbindEditorAutoSave() {
  if (boundEditor && boundInputHandler) {
    boundEditor.removeEventListener('input', boundInputHandler);
  }
  boundEditor = null;
  boundInputHandler = null;
}

function bindEditorAutoSave(editor: HTMLElement | null) {
  unbindEditorAutoSave();
  if (!editor) return;

  boundInputHandler = () => {
    scheduleAutoSave(() => getEditorContent());
  };

  editor.addEventListener('input', boundInputHandler);
  boundEditor = editor;
}

watch(currentActiveEditor, (nextEditor) => {
  bindEditorAutoSave(nextEditor);
});

onMounted(() => {
  bindEditorAutoSave(currentActiveEditor.value);
});

onBeforeUnmount(() => {
  panelRef.value?.removeEventListener('mouseover', handlePanelMouseOver);
  panelRef.value?.removeEventListener('mouseout', handlePanelMouseOut);
  document.removeEventListener('click', handleDocumentClick, true);
  tooltipObserver?.disconnect();
  tooltipObserver = null;
  tooltipEl?.remove();
  tooltipEl = null;
  unbindEditorAutoSave();
  cancelAutoSave();
});

function isEditorFocused() {
  return Boolean(currentActiveEditor.value && document.activeElement === currentActiveEditor.value);
}

useKeyboardShortcuts({
  onVerse: () => {
    if (!isEditorFocused()) return;
    structureSection.value?.insertVerseByShortcut();
  },
  onChorus: () => {
    if (!isEditorFocused()) return;
    structureSection.value?.insertChorusByShortcut();
  },
  onBridge: () => {
    if (!isEditorFocused()) return;
    structureSection.value?.insertBridgeByShortcut();
  },
  onIntro: () => {
    if (!isEditorFocused()) return;
    structureSection.value?.insertIntroByShortcut();
  },
  onOutro: () => {
    if (!isEditorFocused()) return;
    structureSection.value?.insertOutroByShortcut();
  },
  onFixAll: () => {
    if (!isEditorFocused()) return;
    cleanupSection.value?.triggerFixAll();
  },
  onDuplicateLine: () => {
    if (!isEditorFocused()) return;
    cleanupSection.value?.triggerDuplicateLine();
  },
  onToggleStats: () => {
    showStats.value = !showStats.value;
  },
  onUndo: () => {
    if (!isEditorFocused()) return;
    handleUndo();
  },
  onRedo: () => {
    if (!isEditorFocused()) return;
    handleRedo();
  },
});

defineExpose({
  showFeedback,
  showProgress: (step: number, total: number, message: string) => {
    progressStep.value = step;
    progressTotal.value = total;
    progressMessage.value = message;
    showProgress.value = true;
  },
  hideProgress: () => {
    showProgress.value = false;
  },
});
</script>

<template>
  <div
    ref="panelRef"
    class="gft-panel"
    :class="{ 'gft-dark-mode': isDarkMode, 'gft-panel--collapsed': isPanelCollapsed }"
  >
    <div class="gft-panel__header" @click="togglePanel">
      <div class="gft-panel__header-left">
        <div class="gft-panel__title-wrap">
          <img :src="logoSrc" alt="GFT" class="gft-panel__logo-image" />
          <h2 class="gft-panel__title">{{ t('panel_title') }}</h2>
          <span class="gft-panel__collapse-arrow" :style="{ transform: isPanelCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }">▲</span>
        </div>
      </div>
      <div class="gft-panel__header-right" @click.stop>
        <span
          v-if="hasDraft"
          class="gft-panel__draft-indicator"
          :title="`${t('draft_saved_at')} ${draftTimestamp || ''}`"
        >
          💾
        </span>
        <select
          :value="transcriptionMode"
          class="gft-panel__mode-select"
          :title="t('lang_select_title')"
          @click.stop
          @change="updateTranscriptionMode(($event.target as HTMLSelectElement).value as 'fr' | 'en' | 'pl')"
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="pl">PL</option>
        </select>
        <button
          :title="t('undo_tooltip')"
          :disabled="!canUndo()"
          type="button"
          class="gft-panel__icon-btn"
          @click="handleUndo"
        >
          ↩
        </button>
        <button
          :title="t('redo_tooltip')"
          :disabled="!canRedo()"
          type="button"
          class="gft-panel__icon-btn"
          @click="handleRedo"
        >
          ↪
        </button>
        <div class="gft-panel__settings-wrapper">
          <button
            :title="t('settings_tooltip')"
            type="button"
            class="gft-panel__icon-btn"
            @click="toggleSettings"
          >
            ⚙️
          </button>
          <SettingsMenu
            :visible="settingsVisible"
            :show-stats="showStats"
            @toggle-stats="showStats = !showStats"
            @open-custom-library="openCustomButtonManager('structure')"
            @close="settingsVisible = false"
          />
        </div>
      </div>
    </div>

    <Transition name="gft-panel-collapse">
      <div v-show="!isPanelCollapsed" class="gft-panel__collapsible">
        <div class="gft-panel__body">
          <ProgressBar
            v-if="showProgress"
            :step="progressStep"
            :total="progressTotal"
            :message="progressMessage"
          />

          <StatsDisplay v-if="showStats" :content="editorContent" />

          <StructureSection ref="structureSection" @feedback="handleFeedback" @open-custom-library="openCustomButtonManager" />
          <CleanupSection ref="cleanupSection" @feedback="handleFeedback" @open-custom-library="openCustomButtonManager" />

          <button
            :title="t('global_fix_tooltip')"
            type="button"
            class="gft-panel__main-action"
            @click="handleFixAllMain"
          >
            {{ t('btn_fix_all_short') }}
          </button>

          <div class="gft-panel__footer">
            <span class="gft-panel__footer-credit">Made with ❤️ by Lnkhey</span>
            <a
              href="https://buymeacoffee.com/lnkhey"
              target="_blank"
              rel="noopener noreferrer"
              class="gft-panel__footer-link"
            >
              ☕ {{ t('footer_buy_me_a_coffee') }}
            </a>
            <a
              href="https://github.com/anthogoz/Genius-Fast-Transcriber"
              target="_blank"
              rel="noopener noreferrer"
              class="gft-panel__footer-link"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" class="gft-panel__footer-icon">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.77 7.77 0 0 1 8 4.77c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                />
              </svg>
              {{ t('footer_github') }}
            </a>
            <span class="gft-panel__footer-version">{{ panelVersion }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <DraftNotification
      v-if="showDraftNotification"
      :timestamp="draftTime"
      @restore="restoreDraft"
      @discard="dismissDraftNotification"
    />


    <CustomButtonManager
      :visible="showCustomButtonManager"
      :default-type="customManagerDefaultType"
      @feedback="handleFeedback"
      @saved="handleCustomButtonsSaved"
      @close="closeCustomButtonManager"
    />
  </div>
</template>

<style scoped>
.gft-panel {
  --gft-panel-bg: #262626;
  --gft-panel-border: #000;
  --gft-panel-text: #efefef;
  --gft-panel-header-border: #3d3d3d;
  --gft-btn-bg: #2d2d2d;
  --gft-btn-border: #4b4b4b;
  --gft-btn-hover-bg: #f9ff55;
  --gft-btn-hover-border: #f9ff55;
  --gft-btn-hover-text: #0e0e0e;
  --gft-btn-primary-bg: #f9ff55;
  --gft-btn-primary-border: #f9ff55;
  --gft-btn-primary-text: #0e0e0e;
  --gft-btn-primary-hover-bg: #e9ee4e;
  --gft-btn-primary-hover-border: #e9ee4e;
  --gft-btn-primary-hover-text: #0e0e0e;
  --gft-input-bg: rgba(255, 255, 255, 0.08);
  --gft-input-border: rgba(255, 255, 255, 0.16);
  --gft-title-color: #f9ff55;

  background: var(--gft-panel-bg);
  color: var(--gft-panel-text);
  border-radius: 6px;
  border: 1px solid var(--gft-panel-border);
  overflow: visible;
  font-size: 12px;
  width: 100%;
  box-shadow: none;
  margin-bottom: 30px;
  user-select: none;
  -webkit-user-select: none;
}

.gft-panel input,
.gft-panel textarea,
.gft-panel [contenteditable='true'] {
  user-select: text;
  -webkit-user-select: text;
}

.gft-panel:not(.gft-dark-mode) {
  --gft-panel-bg: #ffffff;
  --gft-panel-text: #0e0e0e;
  --gft-panel-header-border: rgba(14, 14, 14, 0.35);
  --gft-btn-bg: #f8f8f8;
  --gft-btn-border: #c9c9c9;
  --gft-btn-primary-bg: #0e0e0e;
  --gft-btn-primary-border: #0e0e0e;
  --gft-btn-primary-text: #f9ff55;
  --gft-btn-primary-hover-bg: #f9ff55;
  --gft-btn-primary-hover-border: #f9ff55;
  --gft-input-bg: #ffffff;
  --gft-input-border: rgba(14, 14, 14, 0.22);
  --gft-title-color: #0e0e0e;

  background: var(--gft-panel-bg);
  color: var(--gft-panel-text);
  border-color: var(--gft-panel-border);
}

.gft-panel__header {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
  background: transparent;
  user-select: none;
  position: relative;
}


.gft-panel:not(.gft-dark-mode) .gft-panel__header {
  background: transparent;
}


.gft-panel__header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gft-panel__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.gft-panel__logo-image {
  width: 16px;
  height: 16px;
  object-fit: contain;
  border-radius: 4px;
}

.gft-panel__title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

.gft-panel__collapse-arrow {
  font-size: 11px;
  opacity: 0.8;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}


.gft-panel__mode-select {
  padding: 2px 18px 2px 7px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid var(--gft-btn-border);
  border-radius: 6px;
  background-color: var(--gft-btn-bg);
  color: inherit;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 10px;
}

.gft-panel__mode-select:hover {
  border-color: var(--gft-btn-hover-border);
}

.gft-panel__header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gft-panel__draft-indicator {
  font-size: 14px;
  line-height: 1;
  opacity: 0.65;
}

.gft-panel__settings-wrapper {
  position: relative;
}

.gft-panel__icon-btn {
  background: var(--gft-btn-bg);
  border: 1px solid var(--gft-btn-border);
  color: inherit;
  cursor: pointer;
  width: 28px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 12px;
  transition: background 0.15s;
}

.gft-panel__icon-btn:hover:not(:disabled) {
  background: var(--gft-btn-hover-bg);
  color: var(--gft-btn-hover-text);
  border-color: var(--gft-btn-hover-border);
}

.gft-panel__icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.gft-panel__collapsible {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-top: 1px solid var(--gft-panel-header-border);
}

.gft-panel:not(.gft-dark-mode) .gft-panel__collapsible {
  border-top-color: rgba(14, 14, 14, 0.35);
}


.gft-panel-collapse-enter-active,
.gft-panel-collapse-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.gft-panel-collapse-enter-from,
.gft-panel-collapse-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
  border-top-color: transparent;
}


.gft-panel__body {
  min-height: 0;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}



.gft-panel__stats-toggle {
  background: var(--gft-btn-bg);
  border: 1px dashed var(--gft-btn-border);
  color: inherit;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.gft-panel__stats-toggle:hover {
  opacity: 1;
}

.gft-panel__main-action {
  width: 100%;
  margin-top: 8px;
  background: var(--gft-btn-primary-bg, #f9ff55);
  border: 1px solid var(--gft-btn-primary-border, #f9ff55);
  color: var(--gft-btn-primary-text, #0e0e0e);
  font-weight: 800;
  font-family: 'Programme', 'Programme Pan', Arial, sans-serif;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  border-radius: 8px;
  padding: 10px 10px;
  transition: transform 0.15s ease, background 0.15s ease;
}

.gft-panel__main-action:hover {
  background: var(--gft-btn-primary-hover-bg, #e9ee4e);
  border-color: var(--gft-btn-primary-hover-border, #e9ee4e);
  color: var(--gft-btn-primary-hover-text, #0e0e0e);
  transform: translateY(-1px);
}

.gft-panel:not(.gft-dark-mode) .gft-panel__main-action {
  background: #f9ff55;
  border-color: #0e0e0e;
  color: #0e0e0e;
}

.gft-panel__footer {
  margin-top: 6px;
  padding-top: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 10px;
}

.gft-panel:not(.gft-dark-mode) .gft-panel__footer {
  border-top-color: rgba(14, 14, 14, 0.2);
}

.gft-panel__footer-credit,
.gft-panel__footer-version {
  font-size: 10px;
  color: #888;
  opacity: 0.65;
}

.gft-panel__footer-link {
  color: #888;
  text-decoration: none;
  font-size: 10px;
  opacity: 0.75;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.gft-panel__footer-icon {
  width: 12px;
  height: 12px;
}

.gft-panel__footer-link:hover {
  opacity: 1;
  color: #f9ff55;
  text-decoration: underline;
}

:global(.gft-custom-tooltip) {
  position: fixed;
  z-index: 2147483646;
  pointer-events: none;
  background: #f9ff55;
  color: #0e0e0e;
  border: 1px solid #0e0e0e;
  border-radius: 6px;
  font-family: 'Programme', 'Programme Pan', Arial, sans-serif;
  font-size: 10px;
  line-height: 1.3;
  padding: 5px 7px;
  max-width: 280px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transition: opacity 0.12s ease;
}

@media (max-width: 560px) {
  .gft-panel__header {
    padding: 7px 8px;
  }

  .gft-panel__title {
    font-size: 12px;
  }

  .gft-panel__footer {
    grid-template-columns: 1fr auto;
    row-gap: 4px;
  }
}
</style>
