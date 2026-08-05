<template>
  <footer class="app-footer">
    <div class="footer-background">
      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-brand">
            <h3 class="brand-title">多模态智能模拟面试评测系统</h3>
            <p class="brand-subtitle">基于讯飞星火大模型 · 面向高校学生的AI面试助手</p>
            <div class="brand-features">
              <div class="feature-item">
                <el-icon><TrendCharts /></el-icon>
                <span>智能评测</span>
              </div>
              <div class="feature-item">
                <el-icon><DataAnalysis /></el-icon>
                <span>多模态分析</span>
              </div>
              <div class="feature-item">
                <el-icon><Reading /></el-icon>
                <span>个性化学习</span>
              </div>
            </div>
          </div>
          
          <div class="footer-links-section">
            <div class="links-column">
              <h4>核心功能</h4>
              <ul>
                <li><el-link @click="$router.push('/home/interviews')">智能面试</el-link></li>
                <li><el-link @click="$router.push('/home/reports')">报告分析</el-link></li>
                <li><el-link @click="$router.push('/home/learning-resources')">学习资源</el-link></li>
              </ul>
            </div>
            
            <div class="links-column">
              <h4>技术领域</h4>
              <ul>
                <li><el-link @click="$emit('explore-domain', {name: '人工智能'})">人工智能</el-link></li>
                <li><el-link @click="$emit('explore-domain', {name: '大数据'})">大数据</el-link></li>
                <li><el-link @click="$emit('explore-domain', {name: '物联网'})">物联网</el-link></li>
                <li><el-link @click="$emit('explore-domain', {name: '智能系统'})">智能系统</el-link></li>
              </ul>
            </div>
            
            <div class="links-column">
              <h4>快速开始</h4>
              <ul>
                <li><el-link @click="$emit('start-interview')">开始面试</el-link></li>
                <li><el-link @click="$emit('scroll-to-section', 'process-section')">使用指南</el-link></li>
                <li><el-link @click="$emit('scroll-to-section', 'features-section')">功能特色</el-link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="copyright-section">
            <p>© 2024 智能面试评测系统 - 助力学生从校园到职场的完美转换</p>
          </div>
          <div class="footer-stats">
            <div class="stat-item">
              <span class="stat-number">15K+</span>
              <span class="stat-label">面试次数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">8.5K+</span>
              <span class="stat-label">服务学生</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">85%</span>
              <span class="stat-label">通过率提升</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { TrendCharts, DataAnalysis, Reading } from '@element-plus/icons-vue'

defineEmits(['start-interview', 'explore-domain', 'scroll-to-section'])
</script>

<style scoped lang="scss">
.app-footer {
  width: 100%;
  margin-top: auto;
}

.footer-background {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="20" cy="80" r="0.5" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
}

.footer-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
  color: white;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-brand {
  .brand-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .brand-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .brand-features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    
    .el-icon {
      color: #667eea;
      font-size: 1.2rem;
    }
  }
}

.footer-links-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.links-column {
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #667eea;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      margin-bottom: 0.75rem;
      
      .el-link {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        
        &:hover {
          color: #667eea;
          transform: translateX(5px);
        }
      }
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright-section {
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    margin: 0;
  }
}

.footer-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  
  .stat-number {
    display: block;
    font-size: 1.2rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }
}

@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .footer-stats {
    justify-content: center;
  }
  
  .brand-features {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>