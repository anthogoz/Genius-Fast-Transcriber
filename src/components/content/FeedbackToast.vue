<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    duration?: number;
  }>(),
  { duration: 3500 },
);

const message = ref('');
const feedbackKey = ref(0);
let timer: ReturnType<typeof setTimeout> | null = null;

function show(msg: string) {
  if (timer) clearTimeout(timer);
  message.value = msg;
  feedbackKey.value++;
  
  if (props.duration > 0) {
    timer = setTimeout(() => {
      message.value = '';
    }, props.duration);
  }
}

const handleEvent = (e: any) => {
  if (e.detail?.message) {
    show(e.detail.message);
  }
};

onMounted(() => {
  window.addEventListener('gft-show-feedback', handleEvent);
});

onUnmounted(() => {
  window.removeEventListener('gft-show-feedback', handleEvent);
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <Transition name="gft-toast">
    <div 
      v-if="message" 
      :key="feedbackKey"
      class="gft-toast gft-u-toast"
    >
      <span class="gft-toast__icon">✨</span>
      <span class="gft-toast__text">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.gft-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 2147483647;
  padding: 14px 24px;
  font-size: 15px;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.gft-toast__icon {
  font-size: 18px;
}

.gft-toast__text {
  font-weight: 500;
  letter-spacing: -0.01em;
}

.gft-toast-enter-active,
.gft-toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.gft-toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.gft-toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
