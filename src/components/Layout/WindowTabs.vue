<template>
  <div class="window-tabs-container">
    <TransitionGroup name="tab-fade" tag="div" class="tabs-wrapper">
      <el-tag 
        v-for="tag in visitedViews" 
        :key="tag.path" 
        :closable="getClosable(tag)"
        @close="closeTag(tag)"
        @click="clickTag(tag)" 
        class="window-tab-item" 
        :class="getClass(tag)"
      >
        {{ tag.title }}
      </el-tag>
    </TransitionGroup>
    
    <div class="header-control">
      <button 
        @click="toggleHeader"
        class="header-toggle-btn"
        :class="buttonClass"
        :title="buttonTitle"
      >
        <div class="btn-content">
          <svg 
            class="btn-icon"
            :class="iconClass"
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
          <span class="btn-text">{{ buttonText }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, inject, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '../../stores/tabs'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const { visitedViews } = storeToRefs(tabsStore)
const activePath = ref(route.path)

const headerVisible = inject('headerVisible')
const toggleHeaderVisibility = inject('toggleHeaderVisibility')

const buttonClass = computed(() => {
  return headerVisible.value ? '' : 'header-hidden-state'
})

const buttonTitle = computed(() => {
  const action = headerVisible.value ? '隐藏' : '显示'
  return `${action}欢迎栏 (Ctrl+Shift+H)`
})

const iconClass = computed(() => {
  return headerVisible.value ? '' : 'rotated'
})

const buttonText = computed(() => {
  const action = headerVisible.value ? '隐藏' : '显示'
  return `${action}欢迎栏`
})

function getClosable(tag) {
  return tag.path !== '/home'
}

function getClass(tag) {
  return tag.path === activePath.value ? 'is-active' : ''
}

function clickTag(tag) {
  const isDifferent = tag.path !== activePath.value
  if (isDifferent) {
    router.push(tag.path)
  }
}

function closeTag(tag) {
  const isHome = tag.path === '/home'
  if (isHome) {
    ElMessage.warning('主页不能关闭！')
    return
  }

  const closedPath = tag.path
  const wasActive = closedPath === activePath.value

  if (wasActive) {
    let newActivePath = '/home'
    const index = visitedViews.value.findIndex(view => view.path === closedPath)

    if (index > -1) {
      if (index > 0) {
        newActivePath = visitedViews.value[index - 1].path
      } else if (visitedViews.value.length > 1) {
        newActivePath = visitedViews.value[1].path
      }
    }

    router.push(newActivePath)
  }

  tabsStore.removeVisitedView(closedPath)
}

function toggleHeader() {
  if (toggleHeaderVisibility) {
    toggleHeaderVisibility()
  }
}

watch(
  () => route.path,
  (newPath) => {
    activePath.value = newPath
    tabsStore.addVisitedView(route)
  },
  { immediate: true }
)

onMounted(() => {
  const homeRoute = router.options.routes.find(r => r.name === 'home')
  const hasHome = visitedViews.value.some(view => view.path === '/home')
  
  if (homeRoute && !hasHome) {
    tabsStore.addVisitedView({
      path: '/home',
      name: 'home',
      meta: { title: '主页' }
    })
  }
})
</script>

<style scoped lang="scss">
@import "@/assets/styles/variables.scss";

.window-tabs-container {
  padding: 0px 0px 0px 6px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(10px);
  min-height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.3) 50%, transparent 100%);
  }
}

.tabs-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  min-height: 40px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 2px;
    
    &:hover {
      background: rgba(99, 102, 241, 0.5);
    }
  }
}

.window-tab-item {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  height: 36px;
  line-height: 34px;
  padding: 0 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  color: #64748b;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  position: relative;
  backdrop-filter: blur(8px);
  user-select: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.02) 100%);
    pointer-events: none;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%);
    color: #475569;
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(99, 102, 241, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  &.is-active {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-color: #6366f1;
    font-weight: 600;
    box-shadow: 
      0 4px 20px rgba(99, 102, 241, 0.3),
      0 2px 8px rgba(99, 102, 241, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    
    &::before {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%);
    }
    
    &:hover {
      background: linear-gradient(135deg, #5855eb 0%, #7c3aed 100%);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 6px 24px rgba(99, 102, 241, 0.35),
        0 3px 12px rgba(99, 102, 241, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
  }

  :deep(.el-tag__close) {
    color: inherit;
    font-size: 12px;
    margin-left: 6px;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.25);
      transform: scale(1.1);
    }
  }
}

.tab-fade-enter-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-8px);
}

.tab-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1), transform 0.25s cubic-bezier(0.4, 0, 1, 1);
  position: absolute;
  pointer-events: none;
}

.tab-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(8px);
}

.tab-fade-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-control {
  display: flex;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.header-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 110px;
  height: 36px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 18px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  user-select: none;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 4px 16px rgba(99, 102, 241, 0.15),
      0 2px 8px rgba(99, 102, 241, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(99, 102, 241, 0.3);
    background: linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.8) 100%);
    color: #475569;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
  }

  &.header-hidden-state {
    border-color: rgba(239, 68, 68, 0.6);
    background: linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.8) 100%);
    color: #dc2626;

    &:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border-color: #ef4444;
      box-shadow: 
        0 4px 16px rgba(239, 68, 68, 0.25),
        0 2px 8px rgba(239, 68, 68, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  }
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-icon {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0, 1);
  width: 16px;
  height: 16px;

  &.rotated {
    transform: rotate(180deg);
  }
}

.btn-text {
  font-size: 12px;
  font-weight: 600;
}
</style>
