import { defineStore } from "pinia"
import { setVisitedViews } from "@/api/userprefs"

export const useTabsStore = defineStore("tabs", {
  state: () => ({
    visitedViews: [],
  }),
  actions: {
    addVisitedView(route) {
      const exists = this.visitedViews.some((view) => view.path === route.path)
      if (!exists) {
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
      // 异步保存到后端 Redis，不阻塞 UI
      setVisitedViews(this.visitedViews).catch((err) => {
        console.warn("保存标签页历史失败:", err)
      })
    },
  },
})
