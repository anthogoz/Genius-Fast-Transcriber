<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    message: string;
    duration?: number;
  }>(),
  { duration: 3000 },
);

const emit = defineEmits<{
  close: [];
}>();

let timer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => emit('close'), props.duration);
  }
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <Transition name="gft-toast">
    <div class="gft-toast" v-if="message">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.gft-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10002;
  background: #333;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  font-size: 14px;
  pointer-events: none;
}

.gft-toast-enter-active,
.gft-toast-leave-active {
  transition: opacity 0.3s ease;
}

.gft-toast-enter-from,
.gft-toast-leave-to {
  opacity: 0;
}
</style>
