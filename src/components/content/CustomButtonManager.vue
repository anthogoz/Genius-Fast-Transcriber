<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/composables/useSettings';
import type { CustomButton } from '@/types';

const STORAGE_KEY = 'gftCustomButtons';
const PRESET_PREFIX = 'GFT-PRESET-';

const { t } = useI18n();
const { isDarkMode } = useSettings();

const props = withDefaults(
  defineProps<{
    visible: boolean;
    defaultType?: 'structure' | 'cleanup';
  }>(),
  {
    defaultType: 'structure',
  },
);

const emit = defineEmits<{
  close: [];
  saved: [];
  feedback: [message: string];
}>();

const currentTab = ref<'create' | 'library'>('create');
const type = ref<'structure' | 'cleanup'>(props.defaultType);
const label = ref('');
const content = ref('');
const findPattern = ref('');
const replaceWith = ref('');
const isRegex = ref(false);
const caseSensitive = ref(false);
const importCode = ref('');

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    type.value = props.defaultType;
    currentTab.value = 'create';
  },
);

function readButtons(): CustomButton[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomButton[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeButtons(buttons: CustomButton[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buttons));
  window.dispatchEvent(new Event('gft-custom-buttons-updated'));
}

const buttons = ref<CustomButton[]>(readButtons());

const customButtons = computed(() => {
  const sorted = [...buttons.value];
  sorted.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
  return sorted;
});

function reloadButtons() {
  buttons.value = readButtons();
}

function resetForm() {
  label.value = '';
  content.value = '';
  findPattern.value = '';
  replaceWith.value = '';
  isRegex.value = false;
  caseSensitive.value = false;
}

function closeManager() {
  emit('close');
}

function createButton() {
  const nextLabel = label.value.trim();
  if (!nextLabel) {
    emit('feedback', t('custom_mgr_error_no_label'));
    return;
  }

  const nextButton: CustomButton = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: nextLabel,
    type: type.value,
  };

  if (type.value === 'structure') {
    const text = content.value.trim();
    if (!text) {
      emit('feedback', t('custom_mgr_error_no_content'));
      return;
    }
    nextButton.content = text;
  } else {
    const find = findPattern.value;
    if (!find) {
      emit('feedback', t('custom_mgr_error_no_content'));
      return;
    }
    nextButton.findPattern = find;
    nextButton.replaceWith = replaceWith.value;
    nextButton.isRegex = isRegex.value;
    nextButton.caseSensitive = caseSensitive.value;
  }

  const updated = [...buttons.value, nextButton];
  writeButtons(updated);
  reloadButtons();
  resetForm();
  emit('saved');
  emit('feedback', t('custom_mgr_success_created'));
}

