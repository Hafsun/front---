// userprefs.js — 用户偏好 API（替代前端 localStorage，数据存储在 Redis）
import { goService } from "@/utils/request"

// 获取所有用户偏好
export const getAllPrefs = () => {
  return goService.get("/user/prefs/all")
}

// 保存主题
export const setTheme = (theme) => {
  return goService.put("/user/prefs/theme", { theme })
}

// 保存标签页历史
export const setVisitedViews = (views) => {
  return goService.put("/user/prefs/visited-views", { views })
}

// 保存侧边栏状态
export const setSidebar = (collapsed) => {
  return goService.put("/user/prefs/sidebar", { collapsed })
}

// 保存子菜单状态
export const setSubmenu = (menuKey, opened) => {
  return goService.put("/user/prefs/submenu", { menuKey, opened })
}

// 保存系统设置
export const setSettings = (settings) => {
  return goService.put("/user/prefs/settings", { settings })
}

// 保存面试预设
export const setInterviewPreset = (preset) => {
  return goService.put("/user/prefs/interview-preset", { preset })
}
