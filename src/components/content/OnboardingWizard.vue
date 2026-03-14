<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import { useSettings } from '@/composables/useSettings';
import type { ExtensionMode, Locale, Theme } from '@/types';

const { t } = useI18n();
const { locale, mode, theme, isTutorialCompleted } = useSettings();

const emit = defineEmits<{
  complete: [];
}>();

const currentStep = ref(0);

const selectedMode = ref<ExtensionMode>(mode.value);
const selectedTheme = ref<Theme>(theme.value);
const selectedLocale = ref<Locale>(locale.value);

interface TutorialStep {
  titleKey: string;
  contentKey: string;
}

const tutorialSteps: TutorialStep[] = [
  { titleKey: 'tuto_step1_title', contentKey: 'tuto_step1_content' },
  { titleKey: 'tuto_step2_title', contentKey: 'tuto_step2_content' },
  { titleKey: 'tuto_step3_title', contentKey: 'tuto_step3_content' },
  { titleKey: 'tuto_step4_title', contentKey: 'tuto_step4_content' },
  { titleKey: 'tuto_step5_title', contentKey: 'tuto_step5_content' },
  { titleKey: 'tuto_step6_title', contentKey: 'tuto_step6_content' },
];

const CONFIG_STEP_COUNT = 3;

const isLyricOnlyFlow = computed(
  () => selectedMode.value === 'lyric-card-only' && currentStep.value >= CONFIG_STEP_COUNT,
);

const totalSteps = computed(() =>
  isLyricOnlyFlow.value ? CONFIG_STEP_COUNT + 1 : CONFIG_STEP_COUNT + tutorialSteps.length + 1,
);

const isTutorialStep = computed(
  () =>
    !isLyricOnlyFlow.value &&
    currentStep.value >= CONFIG_STEP_COUNT &&
    currentStep.value < CONFIG_STEP_COUNT + tutorialSteps.length,
);
const isFinishStep = computed(
  () =>
    !isLyricOnlyFlow.value && currentStep.value >= CONFIG_STEP_COUNT + tutorialSteps.length,
);

const currentTutorialStep = computed(() => {
  if (!isTutorialStep.value) return null;
  return tutorialSteps[currentStep.value - CONFIG_STEP_COUNT];
});

const onboardingClass = computed(() => ({
  'gft-onboarding--light': selectedTheme.value === 'light',
  'gft-onboarding--dark': selectedTheme.value === 'dark',
}));

const onboardingTitle = computed(() => {
  if (isLyricOnlyFlow.value) return t('tuto_lyric_mode_title');
  if (isFinishStep.value) return t('tuto_finish_title');
  if (currentStep.value >= CONFIG_STEP_COUNT) return t('onboarding_title');
  return '';
});

const showHeaderCounter = computed(() => currentStep.value >= CONFIG_STEP_COUNT);
const showFooter = computed(
  () => currentStep.value > 0 && !isLyricOnlyFlow.value,
);
const showSkipButton = computed(() => currentStep.value >= CONFIG_STEP_COUNT);
const logoUrl = browser.runtime.getURL('/icon/128.png');

function chooseLocale(loc: Locale) {
  selectedLocale.value = loc;
  if (currentStep.value === 0) currentStep.value = 1;
}

function chooseTheme(nextTheme: Theme) {
  selectedTheme.value = nextTheme;
  if (currentStep.value === 1) currentStep.value = 2;
}

function chooseMode(nextMode: ExtensionMode) {
  selectedMode.value = nextMode;
  if (currentStep.value !== 2) return;

  if (nextMode === 'lyric-card-only') {
    currentStep.value = CONFIG_STEP_COUNT;
    return;
  }

  currentStep.value = CONFIG_STEP_COUNT;
}

function next() {
  if (isLyricOnlyFlow.value) {
    finish();
    return;
  }

  if (isFinishStep.value) {
    finish();
    return;
  }
  currentStep.value++;
}

function prev() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function skip() {
  finish();
}

function finish() {
  mode.value = selectedMode.value;
  theme.value = selectedTheme.value;
  locale.value = selectedLocale.value;
  isTutorialCompleted.value = true;
  emit('complete');
}

const locales: { value: Locale; label: string }[] = [
  { value: 'fr', label: '🇫🇷 Français (FR)' },
  { value: 'en', label: '🇬🇧 English (EN)' },
  { value: 'pl', label: '🇵🇱 Polski (PL)' },
];
</script>

