<template>
  <div class="report-analysis">
    <!-- 详细分析区域 -->
    <div class="analysis-section">
      <!-- 面试基本信息 -->
      <div class="analysis-card basic-info-card">
        <div class="analysis-header">
          <h3>📊 面试基本信息</h3>
        </div>
        <div class="basic-info-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">面试时长：</span>
              <span class="info-value duration-value">{{ formatDuration(reportData.basicInfo?.totalInterviewTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">面试领域：</span>
              <span class="info-value">{{ reportData.basicInfo?.interviewField || '未指定' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">职位：</span>
              <span class="info-value">{{ reportData.basicInfo?.interviewPosition || '未指定' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">关键技能：</span>
              <span class="info-value">{{ reportData.basicInfo?.keywords || '未指定' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增情感状态卡片 -->
      <div class="analysis-card emotion-state-card">
        <div class="analysis-header">
          <h3>😊 情感状态</h3>
        </div>
        <div class="emotion-state-content">
          <div class="emotion-info-item">
            <span class="emotion-label">包含情绪：</span>
            <div class="emotion-tags-container">
              <span 
                v-for="(round, index) in roundsWithEmotions" 
                :key="`emotion-tag-${index}`"
                class="emotion-tag-small"
                :title="`第${round.round_number}轮：${round.expression_analysis.dominant_emotion}`"
              >
                {{ round.expression_analysis.dominant_emotion }}
              </span>
              <span v-if="roundsWithEmotions.length === 0" class="no-emotion-data">
                暂无情绪数据
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 关键问题分析 -->
      <div class="analysis-card">
        <div class="analysis-header">
          <h3>🎯 关键问题分析</h3>
        </div>
        <div class="key-issues-content">
          <!-- 优秀表现 -->
          <div class="performance-section excellent-section">
            <h4>✨ 优秀表现</h4>
            <div class="performance-list">
              <div 
                v-for="(item, index) in safeTopPerformance"
                :key="`top-${index}`"
                class="performance-item excellent-item"
              >
                <div class="round-badge excellent">第{{ item.round_number }}轮</div>
                <div class="performance-content">
                  <p class="strengths">{{ item.strengths }}</p>
                  <p class="problem-summary" v-if="item.problem_summary">{{ item.problem_summary }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 待改进表现 -->
          <div class="performance-section weak-section">
            <h4>⚠️ 待改进表现</h4>
            <div class="performance-list">
              <div 
                v-for="(item, index) in safeWeakPerformance"
                :key="`weak-${index}`"
                class="performance-item weak-item"
              >
                <div class="round-badge weak">第{{ item.round_number }}轮</div>
                <div class="performance-content">
                  <p class="problem-summary">{{ item.problem_summary }}</p>
                  <p class="weakness-analysis">{{ item.weakness_analysis }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 轮次详细分析 -->
      <div class="analysis-card rounds-analysis-card">
        <div class="analysis-header">
          <h3>📝 轮次详细分析</h3>
          <el-button @click="toggleAllRounds" size="small">
            {{ allRoundsExpanded ? '收起全部' : '展开全部' }}
          </el-button>
        </div>
        <div class="rounds-content">
          <div 
            v-for="(round, index) in safeRoundAnalysis"
            :key="`round-${index}`"
            :data-index="index"
            class="round-item"
            :class="{ 
              'expanded': expandedRounds.includes(index),
              'highlight': highlightedRound === index
            }"
          >
            <!-- 轮次标题栏 -->
            <div 
              class="round-header" 
              @click="toggleRound(index)"
            >
              <div class="round-info">
                <div class="round-number">第{{ round.round_number }}轮</div>
                <div class="round-score">
                  <span class="score-label">得分：</span>
                  <span class="score-value" :class="getScoreClass(round.accuracy_evaluation?.score || 0)">
                    {{ round.accuracy_evaluation?.score || 0 }}分
                  </span>
                </div>
                <div class="round-preview">
                  {{ round.question?.substring(0, 50) }}{{ round.question?.length > 50 ? '...' : '' }}
                </div>
              </div>
              <div class="expand-icon">
                <el-icon :class="{ 'rotated': expandedRounds.includes(index) }">
                  <ArrowDown />
                </el-icon>
              </div>
            </div>

            <!-- 轮次详细内容 -->
            <transition 
              name="round-expand"
              @enter="onRoundEnter"
              @after-enter="onRoundAfterEnter"
              @leave="onRoundLeave"
              @after-leave="onRoundAfterLeave"
            >
              <div class="round-content" v-show="expandedRounds.includes(index)">
                <div class="round-detail">
                  <!-- 问题和回答 -->
                  <div class="qa-section">
                    <div class="content-block question-block">
                      <div class="block-header">
                        <el-icon><QuestionFilled /></el-icon>
                        <h5>面试问题</h5>
                      </div>
                      <div class="block-content">
                        <p class="question-text">{{ round.question }}</p>
                      </div>
                    </div>
                    
                    <div class="content-block answer-block">
                      <div class="block-header">
                        <el-icon><ChatDotRound /></el-icon>
                        <h5>候选人回答</h5>
                      </div>
                      <div class="block-content">
                        <p class="answer-text">{{ round.answer }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 评估详情 -->
                  <div class="content-block evaluation-block">
                    <div class="block-header">
                      <el-icon><DataAnalysis /></el-icon>
                      <h5>评估详情</h5>
                    </div>
                    <div class="block-content">
                      <div class="evaluation-grid">
                        <div class="eval-item">
                          <div class="eval-header">
                            <span class="eval-label">技术正确性</span>
                            <span class="eval-score">{{ round.accuracy_evaluation?.technical_correctness || '未评估' }}</span>
                          </div>
                        </div>
                        <div class="eval-item">
                          <div class="eval-header">
                            <span class="eval-label">完整度</span>
                            <span class="eval-score">{{ round.accuracy_evaluation?.completeness || '未评估' }}</span>
                          </div>
                        </div>
                        <div class="eval-item">
                          <div class="eval-header">
                            <span class="eval-label">逻辑严谨性</span>
                            <span class="eval-score">{{ round.accuracy_evaluation?.logical_rigor || '未评估' }}</span>
                          </div>
                        </div>
                        <div class="eval-item">
                          <div class="eval-header">
                            <span class="eval-label">匹配度</span>
                            <span class="eval-score">{{ round.accuracy_evaluation?.matching_degree || '未评估' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 表情分析 -->
                  <div class="content-block expression-block" v-if="round.expression_analysis">
                    <div class="block-header">
                      <el-icon><Sunny /></el-icon>
                      <h5>表情分析</h5>
                    </div>
                    <div class="block-content">
                      <div class="expression-info">
                        <div class="expr-item">
                          <span class="expr-label">情绪标签：</span>
                          <span class="expr-value emotion-tag">{{ round.expression_analysis.dominant_emotion }}</span>
                        </div>
                        <div class="expr-item">
                          <span class="expr-label">持续时长：</span>
                          <span class="expr-value">{{ round.expression_analysis.intensity_duration }}</span>
                        </div>
                      </div>
                      <div class="rationality-analysis">
                        <p><strong>合理性分析：</strong>{{ round.expression_analysis.rationality_analysis }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- 总体评价 -->
      <div class="analysis-card summary-card">
        <div class="analysis-header">
          <h3>📋 总体评价</h3>
        </div>
        <div class="summary-content">
          <div class="summary-text">
            {{ reportData.summary?.performance_overview || '暂无总体评价数据' }}
          </div>
          <div class="summary-metrics">
            <div class="metric-item">
              <span class="metric-label">平均准确度</span>
              <span class="metric-value">{{ reportData.summary?.average_accuracy_score || 0 }}分</span>
            </div>
          </div>
          <!-- 新增情绪标签汇总显示 -->
          <div class="emotion-tags-summary" v-if="roundsWithEmotions.length > 0">
            <h4>各轮情绪标签汇总</h4>
            <div class="emotion-tags-list">
              <div 
                v-for="(round, index) in roundsWithEmotions" 
                :key="`emotion-${index}`"
                class="emotion-tag-item"
              >
                <span class="round-label">第{{ round.round_number }}轮：</span>
                <span class="emotion-tag-value">{{ round.expression_analysis.dominant_emotion }}</span>
              </div>
            </div>
          </div>
          <!-- 新增情感分析部分 -->
          <div class="emotion-analysis">
            <p><strong>情感分析：</strong>{{ getEmotionAnalysis }}</p>
            <p><strong>情绪稳定性分析：</strong>{{ getEmotionStabilityAnalysis() }}</p>
            <p><strong>压力应对分析：</strong>{{ getStressHandlingAnalysis() }}</p>
            <p><strong>情绪管理建议：</strong>{{ getEmotionManagementSuggestion() }}</p>
          </div>
          <!-- 新增准确度分析部分 -->
          <div class="accuracy-analysis">
            <p><strong>准确度分析：</strong>{{ getAccuracyAnalysis }}</p>
            <div class="accuracy-stats">
              <div class="stat-item">
                <span class="stat-label">平均得分：</span>
                <span class="stat-value">{{ getAccuracyAverage }}分</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最佳轮次：</span>
                <span class="stat-value">第{{ getBestRound }}轮 ({{ getBestScore }}分)</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最弱轮次：</span>
                <span class="stat-value">第{{ getWorstRound }}轮 ({{ getWorstScore }}分)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowDown, QuestionFilled, ChatDotRound, DataAnalysis, Sunny } from '@element-plus/icons-vue'

const props = defineProps({
  reportData: {
    type: Object,
    default: () => ({}),
    required: true
  },
})

const expandedRounds = ref([])
const allRoundsExpanded = ref(false)
const highlightedRound = ref(-1)

const safeTopPerformance = computed(() => {
  try {
    return Array.isArray(props.reportData?.topPerformance) ? props.reportData.topPerformance : []
  } catch (error) {
    console.error('[v0] Error in safeTopPerformance:', error)
    return []
  }
})

const safeWeakPerformance = computed(() => {
  try {
    return Array.isArray(props.reportData?.weakPerformance) ? props.reportData.weakPerformance : []
  } catch (error) {
    console.error('[v0] Error in safeWeakPerformance:', error)
    return []
  }
})

const safeRoundAnalysis = computed(() => {
  try {
    return Array.isArray(props.reportData?.roundAnalysis) ? props.reportData.roundAnalysis : []
  } catch (error) {
    console.error('[v0] Error in safeRoundAnalysis:', error)
    return []
  }
})

const roundsWithEmotions = computed(() => {
  try {
    return safeRoundAnalysis.value.filter(round => 
      round?.expression_analysis?.dominant_emotion
    )
  } catch (error) {
    console.error('[v0] Error in roundsWithEmotions:', error)
    return []
  }
})

// 新增情感分析函数
const getEmotionStabilityAnalysis = () => {
  const stats = getEmotionStats()
  if (stats.length === 0) return '暂无数据'

  const dominantPercent = stats[0].percent
  if (dominantPercent > 70) {
    return '情绪状态相对稳定，主要情绪占主导地位。'
  } else if (dominantPercent > 50) {
    return '情绪状态较为稳定，偶有波动属于正常范围。'
  } else {
    return '情绪状态变化较大，建议加强情绪管理和调节能力。'
  }
}

const getStressHandlingAnalysis = () => {
  const stats = getEmotionStats()
  const stressEmotions = stats.filter(s => 
    s.name.includes('紧张') || s.name.includes('焦虑') || s.name.includes('压力')
  )
  const totalStressPercent = stressEmotions.reduce((sum, s) => sum + s.percent, 0)

  if (totalStressPercent < 20) {
    return '压力应对能力较强，能够在面试中保持相对放松的状态。'
  } else if (totalStressPercent < 40) {
    return '压力应对能力一般，在高压环境下会有一定的紧张情绪。'
  } else {
    return '压力应对能力需要提升，建议学习压力管理技巧。'
  }
}

const getEmotionManagementSuggestion = () => {
  const stats = getEmotionStats()
  if (stats.length === 0) return '暂无建议'

  const dominant = stats[0]
  if (dominant.name.includes('紧张') || dominant.name.includes('焦虑')) {
    return '建议面试前进行深呼吸练习，准备充分的自我介绍和常见问题回答。'
  } else if (dominant.name.includes('平静') || dominant.name.includes('放松')) {
    return '保持当前良好的心理状态，可适当增加一些积极的表达和互动。'
  } else {
    return '建议根据具体情况调整情绪状态，保持积极而专业的面试态度。'
  }
}

const getEmotionAnalysis = computed(() => {
  const stats = getEmotionStats()
  if (stats.length === 0) return '暂无情感数据分析'

  const dominant = stats[0]
  if (dominant.name.includes('平静') || dominant.name.includes('放松')) {
    return `面试过程中主要表现为${dominant.name}状态(${dominant.percent}%)，说明心理素质较好，能够保持冷静应对面试。`
  } else if (dominant.name.includes('紧张') || dominant.name.includes('焦虑')) {
    return `面试过程中主要表现为${dominant.name}状态(${dominant.percent}%)，建议通过深呼吸、积极心理暗示等方式缓解紧张情绪。`
  } else if (dominant.name.includes('高兴') || dominant.name.includes('喜悦')) {
    return `面试过程中主要表现为${dominant.name}状态(${dominant.percent}%)，积极的情绪状态有助于更好地展现个人能力。`
  }
  return `面试过程中情绪状态以${dominant.name}为主(${dominant.percent}%)，建议根据具体情况调整心理状态。`
})

// 新增准确度分析函数
const getAccuracyAverage = computed(() => {
  const roundData = safeRoundAnalysis.value
  if (roundData.length === 0) return 0

  const scores = roundData.map(round => round.accuracy_evaluation?.score || 0)
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
})

const getBestRound = computed(() => {
  const roundData = safeRoundAnalysis.value
  if (roundData.length === 0) return 1

  let bestIndex = 0
  let bestScore = 0
  roundData.forEach((round, index) => {
    const score = round.accuracy_evaluation?.score || 0
    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  })
  return bestIndex + 1
})

const getWorstRound = computed(() => {
  const roundData = safeRoundAnalysis.value
  if (roundData.length === 0) return 1

  let worstIndex = 0
  let worstScore = 10
  roundData.forEach((round, index) => {
    const score = round.accuracy_evaluation?.score || 0
    if (score < worstScore) {
      worstScore = score
      worstIndex = index
    }
  })
  return worstIndex + 1
})

const getBestScore = computed(() => {
  const roundData = safeRoundAnalysis.value
  if (roundData.length === 0) return 0

  const scores = roundData.map(round => round.accuracy_evaluation?.score || 0)
  return Math.max(...scores)
})

const getWorstScore = computed(() => {
  const roundData = safeRoundAnalysis.value
  if (roundData.length === 0) return 0

  const scores = roundData.map(round => round.accuracy_evaluation?.score || 0)
  return Math.min(...scores)
})

const getAccuracyAnalysis = computed(() => {
  const avg = getAccuracyAverage.value
  const best = getBestScore.value
  const worst = getWorstScore.value
  const variance = best - worst

  if (avg >= 4) {
    return `整体回答准确度较高，平均得分${avg}分。${variance > 2 ? '各轮次表现有一定波动，建议保持稳定性。' : '各轮次表现稳定，继续保持。'}`
  } else if (avg >= 3) {
    return `整体回答准确度中等，平均得分${avg}分。建议加强专业知识的学习和理解，提高回答的准确性和完整性。`
  } else {
    return `整体回答准确度偏低，平均得分${avg}分。建议系统性地复习相关知识点，多进行模拟练习以提高回答质量。`
  }
})

const getEmotionStats = () => {
  try {
    const roundData = safeRoundAnalysis.value
    if (!roundData || roundData.length === 0) return []

    const emotionCount = {}
    roundData.forEach(round => {
      const emotion = round.expression_analysis?.dominant_emotion || '未知'
      emotionCount[emotion] = (emotionCount[emotion] || 0) + 1
    })

    const total = roundData.length
    return Object.entries(emotionCount)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Error getting emotion stats:', error)
    return []
  }
}

// 分数等级样式
const getScoreClass = (score) => {
  if (score >= 8) return 'score-excellent'
  if (score >= 6) return 'score-good'
  if (score >= 4) return 'score-average'
  return 'score-poor'
}

// 动画事件处理
const onRoundEnter = (el) => {
  el.style.height = '0'
  el.style.opacity = '0'
}

const onRoundAfterEnter = (el) => {
  el.style.height = 'auto'
  el.style.opacity = '1'
}

const onRoundLeave = (el) => {
  el.style.height = el.scrollHeight + 'px'
  el.offsetHeight // 强制重排
  el.style.height = '0'
  el.style.opacity = '0'
}

const onRoundAfterLeave = (el) => {
  el.style.height = ''
  el.style.opacity = ''
}

const toggleRound = (index) => {
  console.log('[v0] toggleRound - index:', index)
  if (expandedRounds.value.includes(index)) {
    expandedRounds.value = expandedRounds.value.filter(round => round !== index)
  } else {
    expandedRounds.value.push(index)
  }
  console.log('[v0] toggleRound - expandedRounds:', expandedRounds.value)
}

const toggleAllRounds = () => {
  allRoundsExpanded.value = !allRoundsExpanded.value
  if (allRoundsExpanded.value) {
    expandedRounds.value = safeRoundAnalysis.value.map((_, index) => index)
  } else {
    expandedRounds.value = []
  }
}

const formatDuration = (seconds) => {
  console.log('[v0] formatDuration - seconds:', seconds)
  console.log('[v0] formatDuration - typeof seconds:', typeof seconds)
  console.log('[v0] formatDuration - reportData.basicInfo:', props.reportData?.basicInfo)
  
  if (!seconds || seconds === 0) return '0分钟'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes === 0) {
    return `${remainingSeconds}秒`
  } else if (remainingSeconds === 0) {
    return `${minutes}分钟`
  } else {
    return `${minutes}分${remainingSeconds}秒`
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/reports/report-analysis.scss';

.basic-info-card {
  margin-bottom: 20px;
  
  .basic-info-content {
    padding: 20px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #409eff;
    
    .info-label {
      color: #666;
      font-weight: 500;
      min-width: 80px;
    }
    
    .info-value {
      color: #333;
      font-weight: 600;
      
      &.duration-value {
        color: #409eff;
        font-size: 16px;
      }
    }
  }
}

// 新增样式
.emotion-analysis, .accuracy-analysis {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  
  p {
    margin: 8px 0;
    line-height: 1.6;
  }
}

.accuracy-stats {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  flex-wrap: wrap;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 5px;
    
    .stat-label {
      color: #666;
      font-size: 14px;
    }
    
    .stat-value {
      color: #409eff;
      font-weight: bold;
    }
  }
}

.emotion-tags-summary {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
  
  h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }
  
  .emotion-tags-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }
  
  .emotion-tag-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    
    .round-label {
      color: #666;
      font-weight: 500;
      min-width: 60px;
    }
    
    .emotion-tag-value {
      color: #67c23a;
      font-weight: 600;
      padding: 2px 8px;
      background: #f0f9ff;
      border-radius: 4px;
      border: 1px solid #67c23a;
    }
  }
}

.emotion-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: white;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
}

.emotion-state-card {
  margin-bottom: 20px;
  
  .emotion-state-content {
    padding: 20px;
  }
  
  .emotion-info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    
    .emotion-label {
      color: #666;
      font-weight: 500;
      min-width: 80px;
      margin-top: 4px;
    }
    
    .emotion-tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex: 1;
    }
    
    .emotion-tag-small {
      display: inline-block;
      padding: 4px 10px;
      background: linear-gradient(135deg, #67c23a, #85ce61);
      color: white;
      border-radius: 12px;
      font-weight: 500;
      font-size: 12px;
      box-shadow: 0 1px 3px rgba(103, 194, 58, 0.3);
      transition: all 0.3s ease;
      cursor: default;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(103, 194, 58, 0.4);
      }
    }
    
    .no-emotion-data {
      color: #999;
      font-style: italic;
      font-size: 14px;
    }
  }
}
</style>
