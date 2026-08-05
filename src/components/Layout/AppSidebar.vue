<template>
  <!-- 侧边栏的整体容器，作为浮动卡片 -->
  <div class="sidebar-wrapper" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 侧边栏主体 (el-aside) -->
    <el-aside class="sidebar">
      <!-- 顶部品牌区域 -->
      <div class="sidebar-header" @click="handleToggle">
        <img src="@/assets/logo.png" alt="码上通关" class="custom-logo" :class="{ 'is-collapsed-logo': isCollapsed }" />
        <div class="logo-text">码上通关</div>
        <el-icon class="collapse-icon" :class="{ 'rotated': isCollapsed }">
          <ArrowLeft />
        </el-icon>
      </div>

      <!-- 添加logo下方分隔线 -->
      <div class="sidebar-divider"></div>

      <!-- 导航菜单 -->
      <el-menu :default-active="activePath" mode="vertical" router class="custom-menu"
        background-color="#ffffff" text-color="#666666" :active-text-color="$primary-color"
        :active-bg-color="$primary-light-color" :collapse="isCollapsed" :collapse-transition="false"
        :default-openeds="defaultOpenedSubmenus" @open="handleSubmenuOpen" @close="handleSubmenuClose">
        <!-- Main Menu Items -->
        <el-menu-item index="/home">
          <el-icon class="menu-icon"><HomeFilled /></el-icon>
          <template #title><span class="menu-text">主页</span></template>
        </el-menu-item>
        <el-sub-menu index="interviews-management">
          <template #title>
            <el-icon class="menu-icon">
              <Document />
            </el-icon>
            <span class="menu-text">面试管理</span>
          </template>
          <!-- 原面试管理模块 -->
          <el-menu-item index="/home/interviews">
            <el-icon class="menu-icon">
              <List />
            </el-icon>
            <template #title><span class="menu-text">面试房间</span></template>
          </el-menu-item>
          <!-- 新增面部表情调试模块 -->
          <el-menu-item index="/home/interviews/expression-debug">
            <el-icon class="menu-icon">
              <CameraFilled />
            </el-icon>
            <template #title><span class="menu-text">面部表情调试</span></template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/home/reports">
          <el-icon class="menu-icon"><DataAnalysis /></el-icon>
          <template #title><span class="menu-text">报告管理</span></template>
        </el-menu-item>
        <el-menu-item index="/home/settings">
          <el-icon class="menu-icon"><Setting /></el-icon>
          <template #title><span class="menu-text">设置</span></template>
        </el-menu-item>

        <!-- Account Section Title -->
        <div v-if="!isCollapsed" class="sidebar-section-title">账户和个人信息</div>

        <!-- Account Sub-menu -->
        <el-sub-menu index="account-management">
          <template #title>
            <el-icon class="menu-icon"><Key /></el-icon>
            <span class="menu-text">账户信息</span>
          </template>
          <el-menu-item index="/home/account/change-password">
            <el-icon class="menu-icon"><Lock /></el-icon>
            <template #title><span class="menu-text">更改密码</span></template>
          </el-menu-item>
          <el-menu-item index="/home/account/change-security">
            <el-icon class="menu-icon"><FirstAidKit /></el-icon>
            <template #title><span class="menu-text">更改密保</span></template>
          </el-menu-item>
        </el-sub-menu>

        <!-- Personal Info Sub-menu -->
        <el-sub-menu index="personal-info-management">
          <template #title>
            <el-icon class="menu-icon"><UserFilled /></el-icon>
            <span class="menu-text">个人信息</span>
          </template>
          <el-menu-item index="/home/personal-info/basic">
            <el-icon class="menu-icon"><User /></el-icon>
            <template #title><span class="menu-text">基础信息</span></template>
          </el-menu-item>
          <el-menu-item index="/home/personal-info/interviews">
            <el-icon class="menu-icon"><List /></el-icon>
            <template #title><span class="menu-text">面试信息</span></template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 新增扩展界面菜单项 -->
        <div v-if="!isCollapsed" class="sidebar-section-title">扩展功能</div>
        <el-menu-item index="/home/learning-resources">
          <el-icon class="menu-icon"><Reading /></el-icon>
          <template #title><span class="menu-text">学习资源</span></template>
        </el-menu-item>
        <el-menu-item index="/home/ai-setup">
          <el-icon class="menu-icon"><Cpu /></el-icon>
          <template #title><span class="menu-text">AI面试配置</span></template>
        </el-menu-item>
        
        <!-- 自主训练模块 -->
        <div v-if="!isCollapsed" class="sidebar-section-title">自主训练</div>
        <el-menu-item index="/home/question-bank">
          <el-icon class="menu-icon"><UploadFilled /></el-icon>
          <template #title><span class="menu-text">题库管理</span></template>
        </el-menu-item>
        <el-menu-item index="/home/ai-training">
          <el-icon class="menu-icon"><Edit /></el-icon>
          <template #title><span class="menu-text">智能训练</span></template>
        </el-menu-item>
        

      </el-menu>
    </el-aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
