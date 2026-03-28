<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditor } from '@/composables/useEditor';
import { useGftState } from '@/composables/useGftState';
import { useSettings } from '@/composables/useSettings';
import type { CustomButton } from '@/types';
import { formatArtistList } from '@/utils/artists';
import { generateSongHeader } from '@/utils/corrections';
import ArtistSelector from './ArtistSelector.vue';
import VerseCounter from './VerseCounter.vue';

const { t } = useI18n();
const { locale, isTagNewlinesDisabled } = useSettings();
const {
  currentSongTitle,
  currentMainArtists,
  currentFeaturingArtists,
  incrementVerseCounter,
  verseCounter,
} = useGftState();
const { insertTextAtCursor } = useEditor();

const emit = defineEmits<{
  openCustomLibrary: [defaultType: 'cleanup' | 'structure'];
  feedback: [message: string];
}>();

const artistSelector = ref<InstanceType<typeof ArtistSelector> | null>(null);
const customButtonsRevision = ref(0);

interface StructureTag {
  key: string;
  tag: string;
  withArtists: boolean;
  locales?: string[];
}

const allTags: StructureTag[] = [
  { key: 'btn_intro', tag: 'Intro', withArtists: true },
  { key: 'btn_verse_unique', tag: '', withArtists: true },
  { key: 'btn_verse', tag: '', withArtists: true },
  { key: 'btn_chorus', tag: '', withArtists: true },
  { key: 'btn_pre_chorus', tag: '', withArtists: true },
  { key: 'btn_bridge', tag: '', withArtists: true },
  { key: 'btn_outro', tag: 'Outro', withArtists: true },
  { key: 'btn_instrumental', tag: '', withArtists: false },
  { key: 'btn_break', tag: '', withArtists: false },
  { key: 'btn_post_chorus', tag: '', withArtists: true },
  { key: 'btn_hook', tag: '', withArtists: true, locales: ['pl'] },
  { key: 'btn_interlude', tag: '', withArtists: false, locales: ['pl'] },
  { key: 'btn_part', tag: '', withArtists: true, locales: ['pl'] },
  { key: 'btn_skit', tag: '', withArtists: false },
  { key: 'btn_vocalization', tag: '', withArtists: false, locales: ['pl'] },
  { key: 'btn_unknown', tag: '?', withArtists: false },
];

const visibleTags = computed(() =>
  allTags.filter((tag) => {
    if (!tag.locales) return true;
    return tag.locales.includes(locale.value);
  }),
);

const showHeaderButton = computed(() => locale.value !== 'en');

const customStructureButtons = computed<CustomButton[]>(() => {
  void customButtonsRevision.value;
  try {
    const raw = localStorage.getItem('gftCustomButtons');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomButton[];
    return parsed.filter((btn) => btn.type === 'structure' && typeof btn.content === 'string');
  } catch {
    return [];
  }
});

function getSelectedArtists(): string[] {
  return artistSelector.value?.getSelectedArtists() ?? [];
}

function buildTagText(tagKey: string): string {
  const rawLabel = t(tagKey);
  const tagContent = rawLabel.replace(/^\[/, '').replace(/\]$/, '');
  return `[${tagContent}]`;
}

function addArtistsToTag(baseTag: string): string {
  const artists = getSelectedArtists();
  if (artists.length === 0) return baseTag;

  const tagPart = baseTag.slice(0, -1);
  const artistsString = formatArtistList(artists);
  const separator = locale.value === 'fr' ? ' : ' : ': ';
  return `${tagPart}${separator}${artistsString}]`;
}

function formatTag(tag: string): string {
  return isTagNewlinesDisabled.value ? tag : `${tag}\n`;
}

function insertTag(tagDef: StructureTag) {
  const baseTag = buildTagText(tagDef.key);
  const withArtists = tagDef.withArtists ? addArtistsToTag(baseTag) : baseTag;
  insertTextAtCursor(formatTag(withArtists));
  emit('feedback', `${t(tagDef.key)} ${t('feedback_added', 'ajouté !')}`);
}

