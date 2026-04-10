<template>
  <div class="process-section" id="process-section">
    <h2 class="section-title">使用流程</h2>
    <div class="process-steps">
      <div v-for="(step, index) in steps" :key="index" class="step-item">
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-content">
          <h4>{{ step.title }}</h4>
          <p>{{ step.description }}</p>
        </div>
        <div v-if="index < steps.length - 1" class="step-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

defineProps({
  steps: {
    type: Array,
    required: true
  }
})
</script>

<style scoped lang="scss">
.process-section {
  padding: 80px 60px;
  background: white;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
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

.process-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 2rem;
}

.step-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-right: 1rem;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.step-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.step-arrow {
  margin: 0 1rem;
  font-size: 1.5rem;
  color: #bdc3c7;
}

@media (max-width: 768px) {
  .process-section {
    padding: 40px 20px;
  }
  
  .process-steps {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .step-item {
    width: 100%;
    margin-bottom: 2rem;
  }
  
  .step-arrow {
    display: none;
  }
}
</style>