// Import all necessary Element Plus icons
import {
  ArrowLeft,
  HomeFilled,
  Document,
  User, // Added for Basic Info
  List, // Added for Interview Info
  DataAnalysis,
  Setting,
  Key,
  Lock,
  FirstAidKit,
  UserFilled,
  Reading,
  Cpu,
} from '@element-plus/icons-vue';

const isCollapsed = ref(false);
const route = useRoute();

const props = defineProps({
  initialCollapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle', 'sidebar-width-change']);

const handleToggle = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString());
  emit('toggle', isCollapsed.value);
};

const activePath = computed(() => route.path);

// 关键：计算属性，决定哪些子菜单应该默认展开
const defaultOpenedSubmenus = computed(() => {
  if (isCollapsed.value) {
    return []; // 侧边栏折叠时，不展开任何子菜单
  }

  const opened = [];
  const isAccountRoute = route.path.startsWith('/home/account/');
  const wasAccountManuallyOpened = localStorage.getItem('accountSubmenuManuallyOpened') === 'true';

  const isPersonalInfoRoute = route.path.startsWith('/home/personal-info/');
  const wasPersonalInfoManuallyOpened = localStorage.getItem('personalInfoSubmenuManuallyOpened') === 'true';

  // “账户信息”子菜单应该展开的条件：
  if (isAccountRoute || wasAccountManuallyOpened) {
    opened.push('account-management');
  }

  // “个人信息”子菜单应该展开的条件：
  if (isPersonalInfoRoute || wasPersonalInfoManuallyOpened) {
    opened.push('personal-info-management');
  }

  return opened;
});

// 处理子菜单打开事件
const handleSubmenuOpen = (index) => {
  if (index === 'account-management') {
    localStorage.setItem('accountSubmenuManuallyOpened', 'true');
  } else if (index === 'personal-info-management') {
    localStorage.setItem('personalInfoSubmenuManuallyOpened', 'true');
  }
};

// 处理子菜单关闭事件
const handleSubmenuClose = (index) => {
  if (index === 'account-management') {
    if (!route.path.startsWith('/home/account/')) {
      localStorage.setItem('accountSubmenuManuallyOpened', 'false');
    }
  }
};

const emitSidebarWidth = () => {
  // Element Plus 默认折叠宽度为 64px
  const currentWidth = isCollapsed.value ? 64 : 220;
  emit('sidebar-width-change', currentWidth);
};

onMounted(() => {
  const savedState = localStorage.getItem('sidebarCollapsed');
  isCollapsed.value = savedState ? savedState === 'true' : props.initialCollapsed;

  // 确保 localStorage 中有初始值
  if (localStorage.getItem('accountSubmenuManuallyOpened') === null) {
    localStorage.setItem('accountSubmenuManuallyOpened', 'false');
  }
  if (localStorage.getItem('personalInfoSubmenuManuallyOpened') === null) {
    localStorage.setItem('personalInfoSubmenuManuallyOpened', 'false');
  }

  emitSidebarWidth(); // 首次挂载时发出初始宽度
});

