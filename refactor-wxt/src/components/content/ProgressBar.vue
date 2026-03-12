<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  step: number;
  total: number;
  message: string;
}>();

const percentage = computed(() => Math.round((props.step / props.total) * 100));
</script>

<template>
  <div class="gft-progress">
    <div class="gft-progress__bar">
      <div class="gft-progress__fill" :style="{ width: `${percentage}%` }" />
    </div>
    <div class="gft-progress__text">
      {{ message }} ({{ step }}/{{ total }})
    </div>
  </div>
</template>

<style scoped>
.gft-progress {
  margin: 8px 0;
  padding: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.gft-progress__bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.gft-progress__fill {
  height: 100%;
  background: #ffff64;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.gft-progress__text {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
  text-align: center;
}
</style>