<template>
  <div class="gft-u-overlay gft-u-overlay--center gft-onboarding-overlay">
    <div class="gft-onboarding" :class="onboardingClass">
      <div class="gft-onboarding__header">
        <h2 class="gft-onboarding__title" v-html="onboardingTitle" />
        <span v-if="showHeaderCounter" class="gft-onboarding__counter">
          {{ t('tuto_step_counter') }} {{ currentStep + 1 }} {{ t('tuto_of') }} {{ totalSteps }}
        </span>
      </div>

      <div class="gft-onboarding__body">
        <!-- Step 0: Language selection -->
        <div v-if="currentStep === 0" class="gft-onboarding__step">
          <div class="gft-onboarding__hero">
            <img :src="logoUrl" alt="GFT" class="gft-onboarding__hero-logo" />
            <div class="gft-onboarding__hero-badge">
              <h2>Genius Fast Transcriber</h2>
              <h3>+ Lyric Card Maker</h3>
            </div>
          </div>
          <p class="gft-onboarding__intro">
            <strong>Welcome! / Bienvenue ! / Witaj!</strong><br />
            <span>Please select your language to start.</span>
          </p>
          <div class="gft-onboarding__lang-grid">
            <button
              v-for="loc in locales"
              :key="loc.value"
              type="button"
              class="gft-onboarding__lang-btn"
              :class="{ 'gft-onboarding__lang-btn--active': selectedLocale === loc.value }"
              @click="chooseLocale(loc.value)"
            >
              {{ loc.label }}
            </button>
          </div>
        </div>

        <!-- Step 1: Theme selection -->
        <div v-else-if="currentStep === 1" class="gft-onboarding__step">
          <h3>{{ t('theme_select_title') }}</h3>
          <div class="gft-onboarding__theme-buttons">
            <button
              type="button"
              class="gft-onboarding__theme-btn"
              :class="{ 'gft-onboarding__theme-btn--active': selectedTheme === 'light' }"
              @click="chooseTheme('light')"
            >
              {{ t('theme_light_btn') }}
            </button>
            <button
              type="button"
              class="gft-onboarding__theme-btn"
              :class="{ 'gft-onboarding__theme-btn--active': selectedTheme === 'dark' }"
              @click="chooseTheme('dark')"
            >
              {{ t('theme_dark_btn') }}
            </button>
          </div>
        </div>

        <!-- Step 2: Mode selection -->
        <div v-else-if="currentStep === 2" class="gft-onboarding__step">
          <h3>{{ t('mode_select_title') }}</h3>
          <p class="gft-onboarding__intro">{{ t('onboarding_intro') }}</p>
          <div class="gft-onboarding__cards">
            <button
              type="button"
              class="gft-onboarding__card"
              :class="{ 'gft-onboarding__card--active': selectedMode === 'full' }"
              @click="chooseMode('full')"
            >
              <span class="gft-onboarding__badge">{{ t('recommended_label') }}</span>
              <strong>{{ t('mode_full_title') }}</strong>
              <p>{{ t('mode_full_desc') }}</p>
            </button>
            <button
              type="button"
              class="gft-onboarding__card"
              :class="{ 'gft-onboarding__card--active': selectedMode === 'lyric-card-only' }"
              @click="chooseMode('lyric-card-only')"
            >
              <strong>{{ t('mode_lyric_title') }}</strong>
              <p>{{ t('mode_lyric_desc') }}</p>
            </button>
          </div>
        </div>

        <!-- Lyric Card only end -->
        <div v-else-if="isLyricOnlyFlow" class="gft-onboarding__step">
          <div class="gft-onboarding__content" v-html="t('tuto_lyric_mode_content')" />
        </div>

        <!-- Tutorial steps -->
        <div v-else-if="currentTutorialStep" class="gft-onboarding__step">
          <h3>{{ t(currentTutorialStep.titleKey) }}</h3>
          <div class="gft-onboarding__content" v-html="t(currentTutorialStep.contentKey)" />
        </div>

        <!-- Finish step -->
        <div v-else class="gft-onboarding__step">
          <div class="gft-onboarding__content" v-html="t('tuto_finish_content')" />
        </div>
      </div>

      <div v-if="showFooter" class="gft-onboarding__footer">
        <button
          v-if="currentStep > 0"
          type="button"
          class="gft-onboarding__btn gft-onboarding__btn--secondary"
          @click="prev"
        >
          {{ t('tuto_prev') }}
        </button>
        <button
          v-if="showSkipButton"
          type="button"
          class="gft-onboarding__btn gft-onboarding__btn--secondary"
          @click="skip"
        >
          {{ t('tuto_skip') }}
        </button>
        <div style="flex: 1" />
        <button type="button" class="gft-onboarding__btn gft-onboarding__btn--primary" @click="next">
          {{ isFinishStep ? t('tuto_finish') : t('tuto_next') }}
        </button>
      </div>

      <div v-else class="gft-onboarding__footer gft-onboarding__footer--single">
        <button
          type="button"
          class="gft-onboarding__btn gft-onboarding__btn--primary"
          @click="next"
        >
          {{ isLyricOnlyFlow ? t('tuto_lyric_mode_btn') : t('tuto_next') }}
        </button>
      </div>

      <div class="gft-onboarding__progress">
        <div
          v-for="i in totalSteps"
          :key="i"
          class="gft-onboarding__dot"
          :class="{ 'gft-onboarding__dot--active': i - 1 === currentStep, 'gft-onboarding__dot--done': i - 1 < currentStep }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.gft-onboarding-overlay {
  z-index: 2147483646;
  background: rgba(0, 0, 0, 0.6);
}

