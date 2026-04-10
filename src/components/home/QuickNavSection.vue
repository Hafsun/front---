<template>
  <div class="quick-nav-section">
    <div class="nav-container">
      <h2 class="section-title">快速导航</h2>
      <p class="section-subtitle">选择您需要的功能模块，开始您的面试准备之旅</p>
      <el-row :gutter="24">
        <el-col :span="6" v-for="(nav, index) in navItems" :key="index">
          <el-card class="nav-card" shadow="hover" @click="$emit('navigate', nav)">
            <div class="nav-icon-wrapper" :style="{ backgroundColor: nav.color + '20' }">
              <el-icon class="nav-icon" :style="{ color: nav.color }">
                <component :is="nav.icon" />
              </el-icon>
            </div>
            <h4>{{ nav.title }}</h4>
            <p>{{ nav.description }}</p>
            <div class="nav-footer">
              <el-button type="text" class="nav-btn">
                {{ nav.buttonText }} <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

defineProps({
  navItems: {
    type: Array,
    required: true
  }
})

defineEmits(['navigate'])
</script>

<style scoped lang="scss">
.quick-nav-section {
  padding: 80px 60px;
  background: white;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #2c3e50;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
    margin: 1rem auto;
  }
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 3rem;
}

.nav-card {
  height: 100%;
  padding: 2rem;
  text-align: center;
  border-radius: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

.nav-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.nav-icon {
  font-size: 2.5rem;
}

.nav-card h4 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.nav-card p {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.nav-footer {
  margin-top: auto;
}

.nav-btn {
  color: #667eea;
  font-weight: 500;
  
  &:hover {
    color: #5a67d8;
  }
}

@media (max-width: 768px) {
  .quick-nav-section {
    padding: 40px 20px;
  }
  
  .el-col {
    margin-bottom: 1rem;
  }
}
</style>