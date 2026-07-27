import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { setupAuthInterceptors } from './store/auth'
import './assets/styles/tailwind.css'
import i18n from './i18n'

const app = createApp(App)
app.use(pinia)
setupAuthInterceptors(pinia)
app.use(router)
app.use(i18n)
app.mount('#app')
