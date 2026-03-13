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

withDefaults(defineProps<{
  embedded?: boolean;
}>(), {
  embedded: false,
});

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
    <h4 v-if="!embedded" class="gft-u-section-title gft-find-replace__title">{{ t('find_replace_title') }}</h4>
    <div class="gft-find-replace__fields">
      <input
        v-model="searchQuery"
        class="gft-u-input"
        :placeholder="t('find_placeholder')"
        @keydown.enter="replaceFirst"
      />
      <input
        v-model="replaceQuery"
        class="gft-u-input"
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
        <button type="button" class="gft-u-btn gft-u-btn--sm" @click="replaceFirst">
          {{ t('btn_replace') }}
        </button>
        <button type="button" class="gft-u-btn gft-u-btn--sm" @click="replaceAll">
          {{ t('btn_replace_all') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gft-find-replace {
  padding: 4px 0;
}

.gft-find-replace__title {
  margin-bottom: 6px;
}

.gft-find-replace__fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
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
</style>
