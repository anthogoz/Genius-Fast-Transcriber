<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isSectionTag } from '@/utils/corrections';
import type { LyricsStats } from '@/types';

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
  const forms = t(key).split('|');
  if (forms.length === 1) return forms[0];
  return count === 1 ? forms[0] : forms[forms.length - 1];
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
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 6px;
  font-size: 11px;
  opacity: 0.7;
  padding: 6px 0;
}

.gft-stats__item {
  white-space: nowrap;
}

.gft-stats__separator {
  opacity: 0.5;
}
</style>
