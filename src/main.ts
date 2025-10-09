import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import ElementPlus from "element-plus";
import 'element-plus/dist/index.css'
// import zhCn from "element-plus/es/locale/lang/zh-cn";
import './style.css'
import './styles/index.scss'
import * as Sentry from '@sentry/vue'
// import "./core/FabricObjects"; // 导入自定义 Fabric.js 对象实现

import Popover from '@/common/popover.vue'
const app = createApp(App)

Sentry.init({
    app,
    dsn: 'https://a5b16a9ad3dbaa15dea42cb165c66316@o4510158244544512.ingest.us.sentry.io/4510158245527552',
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
    // Tracing
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.,
    // Logs
    enableLogs: true
})

app.use(store).use(router).component('popover', Popover).mount('#app')
