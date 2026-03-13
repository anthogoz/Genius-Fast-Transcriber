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
    <div class="gft-toast gft-u-toast" v-if="message">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.gft-toast {
  top: 20px;
  z-index: 10002;
  padding: 12px 20px;
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
