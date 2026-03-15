<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/composables/useSettings';
import type { KeyboardShortcut, ShortcutSettings } from '@/types';

const { t } = useI18n();
const { shortcuts, isDarkMode, resetShortcuts } = useSettings();

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const recordingKey = ref<keyof ShortcutSettings | null>(null);

function startRecording(key: keyof ShortcutSettings) {
  recordingKey.value = key;
}

function stopRecording() {
  recordingKey.value = null;
}

function handleKeyDown(e: KeyboardEvent) {
  if (!recordingKey.value) return;

  // Prevent default for everything while recording to avoid browser shortcuts interference
  e.preventDefault();
  e.stopPropagation();

  // Ignore solo modifier keys
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

  const newShortcut: KeyboardShortcut = {
    key: e.key,
    code: e.code,
    ctrlKey: e.ctrlKey || e.metaKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    metaKey: e.metaKey,
  };

  shortcuts.value[recordingKey.value] = newShortcut;
  stopRecording();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown, true);
});

function formatShortcut(s: KeyboardShortcut): string {
  const parts: string[] = [];
  if (s.ctrlKey) parts.push('Ctrl');
  if (s.altKey) parts.push('Alt');
  if (s.shiftKey) parts.push('Shift');
  
  // Clean up key name
  let keyDisplay = s.key.toUpperCase();
  if (s.key === ' ') keyDisplay = 'Space';
  if (s.key === 'ArrowLeft') keyDisplay = '←';
  if (s.key === 'ArrowRight') keyDisplay = '→';
  if (s.key === 'ArrowUp') keyDisplay = '↑';
  if (s.key === 'ArrowDown') keyDisplay = '↓';
  
  parts.push(keyDisplay);
  return parts.join(' + ');
}

const shortcutList: { key: keyof ShortcutSettings; label: string }[] = [
  { key: 'verse', label: 'Verse' },
  { key: 'chorus', label: 'Chorus' },
  { key: 'bridge', label: 'Bridge' },
  { key: 'intro', label: 'Intro' },
  { key: 'outro', label: 'Outro' },
  { key: 'fixAll', label: 'btn_fix_all_short' },
  { key: 'duplicateLine', label: 'duplicate_line' },
  { key: 'undo', label: 'undo_tooltip' },
  { key: 'redo', label: 'redo_tooltip' },
  { key: 'toggleStats', label: 'Stats' },
  { key: 'ytPlayPause', label: 'yt_play_pause' },
  { key: 'ytSeekBack', label: 'yt_seek_back' },
  { key: 'ytSeekForward', label: 'yt_seek_forward' },
];
</script>

<template>
  <Teleport to="body">
    <Transition name="gft-fade">
      <div v-if="visible" class="gft-u-overlay gft-u-overlay--blur gft-u-overlay--center" @click="emit('close')">
        <div class="gft-u-modal gft-shortcut-modal" :class="{ 'gft-u-modal--dark': isDarkMode }" @click.stop>
          <div class="gft-shortcut-modal__header">
            <h2 class="gft-shortcut-modal__title">{{ t('shortcuts_title') }}</h2>
            <button type="button" class="gft-shortcut-modal__close" @click="emit('close')">×</button>
          </div>
          
          <div class="gft-shortcut-modal__body">
            <p class="gft-shortcut-modal__hint">{{ t('shortcuts_hint') }}</p>
            
            <div class="gft-shortcut-list">
              <div v-for="item in shortcutList" :key="item.key" class="gft-shortcut-item">
                <span class="gft-shortcut-item__label">{{ t(item.label) }}</span>
                <button 
                  type="button"
                  class="gft-shortcut-item__button"
                  :class="{ 'gft-shortcut-item__button--recording': recordingKey === item.key }"
                  @click="startRecording(item.key)"
                >
                  {{ recordingKey === item.key ? t('shortcuts_recording') : formatShortcut(shortcuts[item.key]) }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="gft-shortcut-modal__footer">
            <button type="button" class="gft-u-btn gft-u-btn--sm gft-shortcut-modal__btn-reset" @click="resetShortcuts">{{ t('shortcuts_reset_all') }}</button>
            <button type="button" class="gft-u-btn gft-u-btn--sm gft-shortcut-modal__btn-close" @click="emit('close')">{{ t('preview_btn_apply') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.gft-shortcut-modal {
  width: 400px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.gft-shortcut-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.gft-shortcut-modal__title {
  margin: 0;
  font-size: 18px;
  color: #0e0e0e; /* Light mode default */
}

.gft-u-modal--dark .gft-shortcut-modal__title {
  color: #f9ff55; /* Better contrast in dark mode */
}

.gft-shortcut-modal__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: inherit;
  opacity: 0.8;
}

.gft-shortcut-modal__body {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.gft-shortcut-modal__hint {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 15px;
  color: #444;
}

.gft-u-modal--dark .gft-shortcut-modal__hint {
  color: #ccc;
}

.gft-shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gft-shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 8px;
}

.gft-shortcut-item__label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.gft-u-modal--dark .gft-shortcut-item__label {
  color: #eee;
}

.gft-shortcut-item__button {
  background: var(--gft-btn-bg, #efefef);
  border: 1px solid var(--gft-btn-border, #ccc);
  color: var(--gft-panel-text);
  padding: 4px 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.2s;
}

.gft-u-modal--dark .gft-shortcut-item__button {
  background: #3d3d3d;
  border-color: #555;
}

.gft-shortcut-item__button:hover {
  border-color: #f9ff55;
}

.gft-shortcut-item__button.gft-shortcut-item__button--recording {
  background: #444;
  color: #f9ff55;
  border-color: #f9ff55;
  animation: gft-pulse 1.5s infinite;
}

@keyframes gft-pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.gft-shortcut-modal__footer {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.gft-shortcut-modal__btn-reset {
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid rgba(128, 128, 128, 0.3);
  color: #444;
}

.gft-u-modal--dark .gft-shortcut-modal__btn-reset {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #bbb;
}

.gft-shortcut-modal__btn-reset:hover {
  background: rgba(255, 64, 64, 0.1);
  border-color: #ff4040;
  color: #ff4040;
}

.gft-shortcut-modal__footer .gft-shortcut-modal__btn-close {
  background: #f9ff55;
  color: #0e0e0e;
  border: none;
  font-weight: 700;
  padding: 6px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}

.gft-shortcut-modal__footer .gft-shortcut-modal__btn-close:hover {
  background: #e9ee4e;
  transform: translateY(-1px);
}

.gft-fade-enter-active,
.gft-fade-leave-active {
  transition: opacity 0.2s ease;
}

.gft-fade-enter-from,
.gft-fade-leave-to {
  opacity: 0;
}
</style>
