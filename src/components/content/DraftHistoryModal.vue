<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/composables/useSettings';
import { useDraft, type DraftHistoryItem } from '@/composables/useDraft';
import { useEditor } from '@/composables/useEditor';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  feedback: [message: string];
}>();

const { t } = useI18n();
const { isDarkMode } = useSettings();
const { getAllDrafts, discardDraftByScoped, loadDraftByScoped } = useDraft();
const { setEditorContent } = useEditor();

const drafts = ref<DraftHistoryItem[]>([]);
const previewDraftId = ref<string | null>(null);

function loadDraftsList() {
  drafts.value = getAllDrafts();
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      loadDraftsList();
      previewDraftId.value = null;
    }
  },
);

function handleRestore(item: DraftHistoryItem) {
  const loaded = loadDraftByScoped(item.scoped);
  if (loaded) {
    setEditorContent(loaded.content);
    emit('feedback', t('draft_restored'));
    emit('close');
  }
}

function handleDelete(item: DraftHistoryItem) {
  const confirmMsg = t('confirm_delete_draft', { title: item.title });
  if (confirm(confirmMsg)) {
    discardDraftByScoped(item.scoped);
    loadDraftsList();
    if (previewDraftId.value === item.scoped) {
      previewDraftId.value = null;
    }
  }
}

function togglePreview(scoped: string) {
  previewDraftId.value = previewDraftId.value === scoped ? null : scoped;
}

const previewContent = computed(() => {
  if (!previewDraftId.value) return '';
  const found = drafts.value.find((d) => d.scoped === previewDraftId.value);
  return found ? found.content : '';
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="gft-u-overlay gft-u-overlay--center gft-u-overlay--blur"
      @click.self="emit('close')"
    >
      <div
        class="gft-u-modal gft-draft-history-modal"
        :class="{ 'gft-u-modal--dark gft-dark-mode': isDarkMode }"
      >
        <div class="gft-draft-history__header">
          <h3>{{ t('draft_history_title') }}</h3>
          <button type="button" class="gft-draft-history__close" @click="emit('close')">×</button>
        </div>

        <div class="gft-draft-history__body">
          <div v-if="drafts.length === 0" class="gft-draft-history__empty">
            {{ t('draft_history_empty') }}
          </div>

          <div v-else class="gft-draft-history__layout">
            <!-- Left Pane: List of drafts -->
            <div class="gft-draft-history__list-container">
              <div class="gft-draft-history__list">
                <div 
                  v-for="item in drafts" 
                  :key="item.scoped" 
                  class="gft-draft-history__item"
                  :class="{ 'gft-draft-history__item--previewing': previewDraftId === item.scoped }"
                >
                  <div class="gft-draft-history__item-info" @click="togglePreview(item.scoped)">
                    <div class="gft-draft-history__item-title" :title="item.title">
                      {{ item.title }}
                    </div>
                    <div class="gft-draft-history__item-artists" :title="item.artists">
                      {{ item.artists }}
                    </div>
                    <div class="gft-draft-history__item-meta">
                      <span>{{ item.date }} {{ item.time }}</span>
                      <span class="gft-meta-dot">•</span>
                      <span>{{ t('draft_history_char_count', { count: item.charCount }) }}</span>
                    </div>
                  </div>

                  <div class="gft-draft-history__item-actions">
                    <button 
                      type="button" 
                      class="gft-draft-history-btn gft-draft-history-btn--restore" 
                      :title="t('draft_btn_restore')"
                      @click="handleRestore(item)"
                    >
                      🚀
                    </button>
                    <button 
                      type="button" 
                      class="gft-draft-history-btn gft-draft-history-btn--delete" 
                      :title="t('confirm_delete_button', { label: '' }).replace('?', '')"
                      @click="handleDelete(item)"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Pane: Preview content -->
            <div class="gft-draft-history__preview-container">
              <div v-if="previewDraftId" class="gft-draft-history__preview">
                <div class="gft-draft-history__preview-header">
                  {{ t('draft_history_preview') }}
                </div>
                <pre class="gft-draft-history__preview-content">{{ previewContent }}</pre>
              </div>
              <div v-else class="gft-draft-history__preview-placeholder">
                💡 Cliquez sur un brouillon pour prévisualiser son contenu avant de le restaurer.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.gft-draft-history-modal {
  --gft-dh-bg: #ffffff;
  --gft-dh-text: #1e1e1e;
  --gft-dh-muted: rgba(30, 30, 30, 0.65);
  --gft-dh-border: rgba(18, 18, 18, 0.14);
  --gft-dh-item-bg: rgba(0, 0, 0, 0.02);
  --gft-dh-item-hover: rgba(249, 255, 85, 0.08);
  --gft-dh-preview-bg: rgba(0, 0, 0, 0.03);

  background: var(--gft-dh-bg);
  color: var(--gft-dh-text);
  width: min(850px, 95vw);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--gft-dh-border);
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.gft-draft-history-modal.gft-u-modal--dark {
  --gft-dh-bg: #242424;
  --gft-dh-text: #f2f2f2;
  --gft-dh-muted: rgba(242, 242, 242, 0.65);
  --gft-dh-border: rgba(255, 255, 255, 0.12);
  --gft-dh-item-bg: rgba(255, 255, 255, 0.02);
  --gft-dh-item-hover: rgba(249, 255, 85, 0.05);
  --gft-dh-preview-bg: rgba(0, 0, 0, 0.2);
}

.gft-draft-history__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gft-dh-border);
  padding-bottom: 10px;
}

