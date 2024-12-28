<script setup lang="ts">
import { ref, computed, onUnmounted, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { messages } from './pomodoro-timer.i18n';
import { formatTime, type PomodoroSettings, type TimerMode, DEFAULT_SETTINGS, formatDate, getEmojis, type PomodoroRecord } from './pomodoro-timer.service';

const { t } = useI18n({
  messages,
  useScope: 'local'
});

const settings = ref<PomodoroSettings>({...DEFAULT_SETTINGS});
const currentMode = ref<TimerMode>('work');
const isRunning = ref(false);
const timeLeft = ref(settings.value.workDuration * 60);
let timerInterval: number | null = null;

const formattedTime = computed(() => formatTime(timeLeft.value));

const RECORDS_KEY = 'pomodoro-records';
const records = ref<PomodoroRecord[]>(
  JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]')
);

// 监听记录变化并保存
watch(records, (newRecords) => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(newRecords));
}, { deep: true });

// 添加新的状态
const worker = ref<Worker | null>(null);
const endTime = ref<number>(0);

// 添加新的状态来跟踪完成的番茄钟数量
const completedPomodoros = ref(0);

// 修改计时器相关函数
function startTimer() {
  if (!isRunning.value) {
    isRunning.value = true;
    endTime.value = Date.now() + timeLeft.value * 1000;
    
    // 保存状态到 localStorage
    saveTimerState();
    
    // 启动 Web Worker
    if (!worker.value) {
      worker.value = new Worker(new URL('./pomodoro-timer.worker.ts', import.meta.url));
      worker.value.onmessage = handleWorkerMessage;
    }
    
    worker.value.postMessage({ 
      type: 'start', 
      endTime: endTime.value 
    });
  }
}

function handleWorkerMessage(e: MessageEvent) {
  const { type, timeLeft: newTimeLeft } = e.data;
  
  if (type === 'tick') {
    timeLeft.value = newTimeLeft;
  } else if (type === 'complete') {
    notifyTimeUp();
    resetTimer();
  }
}

function pauseTimer() {
  if (isRunning.value) {
    isRunning.value = false;
    worker.value?.postMessage({ type: 'stop' });
    saveTimerState();
  }
}

function resetTimer() {
  pauseTimer();
  timeLeft.value = getDurationForMode(currentMode.value);
  completedPomodoros.value = 0;
}

function switchMode(mode: TimerMode) {
  currentMode.value = mode;
  resetTimer();
}

function getDurationForMode(mode: TimerMode): number {
  switch (mode) {
    case 'work':
      return settings.value.workDuration * 60;
    case 'shortBreak':
      return settings.value.shortBreakDuration * 60;
    case 'longBreak':
      return settings.value.longBreakDuration * 60;
  }
}

function notifyTimeUp() {
  // 播放提示音
  const audio = new Audio('/notification.mp3');
  audio.play();
  
  // 发送桌面通知
  if (Notification.permission === 'granted') {
    new Notification(t('title'), {
      body: t(`${currentMode.value}Complete`),
    });
  }
  
  // 工作时间结束时添加记录并切换模式
  if (currentMode.value === 'work') {
    addRecord();
    completedPomodoros.value++;
    
    // 每完成4个番茄钟后切换到长休息，否则切换到短休息
    if (completedPomodoros.value % 4 === 0) {
      switchMode('longBreak');
    } else {
      switchMode('shortBreak');
    }
  } else {
    // 休息结束后切换回工作模式
    switchMode('work');
  }
}

function addRecord() {
  const today = formatDate(new Date());
  const existingRecord = records.value.find(r => r.date === today);
  
  if (existingRecord) {
    existingRecord.count++;
  } else {
    records.value.push({
      date: today,
      count: 1
    });
  }
}

const todayStats = computed(() => {
  const today = formatDate(new Date());
  return records.value.find(r => r.date === today)?.count || 0;
});

const recentRecords = computed(() => {
  return [...records.value]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);  // 显示最近7天的记录
});

// 添加状态保存和恢复函数
function saveTimerState() {
  const state = {
    isRunning: isRunning.value,
    timeLeft: timeLeft.value,
    currentMode: currentMode.value,
    endTime: endTime.value,
    completedPomodoros: completedPomodoros.value,
  };
  localStorage.setItem('pomodoro-state', JSON.stringify(state));
}

