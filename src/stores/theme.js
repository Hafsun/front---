import { defineStore } from "pinia"

export const useThemeStore = defineStore("theme", {
  state: () => ({
    currentTheme: localStorage.getItem("appTheme") || "default", // 从 localStorage 读取，默认为 'default'
  }),
  actions: {
    setTheme(themeName) {
      this.currentTheme = themeName
      localStorage.setItem("appTheme", themeName)
      // 动态更新 body 上的类
      document.body.className = "" // 清除所有现有类
      if (themeName !== "default") {
        document.body.classList.add(`theme-${themeName}`)
      }
    },
    // 初始化主题，在应用加载时调用
    initializeTheme() {
      const savedTheme = localStorage.getItem("appTheme") || "default"
      this.setTheme(savedTheme) // 调用 setTheme 来应用类
    },
  },
})
