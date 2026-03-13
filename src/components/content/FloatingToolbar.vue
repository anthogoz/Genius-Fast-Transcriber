<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  position: { x: number; y: number };
  lyricCardOnly?: boolean;
}>();

const emit = defineEmits(['bold', 'italic', 'numberToWords', 'lyricCard', 'adlib']);

const style = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
}));

type ToolbarAction = 'bold' | 'italic' | 'numberToWords' | 'lyricCard' | 'adlib';

const actions = computed<{ key: ToolbarAction; tooltipKey: string; icon: string }[]>(() => {
  if (props.lyricCardOnly) {
    return [{ key: 'lyricCard', tooltipKey: 'toolbar_lyric_card_tooltip', icon: '🎨' }];
  }

  return [
    { key: 'bold', tooltipKey: 'toolbar_bold_tooltip', icon: 'B' },
    { key: 'italic', tooltipKey: 'toolbar_italic_tooltip', icon: 'I' },
    { key: 'numberToWords', tooltipKey: 'toolbar_num_to_words_tooltip', icon: '#' },
    { key: 'adlib', tooltipKey: 'cleanup_adlib_tooltip', icon: '( )' },
    { key: 'lyricCard', tooltipKey: 'toolbar_lyric_card_tooltip', icon: '🎨' },
  ];
});

function handleAction(action: ToolbarAction) {
  emit(action);
}
</script>

<template>
  <Transition name="gft-toolbar">
    <div
      v-if="visible"
      class="gft-floating-toolbar"
      :style="style"
    >
      <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        :class="[
          'gft-floating-toolbar__btn',
          {
            'gft-floating-toolbar__btn--bold': action.key === 'bold',
            'gft-floating-toolbar__btn--italic': action.key === 'italic'
          }
        ]"
        :title="t(action.tooltipKey)"
        @mousedown.prevent="handleAction(action.key)"
      >
        <span v-if="action.key === 'bold'" style="font-weight: 800;">B</span>
        <span v-else-if="action.key === 'italic'" style="font-style: italic;">I</span>
        <span v-else-if="action.key === 'numberToWords'">#→</span>
        <span v-else-if="action.key === 'adlib'">( )</span>
        <span v-else>{{ action.icon }}</span>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.gft-floating-toolbar {
  position: fixed;
  z-index: 10000;
  display: flex;
  gap: 2px;
  background: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transform: translate(-50%, calc(-100% - 8px));
}

.gft-floating-toolbar__btn {
  background: none;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.15s;
}

.gft-floating-toolbar__btn:hover {
  background: rgba(255, 255, 100, 0.2);
}

.gft-toolbar-enter-active,
.gft-toolbar-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.gft-toolbar-enter-from,
.gft-toolbar-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% - 4px));
}
</style>
