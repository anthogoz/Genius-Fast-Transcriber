<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import { useSettings } from '@/composables/useSettings';
import { setLocale } from '@/locales';
import type { ExtensionMode, Locale, Theme } from '@/types';

const { t } = useI18n();
const { locale, transcriptionMode, mode, theme, isTutorialCompleted, tutorialStep } =
  useSettings();

const emit = defineEmits<{
  complete: [];
}>();

// Restore persisted step (clamped to valid range)
const currentStep = ref(Math.max(0, Math.min(tutorialStep.value, 9)));

// Persist step changes
watch(currentStep, (v) => {
  tutorialStep.value = v;
});

const selectedMode = ref<ExtensionMode>(mode.value);
const selectedTheme = ref<Theme>(theme.value);
const selectedLocale = ref<Locale>(locale.value);

// Direction for slide transition
const slideDirection = ref<'left' | 'right'>('left');

interface TutorialStep {
  titleKey: string;
  contentKey: string;
  icon: string;
}

const tutorialSteps: TutorialStep[] = [
  { titleKey: 'tuto_step1_title', contentKey: 'tuto_step1_content', icon: 'structure' },
  { titleKey: 'tuto_step2_title', contentKey: 'tuto_step2_content', icon: 'magic' },
  { titleKey: 'tuto_step3_title', contentKey: 'tuto_step3_content', icon: 'palette' },
  { titleKey: 'tuto_step4_title', contentKey: 'tuto_step4_content', icon: 'shield' },
  { titleKey: 'tuto_step5_title', contentKey: 'tuto_step5_content', icon: 'youtube' },
  { titleKey: 'tuto_step6_title', contentKey: 'tuto_step6_content', icon: 'keyboard' },
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
const tutoLyricCardGifUrl = browser.runtime.getURL('/images/tutolyriccard.gif');

// Progress bar segments
const progressPhase = computed(() => {
  if (currentStep.value < CONFIG_STEP_COUNT) return 'config';
  if (isFinishStep.value || isLyricOnlyFlow.value) return 'ready';
  return 'tutorial';
});

const progressPercent = computed(() => {
  return ((currentStep.value + 1) / totalSteps.value) * 100;
});



// Navigation
function chooseLocale(loc: Locale) {
  selectedLocale.value = loc;
  setLocale(loc);
  if (currentStep.value === 0) {
    slideDirection.value = 'left';
    currentStep.value = 1;
  }
}

function chooseTheme(nextTheme: Theme) {
  selectedTheme.value = nextTheme;
  if (currentStep.value === 1) {
    slideDirection.value = 'left';
    currentStep.value = 2;
  }
}

function chooseMode(nextMode: ExtensionMode) {
  selectedMode.value = nextMode;
  if (currentStep.value !== 2) return;

  slideDirection.value = 'left';
  currentStep.value = CONFIG_STEP_COUNT;
}

function next() {
  if (isLyricOnlyFlow.value || isFinishStep.value) {
    finish();
    return;
  }

  slideDirection.value = 'left';
  currentStep.value++;
}

function prev() {
  if (currentStep.value > 0) {
    slideDirection.value = 'right';
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
  transcriptionMode.value = selectedLocale.value;
  isTutorialCompleted.value = true;
  tutorialStep.value = 0;
  emit('complete');
}

const locales: { value: Locale; label: string }[] = [
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'pl', label: '🇵🇱 Polski' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'it', label: '🇮🇹 Italiano' },
  { value: 'pt', label: '🇧🇷 Português' },
  { value: 'ru', label: '🇷🇺 Русский' },
];

// Shortcut cheat-sheet data
const shortcutRows = computed(() => [
  { keys: 'Ctrl+1', action: t('btn_chorus') },
  { keys: 'Ctrl+2', action: `${t('btn_chorus')} (2)` },
  { keys: 'Ctrl+3', action: t('btn_pre_chorus') },
  { keys: 'Ctrl+4', action: t('btn_intro') },
  { keys: 'Ctrl+5', action: t('btn_bridge') },
  { keys: 'Ctrl+Shift+C', action: t('btn_fix_all_short') },
  { keys: 'Ctrl+D', action: t('btn_duplicate_line_label') },
  { keys: 'Ctrl+Z / Y', action: `${t('undo')} / ${t('redo')}` },
  { keys: 'Alt+Ctrl+Space', action: t('yt_play_pause') },
  { keys: 'Alt+Ctrl+←/→', action: t('yt_seek_back').replace(' -5s', '') },
]);
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
        <Transition :name="slideDirection === 'left' ? 'gft-slide-left' : 'gft-slide-right'" mode="out-in">
          <!-- Step 0: Language selection -->
          <div v-if="currentStep === 0" key="step-lang" class="gft-onboarding__step">
            <div class="gft-onboarding__hero">
              <img :src="logoUrl" alt="GFT" class="gft-onboarding__hero-logo gft-onboarding__hero-logo--bounce" />
              <div class="gft-onboarding__hero-badge">
                <h2>Genius Fast Transcriber</h2>
                <h3>+ Lyric Card Maker</h3>
              </div>
            </div>
            <p class="gft-onboarding__intro">
              <strong>Welcome! / Bienvenue ! / Willkommen!</strong><br />
              <span>Select your language to start.</span>
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
          <div v-else-if="currentStep === 1" key="step-theme" class="gft-onboarding__step">
            <div class="gft-onboarding__step-icon">🌗</div>
            <h3>{{ t('theme_select_title') }}</h3>
            <div class="gft-onboarding__theme-buttons">
              <button
                type="button"
                class="gft-onboarding__theme-btn gft-onboarding__theme-btn--light-preview"
                :class="{ 'gft-onboarding__theme-btn--active': selectedTheme === 'light' }"
                @click="chooseTheme('light')"
              >
                <span class="gft-onboarding__theme-icon">☀️</span>
                {{ t('theme_light_btn') }}
              </button>
              <button
                type="button"
                class="gft-onboarding__theme-btn gft-onboarding__theme-btn--dark-preview"
                :class="{ 'gft-onboarding__theme-btn--active': selectedTheme === 'dark' }"
                @click="chooseTheme('dark')"
              >
                <span class="gft-onboarding__theme-icon">🌙</span>
                {{ t('theme_dark_btn') }}
              </button>
            </div>
          </div>

          <!-- Step 2: Mode selection -->
          <div v-else-if="currentStep === 2" key="step-mode" class="gft-onboarding__step">
            <div class="gft-onboarding__step-icon">⚡</div>
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
                <span class="gft-onboarding__card-icon">🛠️</span>
                <strong>{{ t('mode_full_title') }}</strong>
                <p>{{ t('mode_full_desc') }}</p>
              </button>
              <button
                type="button"
                class="gft-onboarding__card"
                :class="{ 'gft-onboarding__card--active': selectedMode === 'lyric-card-only' }"
                @click="chooseMode('lyric-card-only')"
              >
                <span class="gft-onboarding__card-icon">🎨</span>
                <strong>{{ t('mode_lyric_title') }}</strong>
                <p>{{ t('mode_lyric_desc') }}</p>
              </button>
            </div>
          </div>

          <!-- Lyric Card only end -->
          <div v-else-if="isLyricOnlyFlow" key="step-lyric-end" class="gft-onboarding__step">
            <div class="gft-onboarding__step-icon gft-onboarding__step-icon--pulse">🎨</div>
            <div class="gft-onboarding__content" v-html="t('tuto_lyric_mode_content')" />
          </div>

          <!-- Tutorial step 1: Structure (removed sandbox test) -->
          <div
            v-else-if="currentTutorialStep && currentTutorialStep.icon === 'structure'"
            key="step-tuto-structure"
            class="gft-onboarding__step"
          >
            <div class="gft-onboarding__step-icon gft-onboarding__step-icon--float">🏗️</div>
            <h3>{{ t(currentTutorialStep.titleKey) }}</h3>
            <div class="gft-onboarding__content" v-html="t(currentTutorialStep.contentKey)" />
          </div>

          <!-- Tutorial step 6: Shortcuts (cheat-sheet table) -->
          <div
            v-else-if="currentTutorialStep && currentTutorialStep.icon === 'keyboard'"
            key="step-tuto-shortcuts"
            class="gft-onboarding__step"
          >
            <div class="gft-onboarding__step-icon gft-onboarding__step-icon--float">⌨️</div>
            <h3>{{ t(currentTutorialStep.titleKey) }}</h3>

            <table class="gft-onboarding__shortcut-table">
              <thead>
                <tr>
                  <th>{{ t('tuto_shortcut_keys') }}</th>
                  <th>{{ t('tuto_shortcut_action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in shortcutRows" :key="row.keys">
                  <td>
                    <kbd v-for="(k, idx) in row.keys.split('+')" :key="idx">
                      {{ k }}
                    </kbd>
                  </td>
                  <td>{{ row.action }}</td>
                </tr>
              </tbody>
            </table>

            <p class="gft-onboarding__shortcut-note">
              💡 <strong>{{ t('tuto_shortcut_customizable') }}</strong>
            </p>
          </div>

          <!-- Tutorial step 3: Lyric Card (with GIF demo) -->
          <div
            v-else-if="currentTutorialStep && currentTutorialStep.icon === 'palette'"
            key="step-tuto-lyriccard"
            class="gft-onboarding__step"
          >
            <div class="gft-onboarding__step-icon gft-onboarding__step-icon--float">🎨</div>
            <h3>{{ t(currentTutorialStep.titleKey) }}</h3>
            <div class="gft-onboarding__content" v-html="t(currentTutorialStep.contentKey)" />
            <div class="gft-onboarding__demo-gif">
              <img
                :src="tutoLyricCardGifUrl"
                alt="Lyric Card demo"
                class="gft-onboarding__demo-gif-img"
              />
            </div>
          </div>

          <!-- Tutorial steps (generic: 2, 4-5) -->
          <div
            v-else-if="currentTutorialStep"
            :key="`step-tuto-${currentStep}`"
            class="gft-onboarding__step"
          >
            <div
              class="gft-onboarding__step-icon gft-onboarding__step-icon--float"
            >{{ currentTutorialStep.icon === 'magic' ? '✨' : currentTutorialStep.icon === 'shield' ? '🛡️' : currentTutorialStep.icon === 'youtube' ? '📺' : '📖' }}</div>
            <h3>{{ t(currentTutorialStep.titleKey) }}</h3>
            <div class="gft-onboarding__content" v-html="t(currentTutorialStep.contentKey)" />
          </div>

          <!-- Finish step -->
          <div v-else key="step-finish" class="gft-onboarding__step">
            <div class="gft-onboarding__step-icon gft-onboarding__step-icon--pulse">🚀</div>
            <div class="gft-onboarding__content" v-html="t('tuto_finish_content')" />
          </div>
        </Transition>
      </div>

      <!-- Segmented progress bar -->
      <div class="gft-onboarding__progress-bar">
        <div class="gft-onboarding__progress-segments">
          <div
            class="gft-onboarding__progress-segment"
            :class="{ 'gft-onboarding__progress-segment--active': progressPhase === 'config', 'gft-onboarding__progress-segment--done': progressPhase !== 'config' }"
          >
            <span>⚙️ {{ t('tuto_progress_config') }}</span>
          </div>
          <div
            v-if="!isLyricOnlyFlow"
            class="gft-onboarding__progress-segment"
            :class="{ 'gft-onboarding__progress-segment--active': progressPhase === 'tutorial', 'gft-onboarding__progress-segment--done': progressPhase === 'ready' }"
          >
            <span>📖 {{ t('tuto_progress_tutorial') }}</span>
          </div>
          <div
            class="gft-onboarding__progress-segment"
            :class="{ 'gft-onboarding__progress-segment--active': progressPhase === 'ready' }"
          >
            <span>🚀 {{ t('tuto_progress_ready') }}</span>
          </div>
        </div>
        <div class="gft-onboarding__progress-track">
          <div
            class="gft-onboarding__progress-fill"
            :style="{ width: `${progressPercent}%` }"
          />
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
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   OVERLAY
   ============================================ */
.gft-onboarding-overlay {
  z-index: 2147483646;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* ============================================
   MAIN CONTAINER
   ============================================ */
.gft-onboarding {
  --bg: #f9f9f9;
  --fg: #222;
  --card: #ffffff;
  --card-border: #ddd;
  --accent: #f9ff55;
  --accent-text: #8a6b00;
  --accent-btn: #d6be3a;
  --muted: rgba(0, 0, 0, 0.55);
  --sandbox-bg: #f0f0f0;
  --sandbox-border: #ccc;
  --table-stripe: rgba(0, 0, 0, 0.03);

  background: var(--bg);
  color: var(--fg);
  border-radius: 16px;
  max-width: 560px;
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
  --sandbox-bg: #2a2a2a;
  --sandbox-border: #555;
  --table-stripe: rgba(255, 255, 255, 0.04);
}

/* ============================================
   HEADER
   ============================================ */
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
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gft-onboarding__counter {
  font-size: 12px;
  color: var(--muted);
}

/* ============================================
   BODY
   ============================================ */
.gft-onboarding__body {
  padding: 20px 24px;
  flex: 1;
  overflow: hidden;
  position: relative;
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

/* ============================================
   HERO (Step 0)
   ============================================ */
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

.gft-onboarding__hero-logo--bounce {
  animation: gft-bounce 2s ease-in-out infinite;
}

@keyframes gft-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
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

/* ============================================
   STEP ICONS (animated emoji hero per step)
   ============================================ */
.gft-onboarding__step-icon {
  font-size: 42px;
  text-align: center;
  margin-bottom: 12px;
  line-height: 1;
}

.gft-onboarding__step-icon--float {
  animation: gft-float 3s ease-in-out infinite;
}

.gft-onboarding__step-icon--pulse {
  animation: gft-pulse 2s ease-in-out infinite;
}

@keyframes gft-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(-2deg); }
  75% { transform: translateY(3px) rotate(1deg); }
}

@keyframes gft-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* ============================================
   LANGUAGE GRID
   ============================================ */
.gft-onboarding__lang-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* ============================================
   KBD styling in content
   ============================================ */
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

/* ============================================
   MODE CARDS
   ============================================ */
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
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  position: relative;
  text-align: left;
}

.gft-onboarding__card:hover {
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
  transform: translateY(-1px);
}

.gft-onboarding__card--active {
  border-color: var(--accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 25%, transparent);
}

.gft-onboarding__card-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 6px;
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

/* ============================================
   THEME BUTTONS
   ============================================ */
.gft-onboarding__theme-buttons,
.gft-onboarding__lang-buttons {
  display: flex;
  gap: 8px;
}

.gft-onboarding__theme-btn {
  flex: 1;
}

.gft-onboarding__theme-btn,
.gft-onboarding__lang-btn {
  background: var(--card);
  border: 2px solid transparent;
  color: inherit;
  padding: 16px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.gft-onboarding__theme-icon {
  font-size: 28px;
}

.gft-onboarding__theme-btn:hover,
.gft-onboarding__lang-btn:hover {
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
  transform: translateY(-1px);
}

.gft-onboarding__theme-btn--active,
.gft-onboarding__lang-btn--active {
  border-color: var(--accent-text);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 20%, transparent);
}

.gft-onboarding__theme-btn--light-preview {
  background: linear-gradient(135deg, #ffffff, #f0f0f0);
  color: #222;
}

.gft-onboarding__theme-btn--dark-preview {
  background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
  color: #f2f2f2;
}

/* ============================================
   SANDBOX (interactive try-it)
   ============================================ */
.gft-onboarding__sandbox {
  margin-top: 16px;
  border: 1px solid var(--sandbox-border);
  border-radius: 10px;
  padding: 12px;
  background: var(--sandbox-bg);
}

.gft-onboarding__sandbox-hint {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: var(--accent-text);
  font-weight: 600;
}

.gft-onboarding__sandbox-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gft-onboarding__sandbox-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--fg);
  font-family: monospace;
  font-size: 13px;
  resize: none;
  box-sizing: border-box;
}

.gft-onboarding__sandbox-btn {
  align-self: flex-start;
  background: var(--accent-btn);
  color: #000;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}

.gft-onboarding__sandbox-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.gft-onboarding__sandbox-btn:active {
  transform: scale(0.97);
}

/* ============================================
   SHORTCUT CHEAT-SHEET TABLE
   ============================================ */
.gft-onboarding__shortcut-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 8px;
}

.gft-onboarding__shortcut-table th {
  text-align: left;
  padding: 6px 8px;
  border-bottom: 2px solid var(--accent);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-text);
}

.gft-onboarding__shortcut-table td {
  padding: 5px 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--fg) 10%, transparent);
}

