<template>
  <div class="interview-info-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>面试信息概览</h1>
        <p>查看您的面试记录和基本统计信息</p>
      </div>
      <div class="header-actions">
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="startNewInterview">
          <el-icon><Plus /></el-icon>
          开始新面试
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="statistics-section">
      <div class="stats-grid">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ statistics.totalInterviews }}</h3>
              <p>总面试次数</p>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ statistics.averageScore }}</h3>
              <p>平均得分</p>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ statistics.bestScore }}</h3>
              <p>最佳表现</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 面试记录列表 -->
    <el-card class="interview-list-card">
      <template #header>
        <div class="card-header">
          <h3>
            <el-icon><Calendar /></el-icon>
            面试记录
          </h3>
          <span class="record-count">共 {{ interviewList.length }} 条记录</span>
        </div>
      </template>

      <div v-loading="loading" class="interview-content">
        <!-- 空状态 -->
        <div v-if="interviewList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无面试记录">
            <el-button type="primary" @click="startNewInterview">
              <el-icon><Plus /></el-icon>
              开始面试
            </el-button>
          </el-empty>
        </div>

        <!-- 面试记录列表 -->
        <div v-else class="interview-list">
          <div 
            v-for="interview in interviewList" 
            :key="interview.id"
            class="interview-item"
          >
            <!-- 得分圆圈 -->
            <div class="score-circle" :class="getScoreClass(interview.interviewScore)">
              <span class="score-number">{{ interview.interviewScore }}</span>
            </div>

            <!-- 面试信息 -->
            <div class="interview-info">
              <div class="interview-title">
                <h4>{{ interview.interviewField }} - {{ interview.interviewPosition }}</h4>
                <el-tag :type="getScoreTagType(interview.interviewScore)" size="small">
                  {{ getScoreLabel(interview.interviewScore) }}
                </el-tag>
              </div>
              <div class="interview-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(interview.beginTime) }}
                </span>
                <span class="meta-item">
                  <el-icon><Timer /></el-icon>
                  {{ formatDuration(interview.totalInterviewTime) }}
                </span>
                <span class="meta-item">
                  <el-icon><PriceTag /></el-icon>
                  {{ interview.interviewPositionKeyword }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="interview-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click="viewReport(interview)"
                :loading="detailLoading && selectedReport?.id === interview.id"
              >
                <el-icon><View /></el-icon>
                查看报告
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteInterview(interview)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { interviewStore } from '@/stores/interview'
import { interviewApi } from '@/api/interview'
import { 
  Document, 
  Trophy, 
  Star, 
  Calendar, 
  Clock, 
  Timer, 
  PriceTag, 
  View, 
  Delete, 
  Refresh, 
  Plus 
} from '@element-plus/icons-vue'

// 路由和状态
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const detailLoading = ref(false)
const interviewList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedReport = ref(null)

// 计算统计数据
const statistics = computed(() => {
  const interviews = interviewList.value
  if (interviews.length === 0) {
    return {
      totalInterviews: 0,
      averageScore: '0.0',
      bestScore: '0.0'
    }
  }

  const scores = interviews.map(item => item.interviewScore)
  const totalInterviews = interviews.length
  const averageScore = (scores.reduce((sum, score) => sum + score, 0) / totalInterviews).toFixed(1)
  const bestScore = Math.max(...scores).toFixed(1)

  return {
    totalInterviews,
    averageScore,
    bestScore
  }
})

// 获取面试数据
const fetchInterviewData = async () => {
  loading.value = true
  try {
    const params = {
      username: userStore.userInfo?.username || 'admin',
      page: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await interviewApi.getInterviewList(params)
    
    if (response.data.code === 1) {
      interviewList.value = response.data.data.reports || []
      total.value = response.data.data.total || 0
    } else {
      ElMessage.error('获取报告列表失败：' + (response.data.msg || '未知错误'))
    }
  } catch (error) {
    console.error('获取面试数据失败:', error)
    ElMessage.error('获取面试数据失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 工具函数
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
}

const formatDuration = (seconds) => {
  if (!seconds) return '未知'
  const minutes = Math.floor(seconds / 60)
  return `${minutes}分钟`
}

const getScoreClass = (score) => {
  if (score >= 8) return 'score-excellent'
  if (score >= 6) return 'score-good'
  if (score >= 4) return 'score-average'
  return 'score-poor'
}

const getScoreTagType = (score) => {
  if (score >= 8) return 'success'
  if (score >= 6) return ''
  if (score >= 4) return 'warning'
  return 'danger'
}

const getScoreLabel = (score) => {
  if (score >= 8) return '优秀'
  if (score >= 6) return '良好'
  if (score >= 4) return '一般'
  return '待改进'
}

// 事件处理
const refreshData = () => {
  fetchInterviewData()
}

const startNewInterview = () => {
  router.push('/home/interviews')
}

const viewReport = async (interview) => {
  detailLoading.value = true
  selectedReport.value = interview
  
  try {
    interviewStore.setCurrentReportInfo(interview)
    
    const response = await interviewApi.getDetailReport(interview.id)
    
    if (response.data.code === 1) {
      interviewStore.setDetailReportData(response.data.data)
      router.push('/home/reports')
    } else {
      ElMessage.error('获取详细报告失败：' + (response.data.msg || '未知错误'))
    }
  } catch (error) {
    console.error('获取详细报告失败:', error)
    ElMessage.error('获取详细报告失败，请检查网络连接')
  } finally {
    detailLoading.value = false
    selectedReport.value = null
  }
}

const deleteInterview = async (interview) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条面试记录吗？删除后无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await interviewApi.deleteReport(interview.id)
    
    if (response.data.code === 1) {
      ElMessage.success('删除成功')
      fetchInterviewData()
    } else {
      ElMessage.error('删除失败：' + (response.data.msg || '未知错误'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除面试记录失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 生命周期
onMounted(() => {
  fetchInterviewData()
})
</script>

<style scoped lang="scss">
@import "../assets/styles/variables.scss";

.interview-info-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  overflow-y: auto;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .header-content {
    h1 {
      margin: 0 0 8px 0;
      color: #2d3748;
      font-size: 1.8rem;
      font-weight: 700;
    }

    p {
      margin: 0;
      color: #718096;
      font-size: 0.95rem;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// 统计概览
.statistics-section {
  margin-bottom: 24px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;

    .stat-card {
      border: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px;

        .stat-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stat-info {
          h3 {
            margin: 0 0 4px 0;
            font-size: 2rem;
            font-weight: 700;
            color: #2d3748;
          }

          p {
            margin: 0;
            color: #718096;
            font-size: 0.9rem;
          }
        }
      }
    }
  }
}

// 面试记录卡片
.interview-list-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #2d3748;
      font-size: 1.2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .record-count {
      color: #718096;
      font-size: 0.9rem;
    }
  }
}

.interview-content {
  .empty-state {
    padding: 40px;
    text-align: center;
  }

  .interview-list {
    .interview-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 16px;
      background: white;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: #667eea;
      }

      .score-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        flex-shrink: 0;

        &.score-excellent {
          background: linear-gradient(135deg, #48bb78, #38a169);
        }

        &.score-good {
          background: linear-gradient(135deg, #4299e1, #3182ce);
        }

        &.score-average {
          background: linear-gradient(135deg, #ed8936, #dd6b20);
        }

        &.score-poor {
          background: linear-gradient(135deg, #f56565, #e53e3e);
        }

        .score-number {
          font-size: 1.2rem;
        }
      }

      .interview-info {
        flex: 1;

        .interview-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          h4 {
            margin: 0;
            color: #2d3748;
            font-size: 1.1rem;
            font-weight: 600;
          }
        }

        .interview-meta {
          display: flex;
          gap: 20px;
          color: #718096;
          font-size: 0.9rem;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .interview-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .interview-info-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }

  .interview-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px;

    .interview-info {
      width: 100%;
    }

    .interview-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .interview-meta {
      flex-direction: column;
      gap: 8px !important;
    }
  }
}
</style>
