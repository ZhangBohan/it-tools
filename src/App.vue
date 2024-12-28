<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { NGlobalStyle, NMessageProvider, NNotificationProvider, darkTheme } from 'naive-ui';
import { Analytics } from '@vercel/analytics/vue';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import { layouts } from './layouts';
import { useStyleStore } from './stores/style.store';

const route = useRoute();
const layout = computed(() => route?.meta?.layout ?? layouts.base);
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));

const { locale } = useI18n();

syncRef(
  locale,
  useStorage('locale', locale),
);

// 添加 sitemap 链接到头部
const head = document.head;
const sitemapLink = document.createElement('link');
sitemapLink.rel = 'sitemap';
sitemapLink.type = 'application/xml';
sitemapLink.href = '/sitemap.xml';
head.appendChild(sitemapLink);
</script>

<template>
  <head>
    <!-- 基本 SEO meta 标签 -->
    <meta name="description" content="工具网站">
    <meta name="keywords" content="关键词1,关键词2">
    <meta name="author" content="伯函">
    
    <!-- Open Graph meta 标签 -->
    <meta property="og:title" content="工具网站">
    <meta property="og:description" content="工具网站">
    <meta property="og:image" content="https://tools.bohanzhang.com/favicon.ico">
    <meta property="og:url" content="https://tools.bohanzhang.com">
    
    <!-- Twitter Card meta 标签 -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="工具网站">
    <meta name="twitter:description" content="工具网站">
    <meta name="twitter:image" content="https://tools.bohanzhang.com/favicon.ico">
  </head>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <Analytics />
    <NGlobalStyle />
    <NMessageProvider placement="bottom">
      <NNotificationProvider placement="bottom-right">
        <component :is="layout">
          <RouterView />
        </component>
      </NNotificationProvider>
    </NMessageProvider>
  </n-config-provider>
</template>

<style>
body {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}
</style>
