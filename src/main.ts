import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {useHolidays} from "./hooks/use-holidays.ts";
import 'element-plus/theme-chalk/el-message.css'
useHolidays(new Date().getFullYear())
createApp(App).mount('#app')
