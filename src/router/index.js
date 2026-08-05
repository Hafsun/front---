import { createRouter, createWebHistory } from "vue-router"
import { useUserStore } from "../stores/user"
import LoginView from "../views/LoginView.vue"
import MainLayout from "../components/MainLayout.vue"

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: {
      requiresAuth: false,
      title: "登录",
      needCrossFade: true,
    },
  },
  {
    path: "/home",
    name: "home",
    component: MainLayout,
    meta: {
      requiresAuth: true,
      title: "主页",
      needCrossFade: true,
    },
    children: [
      {
        path: "", // 默认子路由，对应 /home
        name: "home-dashboard",
        component: () => import("../views/HomeView.vue"),
        meta: { title: "主页概览" },
      },

      {
        path: "interviews",
        name: "interviews-parent",
        meta: { requiresAuth: true, title: "面试管理" },
        redirect: "/home/interviews/list",
        children: [
          {
            path: "list",
            name: "interviews",
            component: () => import("../views/InterviewRoom.vue"),
            meta: { title: "面试列表" },
          },
          {
            path: "expression-debug",
            name: "interviews-expression-debug",
            component: () => import("../views/FaceExpressionDebugView.vue"),
            meta: { title: "面部表情调试" },
          },
        ],
      },

      {
        path: "reports",
        name: "reports",
        component: () => import("../views/ReportsView.vue"),
        meta: { title: "报告分析" },
      },
      {
        path: "personal-info",
        name: "personal-info-parent",
        redirect: "/home/personal-info/basic",
        meta: { requiresAuth: true, title: "个人信息" },
        children: [
          {
            path: "basic",
            name: "personal-info-basic",
            component: () => import("../views/BasicInfoView.vue"),
            meta: { title: "基础信息" },
          },
          {
            path: "interviews",
            name: "personal-info-interviews",
            component: () => import("../views/InterviewInfoView.vue"),
            meta: { title: "面试信息" },
          },
        ],
      },
      {
        path: "account/change-password",
        name: "change-password",
        component: () => import("../views/ChangePasswordView.vue"),
        meta: { title: "更改密码" },
      },
      {
        path: "account/change-security",
        name: "change-security",
        component: () => import("../views/ChangeSecurityView.vue"),
        meta: { title: "更改密保" },
      },
      {
        path: "learning-resources",
        name: "learning-resources",
        component: () => import("../views/LearningResourcesView.vue"),
        meta: { title: "学习资源" },
      },
      {
        path: "ai-setup",
        name: "ai-setup",
        component: () => import("../views/AISetupView.vue"),
        meta: { title: "AI面试配置" },
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("../views/SettingsView.vue"),
        meta: { title: "系统设置" },
      },
      {
        path: "resume-generator",
        name: "resume-generator",
        component: () => import("../views/ResumeGeneratorView.vue"),
        meta: { title: "简历生成器" }
      },
      {
        path: "question-bank",
        name: "question-bank",
        component: () => import("../views/QuestionBankView.vue"),
        meta: { title: "题库管理" },
      },
      {
        path: "ai-training",
        name: "ai-training",
        component: () => import("../views/AITrainingView.vue"),
        meta: { title: "智能训练" },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const isAuthenticated = userStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next({ path: "/login", query: { redirect: to.fullPath } })
  } else if (to.path === "/" && isAuthenticated) {
    next("/home")
  } else if (to.path === "/login" && isAuthenticated) {
    next("/home")
  } else {
    next()
  }
})

export default router
