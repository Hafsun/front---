<template>
  <div class="overview-bento">
    <div class="bento-title"><el-icon><DataAnalysis /></el-icon> 题库矩阵总览</div>
    <div class="card-container">
      <div class="glass-stat-card" v-for="(item, index) in bankOverviewData" :key="item.type" :class="`theme-${index + 1}`">
        <div class="stat-info">
          <span class="stat-name">{{ item.name }}</span>
          <span class="stat-count">{{ item.count }} <small>Files</small></span>
        </div>
        <el-progress type="dashboard" :width="75" :percentage="item.percentage" class="glow-progress" :color="item.color" />
      </div>

      <div class="glass-stat-card total-card theme-total">
        <div class="stat-info center-info">
          <span class="stat-name">全站资料库</span>
          <span class="stat-count gradient-count">{{ totalCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DataAnalysis } from '@element-plus/icons-vue'
import { questionBankStore } from '@/stores/questionBank'

const bankOverviewData = computed(() => {
  const moduleList = questionBankStore.moduleList
  const frontendTotal = moduleList[0]?.files?.length || 0
  const backendTotal = moduleList[1]?.files?.length || 0
  const fullstackTotal = moduleList[2]?.files?.length || 0
  const total = frontendTotal + backendTotal + fullstackTotal

  return[
    { type: 'frontend', name: '前端生态', count: frontendTotal, percentage: total ? Math.round((frontendTotal/total)*100) : 0, color: '#6A8FF1' },
    { type: 'backend', name: '后端架构', count: backendTotal, percentage: total ? Math.round((backendTotal/total)*100) : 0, color: '#FE728F' },
    { type: 'fullstack', name: '全栈链路', count: fullstackTotal, percentage: total ? Math.round((fullstackTotal/total)*100) : 0, color: '#FF9D66' }
  ]
})
const totalCount = computed(() => bankOverviewData.value.reduce((sum, item) => sum + item.count, 0))
</script>

<style scoped>
/* 弥散光球体 - 营造呼吸感和未来感 */
.ambient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  z-index: 0;
  animation: float 15s infinite alternate ease-in-out;
}
.light-1 {
  width: 400px; height: 400px;
  background: #e0c3fc;
  top: 100px; left: 10px;
}
.light-2 {
  width: 500px; height: 500px;
  background: #8ec5fc;
  bottom: -150px; right: -100px;
  animation-delay: -5s;
}
.overview-bento { margin-bottom: 30px; }
.bento-title { font-size: 18px; font-weight: 700; color: #1d1d1f; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

.card-container { display: flex; gap: 20px; flex-wrap: wrap; }
.glass-stat-card {
  flex: 1; min-width: 200px; height: 130px; border-radius: 20px;
  background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 20px 24px; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center;
  transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.03); position: relative; overflow: hidden;
}
.glass-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }

/* 卡片光效背景 */
.glass-stat-card::before {
  content: ''; position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; border-radius: 50%; filter: blur(40px); opacity: 0.15; z-index: 0;
}
.theme-1::before { background: #6A8FF1; }
.theme-2::before { background: #FE728F; }
.theme-3::before { background: #FF9D66; }
.theme-total::before { background: #B061FF; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; }

.stat-info { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 8px; }
.center-info { align-items: center; justify-content: center; width: 100%; }
.stat-name { font-size: 15px; font-weight: 600; color: #606266; }
.stat-count { font-size: 32px; font-weight: 800; color: #1d1d1f; line-height: 1; }
.stat-count small { font-size: 14px; color: #909399; font-weight: 500; }
.gradient-count { background: linear-gradient(135deg, #B061FF, #6A8FF1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 40px;}

:deep(.glow-progress .el-progress__text) { font-size: 16px !important; font-weight: 800 !important; color: #303133 !important; }
</style>






