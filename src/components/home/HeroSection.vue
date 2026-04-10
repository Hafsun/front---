<template>
  <div class="hero-section" @mouseenter="animateHero" @mouseleave="resetHero">
    <div class="hero-container">
      <div class="hero-content" :class="{ 'hero-animate': isHeroAnimated }">
        <h1 class="hero-title">多模态面试模拟与技能精进平台</h1>
        <p class="hero-subtitle">面向高校学生的AI面试助手</p>
        <p class="hero-description">
          通过语音、视频、文本多维度分析，构建智能化、沉浸式面试评测智能体，
          精准诊断面试短板并提供个性化提升方案，助力学生从校园到职场的完美转换
        </p>
        <div class="hero-buttons">
          <el-button type="primary" size="large" class="start-btn" @click="$emit('start-interview')">
            <el-icon><VideoPlay /></el-icon>
            开始模拟面试
          </el-button>
        </div>
      </div>
      
      <div class="hero-image">
        <!-- <div class="stats-overlay">
          <div class="stat-item">
            <div class="stat-number">{{ animatedStats.interviews }}</div>
            <div class="stat-label">累计面试次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ animatedStats.users }}</div>
            <div class="stat-label">服务学生数量</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ animatedStats.success }}%</div>
            <div class="stat-label">面试通过率提升</div>
          </div>
        </div> -->
        <el-image 
          :src="pic" 
          alt="AI面试场景" 
          class="hero-img"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import pic from '@/assets/pic.png'

defineEmits(['start-interview', 'view-demo'])

const isHeroAnimated = ref(false)

// 动画统计数据
const animatedStats = reactive({
  interviews: 0,
  users: 0,
  success: 0
})

// Hero 动画控制
const animateHero = () => {
  isHeroAnimated.value = true
}

const resetHero = () => {
  isHeroAnimated.value = false
}

// 数字动画
const animateNumbers = () => {
  const targets = { interviews: 15000, users: 8500, success: 85 }
  const duration = 2000
  const steps = 60
  const stepTime = duration / steps
  
  Object.keys(targets).forEach(key => {
    const target = targets[key]
    const step = target / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        animatedStats[key] = target
        clearInterval(timer)
      } else {
        animatedStats[key] = Math.floor(current)
      }
    }, stepTime)
  })
}

onMounted(() => {
  animateNumbers()
})
</script>

<style scoped>
@import '../../styles/home/hero-section.css';
</style>
