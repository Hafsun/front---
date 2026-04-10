import { defineStore } from "pinia"

export const useTabsStore = defineStore("tabs", {
  state: () => ({
    visitedViews: JSON.parse(localStorage.getItem("visitedViews") || "[]"),
  }),
  actions: {
    addVisitedView(route) {
      // 检查路由是否已经存在于 visitedViews 中
      const exists = this.visitedViews.some((view) => view.path === route.path)
      if (!exists) {
        // 只添加有 title 的路由，并且排除登录页
        if (route.meta && route.meta.title && route.path !== "/login") {
          this.visitedViews.push({
            path: route.path,
            name: route.name,
            title: route.meta.title,
          })
          this.saveVisitedViews()
        }
      }
    },
    removeVisitedView(path) {
      this.visitedViews = this.visitedViews.filter((view) => view.path !== path)
      this.saveVisitedViews()
    },
    clearVisitedViews() {
      this.visitedViews = []
      this.saveVisitedViews()
    },
    saveVisitedViews() {
      localStorage.setItem("visitedViews", JSON.stringify(this.visitedViews))
    },
  },
})
