<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatTime, generateScramble, type TimerRecord } from './cube-timer.service';
import { messages } from './cube-timer.i18n';
import CubeAnimation from './cube-animation.vue';

const { t } = useI18n({
  messages,
  useScope: 'local'
});

const isReady = ref(false);
const isRunning = ref(false);
const startTime = ref(0);
const currentTime = ref(0);
const STORAGE_KEY = 'cube-timer-records';

const records = ref<TimerRecord[]>(
  JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
);

watch(records, (newRecords) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
}, { deep: true });

const currentScramble = ref(generateScramble());
let timerInterval: number | null = null;
let readyTimeout: number | null = null;

const formattedTime = computed(() => formatTime(currentTime.value));

const averageOf5 = computed(() => {
  if (records.value.length < 5) return null;
  const last5 = records.value.slice(-5);
  const sum = last5.reduce((acc, curr) => acc + curr.time, 0);
  return formatTime(sum / 5);
});

function startTimer() {
  if (!isRunning.value && isReady.value) {
    isRunning.value = true;
    isReady.value = false;
    startTime.value = Date.now();
    timerInterval = window.setInterval(() => {
      currentTime.value = (Date.now() - startTime.value) / 1000;
    }, 10);
  }
}

function stopTimer() {
  if (isRunning.value) {
    isRunning.value = false;
    if (timerInterval) clearInterval(timerInterval);
    
    records.value.push({
      id: Date.now(),
      time: currentTime.value,
      date: new Date(),
      scramble: currentScramble.value
    });
    
    currentScramble.value = generateScramble();
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!isRunning.value && !isReady.value) {
      readyTimeout = window.setTimeout(() => {
        isReady.value = true;
        currentTime.value = 0;
      }, 500);
    }
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (readyTimeout) {
      clearTimeout(readyTimeout);
      readyTimeout = null;
    }
    
    if (isReady.value) {
      startTimer();
    } else if (isRunning.value) {
      stopTimer();
    }
  }
}

function deleteRecord(id: number) {
  records.value = records.value.filter(record => record.id !== id);
}

function clearAllRecords() {
  records.value = [];
}

const showAnimation = ref(false);

function toggleAnimation() {
  showAnimation.value = !showAnimation.value;
}

const touchStartTime = ref(0);
const TOUCH_THRESHOLD = 500; // 长按阈值（毫秒）

function handleTouchStart(e: TouchEvent) {
  e.preventDefault(); // 防止双击缩放等默认行为
  touchStartTime.value = Date.now();
  if (!isRunning.value && !isReady.value) {
    readyTimeout = window.setTimeout(() => {
      isReady.value = true;
      currentTime.value = 0;
    }, TOUCH_THRESHOLD);
  }
}

function handleTouchEnd(e: TouchEvent) {
  e.preventDefault();
  const touchDuration = Date.now() - touchStartTime.value;
  
  if (readyTimeout) {
    clearTimeout(readyTimeout);
    readyTimeout = null;
  }
  
  if (isRunning.value) {
    // 如果正在计时，直接停止
    stopTimer();
  } else if (touchDuration >= TOUCH_THRESHOLD && isReady.value) {
    // 如果准备好了且长按足够时间，开始计时
    startTimer();
  }
}
</script>

<template>
  <c-card>
    <div class="timer-container">
      <div class="scramble-section">
        <div class="scramble">{{ currentScramble }}</div>
        <button @click="toggleAnimation" class="animation-btn">
          {{ showAnimation ? t('hideAnimation') : t('showAnimation') }}
        </button>
      </div>
      
      <transition name="fade">
        <CubeAnimation 
          v-if="showAnimation" 
          :scramble="currentScramble"
          class="animation"
        />
      </transition>
      
      <div 
        class="time" 
        :class="{ 'ready': isReady }"
        @keydown="handleKeyDown" 
        @keyup="handleKeyUp"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        tabindex="0"
      >
        {{ formattedTime }}
      </div>
      
      <div class="instructions">
        {{ t('pressSpaceToStart') }}
        <span class="mobile-hint">{{ t('orLongPress') }}</span>
      </div>

      <div v-if="averageOf5" class="stats">
        {{ t('lastFiveAvg') }}: {{ averageOf5 }}
      </div>

      <div class="records">
        <div class="records-header">
          <h3>{{ t('records') }}</h3>
          <button v-if="records.length > 0" @click="clearAllRecords" class="delete-btn" size="small">
            {{ t('clearRecords') }}
          </button>
        </div>
        <div v-for="record in records" :key="record.id" class="record-item">
          <span>{{ formatTime(record.time) }}</span>
          <span class="scramble-text">{{ record.scramble }}</span>
          <button @click="deleteRecord(record.id)" class="delete-btn">
            {{ t('delete') }}
          </button>
        </div>
      </div>
    </div>
  </c-card>
</template>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.scramble {
  font-size: 1.2em;
  margin-bottom: 20px;
  font-family: monospace;
}

.time {
  font-size: 4em;
  font-family: monospace;
  margin: 20px 0;
  cursor: pointer;
  outline: none;
}

.instructions {
  color: #666;
  margin-bottom: 20px;
}

.records {
  width: 100%;
  max-width: 600px;
  margin-top: 20px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.scramble-text {
  font-size: 0.8em;
  color: #666;
  margin: 0 10px;
}

.delete-btn {
  padding: 2px 8px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #cc0000;
}

.stats {
  margin: 10px 0;
  font-size: 1.2em;
  color: #666;
}

.time.ready {
  color: #4CAF50;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.scramble-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.animation-btn {
  padding: 4px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.animation-btn:hover {
  background-color: #45a049;
}

.animation {
  margin: 20px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mobile-hint {
  display: none;
}

@media (hover: none) and (pointer: coarse) {
  .mobile-hint {
    display: inline;
    color: #666;
  }
}
</style> 