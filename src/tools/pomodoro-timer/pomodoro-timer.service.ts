export interface PomodoroRecord {
  date: string;  // YYYY-MM-DD 格式
  count: number;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15
};

export function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getEmojis(count: number): string {
  return '🍅'.repeat(count);
} 