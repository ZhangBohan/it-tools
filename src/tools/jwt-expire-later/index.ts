import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Jwt expire later',
  path: '/jwt-expire-later',
  description: 'make your jwt token expire later',
  keywords: ['jwt', 'expire', 'later'],
  component: () => import('./jwt-expire-later.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-12-15'),
});