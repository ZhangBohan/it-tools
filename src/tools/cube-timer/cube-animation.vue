<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { TwistyPlayer } from 'cubing/twisty';

const props = defineProps<{
  scramble: string;
}>();

const containerRef = ref<HTMLDivElement>();
let cube: any = null;

onMounted(() => {
  if (containerRef.value) {
    cube = new TwistyPlayer({
      puzzle: "3x3x3",
      alg: props.scramble,
      visualization: 'PG3D',
      background: 'none',
      tempoScale: 2,
      backView: "top-right"
    });
    containerRef.value.appendChild(cube);
  }
});

watch(() => props.scramble, (newScramble) => {
  if (cube) {
    cube.alg = newScramble;
  }
});
</script>

<template>
  <div class="animation-container">
    <div class="cube-wrapper">
      <div ref="containerRef" class="cube-container"></div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px;
}

.cube-wrapper {
  width: 300px;
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cube-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(twisty-player) {
  width: 100%;
  height: 100%;
}
</style> 