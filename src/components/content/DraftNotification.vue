<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  timestamp: string;
}>();

const emit = defineEmits<{
  restore: [];
  discard: [];
}>();

let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  autoHideTimer = setTimeout(() => emit('discard'), 15000);
});

onUnmounted(() => {
  if (autoHideTimer) clearTimeout(autoHideTimer);
});
</script>

<template>
  <Transition name="gft-draft-slide">
    <div class="gft-draft-notification gft-u-toast">
      <div class="gft-draft-notification__text">
        <strong>{{ t('draft_found_title') }}</strong>
        <br />
        {{ t('draft_saved_at') }} {{ timestamp }}
      </div>
      <div class="gft-draft-notification__buttons">
        <button type="button" class="gft-u-btn gft-draft-btn gft-draft-btn--restore" @click="emit('restore')">
          {{ t('draft_btn_restore') }}
        </button>
        <button type="button" class="gft-u-btn gft-draft-btn gft-draft-btn--discard" @click="emit('discard')">
          {{ t('draft_btn_discard') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.gft-draft-notification {
  bottom: 20px;
  padding: 15px;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-left: 4px solid #ffff64;
  animation: gft-slide-in 0.3s ease-out;
  pointer-events: auto;
  cursor: default;
  max-width: 320px;
}

@keyframes gft-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.gft-draft-notification__text {
  font-size: 13px;
  line-height: 1.5;
}

.gft-draft-notification__buttons {
  display: flex;
  gap: 10px;
}

.gft-draft-btn {
  height: auto;
  padding: 5px 10px;
  font-size: 13px;
  pointer-events: auto;
}

.gft-draft-btn:hover {
  opacity: 0.85;
}

.gft-draft-btn--restore {
  background-color: #ffff64;
  color: black;
  border: none;
  font-weight: bold;
}

.gft-draft-btn--restore:hover {
  background-color: #ffff64;
  color: black;
  border: none;
}

.gft-draft-btn--discard {
  background-color: transparent;
  color: #aaa;
  border: 1px solid #555;
}

.gft-draft-btn--discard:hover {
  background-color: transparent;
  color: #aaa;
  border: 1px solid #555;
}

.gft-draft-slide-enter-active {
  animation: gft-slide-in 0.3s ease-out;
}

.gft-draft-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.gft-draft-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