// 监听侧边栏折叠状态变化，发出宽度
watch(isCollapsed, () => {
  emitSidebarWidth();
});
</script>

<style scoped lang="scss">
@import "@/assets/styles/variables.scss";

.sidebar-wrapper {
  // position: fixed;
  top: $spacing-md; // 调整为更小的间距
  left: $spacing-md; // 调整为更小的间距
  height: calc(100vh - 2 * $spacing-md); // 相应调整高度
  z-index: 100;
  background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 
    0 20px 40px -8px rgba(0, 0, 0, 0.15),
    0 8px 16px -4px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  border-radius: $border-radius-lg; // 保持大圆角
  overflow: hidden;
  width: 220px; // Default expanded width
  transition: width 0.3s ease, box-shadow 0.3s ease; // Animate width and shadow
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.sidebar-wrapper.is-collapsed {
  width: 64px; // Element Plus default collapsed width
  box-shadow: 
    0 15px 30px -6px rgba(0, 0, 0, 0.12),
    0 6px 12px -3px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.04);
}

.sidebar { // el-aside
  width: 100% !important; // Ensure it fills wrapper's width
  height: 100%; // Ensure it fills wrapper's height
  background-color: transparent !important;
  box-shadow: none !important;
  display: flex; // Use flexbox for internal layout
  flex-direction: column; // Stack header and menu vertically
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  // border-bottom: 2px solid rgba(102, 126, 234, 0.15);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(226, 232, 240, 0.98) 30%, rgba(203, 213, 225, 0.98) 70%, rgba(241, 245, 249, 0.98) 100%);
  box-shadow: 
    0 8px 20px -4px rgba(0, 0, 0, 0.15),
    0 4px 12px -2px rgba(0, 0, 0, 0.1),
    0 2px 8px -1px rgba(0, 0, 0, 0.08),
    -4px -4px 12px -2px rgba(0, 0, 0, 0.08),
    4px -4px 12px -2px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  height: 60px;
  justify-content: space-between;
  transition: padding 0.3s ease, height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  &:hover {
    background: linear-gradient(135deg, rgba(226, 232, 240, 0.99) 0%, rgba(203, 213, 225, 0.99) 30%, rgba(186, 196, 207, 0.99) 70%, rgba(241, 245, 249, 0.99) 100%);
    box-shadow: 
      0 12px 28px -6px rgba(0, 0, 0, 0.2),
      0 6px 16px -3px rgba(0, 0, 0, 0.12),
      0 3px 10px -1px rgba(0, 0, 0, 0.1),
      -6px -6px 16px -3px rgba(0, 0, 0, 0.12),
      6px -6px 16px -3px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      inset 0 -1px 0 rgba(0, 0, 0, 0.08);
    border-bottom-color: rgba(102, 126, 234, 0.25);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 
      0 4px 12px -2px rgba(0, 0, 0, 0.15),
      0 2px 8px -1px rgba(0, 0, 0, 0.1),
      0 1px 6px -1px rgba(0, 0, 0, 0.08),
      -3px -3px 8px -1px rgba(0, 0, 0, 0.1),
      3px -3px 8px -1px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 -1px 0 rgba(0, 0, 0, 0.06);
  }
}

.custom-logo {
  width: 32px;
  height: 32px;
  border-radius: $border-radius-sm;
  transition: width 0.3s ease, height 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  margin-left: 12px;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.collapse-icon {
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
  color: #475569;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  &:hover {
    color: #334155;
  }
}

.sidebar-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: 0;
  width: 100%;
  flex-shrink: 0;
}

.custom-menu { // el-menu
  height: 100%;
  flex-grow: 1;
  padding-top: 5px;
  overflow-y: auto;
  border-right: none !important;
  background-color: transparent !important;
  background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.02) 1px, transparent 0);
  background-size: 20px 20px;
}

// Element Plus menu item styles for the main menu (expanded or collapsed)
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 40px !important;
  line-height: 40px !important;
  padding-left: 20px !important;
  transition: background-color 0.2s ease, padding-left 0.3s ease, transform 0.2s ease;
  border-radius: $border-radius;
  margin: 0 $spacing-sm;
  width: calc(100% - 2 * #{$spacing-sm});
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
}

:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  padding-left: 20px !important;
  margin: 0; // 折叠时移除外边距
  width: 100%; // 恢复全宽时折叠
  border-radius: 0; // 折叠时移除圆角，保持默认样式
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%) !important;
  transform: translateX(2px);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%) !important;
  color: $primary-color !important;
  border-left: 3px solid $primary-color;
  padding-left: 17px !important; // Adjust for border
  font-weight: 600;
}

:deep(.el-menu-item.is-active .el-icon),
:deep(.el-sub-menu__title.is-active .el-icon) {
  color: $primary-color !important;
}

.menu-icon {
  font-size: 16px;
  margin-right: 8px;
  transition: margin-right 0.3s ease;
}

.sidebar-wrapper.is-collapsed .menu-icon {
  margin-right: 0;
}

.menu-text {
  // Element Plus handles hiding this text when collapsed
}

.sidebar-section-title {
  padding: 6px 16px;
  color: #b4b4b4;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  margin: 6px 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sidebar-wrapper.is-collapsed .sidebar-section-title {
  opacity: 0;
  height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

// Styles for the nested submenu when sidebar is EXPANDED
// This targets the actual ul element that contains the sub-menu items
:deep(.el-sub-menu.is-opened > .el-menu--inline) {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%) !important;
  border-radius: $border-radius-lg !important; // Prominent large border-radius
  box-shadow: 
    0 8px 16px -4px rgba(0, 0, 0, 0.1),
    0 4px 8px -2px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
  margin: $spacing-xs $spacing-sm $spacing-md $spacing-sm !important; // Adjust margin to float
  padding: $spacing-sm !important; // Add padding inside the card
  width: calc(100% - 2 * #{$spacing-sm}) !important; // Adjust width to fit within parent submenu card
  box-sizing: border-box; // Ensure padding is included in width
  border: 1px solid rgba(0, 0, 0, 0.05);
}

// Styles for the items within the nested submenu
:deep(.el-sub-menu.is-opened > .el-menu--inline .el-menu-item) {
  height: 36px !important; // Keep smaller height
  line-height: 36px !important;
  padding-left: 20px !important; // Adjust padding for indentation
  border-radius: $border-radius !important; // Apply border-radius to individual items
  margin: 0 $spacing-xs !important; // Small vertical margin between items
  width: 100% !important; // Ensure items fill the width of the parent submenu card

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%) !important;
  }
  &.is-active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%) !important;
    color: $primary-color !important;
    font-weight: 600;
  }
}

// Styles for the floating submenu when sidebar is COLLAPSED (THIS IS THE KEY CHANGE)
:deep(.el-menu--popup) {
  min-width: 160px !important; // 缩小宽度
  border-radius: 16px !important; // 增加圆角
  box-shadow: 
    0 20px 40px -8px rgba(0, 0, 0, 0.2),
    0 8px 16px -4px rgba(0, 0, 0, 0.15),
    0 4px 8px -2px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 251, 252, 0.95) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  padding: 12px !important; // 增加内部内边距，提供卡片感
  box-sizing: border-box; // 确保内边距包含在宽度计算中
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  // 弹出动画
  transform-origin: left center;
  animation: popup-fade-in 0.2s ease-out forwards;

  // Styles for menu items INSIDE the popup
  .el-menu-item {
    height: 36px !important; // 缩小菜单项高度
    line-height: 36px !important;
    padding: 0 10px !important; // 缩小菜单项内部内边距
    border-radius: $border-radius !important; // 菜单项圆角
    margin: 2px 0 !important; // 缩小菜单项之间的垂直间距
    width: 100% !important; // 确保菜单项填充弹出框宽度

    .menu-icon {
      margin-right: $spacing-sm !important; // 保持图标间距
    }

    &:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%) !important;
      transform: translateX(2px);
    }
    &.is-active {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%) !important;
      color: $primary-color !important;
      font-weight: 600;
    }
  }
}

@keyframes popup-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
