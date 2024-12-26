<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { messages } from './image-generator.i18n';
import { generateImage, type ImageConfig, DEFAULT_CONFIG, PRESET_COLORS, IMAGE_FORMATS, GRADIENT_PRESETS, GRADIENT_DIRECTIONS } from './image-generator.service';

const { t } = useI18n({
  messages,
  useScope: 'local'
});

const config = ref<ImageConfig>({ ...DEFAULT_CONFIG });
const imageUrl = ref<string>('');

const downloadFilename = computed(() => 
  `image-${config.value.width}x${config.value.height}.${config.value.format}`
);

async function handleGenerate() {
  try {
    imageUrl.value = await generateImage(config.value);
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

function handleDownload() {
  if (!imageUrl.value) return;
  
  const link = document.createElement('a');
  link.href = imageUrl.value;
  link.download = downloadFilename.value;
  link.click();
}

function selectPresetColor(color: string) {
  config.value.backgroundColor = color;
}

function selectGradientPreset(preset: { start: string; end: string }) {
  config.value.gradientColor = preset.start;
  config.value.gradientDirection = 'to right';
}
</script>

<template>
  <c-card>
    <div class="generator-container">
      <div class="config-section">
        <div class="input-group">
          <label>{{ t('width') }}</label>
          <div class="input-with-unit">
            <input 
              v-model.number="config.width" 
              type="number" 
              min="1"
              max="4096"
            >
            <span class="unit">{{ t('pixels') }}</span>
          </div>
        </div>

        <div class="input-group">
          <label>{{ t('height') }}</label>
          <div class="input-with-unit">
            <input 
              v-model.number="config.height" 
              type="number"
              min="1"
              max="4096"
            >
            <span class="unit">{{ t('pixels') }}</span>
          </div>
        </div>

        <div class="input-group">
          <label>{{ t('backgroundColor') }}</label>
          <div class="color-inputs">
            <input 
              v-model="config.backgroundColor"
              type="color"
              class="color-picker"
            >
            <input 
              v-model="config.backgroundColor"
              type="text"
              class="color-text"
            >
          </div>
        </div>

        <div class="preset-colors">
          <label>{{ t('presetColors') }}</label>
          <div class="color-grid">
            <button
              v-for="color in PRESET_COLORS"
              :key="color"
              class="color-btn"
              :style="{ backgroundColor: color }"
              @click="selectPresetColor(color)"
            />
          </div>
        </div>

        <div class="input-group">
          <label>{{ t('format') }}</label>
          <select v-model="config.format">
            <option v-for="format in IMAGE_FORMATS" :key="format" :value="format">
              {{ format.toUpperCase() }}
            </option>
          </select>
        </div>

        <div class="input-group">
          <label>{{ t('useGradient') }}</label>
          <input type="checkbox" v-model="config.useGradient">
        </div>

        <div v-if="config.useGradient" class="gradient-section">
          <div class="input-group">
            <label>{{ t('gradientColor') }}</label>
            <div class="color-inputs">
              <input 
                v-model="config.gradientColor"
                type="color"
                class="color-picker"
              >
              <input 
                v-model="config.gradientColor"
                type="text"
                class="color-text"
              >
            </div>
          </div>

          <div class="input-group">
            <label>{{ t('gradientDirection') }}</label>
            <div class="direction-buttons">
              <button
                v-for="dir in GRADIENT_DIRECTIONS"
                :key="dir.value"
                class="direction-btn"
                :class="{ active: config.gradientDirection === dir.value }"
                @click="config.gradientDirection = dir.value"
              >
                {{ dir.label }}
              </button>
            </div>
          </div>

          <div class="gradient-presets">
            <label>{{ t('gradientPresets') }}</label>
            <div class="gradient-grid">
              <button
                v-for="(preset, index) in GRADIENT_PRESETS"
                :key="index"
                class="gradient-btn"
                :style="{
                  background: `linear-gradient(${config.gradientDirection}, ${preset.start}, ${preset.end})`
                }"
                @click="selectGradientPreset(preset)"
              />
            </div>
          </div>
        </div>

        <div class="buttons">
          <button @click="handleGenerate" class="primary-btn">
            {{ t('generate') }}
          </button>
          <button 
            v-if="imageUrl"
            @click="handleDownload" 
            class="secondary-btn"
          >
            {{ t('download') }}
          </button>
        </div>
      </div>

      <div class="preview-section">
        <h3>{{ t('preview') }}</h3>
        <div class="preview-container">
          <img v-if="imageUrl" :src="imageUrl" alt="Generated image" class="preview-image">
        </div>
      </div>
    </div>
  </c-card>
</template>

<style scoped>
.generator-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  padding: 20px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  color: #4E5969;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit input {
  width: 100px;
}

.unit {
  color: #86909C;
  font-size: 14px;
}

input[type="number"],
input[type="text"],
select {
  padding: 8px 12px;
  border: 1px solid #E4E6E8;
  border-radius: 6px;
  font-size: 14px;
}

.color-inputs {
  display: flex;
  gap: 8px;
}

.color-picker {
  width: 50px;
  height: 38px;
  padding: 2px;
  border: 1px solid #E4E6E8;
  border-radius: 6px;
}

.color-text {
  flex: 1;
}

.preset-colors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #E4E6E8;
  border-radius: 4px;
  cursor: pointer;
}

.color-btn:hover {
  transform: scale(1.1);
}

.buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.primary-btn,
.secondary-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.primary-btn {
  background: #3370FF;
  color: white;
}

.primary-btn:hover {
  background: #2860E1;
}

.secondary-btn {
  background: #F0F1F2;
  color: #1F2329;
}

.secondary-btn:hover {
  background: #E4E6E8;
}

.preview-section {
  padding: 20px;
  background: #F7F8FA;
  border-radius: 8px;
}

.preview-section h3 {
  margin: 0 0 16px;
  color: #1F2329;
  font-size: 16px;
}

.preview-container {
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E4E6E8;
  border-radius: 6px;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.gradient-section {
  border-top: 1px solid #E4E6E8;
  padding-top: 16px;
  margin-top: 16px;
}

.direction-buttons {
  display: flex;
  gap: 8px;
}

.direction-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #E4E6E8;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 18px;
}

.direction-btn.active {
  background: #3370FF;
  color: white;
  border-color: #3370FF;
}

.gradient-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.gradient-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #E4E6E8;
  border-radius: 6px;
  cursor: pointer;
}

.gradient-btn:hover {
  transform: scale(1.1);
}
</style> 