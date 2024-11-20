// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import './style.css';

export default {
  extends: DefaultTheme,
} satisfies Theme;
