<template>
  <div class="home-container">
    <!-- 英雄区域 -->
    <HeroSection 
      @start-interview="startInterview"
      @view-demo="viewDemo"
    />

    <!-- 快速导航 -->
    <QuickNavSection 
      :nav-items="quickNavItems"
      @navigate="navigateToModule"
    />

    <!-- 核心功能区域 -->
    <FeaturesSection 
      :features="coreFeatures"
      @navigate="navigateToFeature"
    />

    <!-- 技术领域覆盖 -->
    <DomainsSection 
      :domains="techDomains"
      @explore="exploreDomain"
    />

    <!-- 使用流程 -->
    <ProcessSection :steps="processSteps" />

    <!-- 页脚 -->
    <AppFooter 
      @start-interview="startInterview"
      @explore-domain="exploreDomain"
      @scroll-to-section="scrollToSection"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import HeroSection from '@/components/home/HeroSection.vue'
import QuickNavSection from '@/components/home/QuickNavSection.vue'
import FeaturesSection from '@/components/home/FeaturesSection.vue'
import DomainsSection from '@/components/home/DomainsSection.vue'
import ProcessSection from '@/components/home/ProcessSection.vue'
import AppFooter from '@/components/home/AppFooter.vue'
import { useHomeData } from '@/stores/useHomeData'

const router = useRouter()
 
// 使用组合式函数管理数据
const {
  quickNavItems,
  coreFeatures,
  techDomains,
  processSteps
} = useHomeData()

// 导航方法 - 添加错误处理
const navigateToModule = async (nav) => {
  try {
    ElMessage.info(`正在跳转到${nav.title}...`)
    
    if (nav.title === 'AI面试配置') {
      await router.push({
        path: '/home/interviews',
        query: { tab: 'config' }
      })
    } else if (nav.route) {
      await router.push(nav.route)
    } else {
      scrollToSection(nav.route)
    }
    
    ElMessage.success(`已跳转到${nav.title}`)
  } catch (error) {
    console.error('导航错误:', error)
    ElMessage.error('跳转失败，请重试')
  }
}

const navigateToFeature = async (feature) => {
  try {
    ElMessage.info(`正在跳转到${feature.title}相关页面...`)
    
    if (feature.action === 'scroll') {
      scrollToSection(feature.target)
    } else if (feature.action === 'route') {
      await router.push(feature.target)
    }
    
    ElMessage.success(`已跳转到${feature.title}相关内容`)
  } catch (error) {
    console.error('功能导航错误:', error)
    ElMessage.error('跳转失败，请重试')
  }
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const startInterview = async () => {
  try {
    ElMessage.info('正在启动面试系统...')
    await router.push('/home/interviews')
  } catch (error) {
    console.error('启动面试失败:', error)
    ElMessage.error('启动面试失败，请重试')
  }
}

const viewDemo = () => {
  scrollToSection('process-section')
}

const exploreDomain = async (domain) => {
  try {
    const domainConfig = {
      '人工智能': { domain: 'ai', position: 'tech', difficulty: 'medium' },
      '大数据': { domain: 'bigdata', position: 'tech', difficulty: 'medium' },
      '物联网': { domain: 'iot', position: 'tech', difficulty: 'easy' },
      '智能系统': { domain: 'smart_systems', position: 'tech', difficulty: 'medium' }
    }
    
    const config = domainConfig[domain.name]
    if (config) {
      localStorage.setItem('presetInterviewConfig', JSON.stringify(config))
      ElMessage.success(`已为您预设${domain.name}面试配置`)
    }
    
    await router.push({
      path: '/home/interviews',
      query: { 
        domain: domain.name,
        preset: 'true'
      }
    })
  } catch (error) {
    console.error('探索领域失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}
</script>

<style scoped lang="scss">
.home-container {
  /* 移除所有高度限制，让内容自然流动 */
  width: 100%;
  /* 不设置任何高度相关的属性 */
}
</style>