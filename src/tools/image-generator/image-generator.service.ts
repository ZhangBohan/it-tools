export interface ImageConfig {
  width: number;
  height: number;
  backgroundColor: string;
  format: 'png' | 'jpeg' | 'webp';
  useGradient: boolean;
  gradientColor: string;
  gradientDirection: 'to right' | 'to bottom' | 'to bottom right';
}

export const DEFAULT_CONFIG: ImageConfig = {
  width: 800,
  height: 600,
  backgroundColor: '#3B82F6',
  format: 'png',
  useGradient: false,
  gradientColor: '#60A5FA',
  gradientDirection: 'to right'
};

// 现代化的颜色预设
export const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
];

// 渐变色预设
export const GRADIENT_PRESETS = [
  { start: '#3B82F6', end: '#60A5FA' }, // Blue
  { start: '#10B981', end: '#34D399' }, // Emerald
  { start: '#F59E0B', end: '#FBBF24' }, // Amber
  { start: '#EF4444', end: '#F87171' }, // Red
  { start: '#8B5CF6', end: '#A78BFA' }, // Purple
];

export const GRADIENT_DIRECTIONS = [
  { value: 'to right', label: '→' },
  { value: 'to bottom', label: '↓' },
  { value: 'to bottom right', label: '↘' },
] as const;

export const IMAGE_FORMATS = ['png', 'jpeg', 'webp'] as const;

export async function generateImage(config: ImageConfig): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not supported');
  
  if (config.useGradient) {
    const gradient = ctx.createLinearGradient(
      0, 0,
      config.gradientDirection.includes('right') ? canvas.width : 0,
      config.gradientDirection.includes('bottom') ? canvas.height : 0
    );
    gradient.addColorStop(0, config.backgroundColor);
    gradient.addColorStop(1, config.gradientColor);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = config.backgroundColor;
  }
  
  ctx.fillRect(0, 0, config.width, config.height);
  return canvas.toDataURL(`image/${config.format}`);
} 