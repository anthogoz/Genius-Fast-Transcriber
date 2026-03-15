<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useGftState } from '@/composables/useGftState';

const { t } = useI18n();
const { verseCounter, incrementVerseCounter, decrementVerseCounter } = useGftState();

const emit = defineEmits<{
  insert: [tag: string];
}>();

function insertVerse() {
  emit('insert', `[${t('btn_verse_num').replace(/\[|\]/g, '').replace(/\d+/, String(verseCounter.value))}]`);
}
</script>

<template>
  <div class="gft-verse-counter">
    <button
      :title="t('btn_prev_couplet_tooltip')"
      type="button"
      class="gft-verse-counter__arrow"
      @click="decrementVerseCounter"
    >
      ←
    </button>
    <button
      :title="t('btn_verse_num_tooltip')"
      type="button"
      class="gft-verse-counter__main"
      @click="insertVerse"
    >
      {{ t('btn_verse_num').replace(/\d+/, String(verseCounter)) }}
    </button>
    <button
      :title="t('btn_next_couplet_tooltip')"
      type="button"
      class="gft-verse-counter__arrow"
      @click="incrementVerseCounter"
    >
      →
    </button>
  </div>
</template>

<style scoped>
.gft-verse-counter {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--gft-btn-border, #adadad);
  border-radius: 4px;
  overflow: hidden;
  height: 20px;
  box-sizing: border-box;
  font-family: 'Programme', 'Programme Pan', Arial, sans-serif;
}

.gft-verse-counter__arrow {
  background: var(--gft-btn-bg, #fffdef);
  border: none;
  color: inherit;
  width: 20px;
  height: 100%;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.gft-verse-counter__arrow:hover {
  background: var(--gft-btn-hover-bg, #0e0e0e);
  border-color: var(--gft-btn-hover-border, #0e0e0e);
  color: var(--gft-btn-hover-text, #f9ff55);
}

.gft-verse-counter__main {
  background: var(--gft-btn-bg, #fffdef);
  color: inherit;
  border: none;
  border-left: 1px solid var(--gft-btn-border, #adadad);
  border-right: 1px solid var(--gft-btn-border, #adadad);
  padding: 0 8px;
  height: 100%;
  cursor: pointer;
  font-weight: 400;
  font-size: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.gft-verse-counter__main:hover {
  background: var(--gft-btn-hover-bg, #0e0e0e);
  color: var(--gft-btn-hover-text, #f9ff55);
}
</style>
