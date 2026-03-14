import { createApp } from 'vue';
import { i18n } from '@/locales';
import App from './App.vue';
import '@/assets/popup.css';

createApp(App).use(i18n).mount('#app');