function removeButton(id: string) {
  const updated = buttons.value.filter((button) => button.id !== id);
  writeButtons(updated);
  reloadButtons();
  emit('saved');
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function exportButtons() {
  try {
    const json = JSON.stringify(buttons.value);
    const payload = btoa(unescape(encodeURIComponent(json)));
    importCode.value = `${PRESET_PREFIX}${payload}`;
    void navigator.clipboard?.writeText(importCode.value);
    emit('feedback', t('custom_mgr_export_code'));
  } catch {
    emit('feedback', t('import_failed_invalid'));
  }
}

function importButtons() {
  const code = importCode.value.trim();
  if (!code.startsWith(PRESET_PREFIX)) {
    emit('feedback', t('import_failed_invalid'));
    return;
  }

  try {
    const encoded = code.slice(PRESET_PREFIX.length);
    const json = decodeURIComponent(escape(atob(encoded)));
    const incoming = JSON.parse(json) as CustomButton[];
    if (!Array.isArray(incoming)) throw new Error('Invalid preset');

    const merged = [...buttons.value];
    for (const button of incoming) {
      if (!button?.label || !button?.type) continue;
      const stableId = button.id || `custom_import_${hashString(JSON.stringify(button))}`;
      const exists = merged.some((item) => item.id === stableId);
      if (exists) continue;
      merged.push({ ...button, id: stableId });
    }

    writeButtons(merged);
    reloadButtons();
    emit('saved');
    emit('feedback', t('custom_mgr_success_imported'));
  } catch {
    emit('feedback', t('import_failed_invalid'));
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="gft-u-overlay gft-u-overlay--center gft-u-overlay--blur"
      @click.self="closeManager"
    >
      <div
        class="gft-u-modal gft-custom-manager"
        :class="{ 'gft-u-modal--dark gft-dark-mode': isDarkMode }"
      >
        <div class="gft-custom-manager__header">
          <h3>{{ t('custom_manager_title') }}</h3>
          <button type="button" class="gft-custom-manager__close" @click="closeManager">×</button>
        </div>

        <div class="gft-custom-manager__tabs">
          <button
            type="button"
            class="gft-custom-manager__tab"
            :class="{ 'gft-custom-manager__tab--active': currentTab === 'create' }"
            @click="currentTab = 'create'"
          >
            {{ t('custom_manager_tab_create') }}
          </button>
          <button
            type="button"
            class="gft-custom-manager__tab"
            :class="{ 'gft-custom-manager__tab--active': currentTab === 'library' }"
            @click="currentTab = 'library'"
          >
            {{ t('custom_manager_tab_library') }}
          </button>
        </div>

        <div v-if="currentTab === 'create'" class="gft-custom-manager__content">
          <label class="gft-custom-manager__label">{{ t('custom_mgr_action_type') }}</label>
          <select v-model="type" class="gft-custom-manager__field">
            <option value="structure">{{ t('custom_mgr_type_structure') }}</option>
            <option value="cleanup">{{ t('custom_mgr_type_cleanup') }}</option>
          </select>

          <label class="gft-custom-manager__label">{{ t('custom_mgr_button_label') }}</label>
          <input
            v-model="label"
            class="gft-custom-manager__field"
            :placeholder="t('custom_mgr_btn_label_placeholder')"
          />

          <template v-if="type === 'structure'">
            <label class="gft-custom-manager__label">{{ t('custom_mgr_text_to_insert') }}</label>
            <input
              v-model="content"
              class="gft-custom-manager__field"
              :placeholder="t('custom_mgr_text_to_insert')"
            />
          </template>

          <template v-else>
            <label class="gft-custom-manager__label">{{ t('custom_mgr_find_pattern') }}</label>
            <input
              v-model="findPattern"
              class="gft-custom-manager__field"
              :placeholder="isRegex ? t('custom_mgr_find_placeholder_regex') : t('custom_mgr_find_placeholder_exact')"
            />
            <label class="gft-custom-manager__label">{{ t('custom_mgr_replace_with') }}</label>
            <input
              v-model="replaceWith"
              class="gft-custom-manager__field"
              :placeholder="t('custom_mgr_replace_placeholder')"
            />
            <label class="gft-custom-manager__checkbox">
              <input v-model="isRegex" type="checkbox" />
              {{ t('custom_mgr_advanced_regex') }}
            </label>
            <label class="gft-custom-manager__checkbox">
              <input v-model="caseSensitive" type="checkbox" />
              {{ t('custom_mgr_case_sensitive') }}
            </label>
          </template>

          <button type="button" class="gft-custom-manager__save" @click="createButton">
            {{ t('custom_mgr_save_button') }}
          </button>
        </div>

        <div v-else class="gft-custom-manager__content">
          <div v-if="customButtons.length === 0" class="gft-custom-manager__empty">
            {{ t('custom_mgr_empty_library') }}
          </div>

          <div v-else class="gft-custom-manager__list">
            <div v-for="button in customButtons" :key="button.id" class="gft-custom-manager__item">
              <div>
                <strong>{{ button.label }}</strong>
                <div class="gft-custom-manager__meta">{{ button.type }}</div>
              </div>
              <button type="button" class="gft-custom-manager__remove" @click="removeButton(button.id)">
                ×
              </button>
            </div>
          </div>

          <label class="gft-custom-manager__label">{{ t('custom_mgr_share_presets') }}</label>
          <textarea
            v-model="importCode"
            class="gft-custom-manager__field gft-custom-manager__textarea"
            :placeholder="t('custom_mgr_import_placeholder')"
          />
          <div class="gft-custom-manager__io-buttons">
            <button type="button" class="gft-custom-manager__action" @click="exportButtons">
              {{ t('custom_mgr_export_code') }}
            </button>
            <button type="button" class="gft-custom-manager__action" @click="importButtons">
              {{ t('custom_mgr_import_button') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.gft-custom-manager {
  --gft-cm-bg: #ffffff;
  --gft-cm-text: #1e1e1e;
  --gft-cm-muted: rgba(30, 30, 30, 0.65);
  --gft-cm-border: rgba(18, 18, 18, 0.14);
  --gft-cm-field-bg: rgba(255, 255, 255, 0.92);
  --gft-cm-field-border: rgba(18, 18, 18, 0.2);
  --gft-cm-tab-bg: rgba(18, 18, 18, 0.06);
  --gft-cm-tab-active-bg: #f9ff55;
  --gft-cm-tab-active-text: #161616;
  --gft-cm-action-bg: #f2f2f2;
  --gft-cm-action-text: #1f1f1f;
  --gft-cm-save-bg: #f9ff55;
  --gft-cm-save-text: #111;

  background: var(--gft-cm-bg);
  color: var(--gft-cm-text);
  width: min(560px, 92vw);
  max-height: 88vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--gft-cm-border);
  padding: 18px;
}

.gft-custom-manager.gft-u-modal--dark {
  --gft-cm-bg: #242424;
  --gft-cm-text: #f2f2f2;
  --gft-cm-muted: rgba(242, 242, 242, 0.65);
  --gft-cm-border: rgba(255, 255, 255, 0.12);
  --gft-cm-field-bg: #2f2f2f;
  --gft-cm-field-border: rgba(255, 255, 255, 0.14);
  --gft-cm-tab-bg: rgba(255, 255, 255, 0.08);
  --gft-cm-tab-active-bg: #f9ff55;
  --gft-cm-tab-active-text: #141414;
  --gft-cm-action-bg: #333333;
  --gft-cm-action-text: #f1f1f1;
  --gft-cm-save-bg: #f9ff55;
  --gft-cm-save-text: #151515;
}

.gft-custom-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gft-custom-manager__header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.gft-custom-manager__close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--gft-cm-field-border);
  background: var(--gft-cm-action-bg);
  color: var(--gft-cm-action-text);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.gft-custom-manager__close:hover {
  border-color: #f9ff55;
}

.gft-custom-manager__tabs {
  display: flex;
  gap: 8px;
  background: var(--gft-cm-tab-bg);
  padding: 4px;
  border-radius: 10px;
}

.gft-custom-manager__tab {
  flex: 1;
  border: 1px solid transparent;
  background: transparent;
  color: var(--gft-cm-text);
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  opacity: 0.78;
}

.gft-custom-manager__tab--active {
  background: var(--gft-cm-tab-active-bg);
  color: var(--gft-cm-tab-active-text);
  opacity: 1;
}

.gft-custom-manager__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gft-custom-manager__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gft-cm-muted);
}

.gft-custom-manager__field {
  width: 100%;
  border: 1px solid var(--gft-cm-field-border);
  background: var(--gft-cm-field-bg);
  color: var(--gft-cm-text);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  box-sizing: border-box;
}

.gft-custom-manager__field::placeholder {
  color: var(--gft-cm-muted);
}

.gft-custom-manager__field:focus {
  outline: none;
  border-color: #f9ff55;
  box-shadow: 0 0 0 2px rgba(249, 255, 85, 0.2);
}

.gft-custom-manager__checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gft-cm-text);
}

