import { reactive } from "vue"
import { getAccuracyEvaluation, getAccuracyScore, toNumber, toSeconds } from "@/utils/report"

// 定义面试状态的响应式存储 - 改进版本，添加内存管理
export const interviewStore = reactive({
  // ========== 新增：题库相关状态 ==========
  // 选中的题库文件（从questionBankStore中选择）
  selectedBankFile: null,
  // 选中的题库模块（前端/后端/全栈）
  selectedBankModule: null,
  // 是否已选择题库
  hasSelectedBank: false,

  // 用户选择的面试方向对象
  selectedDirection: null,
  // 用户选择的目标岗位字符串
  selectedTargetPosition: "",
  // 用户选择的标签数组
  selectedTags: [],
  // 当前面试问题
  currentQuestion: "",
  // 当前问题的索引（从0开始）
  currentQuestionIndex: 0,
  // 总问题数
  totalQuestions: 0,
  // 已用时间（秒）
  elapsedTime: 0,
  // 计时器引用
  timerRef: null,
  // 是否正在生成问题
  isGeneratingQuestion: false,
  // 是否正在录制视频（用于人脸数据采集）
  isRecordingVideo: false,
  // 是否正在录制音频
  isRecordingAudio: false,
  // 用于存储当前问题期间的原始面部数据帧 - 添加大小限制
  currentQuestionRawFacialData: [],
  // 当前情感数据，结构匹配后端返回格式
  currentEmotions: {
    expression: "normal", // 表情（如normal, happy, sad等）
    eyebrow_strength: 0.0, // 眉毛强度
    is_eye_contact: false, // 是否有眼神交流
    is_frowning: false, // 是否皱眉
    is_smiling: false, // 是否微笑
  },
  // 存储所有已回答问题的数据和后端评测结果
  interviewHistory: [],
  // 最终报告数据
  finalReportData: null,
  reportRequestData: null,
  // 上一题的表情信息评测结果
  lastQuestionExpressionInfo: null,
  // 上一题的综合得分评测结果
  lastQuestionIntegratedScore: null,
  // 详细报告数据存储
  detailReportData: null,
  // 当前查看的报告基本信息
  currentReportInfo: null,
  // 报告生成状态
  isGeneratingReport: false,
  reportStep: 0,
  // 当前问题开始时间
  currentQuestionStartTime: 0,
  questionAnswerPairs: [],
  // 临时存储表情数据
  tempEmotionData: null,

  // 面部识别和语音识别状态
  modelsLoaded: false,
  hasCameraPermission: false,
  isDetecting: false,
  isInitingCamera: false,
  isListening: false,
  isUserAnswering: false,

  // 当前面部表情数据
  currentExpressions: null,
  currentDominantEmotion: "",
  faceDataFps: 0,
  showEmotionFeedback: true,

  // 表情历史数据
  emotionHistory: [],
  answerEmotionData: [],
  answerStartTime: null,
  answerEndTime: null,

  /**
   * 重置所有面试状态到初始值 - 改进版本，确保完全清理
   */
  resetInterviewState() {
     // ========== 新增：重置题库状态 ==========
    this.selectedBankFile = null;
    this.selectedBankModule = null;
    this.hasSelectedBank = false;

    this.currentQuestion = ""
    this.currentQuestionIndex = 0
    this.totalQuestions = 0
    this.elapsedTime = 0

    // 清除计时器
    if (this.timerRef) {
      clearInterval(this.timerRef)
      this.timerRef = null
    }

    this.isGeneratingQuestion = false
    this.isRecordingVideo = false
    this.isRecordingAudio = false
    this.currentEmotions = {
      expression: "normal",
      eyebrow_strength: 0.0,
      is_eye_contact: false,
      is_frowning: false,
      is_smiling: false,
    }

    // 清空数组并释放内存
    this.interviewHistory.length = 0
    this.currentQuestionRawFacialData.length = 0
    this.questionAnswerPairs.length = 0

    this.finalReportData = null
    this.reportRequestData = null
    this.lastQuestionExpressionInfo = null
    this.lastQuestionIntegratedScore = null
    this.isGeneratingReport = false
    this.reportStep = 0
    this.currentQuestionStartTime = 0

    this.tempEmotionData = null

    this.modelsLoaded = false
    this.hasCameraPermission = false
    this.isDetecting = false
    this.isInitingCamera = false
    this.isListening = false
    this.isUserAnswering = false
    this.currentExpressions = null
    this.currentDominantEmotion = ""
    this.faceDataFps = 0
    this.showEmotionFeedback = true
    this.emotionHistory.length = 0
    this.answerEmotionData.length = 0
    this.answerStartTime = null
    this.answerEndTime = null

    // 强制垃圾回收（如果浏览器支持）
    if (window.gc) {
      setTimeout(() => window.gc(), 100)
    }
  },

  /**
   * 重置面试选择参数。
   */
  resetSelectionParams() {
    // ========== 新增：重置题库选择参数 ==========
    this.selectedBankFile = null;
    this.selectedBankModule = null;
    this.hasSelectedBank = false;

    this.selectedDirection = null
    this.selectedTargetPosition = ""
    this.selectedTags.length = 0 // 清空数组但保持引用
  },

  /**
   * 设置面试选择参数。
   */
  setSelectionParams(direction, tags, position) {
    this.selectedDirection = direction
    this.selectedTags.length = 0 // 清空现有标签
    if (Array.isArray(tags)) {
      this.selectedTags.push(...tags) // 添加新标签
    }
    this.selectedTargetPosition = position
  },

   // ========== 新增：设置选中的题库信息 ==========
  /**
   * 设置选中的题库文件和模块
   * @param {Object} file - 选中的题库文件
   * @param {Object} module - 选中的题库模块
   */
  setSelectedBank(file, module) {
    this.selectedBankFile = file;
    this.selectedBankModule = module;
    this.hasSelectedBank = !!file; // 有文件则标记为已选择
    console.log("题库选择已保存到interviewStore：", {
      file: file?.name,
      module: module?.title,
      hasSelectedBank: this.hasSelectedBank
    });
  },

  /**
   * 设置当前问题、问题索引和总问题数。
   */
  setCurrentQuestion(question, index, total) {
    this.currentQuestion = question
    this.currentQuestionIndex = index
    this.totalQuestions = total
  },

  /**
   * 更新实时情感数据。
   */
  updateCurrentEmotions(emotions) {
    Object.assign(this.currentEmotions, emotions)
  },

  /**
   * 添加原始面部数据帧 - 改进版本，添加大小限制防止内存溢出
   */
  addRawFacialData(data) {
    // 限制原始数据的最大数量，防止内存溢出
    const MAX_FACIAL_DATA_POINTS = 200

    this.currentQuestionRawFacialData.push(data)

    // 如果超过限制，移除最旧的数据
    if (this.currentQuestionRawFacialData.length > MAX_FACIAL_DATA_POINTS) {
      this.currentQuestionRawFacialData.shift()
    }
  },

  /**
   * 清空当前问题期间收集的原始面部数据。
   */
  clearRawFacialData() {
    this.currentQuestionRawFacialData.length = 0
  },

  /**
   * 将当前问题及其回答添加到面试历史记录中 - 改进版本
   */
  addQuestionToHistory(question, userAnswer, avgFacialData, roundDuration) {
    const historyItem = {
      currentQuestionData: question,
      userAnswerText: userAnswer,
      avgFacialData: avgFacialData,
      roundDuration: roundDuration,
      expression_info: null,
      integrated_score: null,
    }

    this.interviewHistory.push(historyItem)

    // 限制历史记录的最大数量
    const MAX_HISTORY_ITEMS = 20
    if (this.interviewHistory.length > MAX_HISTORY_ITEMS) {
      this.interviewHistory.shift()
    }
  },

  /**
   * 更新历史记录中最后一个问题的后端评测数据。
   */
  updateLastQuestionInHistory(expressionInfo, integratedScore) {
    if (this.interviewHistory.length > 0) {
      const lastQuestion = this.interviewHistory[this.interviewHistory.length - 1]
      lastQuestion.expression_info = expressionInfo
      lastQuestion.integrated_score = integratedScore
    }
  },

  /**
   * 设置上一题的评测结果。
   */
  setLastQuestionEvaluation(expressionInfo, integratedScore) {
    this.lastQuestionExpressionInfo = expressionInfo
    this.lastQuestionIntegratedScore = integratedScore
  },

  /**
   * 设置最终报告数据 - 适配新的后端数据格式
   */
  setFinalReportData(reportData) {
    console.log("设置最终报告数据:", reportData)

    if (!reportData) {
      console.error("报告数据为空")
      this.finalReportData = null
      return
    }

    const totalFromReport = toSeconds(reportData?.totalInterviewTime, 0)
    const totalFromElapsed = toSeconds(this.elapsedTime, 0)
    const totalFromRounds = Array.isArray(this.interviewHistory)
      ? this.interviewHistory.reduce((sum, r) => sum + toSeconds(r?.questionAnswerDuration ?? r?.roundDuration, 0), 0)
      : 0
    const totalInterviewTime = totalFromReport || totalFromElapsed || totalFromRounds || 0

    const normalized = {
      ...reportData,
      totalInterviewTime,
    }

    if (normalized.overall_report) {
      console.log("数据格式正确，直接保存")
      this.finalReportData = normalized
    } else {
      console.warn("数据格式不符合预期，但仍然保存:", normalized)
      this.finalReportData = normalized
    }

    console.log("最终存储的报告数据:", this.finalReportData)

    if (this.finalReportData) {
      console.log("数据验证:")
      console.log("- overall_report存在:", !!this.finalReportData.overall_report)
      console.log("- totalInterviewTime:", this.finalReportData.totalInterviewTime)
    }
  },

  /**
   * 设置报告请求数据，用于后续保存到Java后端
   */
  setReportRequestData(requestData) {
    this.reportRequestData = requestData
    console.log("报告请求数据已保存到store:", requestData)
  },

  /**
   * 设置详细报告数据
   */
  setDetailReportData(reportData) {
    this.detailReportData = reportData
  },

  /**
   * 设置当前查看的报告基本信息
   */
  setCurrentReportInfo(reportInfo) {
    this.currentReportInfo = reportInfo
  },

  /**
   * 清空详细报告数据
   */
  clearDetailReportData() {
    this.detailReportData = null
    this.currentReportInfo = null
  },

  /**
   * 获取格式化的报告数据 - 适配新的后端数据结构
   */
  getFormattedReportData() {
    if (!this.finalReportData) return null

    const data = this.finalReportData
    console.log("开始格式化报告数据:", data)

    const summary = data.overall_report?.summary || {}
    const keyIssues = data.overall_report?.key_issues || {}

    return {
      // 整体报告数据
      overallReport: data.overall_report || {},
      // 关键问题分析
      keyIssues: keyIssues,
      // 总结信息
      summary: summary,
      roundAnalysis: data.overall_report?.round_analysis || [],
      roundDetails: data.overall_report?.roundDetails || [],
      overallIntegratedScore: data.overall_report?.overallIntegratedScore || {},
      overallExpressionInfo: data.overall_report?.overallExpressionInfo || {},
      // 总面试时间
      totalInterviewTime: data.totalInterviewTime || 0,
      // 最佳表现
      topPerformance: keyIssues.top_performance || [],
      // 薄弱表现
      weakPerformance: keyIssues.weak_performance || [],
      // 平均准确率分数
      averageAccuracyScore: summary.average_accuracy_score || 0,
      // 表达模式
      expressionPattern: summary.expression_pattern || "",
      // 表现概览
      performanceOverview: summary.performance_overview || "",
    }
  },

  /**
   * 获取轮次统计数据 - 适配新的数据结构
   */
  getRoundStatistics() {
    if (!this.finalReportData?.overall_report?.round_analysis) return null

    const rounds = this.finalReportData.overall_report.round_analysis
    const scores = rounds.map((round) => round.accuracy_evaluation?.score || 0)

    return {
      totalRounds: rounds.length,
      averageScore: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      scoreDistribution: {
        excellent: scores.filter((s) => s >= 80).length,
        good: scores.filter((s) => s >= 60 && s < 80).length,
        average: scores.filter((s) => s >= 40 && s < 60).length,
        poor: scores.filter((s) => s < 40).length,
      },
    }
  },

  /**
   * 获取情感分析数据 - 适配新的数据结构
   */
  getEmotionAnalysisData() {
    if (!this.finalReportData?.overall_report?.roundDetails) return []

    return this.finalReportData.overall_report.roundDetails
      .filter((detail) => detail.expression_info)
      .map((detail) => ({
        round: detail.round_number,
        duration: detail.duration_seconds,
        ...detail.expression_info,
      }))
  },

  /**
   * 获取综合评分趋势数据 - 适配新的数据结构
   */
  getIntegratedScoreTrend() {
    if (!this.finalReportData?.overall_report?.roundDetails) return []

    return this.finalReportData.overall_report.roundDetails
      .filter((detail) => detail.integrated_score)
      .map((detail) => ({
        round: detail.round_number,
        duration: detail.duration_seconds,
        ...detail.integrated_score,
      }))
  },

  /**
   * 新增：添加问答对到存储中
   */
  addQuestionAnswerPair(question, answer) {
    this.questionAnswerPairs.push({
      question: question,
      answer: answer,
      timestamp: new Date().toISOString(),
      questionIndex: this.currentQuestionIndex,
    })
  },

  /**
   * 新增：获取所有问答对
   */
  getQuestionAnswerPairs() {
    return this.questionAnswerPairs
  },

  /**
   * 新增：获取格式化的问答内容用于报告生成
   */
  getFormattedQAContent() {
    return this.questionAnswerPairs
      .map((pair, index) => {
        return `第${index + 1}题：${pair.question}\n回答：${pair.answer}\n`
      })
      .join("\n")
  },

  /**
   * 新增：保存回答期间的表情数据
   */
  saveAnswerEmotionData(emotionData) {
    if (!emotionData) return

    // 将表情数据添加到当前问题的历史记录中
    if (this.interviewHistory.length > 0) {
      const lastQuestion = this.interviewHistory[this.interviewHistory.length - 1]
      lastQuestion.emotionData = emotionData
    } else {
      // 如果还没有历史记录，创建一个临时存储
      if (!this.tempEmotionData) {
        this.tempEmotionData = []
      }
      this.tempEmotionData.push({
        questionIndex: this.currentQuestionIndex,
        emotionData: emotionData,
        timestamp: new Date().toISOString(),
      })
    }

    console.log("表情数据已保存到store:", emotionData)
  },

  /**
   * 新增：获取所有表情数据用于报告生成
   */
  getAllEmotionData() {
    const emotionDataList = []

    // 从历史记录中收集表情数据
    this.interviewHistory.forEach((item, index) => {
      if (item.emotionData) {
        emotionDataList.push({
          questionIndex: index,
          question: item.currentQuestionData,
          answer: item.userAnswerText,
          emotionData: item.emotionData,
        })
      }
    })

    // 添加临时存储的表情数据
    if (this.tempEmotionData) {
      emotionDataList.push(...this.tempEmotionData)
    }

    return emotionDataList
  },

  /**
   * 新增：获取表情数据统计信息
   */
  getEmotionStatistics() {
    const allEmotionData = this.getAllEmotionData()
    if (allEmotionData.length === 0) return null

    const emotionTypes = ["happy", "sad", "angry", "surprised", "fearful", "neutral", "disgusted"]
    const totalStats = {}
    let totalDataPoints = 0
    let totalDuration = 0

    // 初始化统计数据
    emotionTypes.forEach((emotion) => {
      totalStats[emotion] = 0
    })

    // 计算总体统计
    allEmotionData.forEach((item) => {
      if (item.emotionData && item.emotionData.averageExpressions) {
        emotionTypes.forEach((emotion) => {
          totalStats[emotion] += item.emotionData.averageExpressions[emotion] || 0
        })
        totalDataPoints += item.emotionData.dataPoints || 0
        totalDuration += item.emotionData.duration || 0
      }
    })

    // 计算平均值
    const avgStats = {}
    emotionTypes.forEach((emotion) => {
      avgStats[emotion] = allEmotionData.length > 0 ? totalStats[emotion] / allEmotionData.length : 0
    })

    // 找出主要表情
    const dominantEmotion = Object.entries(avgStats).sort((a, b) => b[1] - a[1])[0]

    return {
      averageExpressions: avgStats,
      dominantEmotion: dominantEmotion[0],
      dominantEmotionScore: dominantEmotion[1],
      totalQuestions: allEmotionData.length,
      totalDataPoints: totalDataPoints,
      totalDuration: totalDuration,
      emotionTrend: allEmotionData.map((item) => ({
        questionIndex: item.questionIndex,
        dominantEmotion: item.emotionData?.dominantEmotion,
        confidence: item.emotionData?.dominantEmotionScore,
      })),
    }
  },

  /**
   * 新增：保存每轮面试数据（包含问题、回答和情绪数据）
   */
  saveInterviewRound(questionData, userAnswer, emotionData) {
    console.log("saveInterviewRound方法被调用，参数:", { questionData, userAnswer, emotionData })

    const roundData = {
      roundIndex: this.currentQuestionIndex + 1, // 从1开始计数
      currentQuestionData: questionData || "",
      userAnswerText: userAnswer || "",
      avgFacialData: emotionData?.averageExpressions || {
        angry: "0%",
        disgusted: "0%",
        fearful: "0%",
        happy: "0%",
        sad: "0%",
        surprised: "0%",
        neutral: "100%",
      },
      questionAnswerDuration: emotionData?.duration || 0,
      overall_score: null,
      accuracy_evaluation: null,
      expression_analysis: null,
    }

    this.interviewHistory.push(roundData)
    console.log("保存面试轮次数据:", roundData)
    console.log("当前历史记录长度:", this.interviewHistory.length)

    // 限制历史记录的最大数量
    const MAX_HISTORY_ITEMS = 20
    if (this.interviewHistory.length > MAX_HISTORY_ITEMS) {
      this.interviewHistory.shift()
    }
  },

  /**
   * 新增：获取格式化的面试数据用于报告生成
   */
  getFormattedInterviewData() {
    console.log("开始格式化面试数据")
    console.log("当前面试历史记录:", this.interviewHistory)
    console.log("选择的方向:", this.selectedDirection)
    console.log("选择的标签:", this.selectedTags)
    console.log("选择的岗位:", this.selectedTargetPosition)

    const formattedRecords = this.interviewHistory.map((record, index) => {
      const avgFacialData = record.avgFacialData || {}

      const formattedFacialData = {}
      const emotionKeys = ["angry", "disgusted", "fearful", "happy", "sad", "surprised", "neutral"]

      emotionKeys.forEach((key) => {
        const value = avgFacialData[key]
        if (typeof value === "string" && value.includes("%")) {
          formattedFacialData[key] = value
        } else if (typeof value === "number") {
          formattedFacialData[key] = `${Math.round(value * 100)}%`
        } else {
          formattedFacialData[key] = key === "neutral" ? "100%" : "0%"
        }
      })

      return {
        roundIndex: index + 1,
        currentQuestionData: record.currentQuestionData || "",
        userAnswerText: record.userAnswerText || "",
        avgFacialData: formattedFacialData,
        questionAnswerDuration: record.questionAnswerDuration || 0,
      }
    })

    console.log("格式化后的记录:", formattedRecords)

    return {
      interviewRecords: formattedRecords,
      majorDirection: this.selectedDirection?.name || this.selectedDirection || "",
      minorDirection: this.selectedTags || [], // 小方向改为selectedTags数组
      position: this.selectedTargetPosition || "",
    }
  },

  /**
   * 新增：清空当前轮次的临时数据
   */
  clearCurrentRoundData() {
    this.currentQuestionRawFacialData.length = 0
    this.tempEmotionData = null
  },

  /**
   * 新增：格式化数据为Java后端需要的格式
   */
  formatDataForJavaBackend() {
    console.log("开始格式化数据为Java后端格式")
    console.log("原始finalReportData:", JSON.stringify(this.finalReportData, null, 2))
    console.log("selectedDirection:", this.selectedDirection)
    console.log("selectedTargetPosition:", this.selectedTargetPosition)
    console.log("selectedTags:", this.selectedTags)

    if (!this.finalReportData) {
      console.error("没有最终报告数据")
      return null
    }

    const reportData = this.finalReportData
    const userStore = JSON.parse(localStorage.getItem("userStore") || "{}")
    const username = userStore.username || "admin"

    console.log("从localStorage获取的用户信息:", userStore)
    console.log("使用的用户名:", username)

    const totalFromReport = toSeconds(reportData?.totalInterviewTime, 0)
    const totalFromElapsed = toSeconds(this.elapsedTime, 0)
    const totalFromRounds = Array.isArray(this.interviewHistory)
      ? this.interviewHistory.reduce((sum, r) => sum + toSeconds(r?.questionAnswerDuration ?? r?.roundDuration, 0), 0)
      : 0
    const totalInterviewTime = totalFromReport || totalFromElapsed || totalFromRounds || 0

    const formattedData = {
      username: username,
      beginTime: new Date().toISOString(),
      interview_field: this.selectedDirection?.name || this.selectedDirection || "",
      interview_position: this.selectedTargetPosition || "",
      interview_position_keyword: this.selectedTags?.join(",") || "",
      interview_score: toNumber(reportData.overall_report?.summary?.average_accuracy_score, 0),
      overall_report: {
        summary: {
          performance_overview: reportData.overall_report?.summary?.performance_overview || "",
          expression_pattern: reportData.overall_report?.summary?.expression_pattern || "",
          average_accuracy_score: toNumber(reportData.overall_report?.summary?.average_accuracy_score, 0),
        },
        key_issues: {
          top_performance: reportData.overall_report?.key_issues?.top_performance || [],
          weak_performance: reportData.overall_report?.key_issues?.weak_performance || [],
        },
        round_analysis: (reportData.overall_report?.round_analysis || []).map((round) => ({
          round_number: round.round_number || 0,
          question: round.question || "",
          answer: round.answer || "",
          accuracy_evaluation: {
            matching_degree: (getAccuracyEvaluation(round)?.matching_degree || getAccuracyEvaluation(round)?.matchingDegree || "") + "",
            logical_rigor: (getAccuracyEvaluation(round)?.logical_rigor || getAccuracyEvaluation(round)?.logicalRigor || "") + "",
            completeness: (getAccuracyEvaluation(round)?.completeness || "") + "",
            technical_correctness: (getAccuracyEvaluation(round)?.technical_correctness || getAccuracyEvaluation(round)?.technicalCorrectness || "") + "",
            score: getAccuracyScore(round),
          },
          expression_analysis: {
            dominant_emotion: round.expression_analysis?.dominant_emotion || "",
            intensity_duration: round.expression_analysis?.intensity_duration || "",
            rationality_analysis: round.expression_analysis?.rationality_analysis || "",
          },
        })),
        roundDetails: (reportData.overall_report?.roundDetails || []).map((detail) => ({
          round_number: detail.round_number || 0,
          duration_seconds: detail.duration_seconds || 0,
          expression_info: {
            concentration: Math.round(detail.expression_info?.concentration || 0),
            nervousness: Math.round(detail.expression_info?.nervousness || 0),
            happiness: Math.round(detail.expression_info?.happiness || 0),
            doubtfulness: Math.round(detail.expression_info?.doubtfulness || 0),
            adaptability: Math.round(detail.expression_info?.adaptability || 0),
            emotionalStability: Math.round(detail.expression_info?.emotionalStability || 0),
            confidence: Math.round(detail.expression_info?.confidence || 0),
          },
          integrated_score: {
            major: Math.round(detail.integrated_score?.major || 0),
            expression: Math.round(detail.integrated_score?.expression || 0),
            logic: Math.round(detail.integrated_score?.logic || 0),
            strain: Math.round(detail.integrated_score?.strain || 0),
            stable: Math.round(detail.integrated_score?.stable || 0),
          },
        })),
        overallIntegratedScore: {
          major: Math.round(reportData.overall_report?.overallIntegratedScore?.major || 0),
          expression: Math.round(reportData.overall_report?.overallIntegratedScore?.expression || 0),
          logic: Math.round(reportData.overall_report?.overallIntegratedScore?.logic || 0),
          strain: Math.round(reportData.overall_report?.overallIntegratedScore?.strain || 0),
          stable: Math.round(reportData.overall_report?.overallIntegratedScore?.stable || 0),
        },
        overallExpressionInfo: {
          concentration: Math.round(reportData.overall_report?.overallExpressionInfo?.concentration || 0),
          nervousness: Math.round(reportData.overall_report?.overallExpressionInfo?.nervousness || 0),
          happiness: Math.round(reportData.overall_report?.overallExpressionInfo?.happiness || 0),
          doubtfulness: Math.round(reportData.overall_report?.overallExpressionInfo?.doubtfulness || 0),
          adaptability: Math.round(reportData.overall_report?.overallExpressionInfo?.adaptability || 0),
          emotionalStability: Math.round(reportData.overall_report?.overallExpressionInfo?.emotionalStability || 0),
          confidence: Math.round(reportData.overall_report?.overallExpressionInfo?.confidence || 0),
        },
      },
      totalInterviewTime,
    }
    console.log("完整的格式化数据:", JSON.stringify(formattedData, null, 2))
    return formattedData
  },

  /**
   * 新增：保存报告到Java后端
   */
  async saveReportToJavaBackend() {
    try {
      console.log("开始保存报告到Java后端")

      const formattedData = this.formatDataForJavaBackend()
      if (!formattedData) {
        throw new Error("数据格式化失败")
      }

      console.log("即将发送到Java后端的数据:")
      console.log("- 数据大小:", JSON.stringify(formattedData).length, "字符")
      console.log("- 数据结构验证:")
      console.log("  * username存在:", !!formattedData.username)
      console.log("  * beginTime存在:", !!formattedData.beginTime)
      console.log("  * interview_field存在:", !!formattedData.interview_field)
      console.log("  * overall_report存在:", !!formattedData.overall_report)
      // 导入API
      const { interviewApi } = await import("@/api/interview.js")

      console.log("调用interviewApi.saveReportToJavaBackend...")
      const response = await interviewApi.saveReportToJavaBackend(formattedData)

      console.log("Java后端API响应:response", response)
      console.log("- 响应信息:", response.data?.msg)
      console.log("- 响应数据:", response.data.data)
      console.log("- 响应状态:", response.data?.code)
      if (response?.data?.code === 1) {
        console.log("Java后端保存成功:", response)
        return {
          success: true,
          data: response,
          message: "报告保存成功",
        }
      }
      throw new Error("Java后端返回错误")
    } catch (error) {
      console.error("Java后端保存失败 - 详细错误信息:")
      console.error("- 错误类型:", error.constructor.name)
      console.error("- 错误消息:", error.message)
      console.error("- 错误堆栈:", error.stack)
      if (error.response) {
        console.error("- HTTP响应状态:", error.response.status)
        console.error("- HTTP响应数据:", error.response.data)
      }
      console.error("- 完整错误对象:", error)
      return {
        success: false,
        error: error,
        message: error.message || "报告保存失败",
      }
    }
  },

  // 新增：视频监控状态管理方法
  setModelsLoaded(loaded) {
    this.modelsLoaded = loaded
  },

  setCameraPermission(hasPermission) {
    this.hasCameraPermission = hasPermission
  },

  setDetecting(detecting) {
    this.isDetecting = detecting
  },

  setInitingCamera(initing) {
    this.isInitingCamera = initing
  },

  setListening(listening) {
    this.isListening = listening
  },

  setUserAnswering(answering) {
    this.isUserAnswering = answering
  },

  updateCurrentExpressions(expressions) {
    this.currentExpressions = expressions
  },

  setCurrentDominantEmotion(emotion) {
    this.currentDominantEmotion = emotion
  },

  updateFaceDataFps(fps) {
    this.faceDataFps = fps
  },

  toggleEmotionFeedback() {
    this.showEmotionFeedback = !this.showEmotionFeedback
  },

  addEmotionHistory(data) {
    this.emotionHistory.push(data)
    if (this.emotionHistory.length > 100) {
      this.emotionHistory = this.emotionHistory.slice(-100)
    }
  },

  addAnswerEmotionData(data) {
    this.answerEmotionData.push(data)
  },

  clearAnswerEmotionData() {
    this.answerEmotionData.length = 0
  },

  setAnswerStartTime(time) {
    this.answerStartTime = time
  },

  setAnswerEndTime(time) {
    this.answerEndTime = time
  },

  // 新增：获取表情历史统计数据
  /**
   * 获取表情历史统计数据
   */
  getEmotionHistoryStats() {
    if (this.emotionHistory.length === 0) {
      return null
    }

    const totalDataPoints = this.emotionHistory.length
    const timeSpan =
      this.emotionHistory.length > 0
        ? (this.emotionHistory[this.emotionHistory.length - 1].timestamp - this.emotionHistory[0].timestamp) / 1000
        : 0
    const fps = timeSpan > 0 ? Math.round((totalDataPoints / timeSpan) * 10) / 10 : 0

    // 计算各种表情的统计数据
    const emotionStats = {}
    const emotionTypes = ["happy", "sad", "angry", "surprised", "fearful", "neutral", "disgusted"]

    emotionTypes.forEach((emotion) => {
      const values = this.emotionHistory
        .filter((item) => item.expressions && item.expressions[emotion] !== undefined)
        .map((item) => item.expressions[emotion])

      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0)
        const average = Math.round((sum / values.length) * 100) / 100
        const max = Math.round(Math.max(...values) * 100) / 100

        emotionStats[emotion] = {
          average: average.toFixed(2),
          max: max.toFixed(2),
          count: values.length,
        }
      } else {
        emotionStats[emotion] = {
          average: "0.00",
          max: "0.00",
          count: 0,
        }
      }
    })

    return {
      totalDataPoints,
      timeSpan,
      fps,
      emotionStats,
    }
  },
})
