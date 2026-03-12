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
  gap: 2px;
}

.gft-verse-counter__arrow {
  background: rgba(255, 255, 100, 0.15);
  border: 1px solid rgba(255, 255, 100, 0.3);
  color: inherit;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.gft-verse-counter__arrow:hover {
  background: rgba(255, 255, 100, 0.3);
}

.gft-verse-counter__main {
  background: #ffff64;
  color: #000;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  transition: opacity 0.15s;
}

.gft-verse-counter__main:hover {
  opacity: 0.85;
}
</style>
