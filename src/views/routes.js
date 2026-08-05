export const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login/LoginView.vue"),
    meta: {
      requiresAuth: false,
      title: "登录",
      needCrossFade: true,
    },
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../components/Layout/MainLayout.vue"),
    meta: {
      requiresAuth: true,
      title: "主页",
      needCrossFade: true,
    },
    children: [
      {
        path: "",
        name: "home-dashboard",
        component: () => import("../views/HomeView.vue"),
        meta: { title: "主页概览" },
      },
      // 面试管理路由模块
      // 个人信息路由模块
      // 账户管理路由模块
      // 其他功能路由模块
    ],
  },
]

// 面试管理相关路由
const interviewRoutes = [
  {
    path: "interviews",
    name: "interviews-parent",
    meta: { requiresAuth: true, title: "面试管理" },
    redirect: "/home/interviews/list",
    children: [
      {
        path: "list",
        name: "interviews",
        component: () => import("../views/interviewRoom/InterviewRoom.vue"),
        meta: { title: "面试列表" },
      },
      {
        path: "expression-debug",
        name: "interviews-expression-debug",
        component: () => import("../views/others/FaceExpressionDebugView.vue"),
        meta: { title: "面部表情调试" },
      },
    ],
  },
  {
    path: "reports",
    name: "reports",
    component: () => import("../views/interviewReport/ReportsView.vue"),
    meta: { title: "报告分析" },
  },
]

// 个人信息相关路由
const personalInfoRoutes = [
  {
    path: "personal-info",
    name: "personal-info-parent",
    redirect: "/home/personal-info/basic",
    meta: { requiresAuth: true, title: "个人信息" },
    children: [
      {
        path: "basic",
        name: "personal-info-basic",
        component: () => import("../views/information/BasicInfoView.vue"),
        meta: { title: "基础信息" },
      },
      {
        path: "interviews",
        name: "personal-info-interviews",
        component: () => import("../views/information/InterviewInfoView.vue"),
        meta: { title: "面试信息" },
      },
    ],
  },
]

// 账户管理相关路由
const accountRoutes = [
  {
    path: "account/change-password",
    name: "change-password",
    component: () => import("../views/information/ChangePasswordView.vue"),
    meta: { title: "更改密码" },
  },
  {
    path: "account/change-security",
    name: "change-security",
    component: () => import("../views/information/ChangeSecurityView.vue"),
    meta: { title: "更改密保" },
  },
]

// 其他功能路由
const otherRoutes = [
  {
    path: "learning-resources",
    name: "learning-resources",
    component: () => import("../views/others/LearningResourcesView.vue"),
    meta: { title: "学习资源" },
  },
  {
    path: "ai-setup",
    name: "ai-setup",
    component: () => import("../views/setting/AISetupView.vue"),
    meta: { title: "AI面试配置" },
  },
  {
    path: "settings",
    name: "settings",
    component: () => import("../views/setting/SettingsView.vue"),
    meta: { title: "系统设置" },
  },
]

routes[2].children.push(...interviewRoutes)
routes[2].children.push(...personalInfoRoutes)
routes[2].children.push(...accountRoutes)
routes[2].children.push(...otherRoutes)
