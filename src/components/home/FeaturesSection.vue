<template>
  <div class="features-section">
    <h2 class="section-title">核心功能特色</h2>
    <p class="section-subtitle">基于多模态AI技术，提供全方位面试能力评测</p>
    <el-row :gutter="24">
      <el-col :span="8" v-for="(feature, index) in features" :key="index">
        <el-card class="feature-card" shadow="hover" @click="$emit('navigate', feature)">
          <div class="feature-icon-wrapper" :style="{ backgroundColor: feature.color + '20' }">
            <el-icon class="feature-icon" :style="{ color: feature.color }">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <div class="feature-tags">
            <el-tag v-for="tag in feature.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
defineProps({
  features: {
    type: Array,
    required: true
  }
})

defineEmits(['navigate'])
</script>

<style scoped lang="scss">
.features-section {
  padding: 80px 60px;
  background: #f8f9fa;
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

.feature-card {
  height: 100%;
  padding: 2rem;
  text-align: center;
  border-radius: 15px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  transition: all 0.3s ease;
}

.feature-icon {
  font-size: 2.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-tags {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .features-section {
    padding: 40px 20px;
  }
  
  .el-col {
    margin-bottom: 1rem;
  }
}
</style>