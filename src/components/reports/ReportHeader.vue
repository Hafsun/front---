<template>
  <div class="report-header">
    <!-- 报告列表视图头部 -->
    <div v-if="!isDetailView" class="list-header">
      <el-card class="header-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <div class="title-section">
                <h1 class="page-title">面试报告分析</h1>
                <!-- 将统计信息移到标题后面，删除本月新增 -->
                <div class="title-stats">
                  <span class="stat-item">总报告数: {{ reportsCount }}</span>
                  <span class="stat-divider">|</span>
                  <span class="stat-item">平均得分: {{ averageScore }}</span>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <el-button 
                type="primary" 
                @click="$emit('view-latest')"
                :disabled="reportsCount === 0"
                :loading="loading"
                class="action-btn primary-btn"
              >
                <el-icon><Document /></el-icon>
                查看最新报告
              </el-button>
              <el-button 
                @click="$emit('refresh')" 
                :loading="loading"
                class="action-btn refresh-btn"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>
      </el-card>
    </div>

    <!-- 详细报告视图头部 -->
    <div v-else class="detail-header">
      <div class="header-left">
        <el-button @click="$emit('back-to-list')" type="text" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <div class="report-title">
          <h2>{{ reportData?.basicInfo?.interviewPosition }} 面试报告</h2>
          <p class="report-subtitle">{{ reportData?.basicInfo?.beginTime }}</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="$emit('export-report')" class="action-btn">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button @click="$emit('share-report')" class="action-btn">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document, Refresh, ArrowLeft, Download, Share } from '@element-plus/icons-vue'

const props = defineProps({
  isDetailView: {
    type: Boolean,
    default: false
  },
  reportsCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  reportData: {
    type: Object,
    default: () => ({})
  },
  reports: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-latest', 'refresh', 'back-to-list', 'export-report', 'share-report'])

const averageScore = computed(() => {
  if (!props.reports || props.reports.length === 0) return 0
  
  const totalScore = props.reports.reduce((sum, report) => {
    // 使用后端返回的interview_score字段
    return sum + (report.interview_score || report.interviewScore || 0)
  }, 0)
  
  return Math.round(totalScore / props.reports.length)
})
</script>

<style lang="scss" scoped>
.report-header {
  margin-bottom: 20px;
}

.list-header {
  .header-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: none;
    
    :deep(.el-card__header) {
      padding: 24px;
      border-bottom: none;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      .title-section {
        .page-title {
          margin: 0 0 12px 0;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
        }
        
        .title-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          
          .stat-item {
            font-size: 16px;
            font-weight: 500;
            color: #409eff;
          }
          
          .stat-divider {
            color: #dcdfe6;
            font-weight: 300;
          }
        }
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      
      .action-btn {
        height: 40px;
        padding: 0 20px;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &.primary-btn {
          background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
          border: none;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
          }
          
          &:disabled {
            background: #c0c4cc;
            transform: none;
            box-shadow: none;
          }
        }
        
        &.refresh-btn {
          border: 1px solid #dcdfe6;
          background: white;
          color: #606266;
          
          &:hover {
            border-color: #409eff;
            color: #409eff;
            transform: translateY(-1px);
          }
        }
      }
    }
  }
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #409eff;
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f0f9ff;
        color: #66b1ff;
      }
    }
    
    .report-title {
      h2 {
        margin: 0 0 4px 0;
        font-size: 24px;
        font-weight: 600;
        color: #1a1a1a;
      }
      
      .report-subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    
    .action-btn {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}
</style>
