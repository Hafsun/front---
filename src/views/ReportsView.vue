<template>
  <div class="reports-view">
    <ReportHeader 
      v-if="!showDetailReport"
      :reports="sortedReports"
      :loading="loading"
      :reports-count="total"
      @start-interview="handleStartInterview"
      @refresh="handleRefresh"
      @view-latest="handleViewLatest"
    />
    
    <ReportList 
      v-if="!showDetailReport"
      :reports="sortedReports"
      :loading="loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @view-report="viewReport"
      @delete-report="deleteReport"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
    
    <div v-if="showDetailReport" class="detail-section">
      <div class="header-section">
        <el-button @click="handleBackToList" type="text" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <div class="title-section">
          <h2>{{ formatReportData.basicInfo.interviewPosition || '面试报告' }}</h2>
          <p class="subtitle">{{ formatReportData.basicInfo.beginTime || '' }}</p>
        </div>
      </div>
      
      <ReportCharts 
        v-if="formatReportData"
        :report-data="formatReportData"
        :show-emotion-percentage="showEmotionPercentage"
        @back="handleBackToList"
        @toggle-emotion-percentage="handleToggleEmotionPercentage"
      />
      
      <ReportAnalysis 
        v-if="formatReportData"
        :report-data="formatReportData"
      />
      
      <div v-if="formatReportData" class="actions-section">
        <el-button 
          type="primary" 
          @click="handleSaveReport"
          :loading="isSaving"
          :disabled="isSaving"
        >
          {{ isSaving ? '保存中...' : '保存报告' }}
        </el-button>
        <el-button @click="handleExportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button @click="handleShareReport">
          <el-icon><Share /></el-icon>
          分享报告
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Download, Share } from '@element-plus/icons-vue'
import ReportHeader from '@/components/reports/ReportHeader.vue'
import ReportList from '@/components/reports/ReportList.vue'
import ReportCharts from '@/components/reports/ReportCharts.vue'
import ReportAnalysis from '@/components/reports/ReportAnalysis.vue'
import { interviewApi } from '@/api/interview'
import { interviewStore } from '@/stores/interview'
import { deriveDurationSeconds, getAccuracyEvaluation, getAccuracyScore, toNumber } from '@/utils/report'


const router = useRouter()
const reports = ref([])
const loading = ref(false)
const showDetailReport = ref(false)
const currentReport = ref(null)
const showEmotionPercentage = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isSaving = ref(false)
const detailLoading = ref(false)

onMounted(() => {
  console.log('[ReportsView] 页面已挂载，开始获取报告数据')
  fetchReports()
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 新增：抑制 ResizeObserver 特定错误
  window.addEventListener('error', handleResizeObserverError, true)
  window.addEventListener('unhandledrejection', handleResizeObserverRejection)
})
onUnmounted(() => {
  try {
    if (interviewStore.timerRef) {
      clearInterval(interviewStore.timerRef)
    }
  } catch (error) {
    console.error('Error during component cleanup:', error)
  }
  
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // 新增：移除错误监听
  window.removeEventListener('error', handleResizeObserverError, true)
  window.removeEventListener('unhandledrejection', handleResizeObserverRejection)
})
// 新增：处理 ResizeObserver 错误的函数
const handleResizeObserverError = (event) => {
  if (event.message && event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    // 抑制该错误的传播
    event.preventDefault()
    event.stopPropagation()
  }
}