function restoreTimerState() {
  const savedState = localStorage.getItem('pomodoro-state');
  if (savedState) {
    const state = JSON.parse(savedState);
    currentMode.value = state.currentMode;
    completedPomodoros.value = state.completedPomodoros || 0;
    
    if (state.isRunning) {
      const now = Date.now();
      if (now < state.endTime) {
        timeLeft.value = Math.floor((state.endTime - now) / 1000);
        startTimer();
      } else {
        notifyTimeUp();
        resetTimer();
      }
    } else {
      timeLeft.value = state.timeLeft;
    }
  }
}

// 添加组件生命周期钩子
onMounted(() => {
  restoreTimerState();
  
  // 添加页面关闭事件监听
  window.addEventListener('beforeunload', saveTimerState);
});

onUnmounted(() => {
  if (worker.value) {
    worker.value.terminate();
    worker.value = null;
  }
  window.removeEventListener('beforeunload', saveTimerState);
});
</script>

<template>
  <c-card>
    <div class="pomodoro-container">
      <div class="mode-buttons">
        <button 
          v-for="mode in ['work', 'shortBreak', 'longBreak']" 
          :key="mode"
          @click="switchMode(mode as TimerMode)"
          :class="{ active: currentMode === mode }"
          class="mode-btn"
        >
          {{ t(mode) }}
        </button>
      </div>

      <div class="timer">{{ formattedTime }}</div>

      <div class="control-buttons">
        <button 
          @click="isRunning ? pauseTimer() : startTimer()"
          class="control-btn"
        >
          {{ isRunning ? t('pause') : t('start') }}
        </button>
        <button @click="resetTimer" class="control-btn">
          {{ t('reset') }}
        </button>
      </div>

      <div class="settings">
        <h3>{{ t('settings') }}</h3>
        <div class="setting-item">
          <label>{{ t('workDuration') }}</label>
          <input 
            v-model.number="settings.workDuration" 
            type="number" 
            min="1"
            :disabled="isRunning"
          >
          {{ t('minutes') }}
        </div>
        <div class="setting-item">
          <label>{{ t('shortBreakDuration') }}</label>
          <input 
            v-model.number="settings.shortBreakDuration" 
            type="number"
            min="1"
            :disabled="isRunning"
          >
          {{ t('minutes') }}
        </div>
        <div class="setting-item">
          <label>{{ t('longBreakDuration') }}</label>
          <input 
            v-model.number="settings.longBreakDuration" 
            type="number"
            min="1"
            :disabled="isRunning"
          >
          {{ t('minutes') }}
        </div>
      </div>

      <div class="statistics">
        <h3>{{ t('statistics') }}</h3>
        
        <div class="today-stats">
          {{ t('today') }} {{ t('completed') }} {{ todayStats }} {{ t('pomodoros') }}
          <div class="tomato-emojis">
            {{ getEmojis(todayStats) }}
          </div>
        </div>
        
        <div class="records-list">
          <template v-if="recentRecords.length">
            <div v-for="record in recentRecords" :key="record.date" class="record-item">
              <span class="date">{{ record.date }}</span>
              <span class="tomatoes">{{ getEmojis(record.count) }}</span>
            </div>
          </template>
          <div v-else class="no-records">
            {{ t('noRecords') }}
          </div>
        </div>
      </div>
    </div>
  </c-card>
</template>

<style scoped>
.pomodoro-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.timer {
  font-size: 6em;
  font-family: monospace;
  font-weight: bold;
}

.mode-buttons {
  display: flex;
  gap: 10px;
}

.mode-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #eee;
}

.mode-btn.active {
  background-color: #4CAF50;
  color: white;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  font-size: 1.2em;
}

.control-btn:hover {
  background-color: #45a049;
}

.settings {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.setting-item input {
  width: 60px;
  padding: 4px;
}

.statistics {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
  padding: 15px;
  border-top: 1px solid #eee;
}

.today-stats {
  margin: 15px 0;
  text-align: center;
  font-size: 1.2em;
}

.tomato-emojis {
  margin-top: 10px;
  font-size: 1.5em;
  line-height: 1.5;
}

.records-list {
  margin-top: 20px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.date {
  color: #666;
}

.tomatoes {
  font-size: 1.2em;
}

.no-records {
  text-align: center;
  color: #666;
  padding: 20px 0;
}
</style> 