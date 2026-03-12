<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditor } from '@/composables/useEditor';
import { useUndoRedo } from '@/composables/useUndoRedo';

const { t } = useI18n();
const { getEditorContent, setEditorContent } = useEditor();
const { saveState } = useUndoRedo();

const emit = defineEmits<{
  feedback: [message: string];
}>();

const searchQuery = ref('');
const replaceQuery = ref('');
const useRegex = ref(false);

function buildPattern(): RegExp | null {
  if (!searchQuery.value) return null;
  try {
    if (useRegex.value) {
      return new RegExp(searchQuery.value, 'g');
    }
    const escaped = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'g');
  } catch {
    return null;
  }
}

function replaceFirst() {
  const pattern = buildPattern();
  if (!pattern) return;

  const content = getEditorContent();
  const match = pattern.exec(content);
  if (!match) {
    emit('feedback', t('feedback_no_replacement'));
    return;
  }

  saveState(content);
  const newText = content.slice(0, match.index) + replaceQuery.value + content.slice(match.index + match[0].length);
  setEditorContent(newText);
  emit('feedback', t('feedback_replaced', { count: 1, item: searchQuery.value }));
}

function replaceAll() {
  const pattern = buildPattern();
  if (!pattern) return;

  const content = getEditorContent();
  const matches = content.match(pattern);
  if (!matches || matches.length === 0) {
    emit('feedback', t('feedback_no_replacement'));
    return;
  }

  saveState(content);
  const newText = content.replace(pattern, replaceQuery.value);
  setEditorContent(newText);
  emit('feedback', t('feedback_replaced', { count: matches.length, item: searchQuery.value }));
}
</script>

<template>
  <div class="gft-find-replace">
    <h4 class="gft-find-replace__title">{{ t('find_replace_title') }}</h4>
    <div class="gft-find-replace__fields">
      <input
        v-model="searchQuery"
        class="gft-find-replace__input"
        :placeholder="t('find_placeholder')"
        @keydown.enter="replaceFirst"
      />
      <input
        v-model="replaceQuery"
        class="gft-find-replace__input"
        :placeholder="t('replace_placeholder')"
        @keydown.enter="replaceFirst"
      />
    </div>
    <div class="gft-find-replace__controls">
      <label class="gft-find-replace__regex">
        <input type="checkbox" v-model="useRegex" />
        {{ t('regex_toggle') }}
      </label>
      <div class="gft-find-replace__buttons">
        <button class="gft-btn gft-btn--sm" @click="replaceFirst">
          {{ t('btn_replace') }}
        </button>
        <button class="gft-btn gft-btn--sm" @click="replaceAll">
          {{ t('btn_replace_all') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gft-find-replace {
  padding: 8px 0;
}

.gft-find-replace__title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 6px 0;
  color: #ffff64;
}

.gft-find-replace__fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
}

.gft-find-replace__input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: inherit;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}

.gft-find-replace__input:focus {
  border-color: #ffff64;
}

.gft-find-replace__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gft-find-replace__regex {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  opacity: 0.8;
}

.gft-find-replace__buttons {
  display: flex;
  gap: 4px;
}

.gft-btn--sm {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: inherit;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background 0.15s, border-color 0.15s;
}

.gft-btn--sm:hover {
  background: rgba(255, 255, 100, 0.15);
  border-color: rgba(255, 255, 100, 0.4);
}
</style>