function insertHeader() {
  if (locale.value === 'en') return;

  const headerText = generateSongHeader(
    {
      title: currentSongTitle.value,
      mainArtists: currentMainArtists.value,
      featuringArtists: currentFeaturingArtists.value,
    },
    locale.value,
  );

  insertTextAtCursor(formatTag(headerText));
  emit('feedback', `🏠 ${t('btn_header')} ${t('feedback_added', 'ajouté !')}`);
}

function handleVerseInsert(tag: string) {
  const withArtists = addArtistsToTag(tag);
  insertTextAtCursor(formatTag(withArtists));
  incrementVerseCounter();
  emit('feedback', `📝 ${tag} ${t('feedback_added', 'ajouté !')}`);
}

function insertTagByKey(key: string) {
  const tagDef = allTags.find(tag => tag.key === key);
  if (!tagDef) return;
  insertTag(tagDef);
}

function insertVerseByShortcut() {
  handleVerseInsert(`[${t('btn_verse_num').replace(/\[|\]/g, '').replace(/\d+/, String(verseCounter.value))}]`);
}

function openCustomStructureButtonManager() {
  emit('openCustomLibrary', 'structure');
}

function insertCustomStructureButton(button: CustomButton) {
  if (!button.content) return;
  const textToInsert = button.content.trim().startsWith('[')
    ? addArtistsToTag(button.content)
    : button.content;
  insertTextAtCursor(formatTag(textToInsert));
}

defineExpose({
  insertVerseByShortcut,
  insertChorusByShortcut: () => insertTagByKey('btn_chorus'),
  insertBridgeByShortcut: () => insertTagByKey('btn_bridge'),
  insertIntroByShortcut: () => insertTagByKey('btn_intro'),
  insertOutroByShortcut: () => insertTagByKey('btn_outro'),
});

function handleCustomButtonsUpdated() {
  customButtonsRevision.value++;
}

onMounted(() => {
  window.addEventListener('gft-custom-buttons-updated', handleCustomButtonsUpdated);
});

onUnmounted(() => {
  window.removeEventListener('gft-custom-buttons-updated', handleCustomButtonsUpdated);
});
</script>

<template>
  <section class="gft-structure-section">
    <ArtistSelector ref="artistSelector" @artists-selected="() => {}" />

    <hr class="gft-structure-section__divider" />

    <h3 class="gft-u-section-title">{{ t('section_structure') }}</h3>

    <div class="gft-structure-section__tags">
      <VerseCounter @insert="handleVerseInsert" />

      <button
        v-if="showHeaderButton"
        :title="t('btn_header_tooltip')"
        type="button"
        class="gft-u-btn"
        @click="insertHeader"
      >
        {{ t('btn_header') }}
      </button>

      <template v-for="tagDef in visibleTags" :key="tagDef.key">
        <button
          :title="t(`${tagDef.key}_tooltip`)"
          type="button"
          class="gft-u-btn gft-u-btn--tag"
          @click="insertTag(tagDef)"
        >
          {{ t(tagDef.key) }}
        </button>
      </template>

      <button
        v-for="btn in customStructureButtons"
        :key="btn.id"
        type="button"
        class="gft-u-btn gft-u-btn--tag"
        @click="insertCustomStructureButton(btn)"
      >
        {{ btn.label }}
      </button>

      <button
        :title="t('btn_add_custom_structure_title')"
        type="button"
        class="gft-u-btn gft-u-btn--plus"
        @click="openCustomStructureButtonManager"
      >
        +
      </button>
    </div>
  </section>
</template>

<style scoped>
.gft-structure-section {
  margin-bottom: 6px;
}

.gft-structure-section__divider {
  margin: 6px 0 8px;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}


.gft-structure-section__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