.gft-draft-history__header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.gft-draft-history__close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--gft-dh-border);
  background: rgba(0, 0, 0, 0.05);
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gft-dark-mode .gft-draft-history__close {
  background: rgba(255, 255, 255, 0.08);
}

.gft-draft-history__close:hover {
  border-color: #f9ff55;
}

.gft-draft-history__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.gft-draft-history__empty {
  font-size: 13px;
  color: var(--gft-dh-muted);
  text-align: center;
  padding: 40px 0;
}

.gft-draft-history__layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.gft-draft-history__list-container {
  width: 380px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.gft-draft-history__list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.gft-draft-history__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--gft-dh-border);
  border-radius: 8px;
  padding: 10px;
  background: var(--gft-dh-item-bg);
  transition: all 0.2s ease;
}

.gft-draft-history__item:hover {
  background: var(--gft-dh-item-hover);
  border-color: rgba(249, 255, 85, 0.3);
}

.gft-draft-history__item--previewing {
  border-color: #f9ff55;
  background: var(--gft-dh-item-hover);
}

.gft-draft-history__item-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.gft-draft-history__item-title {
  font-weight: bold;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.gft-draft-history__item-artists {
  font-size: 11.5px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.gft-draft-history__item-meta {
  font-size: 10.5px;
  color: var(--gft-dh-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.gft-meta-dot {
  opacity: 0.5;
}

.gft-draft-history__item-actions {
  display: flex;
  gap: 4px;
}

.gft-draft-history-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--gft-dh-border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.gft-draft-history-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.gft-draft-history-btn--restore:hover {
  background: rgba(74, 222, 128, 0.1);
  border-color: #4ade80;
}

.gft-draft-history-btn--delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

/* Right Pane: Preview styling */
.gft-draft-history__preview-container {
  flex: 1;
  min-width: 0;
  display: flex;
  background: var(--gft-dh-preview-bg);
  border: 1px solid var(--gft-dh-border);
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
}

.gft-draft-history__preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.gft-draft-history__preview-header {
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gft-dh-muted);
  margin-bottom: 8px;
  border-bottom: 1px solid var(--gft-dh-border);
  padding-bottom: 4px;
}

.gft-draft-history__preview-content {
  flex: 1;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: Consolas, Monaco, monospace;
  font-size: 11.5px;
  line-height: 1.5;
  margin: 0;
  color: inherit;
  opacity: 0.95;
}

.gft-draft-history__preview-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--gft-dh-muted);
  font-size: 12.5px;
  padding: 20px;
}

/* Responsiveness */
@media (max-width: 768px) {
  .gft-draft-history-modal {
    max-height: 90vh;
  }
  .gft-draft-history__layout {
    flex-direction: column;
  }
  .gft-draft-history__list-container {
    width: 100%;
    height: 250px;
    flex: none;
  }
  .gft-draft-history__preview-container {
    height: 200px;
  }
}
</style>
