<template>
  <div class="domains-section" id="domains-section">
    <h2 class="section-title">技术领域覆盖</h2>
    <p class="section-subtitle">支持多个热门技术领域的专业面试场景</p>
    <el-row :gutter="24">
      <el-col :span="6" v-for="(domain, index) in domains" :key="index">
        <el-card class="domain-card" shadow="hover" @click="$emit('explore', domain)">
          <div class="domain-icon">
            <el-icon><component :is="domain.icon" /></el-icon>
          </div>
          <h4>{{ domain.name }}</h4>
          <p>{{ domain.description }}</p>
          <div class="domain-positions">
            <el-tag v-for="position in domain.positions" :key="position" size="small">{{ position }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
defineProps({
  domains: {
    type: Array,
    required: true
  }
})

defineEmits(['explore'])
</script>

<style scoped lang="scss">
.domains-section {
  padding: 100px 60px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(102,126,234,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
    opacity: 0.5;
    z-index: 0;
  }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #2c3e50;
  position: relative;
  z-index: 1;
  
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
  position: relative;
  z-index: 1;
}

.domain-card {
  text-align: center;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: white;
  border: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
  height: 100%;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
    
    .domain-icon {
      transform: scale(1.1) rotate(5deg);
      color: #667eea;
    }
    
    .domain-positions .el-tag {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-color: transparent;
    }
  }
}

.domain-icon {
  font-size: 3.5rem;
  color: #667eea;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
  min-height: 3.5rem;
  margin-left: auto;
  margin-right: auto;
}

.domain-card h4 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #2c3e50;
  position: relative;
}

.domain-card p {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.domain-positions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  .el-tag {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(102, 126, 234, 0.2);
      transform: translateY(-1px);
    }
  }
}

@media (max-width: 768px) {
  .domains-section {
    padding: 40px 20px;
  }
  
  .el-col {
    margin-bottom: 1rem;
  }
}
</style>