.gft-onboarding__shortcut-table tr:nth-child(even) td {
  background: var(--table-stripe);
}

.gft-onboarding__shortcut-table kbd {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  border: 1px solid rgba(0, 0, 0, 0.15);
  margin-right: 2px;
  display: inline-block;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
}

.gft-onboarding.gft-onboarding--dark .gft-onboarding__shortcut-table kbd {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.gft-onboarding__shortcut-note {
  margin: 12px 0 0;
  font-size: 13px;
  text-align: center;
  color: var(--muted);
}

/* ============================================
   DEMO GIF (Lyric Card step)
   ============================================ */
.gft-onboarding__demo-gif {
  margin-top: 14px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  background: var(--sandbox-bg);
}

.gft-onboarding__demo-gif-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10px;
}

/* ============================================
   SEGMENTED PROGRESS BAR
   ============================================ */
.gft-onboarding__progress-bar {
  padding: 0 24px 12px;
}

.gft-onboarding__progress-segments {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.gft-onboarding__progress-segment {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  opacity: 0.5;
  transition: opacity 0.3s, color 0.3s;
}

.gft-onboarding__progress-segment--active {
  opacity: 1;
  color: var(--accent-text);
}

.gft-onboarding__progress-segment--done {
  opacity: 0.8;
  color: var(--accent-text);
}

.gft-onboarding__progress-track {
  height: 4px;
  background: color-mix(in srgb, var(--fg) 12%, transparent);
  border-radius: 2px;
  overflow: hidden;
}

.gft-onboarding__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-btn), var(--accent));
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================
   FOOTER BUTTONS
   ============================================ */
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
  transition: opacity 0.15s, transform 0.1s;
}

.gft-onboarding__btn:hover {
  opacity: 0.85;
}

.gft-onboarding__btn:active {
  transform: scale(0.97);
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

/* ============================================
   SLIDE TRANSITIONS
   ============================================ */
.gft-slide-left-enter-active,
.gft-slide-left-leave-active,
.gft-slide-right-enter-active,
.gft-slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.gft-slide-left-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.gft-slide-left-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}

.gft-slide-right-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
.gft-slide-right-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
</style>
