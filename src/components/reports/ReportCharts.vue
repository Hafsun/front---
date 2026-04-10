<template>
  <div class="report-charts">
    <!-- 概览卡片区域 -->
    <div class="overview-section">
      <div class="overview-cards">
        <!-- 综合评分卡片 -->
        <div class="score-card elegant-score-card" :class="scoreClass">
          <div class="card-header">
            <h3>综合评分</h3>
          </div>
          <div class="score-display-container">
            <div class="circular-progress">
              <svg class="progress-ring" width="160" height="160">
                <defs>
                  <linearGradient :id="`scoreGradient-${scoreClass}`" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" :stop-color="getScoreGradientStart" />
                    <stop offset="100%" :stop-color="getScoreGradientEnd" />
                  </linearGradient>
                </defs>
                <circle
                  class="progress-ring-background"
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="#f1f5f9"
                  stroke-width="8"
                />
                <circle
                  class="progress-ring-progress"
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  :stroke="`url(#scoreGradient-${scoreClass})`"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeDashoffset"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div class="score-content">
                <div class="score-number">{{ interviewScore }}</div>
                <div class="score-label">综合得分</div>
                <div class="score-percentage">{{ Math.round((interviewScore / 100) * 100) }}%</div>
              </div>
            </div>
          </div>
          <div class="score-description-elegant">
            <div class="description-text">{{ scoreDescription }}</div>
            <div class="score-level-indicator">
              <div class="level-dots">
                <span class="dot" :class="{ active: interviewScore >= 20 }"></span>
                <span class="dot" :class="{ active: interviewScore >= 40 }"></span>
                <span class="dot" :class="{ active: interviewScore >= 60 }"></span>
                <span class="dot" :class="{ active: interviewScore >= 80 }"></span>
                <span class="dot" :class="{ active: interviewScore >= 95 }"></span>
              </div>
              <div class="level-labels">
                <span>差</span>
                <span>一般</span>
                <span>良好</span>
                <span>优秀</span>
                <span>卓越</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 面试时长卡片 -->
        <div class="time-card gradient-card">
          <div class="card-header">
            <h3>面试时长</h3>
            <div class="time-icon">⏱️</div>
          </div>
          <div class="time-display">
            <span class="time-number">{{ formattedTime }}</span>
          </div>
          <div class="time-description">
            总计 {{ roundStatistics?.totalRounds || 0 }} 轮问答
          </div>
        </div>

        <!-- 表现统计卡片 -->
        <div class="stats-card gradient-card">
          <div class="card-header">
            <h3>表现统计</h3>
            <div class="stats-icon">📈</div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">最高分</span>
              <span class="stat-value excellent">{{ roundStatistics?.highestScore || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均分</span>
              <span class="stat-value good">{{ roundStatistics?.averageScore || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最低分</span>
              <span class="stat-value poor">{{ roundStatistics?.lowestScore || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 情感状态卡片 -->
        <div class="emotion-card gradient-card">
          <div class="card-header">
            <h3>情感状态</h3>
            <div class="emotion-icon">😊</div>
          </div>
          <div class="emotion-summary">
            <div class="dominant-emotion">
              包含情绪: 
              <div class="emotion-tags">
                <span 
                  v-for="(emotion, index) in roundEmotions" 
                  :key="index"
                  class="emotion-tag"
                  :title="`第${index + 1}轮: ${emotion}`"
                >
                  {{ emotion }}
                </span>
              </div>
            </div>
            <div class="emotion-pattern">
              {{ reportData?.summary?.expression_pattern }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完全重构图表分析区域，使用ECharts组件库 -->
    <div class="charts-section">
      <!-- 综合能力雷达图 -->
      <div class="chart-row">
        <div class="chart-container">
          <div class="chart-header">
            <h3>综合能力分析</h3>
            <div class="chart-controls">
              <button 
                :class="{ active: radarViewMode === '2d' }" 
                @click="radarViewMode = '2d'"
                class="toggle-btn"
              >
                2D雷达图
              </button>
              <button 
                :class="{ active: radarViewMode === '3d' }" 
                @click="radarViewMode = '3d'"
                class="toggle-btn"
              >
                3D柱状图
              </button>
              <button 
                @click="openChartModal('radar')"
                class="expand-btn"
                title="全屏查看"
              >
                🔍
              </button>
            </div>
          </div>
          <div class="chart-wrapper">
            <EChartsRadarChart 
              v-if="radarViewMode === '2d'"
              :option="radarChartOption" 
              class="chart"
            />
            <ECharts3DBarChart 
              v-else
              :option="radar3DChartOption" 
              class="chart"
            />
          </div>
        </div>
        <div class="chart-analysis">
          <div class="analysis-header">
            <h4>能力分析报告</h4>
          </div>
          <div class="analysis-content">
            <div class="metric-item" v-for="metric in radarMetrics" :key="metric.key">
              <span class="metric-label">{{ metric.label }}</span>
              <div class="metric-details">
                <span class="metric-score">{{ getRadarMetricScore(metric.key) }}分</span>
                <span class="metric-desc">{{ getRadarMetricDescription(metric.key) }}</span>
              </div>
            </div>
            <div class="overall-analysis">
              <p><strong>综合评价：</strong>{{ overallRadarAnalysis }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 情感分布分析 -->
      <div class="chart-row">
        <div class="chart-container">
          <div class="chart-header">
            <h3>情感分布分析</h3>
            <div class="chart-controls">
              <button 
                :class="{ active: emotionViewMode === 'pie' }" 
                @click="emotionViewMode = 'pie'"
                class="toggle-btn"
              >
                饼图
              </button>
              <button 
                :class="{ active: emotionViewMode === 'bar' }" 
                @click="emotionViewMode = 'bar'"
                class="toggle-btn"
              >
                柱状图
              </button>
              <button 
                @click="openChartModal('emotion')"
                class="expand-btn"
                title="全屏查看"
              >
                🔍
              </button>
            </div>
          </div>
          <div class="chart-wrapper">
            <EChartsPieChart 
              v-if="emotionViewMode === 'pie'"
              :option="emotionPieChartOption" 
              class="chart"
            />
            <EChartsBarChart 
              v-else
              :option="emotionBarChartOption" 
              class="chart"
            />
          </div>
        </div>
        <div class="chart-analysis">
          <div class="analysis-header">
            <h4>情感状态深度分析</h4>
          </div>
          <div class="analysis-content">
            <div class="emotion-stats">
              <div v-for="emotion in emotionStats" :key="emotion.name" class="emotion-item">
                <div class="emotion-info">
                  <span class="emotion-name">{{ emotion.name }}</span>
                  <span class="emotion-percent">{{ emotion.percent }}%</span>
                </div>
                <div class="emotion-bar">
                  <div class="emotion-fill" :style="{ width: emotion.percent + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="emotion-insights">
              <p><strong>主导情绪：</strong>{{ dominantEmotion }}</p>
              <p><strong>情绪稳定性：</strong>{{ emotionStability }}</p>
              <p><strong>建议：</strong>{{ emotionSuggestion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 准确度与完整度分析 -->
      <div class="chart-row">
        <div class="chart-container">
          <div class="chart-header">
            <h3>准确度与完整度分析</h3>
            <div class="chart-controls">
              <button 
                :class="{ active: accuracyViewType === 'combined' }" 
                @click="accuracyViewType = 'combined'"
                class="toggle-btn"
              >
                综合分析
              </button>
              <button 
                :class="{ active: accuracyViewType === 'scatter' }" 
                @click="accuracyViewType = 'scatter'"
                class="toggle-btn"
              >
                散点分析
              </button>
              <button 
                @click="openChartModal('accuracy')"
                class="expand-btn"
                title="全屏查看"
              >
                🔍
              </button>
            </div>
          </div>
          <div class="chart-wrapper">
            <EChartsBarChart 
              v-if="accuracyViewType === 'combined'"
              :option="accuracyBarChartOption" 
              class="chart"
            />
            <EChartsScatterChart 
              v-else
              :option="accuracyScatterChartOption" 
              class="chart"
            />
          </div>
        </div>
        <div class="chart-analysis">
          <div class="analysis-header">
            <h4>准确度详细分析</h4>
          </div>
          <div class="analysis-content">
            <div class="accuracy-summary">
              <p><strong>平均准确度：</strong>{{ getAccuracyAverage }}分</p>
              <p><strong>最佳表现：</strong>第{{ getBestRound }}轮 ({{ getBestScore }}分)</p>
              <p><strong>最弱表现：</strong>第{{ getWorstRound }}轮 ({{ getWorstScore }}分)</p>
              <p><strong>分析建议：</strong>{{ getAccuracyAnalysis }}</p>
            </div>
            <div class="performance-insights">
              <h5>表现亮点</h5>
              <ul>
                <li v-for="highlight in topPerformanceHighlights" :key="highlight">
                  {{ highlight }}
                </li>
              </ul>
              <h5>改进建议</h5>
              <ul>
                <li v-for="weakness in weaknessAnalysis" :key="weakness">
                  {{ weakness }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加图表模态框组件 -->
    <ChartModal
      :is-visible="modalVisible"
      :chart-option="modalChartOption"
      :chart-title="modalChartTitle"
      @close="closeChartModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EChartsRadarChart from '@/components/ECharts/EChartsRadarChart.vue'
import ECharts3DBarChart from '@/components/ECharts/ECharts3DBarChart.vue'
// import EChartsLineChart from '@/components/ECharts/EChartsLineChart.vue'
import EChartsPieChart from '@/components/ECharts/EChartsPieChart.vue'
import EChartsBarChart from '@/components/ECharts/EChartsBarChart.vue'
import EChartsScatterChart from '@/components/ECharts/EChartsScatterChart.vue'
import ChartModal from '@/components/ECharts/ChartModal.vue'
import { formatDurationMinSec, getAccuracyScore } from '@/utils/report'

const props = defineProps({
  reportData: {
    type: Object,
    default: () => ({}),
  },
  showEmotionPercentage: {
    type: Boolean,
    default: true,
  },
})

const radarViewMode = ref('2d')
const trendViewMode = ref('2d')
const emotionViewMode = ref('pie')
const accuracyViewType = ref('combined')
const currentMetricType = ref('performance')
const modalVisible = ref(false)
const modalChartOption = ref({})
const modalChartTitle = ref('')

// 雷达图指标配置
const radarMetrics = [
  { key: 'major', label: '专业知识' },
  { key: 'expression', label: '表达能力' },
  { key: 'logic', label: '逻辑思维' },
  { key: 'strain', label: '应变能力' },
  { key: 'stable', label: '情绪稳定' },
]

const trendMetricsConfig = ref({
  // 综合评分指标
  major: { 
    name: '专业知识', 
    color: '#667eea', 
    visible: true, 
    type: 'performance',
    description: '专业技能和知识掌握程度'
  },
  expression: { 
    name: '表达能力', 
    color: '#764ba2', 
    visible: true, 
    type: 'performance',
    description: '语言表达和沟通能力'
  },
  logic: { 
    name: '逻辑思维', 
    color: '#f093fb', 
    visible: true, 
    type: 'performance',
    description: '逻辑分析和推理能力'
  },
  stable: { 
    name: '情绪稳定', 
    color: '#4facfe', 
    visible: true, 
    type: 'performance',
    description: '情绪控制和心理稳定性'
  },
  strain: { 
    name: '应变能力', 
    color: '#f5576c', 
    visible: true, 
    type: 'performance',
    description: '压力应对和适应能力'
  },
  // 表情信息指标
  concentration: { 
    name: '专注度', 
    color: '#43e97b', 
    visible: false, 
    type: 'expression',
    description: '注意力集中程度'
  },
  confidence: { 
    name: '自信度', 
    color: '#38f9d7', 
    visible: false, 
    type: 'expression',
    description: '自信心和确定性表现'
  },
  doubt: { 
    name: '疑虑度', 
    color: '#ffeaa7', 
    visible: false, 
    type: 'expression',
    description: '犹豫和不确定性表现'
  },
  happy: { 
    name: '愉悦度', 
    color: '#fd79a8', 
    visible: false, 
    type: 'expression',
    description: '积极情绪和愉快程度'
  },
  nervous: { 
    name: '紧张度', 
    color: '#fdcb6e', 
    visible: false, 
    type: 'expression',
    description: '紧张和焦虑程度'
  }
})

const interviewScore = computed(() => {
  const score = props.reportData?.basicInfo?.interviewScore || 0
  return Math.round(score)
})

const scoreClass = computed(() => {
  const score = interviewScore.value
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-average'
  return 'score-poor'
})

const scoreDescription = computed(() => {
  const score = interviewScore.value
  if (score >= 90) return '表现卓越'
  if (score >= 80) return '表现优秀'
  if (score >= 60) return '表现良好'
  return '需要改进'
})

const formattedTime = computed(() => {
  return formatDurationMinSec(props.reportData?.basicInfo?.totalInterviewTime)
})

const roundEmotions = computed(() => {
  if (!props.reportData?.roundAnalysis) return []
  
  return props.reportData.roundAnalysis
    .map(round => round.expression_analysis?.dominant_emotion)
    .filter(emotion => emotion)
})

const emotionStats = computed(() => {
  if (!props.reportData?.overallExpressionInfo) return []

  const emotionData = props.reportData.overallExpressionInfo
  const emotions = [
    { name: '专注', value: emotionData.concentration || 0, color: '#43e97b' },
    { name: '自信', value: emotionData.confidence || 0, color: '#38f9d7' },
    { name: '愉悦', value: emotionData.happiness || 0, color: '#fd79a8' },
    { name: '疑虑', value: emotionData.doubtfulness || 0, color: '#ffeaa7' },
    { name: '紧张', value: emotionData.nervousness || 0, color: '#fdcb6e' }
  ]

  const total = emotions.reduce((sum, emotion) => sum + emotion.value, 0)
  return emotions
    .map(emotion => ({
      ...emotion,
      percent: total > 0 ? Math.round((emotion.value / total) * 100) : 0
    }))
    .filter(emotion => emotion.value > 0)
    .sort((a, b) => b.value - a.value)
})

const roundStatistics = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) return { totalRounds: 0, highestScore: 0, averageScore: 0, lowestScore: 0 }

  const scores = roundData.map(round => getAccuracyScore(round))
  const sum = scores.reduce((acc, v) => acc + v, 0)
  return {
    totalRounds: roundData.length,
    highestScore: scores.length ? Math.max(...scores) : 0,
    averageScore: scores.length ? Math.round((sum / scores.length) * 10) / 10 : 0,
    lowestScore: scores.length ? Math.min(...scores) : 0,
  }
})

const radarData = computed(() => {
  if (props.reportData?.overallIntegratedScore) {
    const data = props.reportData.overallIntegratedScore
    return {
      major: data.major || 0,
      expression: data.expression || 0,
      logic: data.logic || 0,
      strain: 100 - (data.strain || 0), // strain是压力值，需要反转
      stable: data.stable || 0,
    }
  }
  
  // 默认数据
  return {
    major: 75,
    expression: 70,
    logic: 80,
    strain: 65,
    stable: 75,
  }
})

const trendData = computed(() => {
  console.log('[v0] Processing trendData, reportData:', props.reportData)
  
  if (!props.reportData?.roundDetails || !Array.isArray(props.reportData.roundDetails)) {
    console.log('[v0] No roundDetails available')
    return []
  }
  
  const processedData = props.reportData.roundDetails.map((round) => {
    const roundNumber = round.round_number
    const integratedScore = round.integrated_score || {}
    const expressionInfo = round.expression_info || {}
    
    const processedRound = {
      round: roundNumber,
      roundName: `第${roundNumber}轮`,
      // 综合评分数据
      major: Number(integratedScore.major) || 0,
      expression: Number(integratedScore.expression) || 0,
      logic: Number(integratedScore.logic) || 0,
      stable: Number(integratedScore.stable) || 0,
      strain: Number(integratedScore.strain) || 0,
      // 表情信息数据
      concentration: Number(expressionInfo.concentration) || 0,
      confidence: Number(expressionInfo.confidence) || 0,
      doubt: Number(expressionInfo.doubt) || 0,
      happy: Number(expressionInfo.happy) || 0,
      nervous: Number(expressionInfo.nervous) || 0,
    }
    
    console.log('[v0] Processed round:', processedRound)
    return processedRound
  })
  
  console.log('[v0] Final processed trendData:', processedData)
  return processedData
})

const visibleTrendMetrics = computed(() => {
  return Object.fromEntries(
    Object.entries(trendMetricsConfig.value).filter(([config]) => 
      config.type === currentMetricType.value
    )
  )
})

const radarChartOption = computed(() => {
  const data = radarData.value
  return {
    title: {
      text: '综合能力雷达图',
      left: 'center',
      textStyle: { color: '#333', fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}分'
    },
    radar: {
      indicator: radarMetrics.map(metric => ({
        name: metric.label,
        max: 100
      })),
      center: ['50%', '55%'],
      radius: '70%',
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: '#e0e0e0' }
      },
      axisLine: {
        lineStyle: { color: '#ccc' }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [data.major, data.expression, data.logic, data.strain, data.stable],
        name: '综合能力',
        areaStyle: {
          color: 'rgba(102, 126, 234, 0.3)'
        },
        lineStyle: {
          color: '#667eea',
          width: 3
        },
        itemStyle: {
          color: '#667eea',
          borderWidth: 2,
          borderColor: '#fff'
        }
      }]
    }]
  }
})

const radar3DChartOption = computed(() => {
  const data = radarData.value
  const chartData = radarMetrics.map((metric, index) => [
    index, 0, data[metric.key], metric.label
  ])

  return {
    title: {
      text: '3D综合能力分析',
      left: 'center',
      textStyle: { color: '#333', fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      formatter: function(params) {
        return `${params.data[3]}: ${params.data[2]}分`
      }
    },
    visualMap: {
      max: 100,
      min: 0,
      dimension: 2,
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027']
      }
    },
    xAxis3D: {
      type: 'category',
      data: radarMetrics.map(m => m.label),
      name: '能力维度'
    },
    yAxis3D: {
      type: 'value',
      name: '评估'
    },
    zAxis3D: {
      type: 'value',
      name: '分数',
      min: 0,
      max: 100
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      boxHeight: 100,
      viewControl: {
        autoRotate: true,
        autoRotateSpeed: 10
      }
    },
    series: [{
      type: 'bar3D',
      data: chartData,
      shading: 'lambert'
    }]
  }
})

const trendChartOption = computed(() => {
  const data = trendData.value
  console.log('[v0] Building trendChartOption with data:', data)
  
  if (!data || data.length === 0) {
    console.log('[v0] No data available for trend chart')
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { 
          color: '#999', 
          fontSize: 16 
        }
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无趋势数据',
          fontSize: 14,
          fill: '#999'
        }
      }
    }
  }

  // 获取当前可见的指标
  const visibleMetrics = Object.entries(visibleTrendMetrics.value).filter(([, config]) => config.visible)
  
  console.log('[v0] Visible metrics:', visibleMetrics)

  if (visibleMetrics.length === 0) {
    return {
      title: {
        text: '请选择要显示的指标',
        left: 'center',
        top: 'center',
        textStyle: { 
          color: '#999', 
          fontSize: 16 
        }
      }
    }
  }

  // 构建系列数据
  const series = visibleMetrics.map(([key, config]) => {
    const seriesData = data.map(item => {
      const value = item[key]
      console.log('[v0] Series data point:', key, value)
      return value
    })
    
    console.log('[v0] Complete series data for', key, ':', seriesData)
    
    return {
      name: config.name,
      type: 'line',
      data: seriesData,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: config.color
      },
      itemStyle: {
        color: config.color,
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: config.color + '40' },
            { offset: 1, color: config.color + '10' }
          ]
        }
      }
    }
  })

  const xAxisData = data.map(item => item.roundName)
  console.log('[v0] X-axis data:', xAxisData)
  console.log('[v0] Final series:', series)

  return {
    title: {
      text: currentMetricType.value === 'performance' ? '综合能力趋势分析' : '表情状态趋势分析',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        if (!params || params.length === 0) return ''
        
        let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].name}</div>`
        params.forEach(param => {
          result += `<div style="margin: 4px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
            ${param.seriesName}: <span style="font-weight: bold;">${param.value}分</span>
          </div>`
        })
        return result
      }
    },
    legend: {
      data: visibleMetrics.map(([config]) => config.name),
      top: 40,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
        formatter: '{value}分'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: series
  }
})

const trend3DChartOption = computed(() => {
  const data = trendData.value
  if (!data || data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 }
      }
    }
  }

  const visibleMetrics = Object.entries(visibleTrendMetrics.value)
    .filter(([config]) => config.visible)

  if (visibleMetrics.length === 0) {
    return {
      title: {
        text: '请选择要显示的指标',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 }
      }
    }
  }

  const data3D = []
  const metricNames = visibleMetrics.map(([config]) => config.name)
  
  data.forEach((round, roundIndex) => {
    visibleMetrics.forEach(([key, config], metricIndex) => {
      const value = round[key] || 0
      data3D.push([roundIndex, metricIndex, value, round.roundName, config.name])
    })
  })

  console.log('[v0] 3D chart data:', data3D)

  return {
    title: {
      text: currentMetricType.value === 'performance' ? '3D综合能力趋势' : '3D表情状态趋势',
      left: 'center',
      textStyle: { color: '#333', fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      formatter: function(params) {
        if (!params.data) return ''
        return `${params.data[3]}<br/>${params.data[4]}：${params.data[2]}分`
      }
    },
    visualMap: {
      max: 100,
      min: 0,
      dimension: 2,
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027']
      }
    },
    xAxis3D: {
      type: 'category',
      data: data.map(item => item.roundName),
      name: '面试轮次'
    },
    yAxis3D: {
      type: 'category',
      data: metricNames,
      name: '评估维度'
    },
    zAxis3D: {
      type: 'value',
      name: '分数',
      min: 0,
      max: 100
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      boxHeight: 100,
      viewControl: {
        autoRotate: true,
        autoRotateSpeed: 5
      }
    },
    series: [{
      type: 'bar3D',
      data: data3D,
      shading: 'lambert'
    }]
  }
})

const emotionPieChartOption = computed(() => {
  return {
    title: {
      text: '情感分布',
      left: 'center',
      textStyle: { color: '#333', fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#666' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: emotionStats.value.map(emotion => ({
        name: emotion.name,
        value: emotion.percent,
        itemStyle: { color: emotion.color }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}\n{c}%'
      }
    }]
  }
})

const emotionBarChartOption = computed(() => {
  return {
    title: {
      text: '情感状态分析',
      left: 'center',
      textStyle: { color: '#333', fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: emotionStats.value.map(e => e.name),
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      name: '百分比 (%)',
      axisLabel: { color: '#666' }
    },
    series: [{
      type: 'bar',
      data: emotionStats.value.map(emotion => ({
        value: emotion.percent,
        itemStyle: { color: emotion.color }
      })),
      barWidth: '60%',
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }]
  }
})

const accuracyBarChartOption = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 }
      }
    }
  }

  const data = roundData.map((round, index) => ({
    round: `第${index + 1}轮`,
    score: round.accuracy_evaluation?.score || 0,
    completeness: round.accuracy_evaluation?.completeness || 0,
    logical_rigor: round.accuracy_evaluation?.logical_rigor || 0,
    matching_degree: round.accuracy_evaluation?.matching_degree || 0
  }))

  return {
    title: {
      text: '各轮次准确度分析',
      left: 'center',
      textStyle: { color: '#333', fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['综合得分', '完整度', '逻辑严谨性', '匹配度'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.round),
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: '#666' }
    },
    series: [
      {
        name: '综合得分',
        type: 'bar',
        data: data.map(d => d.score),
        itemStyle: { color: '#667eea' }
      },
      {
        name: '完整度',
        type: 'bar',
        data: data.map(d => d.completeness),
        itemStyle: { color: '#764ba2' }
      },
      {
        name: '逻辑严谨性',
        type: 'bar',
        data: data.map(d => d.logical_rigor),
        itemStyle: { color: '#f093fb' }
      },
      {
        name: '匹配度',
        type: 'bar',
        data: data.map(d => d.matching_degree),
        itemStyle: { color: '#4facfe' }
      }
    ]
  }
})

const accuracyScatterChartOption = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 }
      }
    }
  }

  const data = roundData.map((round, index) => [
    round.accuracy_evaluation?.completeness || 0,
    round.accuracy_evaluation?.score || 0,
    round.accuracy_evaluation?.logical_rigor || 0,
    `第${index + 1}轮`
  ])

  return {
    title: {
      text: '完整度 vs 综合得分关系',
      left: 'center',
      textStyle: { color: '#333', fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `${params.data[3]}<br/>完整度: ${params.data[0]}分<br/>综合得分: ${params.data[1]}分<br/>逻辑严谨性: ${params.data[2]}分`
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      dimension: 2,
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      }
    },
    grid: {
      left: '3%',
      right: '15%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '完整度',
      min: 0,
      max: 100,
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      name: '综合得分',
      min: 0,
      max: 100,
      axisLabel: { color: '#666' }
    },
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: function(data) {
        return Math.sqrt(data[2]) * 2
      },
      emphasis: {
        focus: 'series',
        label: {
          show: true,
          formatter: function(param) {
            return param.data[3]
          },
          position: 'top'
        }
      }
    }]
  }
})

const getRadarMetricScore = (key) => {
  return radarData.value[key] || 0
}

const getRadarMetricDescription = (key) => {
  const score = radarData.value[key] || 0
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需要提升'
}

const overallRadarAnalysis = computed(() => {
  const data = radarData.value
  const avgScore = Math.round((data.major + data.expression + data.logic + data.strain + data.stable) / 5)
  
  let analysis = `综合能力评分为 ${avgScore} 分。`
  
  const metrics = [
    { key: 'major', name: '专业知识', score: data.major },
    { key: 'expression', name: '表达能力', score: data.expression },
    { key: 'logic', name: '逻辑思维', score: data.logic },
    { key: 'strain', name: '应变能力', score: data.strain },
    { key: 'stable', name: '情绪稳定', score: data.stable }
  ]
  
  const sortedMetrics = metrics.sort((a, b) => b.score - a.score)
  const strongest = sortedMetrics[0]
  const weakest = sortedMetrics[sortedMetrics.length - 1]
  
  analysis += ` 其中${strongest.name}表现最佳（${strongest.score}分），`
  analysis += `${weakest.name}有待提升（${weakest.score}分）。`
  
  return analysis
})

// const getTrendMetricAverage = (metric) => {
//   const data = trendData.value
//   if (data.length === 0) return 0
//   
//   const values = data.map(item => item[metric] || 0).filter(val => !isNaN(val))
//   if (values.length === 0) return 0
//   
//   return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
// }

// const getTrendMetricDirection = (metric) => {
//   const data = trendData.value
//   if (data.length < 2) return { text: '数据不足', class: 'neutral' }

//   const values = data.map(item => item[metric] || 0).filter(val => !isNaN(val))
//   if (values.length < 2) return { text: '数据不足', class: 'neutral' }
  
//   const firstHalf = values.slice(0, Math.floor(values.length / 2))
//   const secondHalf = values.slice(Math.floor(values.length / 2))

//   const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
//   const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

//   if (secondAvg > firstAvg + 5) return { text: '↗ 上升', class: 'positive' }
//   if (secondAvg < firstAvg - 5) return { text: '↘ 下降', class: 'negative' }
//   return { text: '→ 稳定', class: 'neutral' }
// }

// const overallTrendAnalysis = computed(() => {
//   if (trendData.value.length === 0) return '暂无数据'
//   
//   const avgScores = trendData.value.map(item => {
//     const scores = [item.major, item.expression, item.logic, item.stable, 100 - item.strain]
//     return scores.reduce((sum, score) => sum + score, 0) / scores.length
//   })
//   
//   const firstScore = avgScores[0]
//   const lastScore = avgScores[avgScores.length - 1]
//   const avgScore = avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length
//   
//   let analysis = `面试表现整体平均分为${Math.round(avgScore)}分。`
//   
//   if (lastScore > firstScore + 10) {
//     analysis += '表现呈明显上升趋势，适应能力强。'
//   } else if (lastScore < firstScore - 10) {
//     analysis += '后期表现有所下降，可能存在疲劳或压力因素。'
//   } else {
//     analysis += '表现相对稳定，各轮次发挥较为均衡。'
//   }
//   
//   return analysis
// })

// const bestTrendMetric = computed(() => {
//   const metrics = ['major', 'expression', 'logic', 'strain', 'stable']
//   let bestMetric = metrics[0]
//   let bestScore = getTrendMetricAverage(bestMetric)
  
//   metrics.forEach(metric => {
//     const score = getTrendMetricAverage(metric)
//     if (score > bestScore) {
//       bestScore = score
//       bestMetric = metric
//     }
//   })
  
//   return `${trendMetricsConfig.value[bestMetric]?.name}（${bestScore}分）`
// })

// const trendImprovementSuggestion = computed(() => {
//   const metrics = ['major', 'expression', 'logic', 'strain', 'stable']
//   let weakestMetric = metrics[0]
//   let weakestScore = getTrendMetricAverage(weakestMetric)
  
//   metrics.forEach(metric => {
//     const score = getTrendMetricAverage(metric)
//     if (score < weakestScore) {
//       weakestScore = score
//       weakestMetric = metric
//     }
//   })
  
//   const suggestions = {
//     major: '加强专业知识学习，关注行业最新动态',
//     expression: '提升表达技巧，多练习口语表达和逻辑组织',
//     logic: '加强逻辑思维训练，多做案例分析练习',
//     strain: '提高应变能力，学会在压力下保持冷静',
//     stable: '增强情绪控制能力，保持心理稳定'
//   }
  
//   return suggestions[weakestMetric] || '整体表现良好，无需特别改进'
// })

const dominantEmotion = computed(() => {
  if (emotionStats.value.length === 0) return '无明显主导情绪'
  return emotionStats.value[0].name
})

const emotionStability = computed(() => {
  const stability = props.reportData?.overallExpressionInfo?.emotionalStability || 0
  if (stability >= 90) return '非常稳定'
  if (stability >= 80) return '较为稳定'
  if (stability >= 60) return '一般稳定'
  return '需要改善'
})

const emotionSuggestion = computed(() => {
  const nervousness = props.reportData?.overallExpressionInfo?.nervousness || 0
  const confidence = props.reportData?.overallExpressionInfo?.confidence || 0
  
  if (nervousness > 30) return '建议通过深呼吸和放松训练来缓解紧张情绪'
  if (confidence < 60) return '建议增强自信心，多进行模拟面试练习'
  return '情绪状态良好，继续保持'
})

const topPerformanceHighlights = computed(() => {
  return props.reportData?.topPerformance?.map(item => item.strengths) || []
})

const weaknessAnalysis = computed(() => {
  return props.reportData?.weakPerformance?.map(item => item.weakness_analysis) || []
})

const getAccuracyAverage = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) return 0

  const scores = roundData.map(round => round.accuracy_evaluation?.score || 0)
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
})

const getBestRound = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) return 0

  let bestScore = -1
  let bestRound = 0

  roundData.forEach((round, index) => {
    const score = round.accuracy_evaluation?.score || 0
    if (score > bestScore) {
      bestScore = score
      bestRound = index + 1
    }
  })

  return bestRound
})

const getBestScore = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) return 0

  let bestScore = -1

  roundData.forEach(round => {
    const score = round.accuracy_evaluation?.score || 0
    if (score > bestScore) {
      bestScore = score
    }
  })

  return bestScore
})

const getWorstRound = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) return 0

  let worstScore = Infinity
  let worstRound = 0

  roundData.forEach((round, index) => {
    const score = round.accuracy_evaluation?.score || 0
    if (score < worstScore) {
      worstScore = score
      worstRound = index + 1
    }
  })

  return worstRound
})

const getWorstScore = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) return 0

  let worstScore = Infinity

  roundData.forEach(round => {
    const score = round.accuracy_evaluation?.score || 0
    if (score < worstScore) {
      worstScore = score
    }
  })

  return worstScore
})

const getAccuracyAnalysis = computed(() => {
  const roundData = props.reportData?.roundAnalysis || []
  if (roundData.length === 0) return '暂无数据'

  const scores = roundData.map(round => round.accuracy_evaluation?.score || 0)
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

  if (avgScore >= 90) return '整体表现卓越，继续保持'
  if (avgScore >= 80) return '整体表现优秀，继续保持'
  if (avgScore >= 60) return '表现良好，但需注意细节'
  if (avgScore >= 40) return '表现一般，需加强训练'
  return '需要改进，多做模拟练习'
})

const circumference = computed(() => 2 * Math.PI * 70)
const strokeDashoffset = computed(() => {
  const progress = interviewScore.value / 100
  return circumference.value - (progress * circumference.value)
})

const getScoreGradientStart = computed(() => {
  const score = interviewScore.value
  if (score >= 90) return '#10b981'
  if (score >= 80) return '#3b82f6'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
})

const getScoreGradientEnd = computed(() => {
  const score = interviewScore.value
  if (score >= 90) return '#059669'
  if (score >= 80) return '#1d4ed8'
  if (score >= 60) return '#d97706'
  return '#dc2626'
})

// const toggleMetricType = () => {
//   currentMetricType.value = currentMetricType.value === 'performance' ? 'expression' : 'performance'
  
//   // 切换指标可见性
//   Object.keys(trendMetricsConfig.value).forEach(key => {
//     const config = trendMetricsConfig.value[key]
//     config.visible = config.type === currentMetricType.value
//   })
// }

// const toggleTrendMetric = (key) => {
//   trendMetricsConfig.value[key].visible = !trendMetricsConfig.value[key].visible
// }

const openChartModal = (chartType) => {
  switch (chartType) {
    case 'radar':
      modalChartOption.value = radarViewMode.value === '2d' ? radarChartOption.value : radar3DChartOption.value
      modalChartTitle.value = '综合能力分析'
      break
    case 'trend':
      modalChartOption.value = trendViewMode.value === '2d' ? trendChartOption.value : trend3DChartOption.value
      modalChartTitle.value = '评分趋势分析'
      break
    case 'emotion':
      modalChartOption.value = emotionViewMode.value === 'pie' ? emotionPieChartOption.value : emotionBarChartOption.value
      modalChartTitle.value = '情感分布分析'
      break
    case 'accuracy':
      modalChartOption.value = accuracyViewType.value === 'combined' ? accuracyBarChartOption.value : accuracyScatterChartOption.value
      modalChartTitle.value = '准确度分析'
      break
  }
  modalVisible.value = true
}

const closeChartModal = () => {
  modalVisible.value = false
}

let resizeTimeout = null
let resizeObserverErrorHandler = null


const suppressResizeObserverError = (event) => {
  if (event.message && event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    event.preventDefault()
    event.stopPropagation()
    return false
  }
}

const handleUnhandledRejection = (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.preventDefault()
    return false
  }
}

onMounted(() => {
  resizeObserverErrorHandler = suppressResizeObserverError
  window.addEventListener('error', resizeObserverErrorHandler, true)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  const originalConsoleError = console.error
  console.error = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && message.includes('ResizeObserver loop completed')) {
      return // Suppress ResizeObserver console errors
    }
    originalConsoleError.apply(console, args)
  }
})

onUnmounted(() => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }
  
  if (resizeObserverErrorHandler) {
    window.removeEventListener('error', resizeObserverErrorHandler, true)
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    resizeObserverErrorHandler = null
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/reports/report-charts.scss';

.chart-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
}

.expand-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
    transform: scale(1.1);
  }
}

.chart-wrapper {
  height: 400px;
  width: 100%;
  position: relative;
  contain: layout style paint;
  overflow: hidden;
}

.chart {
  width: 100%;
  height: 100%;
  contain: layout style paint;
  will-change: transform;
}

.view-toggle, .metric-type-toggle {
  display: flex;
  gap: 4px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: #e9e9e9;
  }

  &.disabled {
    opacity: 0.5;
  }
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-text {
  font-size: 12px;
  color: #666;
}

.performance-insights {
  margin-top: 16px;

  h5 {
    color: #333;
    margin: 12px 0 8px 0;
    font-size: 14px;
    font-weight: 600;
  }

  ul {
    margin: 0;
    padding-left: 16px;
    
    li {
      margin: 4px 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }
  }
}

.emotion-insights {
  margin-top: 12px;
  
  p {
    margin: 8px 0;
    font-size: 13px;
    color: #666;
    line-height: 1.4;
  }
}

.trend-indicator {
  font-size: 12px;
  font-weight: 600;
  
  &.positive {
    color: #10b981;
  }
  
  &.negative {
    color: #ef4444;
  }
  
  &.neutral {
    color: #6b7280;
  }
}
</style>
