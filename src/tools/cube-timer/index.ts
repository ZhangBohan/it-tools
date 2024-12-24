import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Cube Timer',
  path: '/cube-timer',
  description: 'A timer for cube solving',
  keywords: ['cube', 'timer', 'solving'],
  component: () => import('./cube-timer.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-12-15'),
});
