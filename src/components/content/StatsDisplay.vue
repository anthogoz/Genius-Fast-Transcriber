<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LyricsStats } from '@/types';
import { isSectionTag } from '@/utils/corrections';

const { t } = useI18n();

const props = defineProps<{
  content: string;
}>();

const stats = computed<LyricsStats>(() => {
  const text = props.content;
  if (!text.trim()) {
    return { lines: 0, words: 0, sections: 0, characters: 0 };
  }

  const lines = text.split('\n');
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  const sections = lines.filter((l) => isSectionTag(l.trim())).length;
  const words = text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return {
    lines: nonEmptyLines.length,
    words,
    sections,
    characters: text.length,
  };
});

function pluralize(key: string, count: number): string {
  return (t as any)(key, count);
}
</script>

<template>
  <div class="gft-stats">
    <span class="gft-stats__item">
      {{ stats.lines }} {{ pluralize('stats_lines', stats.lines) }}
    </span>
    <span class="gft-stats__separator">·</span>
    <span class="gft-stats__item">
      {{ stats.words }} {{ pluralize('stats_words', stats.words) }}
    </span>
    <span class="gft-stats__separator">·</span>
    <span class="gft-stats__item">
      {{ stats.sections }} {{ pluralize('stats_sections', stats.sections) }}
    </span>
    <span class="gft-stats__separator">·</span>
    <span class="gft-stats__item">
      {{ stats.characters }} {{ pluralize('stats_characters', stats.characters) }}
    </span>
  </div>
</template>

<style scoped>
.gft-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 500;
  padding: 3px 14px;
  margin: 0 auto 10px auto;
  border-radius: 20px;
  width: fit-content;
  background: var(--gft-btn-bg, rgba(128, 128, 128, 0.1));
  border: 1px solid var(--gft-btn-border, rgba(128, 128, 128, 0.2));
  opacity: 0.85;
}

.gft-stats__item {
  white-space: nowrap;
}

.gft-stats__separator {
  opacity: 0.35;
}
</style>