.gft-custom-manager__save {
  margin-top: 10px;
  width: 100%;
  border: none;
  background: var(--gft-cm-save-bg);
  color: var(--gft-cm-save-text);
  border-radius: 8px;
  height: 36px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.gft-custom-manager__save:hover {
  filter: brightness(0.96);
}

.gft-custom-manager__empty {
  font-size: 12px;
  color: var(--gft-cm-muted);
}

.gft-custom-manager__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow: auto;
  padding-right: 4px;
}

.gft-custom-manager__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--gft-cm-border);
  border-radius: 8px;
  padding: 10px;
  background: color-mix(in srgb, var(--gft-cm-bg) 88%, transparent);
}

.gft-custom-manager__item strong {
  color: var(--gft-cm-text);
}

.gft-custom-manager__remove {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--gft-cm-field-border);
  background: transparent;
  color: var(--gft-cm-text);
  cursor: pointer;
  font-size: 16px;
}

.gft-custom-manager__remove:hover {
  border-color: #f66;
  color: #f66;
}

.gft-custom-manager__meta {
  font-size: 11px;
  color: var(--gft-cm-muted);
  text-transform: uppercase;
}

.gft-custom-manager__textarea {
  min-height: 90px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.gft-custom-manager__io-buttons {
  display: flex;
  gap: 6px;
}

.gft-custom-manager__action {
  flex: 1;
  border: 1px solid var(--gft-cm-field-border);
  background: var(--gft-cm-action-bg);
  color: var(--gft-cm-action-text);
  border-radius: 8px;
  height: 34px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.gft-custom-manager__action:hover {
  border-color: #f9ff55;
}
</style>