import { createApp } from 'vue'
import App from './App.vue'
import Header from '@/views/header/Header.vue'
import router from '@/router'
import {createPinia} from "pinia";
import { MotionPlugin } from '@vueuse/motion'

const app = createApp(App)
const pinia = createPinia()
app.component('Header', Header)
app.use(pinia)
app.use(router)
app.use(MotionPlugin)
app.mount('#app')
