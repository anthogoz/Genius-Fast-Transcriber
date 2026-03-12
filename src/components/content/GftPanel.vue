<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditor } from '@/composables/useEditor';
import { useSettings } from '@/composables/useSettings';
import { useUndoRedo } from '@/composables/useUndoRedo';
import CleanupSection from './CleanupSection.vue';
import ExportSection from './ExportSection.vue';
import FeedbackToast from './FeedbackToast.vue';
import FindReplace from './FindReplace.vue';
import ProgressBar from './ProgressBar.vue';
import SettingsMenu from './SettingsMenu.vue';
import StatsDisplay from './StatsDisplay.vue';
import StructureSection from './StructureSection.vue';

const { t } = useI18n();
const { isPanelCollapsed, isDarkMode } = useSettings();
const { getEditorContent, setEditorContent } = useEditor();
const { undo, redo, canUndo, canRedo } = useUndoRedo();

const settingsVisible = ref(false);
const showStats = ref(false);
const feedbackMessage = ref('');
const feedbackKey = ref(0);
const progressStep = ref(0);
const progressTotal = ref(0);
const progressMessage = ref('');
const showProgress = ref(false);

const editorContent = computed(() => getEditorContent());

function togglePanel() {
  isPanelCollapsed.value = !isPanelCollapsed.value;
}

function toggleSettings() {
  settingsVisible.value = !settingsVisible.value;
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
  feedbackMessage.value = message;
  feedbackKey.value++;
}

function handleFeedback(message: string) {
  showFeedback(message);
}

function clearFeedback() {
  feedbackMessage.value = '';
}

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
    class="gft-panel"
    :class="{ 'gft-dark-mode': isDarkMode, 'gft-panel--collapsed': isPanelCollapsed }"
  >
    <div class="gft-panel__header" @click="togglePanel">
      <div class="gft-panel__header-left">
        <span class="gft-panel__logo">GFT</span>
        <h2 class="gft-panel__title">{{ t('panel_title') }}</h2>
      </div>
      <div class="gft-panel__header-right" @click.stop>
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
          <SettingsMenu :visible="settingsVisible" @close="settingsVisible = false" />
        </div>
      </div>
    </div>

    <div v-show="!isPanelCollapsed" class="gft-panel__body">
      <FeedbackToast
        v-if="feedbackMessage"
        :key="feedbackKey"
        :message="feedbackMessage"
        @close="clearFeedback"
      />

      <ProgressBar
        v-if="showProgress"
        :step="progressStep"
        :total="progressTotal"
        :message="progressMessage"
      />

      <StructureSection />
      <CleanupSection @feedback="handleFeedback" />
      <ExportSection />
      <FindReplace @feedback="handleFeedback" />

      <StatsDisplay v-if="showStats" :content="editorContent" />

      <button
        type="button"
        class="gft-panel__stats-toggle"
        @click="showStats = !showStats"
      >
        {{ showStats ? t('stats_hide') : t('stats_show') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.gft-panel {
  font-family: 'Programme Pan', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1a1a1a;
  color: #e0e0e0;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 100, 0.15);
  overflow: hidden;
  font-size: 13px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.gft-panel.gft-dark-mode {
  background: #111;
  border-color: rgba(255, 255, 100, 0.2);
}

.gft-panel:not(.gft-dark-mode) {
  background: #f8f8f8;
  color: #222;
  border-color: rgba(0, 0, 0, 0.1);
}

.gft-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  background: rgba(255, 255, 100, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  user-select: none;
}

.gft-panel:not(.gft-dark-mode) .gft-panel__header {
  background: rgba(0, 0, 0, 0.02);
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

.gft-panel__header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gft-panel__logo {
  background: #ffff64;
  color: #000;
  font-weight: 900;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.gft-panel__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.gft-panel__header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gft-panel__settings-wrapper {
  position: relative;
}

.gft-panel__icon-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: background 0.15s;
}

.gft-panel__icon-btn:hover:not(:disabled) {
  background: rgba(255, 255, 100, 0.15);
}

.gft-panel__icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.gft-panel__body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gft-panel--collapsed .gft-panel__body {
  display: none;
}

.gft-panel__stats-toggle {
  background: none;
  border: 1px dashed rgba(255, 255, 255, 0.15);
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

.gft-panel:not(.gft-dark-mode) .gft-panel__stats-toggle {
  border-color: rgba(0, 0, 0, 0.15);
}
</style>