// 新增：处理未捕获的 Promise  rejection
const handleResizeObserverRejection = (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.preventDefault()
  }
}
const formatReportData = computed(() => {
  if (!currentReport.value) return null
  
  const report = currentReport.value
  console.log('[v0] formatReportData - 原始报告数据:', JSON.stringify(report, null, 2))
  
  // 处理后端返回的嵌套数据结构
  const overallReport = report.overall_report || {}
  const summary = overallReport.summary || {}
  const keyIssues = overallReport.key_issues || {}
  const roundAnalysis = overallReport.round_analysis || []
  const roundDetails = overallReport.roundDetails || []
  const overallIntegratedScore = overallReport.overallIntegratedScore || {}
  const overallExpressionInfo = overallReport.overallExpressionInfo || {}
  
  console.log('[v0] formatReportData - 解析的数据结构:', {
    summary: summary,
    keyIssues: keyIssues,
    roundAnalysisLength: roundAnalysis.length,
    roundDetailsLength: roundDetails.length
  })
  
  const formattedData = {
    basicInfo: {
      interviewPosition: report.interview_position || '未知职位',
      interviewField: report.interview_field || '未知领域',
      beginTime: report.beginTime || '',
      username: report.username || '匿名',
      interviewScore: toNumber(report.interview_score ?? report.interviewScore, 0),
      totalInterviewTime: deriveDurationSeconds({
        totalInterviewTime: report.totalInterviewTime ?? report.total_interview_time ?? report.totalInterviewSeconds,
        beginTime: report.beginTime ?? report.begin_time,
        endTime: report.endTime ?? report.end_time,
      }),
      keywords: report.interview_position_keyword || ''
    },
    summary: {
      performance_overview: summary.performance_overview || '暂无总体评价',
      average_accuracy_score: summary.average_accuracy_score || '0',
      expression_pattern: summary.expression_pattern || '暂无表情分析'
    },
    topPerformance: keyIssues.top_performance || [],
    weakPerformance: keyIssues.weak_performance || [],
    roundAnalysis: roundAnalysis.map((round, index) => {
      const ae = getAccuracyEvaluation(round) || {}
      const score = getAccuracyScore(round)
      return {
        ...round,
        round_number: round.round_number || (index + 1),
        accuracy_evaluation: {
          ...ae,
          matching_degree: ae.matching_degree ?? ae.matchingDegree ?? '',
          logical_rigor: ae.logical_rigor ?? ae.logicalRigor ?? '',
          technical_correctness: ae.technical_correctness ?? ae.technicalCorrectness ?? '',
          completeness: ae.completeness ?? '',
          score,
        },
      }
    }),
    roundDetails: roundDetails,
    overallIntegratedScore: overallIntegratedScore,
    overallExpressionInfo: overallExpressionInfo
  }
  
  console.log('[v0] formatReportData - 格式化后的数据:', JSON.stringify(formattedData, null, 2))
  console.log('[v0] formatReportData - topPerformance:', formattedData.topPerformance)
  console.log('[v0] formatReportData - weakPerformance:', formattedData.weakPerformance)
  console.log('[v0] formatReportData - roundAnalysis:', formattedData.roundAnalysis)
  
  return formattedData
})

const sortedReports = computed(() => {
  if (!reports.value || reports.value.length === 0) return []
  
  return [...reports.value].sort((a, b) => {
    const timeA = new Date(a.beginTime || a.createTime || 0)
    const timeB = new Date(b.beginTime || b.createTime || 0)
    return timeB - timeA // 降序排列，最新的在前面
  })
})

const handleBackToList = () => {
  showDetailReport.value = false
}

const handleStartInterview = () => {
  router.push('/home/interviews')
}

const handleToggleEmotionPercentage = (value) => {
  showEmotionPercentage.value = value
}

const handlePageChange = (page) => {
  if (page === currentPage.value) return
  currentPage.value = page
  fetchReports()
}

const handleSizeChange = (size) => {
  if (size === pageSize.value) return
  pageSize.value = size
  currentPage.value = 1
  fetchReports()
}

const handleSaveReport = async () => {
  if (isSaving.value) return
  
  try {
    isSaving.value = true
    const result = await interviewStore.saveReport()
    
    if (result.success) {
      ElMessage.success('报告保存成功！')
    } else {
      throw new Error(result.message || '保存失败')
    }
  } catch (error) {
    console.error('保存报告失败:', error)
    ElMessage.error(`保存失败: ${error.message || '未知错误'}`)
  } finally {
    isSaving.value = false
  }
}

