<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import { useSettings } from '@/composables/useSettings';

const { t } = useI18n();
const {
  isDarkMode,
  areTooltipsEnabled,
  isHeaderFeatEnabled,
  isTagNewlinesDisabled,
  resetTutorial,
} = useSettings();

defineProps<{
  visible: boolean;
  showStats?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  toggleStats: [];
  openCustomLibrary: [];
}>();

function relaunchTutorial() {
  resetTutorial();
  emit('close');
  // Petit délai pour laisser le menu se fermer visuellement si besoin
  setTimeout(() => {
    window.location.reload();
  }, 150);
}
</script>

<template>
  <Transition name="gft-menu">
    <div v-if="visible" class="gft-settings-menu" :class="{ 'gft-settings-menu--dark': isDarkMode }" @click.stop>
      
      <label class="gft-settings-menu__item gft-settings-menu__item--toggle">
        <span class="gft-settings-menu__label">{{ isDarkMode ? t('popup_dark') : t('popup_light') }}</span>
        <div class="gft-toggle" :class="{ 'gft-toggle--active': isDarkMode }">
          <input type="checkbox" v-model="isDarkMode" class="gft-toggle__input" />
          <div class="gft-toggle__track">
            <div class="gft-toggle__thumb"></div>
          </div>
        </div>
      </label>

      <label class="gft-settings-menu__item gft-settings-menu__item--toggle">
        <span class="gft-settings-menu__label">{{ areTooltipsEnabled ? t('tooltips_disable') : t('tooltips_enable') }}</span>
        <div class="gft-toggle" :class="{ 'gft-toggle--active': areTooltipsEnabled }">
          <input type="checkbox" v-model="areTooltipsEnabled" class="gft-toggle__input" />
          <div class="gft-toggle__track">
            <div class="gft-toggle__thumb"></div>
          </div>
        </div>
      </label>

      <label class="gft-settings-menu__item gft-settings-menu__item--toggle">
        <span class="gft-settings-menu__label">{{ isHeaderFeatEnabled ? t('header_feat_hide') : t('header_feat_show') }}</span>
        <div class="gft-toggle" :class="{ 'gft-toggle--active': isHeaderFeatEnabled }">
          <input type="checkbox" v-model="isHeaderFeatEnabled" class="gft-toggle__input" />
          <div class="gft-toggle__track">
            <div class="gft-toggle__thumb"></div>
          </div>
        </div>
      </label>

      <label class="gft-settings-menu__item gft-settings-menu__item--toggle">
        <span class="gft-settings-menu__label">{{ isTagNewlinesDisabled ? t('newline_enable') : t('newline_disable') }}</span>
        <div class="gft-toggle" :class="{ 'gft-toggle--active': !isTagNewlinesDisabled }">
          <input type="checkbox" :checked="!isTagNewlinesDisabled" @change="isTagNewlinesDisabled = !isTagNewlinesDisabled" class="gft-toggle__input" />
          <div class="gft-toggle__track">
            <div class="gft-toggle__thumb"></div>
          </div>
        </div>
      </label>

      <label class="gft-settings-menu__item gft-settings-menu__item--toggle">
        <span class="gft-settings-menu__label">{{ showStats ? t('stats_hide') : t('stats_show') }}</span>
        <div class="gft-toggle" :class="{ 'gft-toggle--active': showStats }">
          <input type="checkbox" :checked="showStats" @change="emit('toggleStats')" class="gft-toggle__input" />
          <div class="gft-toggle__track">
            <div class="gft-toggle__thumb"></div>
          </div>
        </div>
      </label>

      <hr class="gft-settings-menu__divider" />

      <button type="button" class="gft-settings-menu__item gft-settings-menu__item--btn" @click="relaunchTutorial">
        {{ t('tutorial_link') }}
      </button>
      <button type="button" class="gft-settings-menu__item gft-settings-menu__item--btn" @click="emit('openCustomLibrary')">
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
  background: #ffffff;
  border: 1px solid rgba(14, 14, 14, 0.16);
  color: #1d1d1d;
  border-radius: 8px;
  padding: 6px 0;
  min-width: 240px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  font-family: inherit;
}

.gft-settings-menu--dark {
  background: #2b2b2b;
  border-color: rgba(255, 255, 255, 0.12);
  color: #efefef;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.gft-settings-menu__item {
  display: flex;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  color: inherit;
  text-align: left;
  padding: 8px 14px;
  font-size: 13px;
  font-family: inherit;
  text-decoration: none;
}

.gft-settings-menu__item--btn {
  cursor: pointer;
  transition: background 0.15s;
}

.gft-settings-menu__item--btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.gft-settings-menu--dark .gft-settings-menu__item--btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.gft-settings-menu__item--toggle {
  justify-content: space-between;
  cursor: pointer;
}

.gft-settings-menu__item--toggle:hover {
  background: rgba(0, 0, 0, 0.03);
}

.gft-settings-menu--dark .gft-settings-menu__item--toggle:hover {
  background: rgba(255, 255, 255, 0.05);
}

.gft-settings-menu__label {
  flex: 1;
}

/* Toggle Switch Styles */
.gft-toggle {
  position: relative;
  width: 34px;
  height: 20px;
  margin-left: 10px;
  flex-shrink: 0;
}

.gft-toggle__input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.gft-toggle__track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d1d1;
  border-radius: 20px;
  transition: 0.3s;
}

.gft-settings-menu--dark .gft-toggle__track {
  background-color: #4a4a4a;
}

.gft-toggle__thumb {
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.gft-toggle--active .gft-toggle__track {
  background-color: #f9ff55;
}

.gft-settings-menu--dark .gft-toggle--active .gft-toggle__track {
  background-color: #f9ff55;
}

.gft-toggle--active .gft-toggle__thumb {
  transform: translateX(14px);
  background-color: #0e0e0e;
}

.gft-settings-menu__divider {
  border: none;
  border-top: 1px solid rgba(14, 14, 14, 0.12);
  margin: 6px 0;
}

.gft-settings-menu--dark .gft-settings-menu__divider {
  border-top-color: rgba(255, 255, 255, 0.1);
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
