<template>
  <div class="main-layout">
    <AppSidebar
      :initial-collapsed="!sidebarOpen"
      @toggle="onSidebarToggle"
      @sidebar-width-change="onSidebarWidthChange"
    />

    <div class="main-content" :class="mainContentClass" :style="mainContentStyle">
      <div class="header-area">
        <Transition name="welcome-slide" mode="out-in">
          <div v-if="headerVisible" class="content-header">
            <WelcomeHeader :user-info="userStore.welcomeInfo" />
          </div>
        </Transition>
        
        <div class="tabs-section">
          <WindowTabs />
        </div>
      </div>

      <div class="content-area" :class="contentAreaClass">
        <Transition name="page-fade" mode="out-in">
          <router-view :key="$route.fullPath" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, provide } from 'vue'
import { useUserStore } from '@/stores/user'
import AppSidebar from './Layout/AppSidebar.vue'
import WelcomeHeader from './Layout/WelcomeHeader.vue'
import WindowTabs from './Layout/WindowTabs.vue'

const userStore = useUserStore()
const sidebarOpen = ref(true)
const headerVisible = ref(true)
const sidebarWidth = ref(220)

const mainContentClass = computed(() => {
  return !sidebarOpen.value ? 'sidebar-collapsed' : ''
})

const contentAreaClass = computed(() => {
  return !headerVisible.value ? 'header-hidden' : ''
})

const mainContentStyle = computed(() => {
  const marginLeft = '10px'
  return {
    marginLeft: marginLeft,
    transition: 'margin-left 0.4s cubic-bezier(0.2, 0, 0, 1)'
  }
})

function onSidebarToggle(isCollapsed) {
  sidebarOpen.value = !isCollapsed
}

function onSidebarWidthChange(width) {
  sidebarWidth.value = width
}

function toggleHeaderVisibility() {
  headerVisible.value = !headerVisible.value
}

function onKeydown(event) {
  const isCtrlShiftH = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H'
  if (isCtrlShiftH) {
    event.preventDefault()
    toggleHeaderVisibility()
  }
}

function onResize() {
  const width = window.innerWidth
  if (width < 768) {
    sidebarOpen.value = false
  } else if (width >= 1024) {
    sidebarOpen.value = true
  }
}

async function initUserInfo() {
  try {
    const hasUserInfo = userStore.userInfo?.username
    if (!hasUserInfo) {
      await userStore.fetchUserInfo()
    }
  } catch (error) {
    console.error("获取用户信息失败:", error)
  }
}

provide('headerVisible', headerVisible)
provide('toggleHeaderVisibility', toggleHeaderVisibility)

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKeydown)
  onResize()
  initUserInfo()

  // 聊天组件地址可能包含访问令牌，只允许从项目级环境变量注入。
  const chatWidgetUrl = process.env.VUE_APP_CHAT_WIDGET_URL
  if (chatWidgetUrl) {
    const script = document.createElement('script')
    script.src = chatWidgetUrl
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log('✅ 聊天组件脚本加载成功！')
    }

    document.body.appendChild(script)
  }
}
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped lang="scss">
@import "@/assets/styles/variables.scss";
@import '../styles/layout/main-layout.css';

.welcome-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.welcome-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.6, 1);
}

.welcome-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.welcome-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.welcome-slide-enter-to,
.welcome-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}
</style>
