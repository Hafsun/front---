import { defineStore } from "pinia"
import { setTheme } from "@/api/userprefs"

export const useThemeStore = defineStore("theme", {
  state: () => ({
    currentTheme: "default",
  }),
  actions: {
    setTheme(themeName) {
      this.currentTheme = themeName
      this.applyThemeClass(themeName)
      setTheme(themeName).catch((err) => {
        console.warn("保存主题设置失败:", err)
      })
    },
    // 初始化主题，在应用加载时调用
    initializeTheme() {
      // 从后端加载偏好会通过 getAllPrefs 完成
      // 这里先应用默认主题
      this.applyThemeClass(this.currentTheme)
    },
    // 仅设置主题不保存（用于从后端加载时恢复）
    setThemeWithoutSave(themeName) {
      this.currentTheme = themeName
      this.applyThemeClass(themeName)
    },
    applyThemeClass(themeName) {
      document.body.className = ""
      if (themeName !== "default") {
        document.body.classList.add(`theme-${themeName}`)
      }
    },
  },
})