const handleExportReport = () => {
  try {
    const reportData = formatReportData.value
    if (!reportData) {
      ElMessage.warning('没有可导出的报告数据')
      return
    }
    
    const exportContent = {
      基本信息: {
        面试职位: reportData.basicInfo.interviewPosition,
        面试领域: reportData.basicInfo.interviewField,
        面试时间: reportData.basicInfo.beginTime,
        用户名: reportData.basicInfo.username,
        面试得分: reportData.basicInfo.interviewScore,
        面试时长: reportData.basicInfo.totalInterviewTime,
        关键词: reportData.basicInfo.keywords
      },
      总体评价: reportData.summary.performance_overview,
      平均准确度得分: reportData.summary.average_accuracy_score,
      表情分析: reportData.summary.expression_pattern,
      优秀表现: reportData.topPerformance,
      待改进表现: reportData.weakPerformance,
      轮次分析: reportData.roundAnalysis,
      轮次详情: reportData.roundDetails,
      综合评分: reportData.overallIntegratedScore,
      表情信息: reportData.overallExpressionInfo
    }
    
    const dataStr = JSON.stringify(exportContent, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `面试报告_${reportData.basicInfo.interviewPosition}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('报告导出成功')
  } catch (error) {
    console.error('导出报告失败:', error)
    ElMessage.error('导出失败')
  }
}

const handleShareReport = async () => {
  try {
    const reportData = formatReportData.value
    if (!reportData) {
      ElMessage.warning('没有可分享的报告数据')
      return
    }
    
    const shareText = `面试报告分享\n职位：${reportData.basicInfo.interviewPosition}\n领域：${reportData.basicInfo.interviewField}\n得分：${reportData.basicInfo.interviewScore}分\n时长：${reportData.basicInfo.totalInterviewTime}秒`
    
    if (navigator.share) {
      await navigator.share({
        title: '面试报告',
        text: shareText,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(shareText)
      ElMessage.success('报告内容已复制到剪贴板')
    }
  } catch (error) {
    console.error('分享报告失败:', error)
    ElMessage.error('分享失败')
  }
}

const viewReport = async (report) => {
  if (!report || !report.id) {
    ElMessage.error('报告数据无效')
    return
  }
  
  try {
    detailLoading.value = true
    
    console.log('[v0] ========== 开始查看报告详情 ==========')
    console.log('[v0] 传入的报告对象:', JSON.stringify(report, null, 2))
    console.log('[v0] 报告ID:', report.id)
    console.log('[v0] 即将调用后端接口: /report/getReport/' + report.id)
    
    interviewStore.setCurrentReportInfo(report)
    
    console.log('[v0] 正在调用 interviewApi.getDetailReport...')
    const response = await interviewApi.getDetailReport(report.id)
    
    console.log('[v0] ========== 后端响应详情 ==========')
    console.log('[v0] 完整响应对象:', JSON.stringify(response, null, 2))
    console.log('[v0] 响应状态码:', response?.status)
    console.log('[v0] 响应数据结构:', {
      hasData: !!response?.data,
      dataKeys: response?.data ? Object.keys(response.data) : [],
      code: response?.data?.code,
      msg: response?.data?.msg,
      hasDataField: !!response?.data?.data
    })
    
    if (response?.data?.data) {
      const backendData = response.data.data
      console.log('[v0] 后端返回的报告数据:', JSON.stringify(backendData, null, 2))
      console.log('[v0] 后端数据字段分析:', {
        beginTime: backendData.beginTime,
        username: backendData.username,
        interview_field: backendData.interview_field,
        interview_position: backendData.interview_position,
        interview_position_keyword: backendData.interview_position_keyword,
        interview_score: backendData.interview_score,
        hasOverallReport: !!backendData.overall_report,
        overallReportKeys: backendData.overall_report ? Object.keys(backendData.overall_report) : []
      })
      
      if (backendData.overall_report) {
        console.log('[v0] overall_report 详细结构:', {
          hasSummary: !!backendData.overall_report.summary,
          hasKeyIssues: !!backendData.overall_report.key_issues,
          hasRoundAnalysis: !!backendData.overall_report.round_analysis,
          roundAnalysisLength: backendData.overall_report.round_analysis ? backendData.overall_report.round_analysis.length : 0,
          hasRoundDetails: !!backendData.overall_report.roundDetails,
          roundDetailsLength: backendData.overall_report.roundDetails ? backendData.overall_report.roundDetails.length : 0
        })
      }
    }
    
    if (response?.data?.code === 1) {
      console.log('[v0] 后端返回成功，开始处理数据...')
      
      interviewStore.setDetailReportData(response.data.data)
      
      // 直接使用后端返回的数据，不再合并原始report数据
      const reportData = {
        id: report.id,
        ...response.data.data
      }
      
      console.log('[v0] 最终报告数据:', JSON.stringify(reportData, null, 2))
      
      currentReport.value = reportData
      showDetailReport.value = true
      
      console.log('[v0] 设置 currentReport.value 完成')
      console.log('[v0] 设置 showDetailReport.value = true')
      
      await nextTick()
      console.log('[v0] nextTick 完成，页面应该已切换到详情视图')
    } else {
      console.log('[v0] 后端返回失败，错误信息:', response?.data?.msg)
      throw new Error(response?.data?.msg || '获取详细报告失败')
    }
  } catch (error) {
    console.error('[v0] ========== 查看报告失败 ==========')
    console.error('[v0] 错误对象:', error)
    console.error('[v0] 错误消息:', error.message)
    console.error('[v0] 错误堆栈:', error.stack)
    
    if (error.response) {
      console.error('[v0] HTTP响应错误:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    if (error.request) {
      console.error('[v0] 请求错误:', error.request)
    }
    
    let errorMessage = '查看报告失败'
    if (error.message.includes('网络连接失败')) {
      errorMessage = 'Go 后端服务连接失败，请确认服务是否启动'
    } else {
      errorMessage = `查看报告失败: ${error.message}`
    }
    
    console.error('[v0] 最终错误消息:', errorMessage)
    ElMessage.error(errorMessage)
  } finally {
    detailLoading.value = false
    console.log('[v0] ========== 查看报告流程结束 ==========')
  }
}

const deleteReport = async (report) => {
  if (!report || !report.id) {
    ElMessage.error('报告数据无效')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除这份报告吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteReportById(report.id)
    ElMessage.success('删除成功')
    await fetchReports()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除报告失败:', error)
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

const fetchReports = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }

    console.log('[ReportsView] 开始获取报告列表，参数:', params)
    console.log('[ReportsView] Go 后端地址:', 'http://localhost:18082/api/')
    
    const response = await interviewApi.getInterviewList(params)
    
    console.log('[ReportsView] API响应:', response)
    
    if (response?.data?.code === 1) {
      const data = response.data.data || {}
      reports.value = Array.isArray(data.reports)
        ? data.reports.map((r) => {
            const beginTime = r.beginTime ?? r.begin_time ?? r.createTime ?? r.create_time ?? ''
            const endTime = r.endTime ?? r.end_time ?? ''
            const totalInterviewTime = deriveDurationSeconds({
              totalInterviewTime: r.totalInterviewTime ?? r.total_interview_time ?? r.totalInterviewSeconds,
              beginTime,
              endTime,
            })

            return {
              ...r,
              beginTime,
              interviewField: r.interviewField ?? r.interview_field ?? '',
              interviewPosition: r.interviewPosition ?? r.interview_position ?? '',
              interviewPositionKeyword: r.interviewPositionKeyword ?? r.interview_position_keyword ?? r.keywords ?? '',
              interviewScore: toNumber(r.interviewScore ?? r.interview_score, 0),
              totalInterviewTime,
            }
          })
        : []
      total.value = Number(data.total) || 0
      
      console.log('[ReportsView] 成功获取报告列表:', {
        报告数量: reports.value.length,
        总数: total.value,
        当前页: currentPage.value
      })
    } else {
      const errorMsg = response?.data?.msg || '获取报告列表失败'
      console.error('[ReportsView] 后端返回错误:', errorMsg)
      ElMessage.error(errorMsg)
      reports.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('[ReportsView] 获取报告列表失败:', error)
    
    let errorMessage = '获取报告列表失败'
    if (error.message.includes('网络连接失败')) {
      errorMessage = 'Go 后端服务连接失败，请确认服务是否启动 (localhost:18082)'
    } else if (error.message.includes('API接口不存在')) {
      errorMessage = 'API接口不存在，请检查后端路由配置'
    } else {
      errorMessage = `获取报告列表失败: ${error.message}`
    }
    
    ElMessage.error(errorMessage)
    reports.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const deleteReportById = async (reportId) => {
  if (!reportId) {
    throw new Error('报告ID无效')
  }

  try {
    const response = await interviewApi.deleteReport(reportId)
    
    if (response?.data?.code === 1) {
      return true
    } else {
      throw new Error(response?.data?.msg || '删除报告失败')
    }
  } catch (error) {
    console.error('删除报告API调用失败:', error)
    throw error
  }
}

const handleRefresh = async () => {
  console.log('[ReportsView] 手动刷新报告列表')
  
  // 重置分页到第一页
  currentPage.value = 1
  
  // 清空当前数据
  reports.value = []
  total.value = 0
  
  // 重新获取数据
  await fetchReports()
  
  ElMessage.success('刷新完成')
}

const handleViewLatest = async () => {
  if (sortedReports.value.length > 0) {
    const latestReport = sortedReports.value[0]
    console.log('[ReportsView] 查看最新报告:', latestReport)
    await viewReport(latestReport)
  } else {
    ElMessage.warning('暂无报告数据')
  }
}

watch(showDetailReport, (newVal) => {
  if (!newVal) {
    currentReport.value = null
    interviewStore.clearDetailReportData()
  }
})

watch(() => interviewStore.finalReportData, (newData) => {
  try {
    if (newData) {
      console.log('Report data updated in store:', newData)
    }
  } catch (error) {
    console.error('Error watching store data:', error)
  }
}, { deep: true })

const handleVisibilityChange = () => {
  if (!document.hidden) {
    console.log('[ReportsView] 页面重新可见，刷新报告数据')
    fetchReports()
  }
}

onMounted(() => {
  console.log('[ReportsView] 页面已挂载，开始获取报告数据')
  fetchReports()
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  try {
    if (interviewStore.timerRef) {
      clearInterval(interviewStore.timerRef)
    }
  } catch (error) {
    console.error('Error during component cleanup:', error)
  }
  
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style lang="scss" scoped>
@import '@/styles/reports/index.scss';

.reports-view {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #409eff;
  
  &:hover {
    color: #66b1ff;
  }
}

.title-section {
  flex: 1;
  margin-left: 20px;
  
  h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
  }
  
  .subtitle {
    margin: 5px 0 0 0;
    font-size: 14px;
    color: #909399;
  }
}

.actions-section {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
