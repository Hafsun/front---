import { createApp } from "vue"
import "./assets/styles/global.scss"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router" // 引用 router 目录下的 index.js
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { PieChart, LineChart, RadarChart } from "echarts/charts"
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components"

// 注册ECharts组件
use([CanvasRenderer, PieChart, LineChart, RadarChart, GridComponent, TooltipComponent, LegendComponent])

const app = createApp(App)
const pinia = createPinia()

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

const originalConsoleError = console.error
console.error = (...args) => {
  if (args[0] && typeof args[0] === "string" && args[0].includes("ResizeObserver")) {
    return // 静默ResizeObserver错误
  }
  originalConsoleError.apply(console, args)
}

window.addEventListener("error", (e) => {
  if (
    e.message &&
    (e.message.includes("ResizeObserver loop completed with undelivered notifications") ||
      e.message.includes("ResizeObserver"))
  ) {
    e.stopImmediatePropagation()
    e.preventDefault()
    return false
  }
})

window.addEventListener("unhandledrejection", (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes("ResizeObserver")) {
    e.preventDefault()
    return false
  }
})

app.mount("#app")
