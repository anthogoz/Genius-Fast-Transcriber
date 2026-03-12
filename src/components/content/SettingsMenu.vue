<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/composables/useSettings';

const { t } = useI18n();
const {
  isDarkMode,
  areTooltipsEnabled,
  isHeaderFeatEnabled,
  isTagNewlinesDisabled,
} = useSettings();

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const darkModeLabel = computed(() =>
  isDarkMode.value ? t('dark_mode_toggle_dark') : t('dark_mode_toggle_light'),
);

const tooltipsLabel = computed(() =>
  areTooltipsEnabled.value ? t('tooltips_disable') : t('tooltips_enable'),
);

const headerFeatLabel = computed(() =>
  isHeaderFeatEnabled.value ? t('header_feat_hide') : t('header_feat_show'),
);

const newlineLabel = computed(() =>
  isTagNewlinesDisabled.value ? t('newline_enable') : t('newline_disable'),
);

const TUTORIAL_URL = 'https://github.com/anthogoz/Genius-Fast-Transcriber#readme';
const CUSTOM_LIBRARY_URL = '#';
</script>

<template>
  <Transition name="gft-menu">
    <div v-if="visible" class="gft-settings-menu" @click.stop>
      <button type="button" class="gft-settings-menu__item" @click="isDarkMode = !isDarkMode">
        {{ darkModeLabel }}
      </button>
      <button type="button" class="gft-settings-menu__item" @click="areTooltipsEnabled = !areTooltipsEnabled">
        {{ tooltipsLabel }}
      </button>
      <button type="button" class="gft-settings-menu__item" @click="isHeaderFeatEnabled = !isHeaderFeatEnabled">
        {{ headerFeatLabel }}
      </button>
      <button type="button" class="gft-settings-menu__item" @click="isTagNewlinesDisabled = !isTagNewlinesDisabled">
        {{ newlineLabel }}
      </button>

      <hr class="gft-settings-menu__divider" />

      <a
        class="gft-settings-menu__item gft-settings-menu__item--link"
        :href="TUTORIAL_URL"
        target="_blank"
        rel="noopener"
      >
        {{ t('tutorial_link') }}
      </a>
      <button type="button" class="gft-settings-menu__item" @click="emit('close')">
        {{ t('settings_custom_library') }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.gft-settings-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  background: #333;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 4px 0;
  min-width: 220px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.gft-settings-menu__item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: inherit;
  text-align: left;
  padding: 8px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;
}

.gft-settings-menu__item:hover {
  background: rgba(255, 255, 100, 0.1);
}

.gft-settings-menu__item--link {
  color: inherit;
}

.gft-settings-menu__divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 4px 0;
}

.gft-menu-enter-active,
.gft-menu-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.gft-menu-enter-from,
.gft-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
