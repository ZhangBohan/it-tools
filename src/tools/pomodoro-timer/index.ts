import { Clock } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Pomodoro Timer',
  path: '/pomodoro-timer',
  description: 'A Pomodoro timer to help you stay focused',
  keywords: ['pomodoro', 'timer', 'productivity'],
  component: () => import('./pomodoro-timer.vue'),
  icon: Clock,
  createdAt: new Date('2024-03-21'),
}); 