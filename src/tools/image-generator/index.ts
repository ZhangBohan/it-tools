import { Photo } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Image Generator',
  path: '/image-generator',
  description: 'Generate images with custom size, color and format',
  keywords: ['image', 'generator', 'placeholder', 'color'],
  component: () => import('./image-generator.vue'),
  icon: Photo,
  createdAt: new Date('2024-03-21'),
}); 