.gft-onboarding {
  --bg: #f9f9f9;
  --fg: #222;
  --card: #ffffff;
  --card-border: #ccc;
  --accent: #f9ff55;
  --accent-text: #8a6b00;
  --accent-btn: #d6be3a;
  --muted: rgba(0, 0, 0, 0.55);

  background: var(--bg);
  color: var(--fg);
  border-radius: 16px;
  max-width: 520px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
}

.gft-onboarding.gft-onboarding--dark {
  --bg: #1d1d1d;
  --fg: #f2f2f2;
  --card: #333;
  --card-border: #555;
  --accent: #f9ff55;
  --accent-text: #f9ff55;
  --accent-btn: #f9ff55;
  --muted: rgba(255, 255, 255, 0.65);
}

.gft-onboarding__header {
  padding: 20px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gft-onboarding__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gft-onboarding__counter {
  font-size: 12px;
  color: var(--muted);
}

.gft-onboarding__body {
  padding: 20px 24px;
  flex: 1;
}

.gft-onboarding__step h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--accent-text);
}

.gft-onboarding__content {
  font-size: 14px;
  line-height: 1.7;
}

.gft-onboarding__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.gft-onboarding__hero-logo {
  width: 80px;
  height: 80px;
}

.gft-onboarding__hero-badge {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 12px 18px;
  text-align: center;
}

.gft-onboarding__hero-badge h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.4px;
}

.gft-onboarding__hero-badge h3 {
  margin: 4px 0 0 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--fg);
  opacity: 0.85;
}

.gft-onboarding__intro {
  text-align: center;
  margin: 0 0 16px 0;
  color: var(--muted);
}

.gft-onboarding__lang-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

/* biome-ignore lint/correctness/noUnknownPseudoClass: Vue SFC deep selector for scoped styles */
.gft-onboarding__content :deep(kbd) {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

/* biome-ignore lint/correctness/noUnknownPseudoClass: Vue SFC deep selector for scoped styles */
.gft-onboarding.gft-onboarding--dark .gft-onboarding__content :deep(kbd) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.gft-onboarding__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gft-onboarding__card {
  background: var(--card);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 14px;
  color: var(--fg);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.gft-onboarding__card:hover {
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}

.gft-onboarding__card--active {
  border-color: var(--accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 25%, transparent);
}

.gft-onboarding__card strong {
  font-size: 14px;
  color: inherit;
}

.gft-onboarding__card p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--muted);
}

.gft-onboarding__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--accent-btn);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
}

.gft-onboarding__theme-buttons,
.gft-onboarding__lang-buttons {
  display: flex;
  gap: 8px;
}

.gft-onboarding__theme-btn,
.gft-onboarding__lang-btn {
  flex: 1;
  background: var(--card);
  border: 2px solid transparent;
  color: inherit;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: border-color 0.2s;
}

.gft-onboarding__theme-btn:hover,
.gft-onboarding__lang-btn:hover {
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}

.gft-onboarding__theme-btn--active,
.gft-onboarding__lang-btn--active {
  border-color: var(--accent-text);
}

.gft-onboarding__footer {
  padding: 0 24px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.gft-onboarding__btn {
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  border: none;
  transition: opacity 0.15s;
}

.gft-onboarding__btn:hover {
  opacity: 0.85;
}

.gft-onboarding__btn--primary {
  background: var(--accent-btn);
  color: #000;
}

.gft-onboarding__btn--secondary {
  background: color-mix(in srgb, var(--card) 90%, transparent);
  color: var(--fg);
  border: 1px solid color-mix(in srgb, var(--fg) 25%, transparent);
}

.gft-onboarding.gft-onboarding--dark .gft-onboarding__btn--secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #f2f2f2;
  border-color: rgba(255, 255, 255, 0.2);
}

.gft-onboarding__footer--single {
  justify-content: flex-end;
}

.gft-onboarding__progress {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 0 24px 16px;
}

.gft-onboarding__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--fg) 15%, transparent);
  transition: background 0.2s, transform 0.2s;
}

.gft-onboarding__dot--active {
  background: var(--accent);
  transform: scale(1.3);
}

.gft-onboarding__dot--done {
  background: color-mix(in srgb, var(--accent) 55%, transparent);
}
</style>
