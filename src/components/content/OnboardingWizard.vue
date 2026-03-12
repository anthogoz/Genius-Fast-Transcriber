<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/composables/useSettings';
import type { Locale, ExtensionMode, Theme } from '@/types';

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

const totalSteps = computed(() => tutorialSteps.length + 3);

const isConfigStep = computed(() => currentStep.value < 3);
const isTutorialStep = computed(() => currentStep.value >= 3 && currentStep.value < 3 + tutorialSteps.length);
const isFinishStep = computed(() => currentStep.value >= 3 + tutorialSteps.length);

const currentTutorialStep = computed(() => {
  if (!isTutorialStep.value) return null;
  return tutorialSteps[currentStep.value - 3];
});

function next() {
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
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
];
</script>

<template>
  <div class="gft-onboarding-overlay">
    <div class="gft-onboarding">
      <div class="gft-onboarding__header">
        <h2 class="gft-onboarding__title">
          {{ isFinishStep ? t('tuto_finish_title') : t('onboarding_title') }}
        </h2>
        <span class="gft-onboarding__counter">
          {{ t('tuto_step_counter') }} {{ currentStep + 1 }} {{ t('tuto_of') }} {{ totalSteps }}
        </span>
      </div>

      <div class="gft-onboarding__body">
        <!-- Step 0: Mode selection -->
        <div v-if="currentStep === 0" class="gft-onboarding__step">
          <h3>{{ t('mode_select_title') }}</h3>
          <div class="gft-onboarding__cards">
            <div
              class="gft-onboarding__card"
              :class="{ 'gft-onboarding__card--active': selectedMode === 'full' }"
              @click="selectedMode = 'full'"
            >
              <strong>{{ t('mode_full_title') }}</strong>
              <p>{{ t('mode_full_desc') }}</p>
              <span class="gft-onboarding__badge">{{ t('recommended_label') }}</span>
            </div>
            <div
              class="gft-onboarding__card"
              :class="{ 'gft-onboarding__card--active': selectedMode === 'lyric-card-only' }"
              @click="selectedMode = 'lyric-card-only'"
            >
              <strong>{{ t('mode_lyric_title') }}</strong>
              <p>{{ t('mode_lyric_desc') }}</p>
            </div>
          </div>
        </div>

        <!-- Step 1: Theme selection -->
        <div v-else-if="currentStep === 1" class="gft-onboarding__step">
          <h3>{{ t('theme_select_title') }}</h3>
          <div class="gft-onboarding__theme-buttons">
            <button
              class="gft-onboarding__theme-btn"
              :class="{ 'gft-onboarding__theme-btn--active': selectedTheme === 'light' }"
              @click="selectedTheme = 'light'"
            >
              {{ t('theme_light_btn') }}
            </button>
            <button
              class="gft-onboarding__theme-btn"
              :class="{ 'gft-onboarding__theme-btn--active': selectedTheme === 'dark' }"
              @click="selectedTheme = 'dark'"
            >
              {{ t('theme_dark_btn') }}
            </button>
          </div>
        </div>

        <!-- Step 2: Language selection -->
        <div v-else-if="currentStep === 2" class="gft-onboarding__step">
          <h3>{{ t('lang_select_title') }}</h3>
          <div class="gft-onboarding__lang-buttons">
            <button
              v-for="loc in locales"
              :key="loc.value"
              class="gft-onboarding__lang-btn"
              :class="{ 'gft-onboarding__lang-btn--active': selectedLocale === loc.value }"
              @click="selectedLocale = loc.value"
            >
              {{ loc.label }}
            </button>
          </div>
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

      <div class="gft-onboarding__footer">
        <button
          v-if="currentStep > 0"
          class="gft-onboarding__btn gft-onboarding__btn--secondary"
          @click="prev"
        >
          {{ t('tuto_prev') }}
        </button>
        <button
          class="gft-onboarding__btn gft-onboarding__btn--secondary"
          @click="skip"
        >
          {{ t('tuto_skip') }}
        </button>
        <div style="flex: 1" />
        <button class="gft-onboarding__btn gft-onboarding__btn--primary" @click="next">
          {{ isFinishStep ? t('tuto_finish') : t('tuto_next') }}
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
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gft-onboarding {
  background: #222;
  color: #e0e0e0;
  border-radius: 16px;
  max-width: 520px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 100, 0.15);
  display: flex;
  flex-direction: column;
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
}

.gft-onboarding__counter {
  font-size: 12px;
  opacity: 0.5;
}

.gft-onboarding__body {
  padding: 20px 24px;
  flex: 1;
}

.gft-onboarding__step h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #ffff64;
}

.gft-onboarding__content {
  font-size: 14px;
  line-height: 1.7;
}

.gft-onboarding__content :deep(kbd) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gft-onboarding__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gft-onboarding__card {
  background: #333;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.gft-onboarding__card:hover {
  border-color: rgba(255, 255, 100, 0.3);
}

.gft-onboarding__card--active {
  border-color: #ffff64;
  box-shadow: 0 0 12px rgba(255, 255, 100, 0.15);
}

.gft-onboarding__card strong {
  font-size: 14px;
}

.gft-onboarding__card p {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

.gft-onboarding__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ffff64;
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
  background: #333;
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
  border-color: rgba(255, 255, 100, 0.3);
}

.gft-onboarding__theme-btn--active,
.gft-onboarding__lang-btn--active {
  border-color: #ffff64;
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
  background: #ffff64;
  color: #000;
}

.gft-onboarding__btn--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
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
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s, transform 0.2s;
}

.gft-onboarding__dot--active {
  background: #ffff64;
  transform: scale(1.3);
}

.gft-onboarding__dot--done {
  background: rgba(255, 255, 100, 0.5);
}
</style>
