<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useExport } from '@/composables/useExport';

defineProps<{
  buttonClass: string;
  iconClass: string;
  labelClass: string;
}>();

const { t } = useI18n();
const { getPreviewText, exportLyrics } = useExport();

const isOpen = ref(false);
const optNoTags = ref(false);
const optNoSpacing = ref(false);

const previewText = ref('');

function updatePreview() {
  previewText.value = getPreviewText({
    removeTags: optNoTags.value,
    removeSpacing: optNoSpacing.value
  });
}

function openModal() {
  isOpen.value = true;
  updatePreview();
}

function closeModal() {
  isOpen.value = false;
}

function handleDownload() {
  exportLyrics({
    removeTags: optNoTags.value,
    removeSpacing: optNoSpacing.value
  });
  closeModal();
}

watch([optNoTags, optNoSpacing], () => {
  updatePreview();
});

</script>

<template>
  <div style="display: contents;">
    <button type="button" :class="buttonClass" @click.stop="openModal" :title="t('section_export')">
      <span :class="labelClass">Export TXT</span>
    </button>
    <Teleport to="body">
      <div v-if="isOpen" class="gft-export-overlay" @click.stop="closeModal">
        <div class="gft-export-modal" @click.stop>
          <div class="gft-export-header">
            <h3>{{ t('section_export') }}</h3>
            <button class="gft-export-close" @click="closeModal" type="button">×</button>
          </div>
          
          <div class="gft-export-body">
            <div class="gft-export-options">
              <label class="gft-export-toggle">
                <span>{{ t('export_opt_no_tags') }}</span>
                <div class="gft-toggle" :class="{ 'gft-toggle--active': optNoTags }">
                  <input type="checkbox" v-model="optNoTags" class="gft-toggle__input" />
                  <div class="gft-toggle__track">
                    <div class="gft-toggle__thumb"></div>
                  </div>
                </div>
              </label>
              
              <label class="gft-export-toggle">
                <span>{{ t('export_opt_no_spacing') }}</span>
                <div class="gft-toggle" :class="{ 'gft-toggle--active': optNoSpacing }">
                  <input type="checkbox" v-model="optNoSpacing" class="gft-toggle__input" />
                  <div class="gft-toggle__track">
                    <div class="gft-toggle__thumb"></div>
                  </div>
                </div>
              </label>
            </div>
            
            <div class="gft-export-preview">
              <div class="gft-export-preview-header">Aperçu</div>
              <textarea class="gft-export-preview-content" readonly v-model="previewText"></textarea>
            </div>
          </div>
          
          <div class="gft-export-footer">
            <button class="gft-btn-download" @click="handleDownload" type="button">
              Télécharger (.txt)
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.gft-export-overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.6);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  color: #fff;
}

.gft-export-modal {
  background: #1e1e1e;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}

.gft-export-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gft-export-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: inherit;
}

.gft-export-close {
  background: transparent;
  border: none;
  color: #a0a0a0;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.gft-export-close:hover {
  color: #fff;
}

.gft-export-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.gft-export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.gft-export-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.gft-export-preview {
  display: flex;
  flex-direction: column;
}

.gft-export-preview-header {
  font-size: 12px;
  text-transform: uppercase;
  color: #a0a0a0;
  margin-bottom: 8px;
  font-weight: 500;
}

.gft-export-preview-content {
  width: 100%;
  height: 200px;
  background: rgba(0,0,0,0.4);
  color: #d0d0d0;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 12px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  white-space: pre-wrap;
  outline: none;
}

.gft-export-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: flex-end;
}

.gft-btn-download {
  background: #f9ff55;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.gft-btn-download:hover {
  opacity: 0.9;
}

.gft-btn-download:active {
  transform: scale(0.97);
}

.gft-toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}

.gft-toggle__input {
  opacity: 0;
  width: 0;
  height: 0;
}

.gft-toggle__track {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.4s;
  border-radius: 20px;
}

.gft-toggle__thumb {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.gft-toggle--active .gft-toggle__track {
  background-color: #f9ff55;
}

.gft-toggle--active .gft-toggle__thumb {
  transform: translateX(16px);
  background-color: #000;
}
</style>
