<template>
  <div class="face-expression-container">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="status-info">
        <div class="status-indicator" :class="statusClass">
          <div class="pulse-dot"></div>
        </div>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div class="model-progress" v-if="loadingProgress > 0 && loadingProgress < 100">
        <span class="progress-text">模型加载中 {{ loadingProgress }}%</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${loadingProgress}%` }"></div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：摄像头和控制区 -->
      <div class="camera-section">
        <!-- 摄像头卡片 -->
        <div class="card camera-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="icon-camera"></i>
              实时情绪识别
            </h3>
            <div class="camera-controls">
              <button v-if="!hasCameraPermission" @click="initCamera" class="btn btn-primary" :disabled="!modelsLoaded">
                <i class="icon-play"></i>
                启动摄像头
              </button>
              <div v-else class="control-group">
                <button @click="toggleDetection" class="btn" :class="isDetecting ? 'btn-danger' : 'btn-success'">
                  <i :class="isDetecting ? 'icon-stop' : 'icon-play'"></i>
                  {{ isDetecting ? '停止识别' : '开始识别' }}
                </button>
                <button @click="toggleLandmarks" class="btn btn-secondary">
                  <i class="icon-eye"></i>
                  {{ showLandmarks ? '隐藏' : '显示' }}特征点
                </button>
              </div>
            </div>
          </div>

          <div class="camera-viewport">
            <div v-if="!hasCameraPermission && !isInitingCamera" class="camera-placeholder">
              <div class="placeholder-content">
                <i class="icon-camera-off"></i>
                <p>点击启动摄像头开始识别</p>
              </div>
            </div>

            <div v-else class="video-container">
              <video ref="videoRef" autoplay playsinline muted class="video-stream"></video>
              <canvas ref="canvasRef" class="detection-overlay"></canvas>

              <!-- 加载遮罩 -->
              <div v-if="isInitingCamera" class="loading-overlay">
                <div class="loading-spinner">
                  <div class="spinner"></div>
                  <span>初始化摄像头...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时情绪数据卡片 -->
        <div v-if="currentExpressions" class="card emotion-data-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="icon-brain"></i>
              实时情绪分析
            </h3>
            <div class="dominant-emotion" v-if="currentDominantEmotion">
              <span class="emotion-label">主要情绪:</span>
              <div class="emotion-badge" :class="`emotion-${currentDominantEmotion}`">
                <i :class="getEmotionIcon(currentDominantEmotion)"></i>
                {{ formatEmotion(currentDominantEmotion) }}
              </div>
            </div>
          </div>

          <div class="emotion-grid">
            <div v-for="(value, emotion) in currentExpressions" :key="emotion" class="emotion-item"
              :class="`emotion-${emotion}`">
              <div class="emotion-header">
                <div class="emotion-icon-wrapper">
                  <i :class="getEmotionIcon(emotion)"></i>
                </div>
                <span class="emotion-name">{{ formatEmotion(emotion) }}</span>
                <span class="emotion-percentage">{{ Math.round(value * 100) }}%</span>
              </div>
              <div class="emotion-bar">
                <div class="emotion-fill" :style="{ width: `${Math.round(value * 100)}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：统计和历史 -->
      <div class="stats-section">
        <!-- 情绪统计卡片 -->
        <div class="card stats-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="icon-chart"></i>
              情绪统计
            </h3>
            <button @click="clearHistory" class="btn btn-ghost btn-sm" :disabled="emotionHistory.length === 0">
              <i class="icon-trash"></i>
              清空
            </button>
          </div>

          <div class="stats-content">
            <!-- 统计概览 -->
            <div class="stats-overview">
              <div class="stat-item">
                <div class="stat-value">{{ emotionHistory.length }}</div>
                <div class="stat-label">总记录数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ detectionTime }}</div>
                <div class="stat-label">检测时长</div>
              </div>
              <div class="stat-item" v-if="mostFrequentEmotion">
                <div class="stat-value emotion-icon-small">
                  <i :class="getEmotionIcon(mostFrequentEmotion)"></i>
                </div>
                <div class="stat-label">主要情绪</div>
              </div>
            </div>

            <!-- 情绪分布图表 -->
            <div class="chart-container">
              <canvas ref="chartRef" class="emotion-chart"></canvas>
            </div>

            <!-- 情绪占比列表 -->
            <div class="emotion-distribution">
              <div v-for="emotion in emotionTypes" :key="emotion" class="distribution-item">
                <div class="distribution-header">
                  <i :class="[getEmotionIcon(emotion), `text-${emotion}`]"></i>
                  <span class="distribution-name">{{ formatEmotion(emotion) }}</span>
                  <span class="distribution-percentage">{{ getEmotionPercentage(emotion) }}%</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill" :class="`bg-${emotion}`"
                    :style="{ width: `${getEmotionPercentage(emotion)}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onBeforeUnmount } from 'vue'
import * as faceapi from 'face-api.js'
import { Chart, registerables } from 'chart.js'

// 注册Chart.js组件
Chart.register(...registerables)

const statusText = ref('准备加载模型...')
const loadingProgress = ref(0)
const modelsLoaded = ref(false)
const hasCameraPermission = ref(false)
const isDetecting = ref(false)
const showLandmarks = ref(true)
const currentExpressions = ref(null)
const currentDominantEmotion = ref('')
const isInitingCamera = ref(false)
const emotionHistory = ref([])
const detectionStartTime = ref(null)
const detectionTime = ref('00:00')
// const activeHistoryIndex = ref(-1) // 用于历史记录详情的显示控制

const videoRef = ref(null)
const canvasRef = ref(null)
const chartRef = ref(null)

let detectionInterval = null
let emotionChart = null
let timeInterval = null

const emotionTypes = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'neutral', 'disgusted']

const maxHistoryCount = 50

const statusClass = computed(() => {
  if (!modelsLoaded.value) return 'status-loading'
  if (isDetecting.value) return 'status-active'
  if (hasCameraPermission.value) return 'status-ready'
  return 'status-idle'
})

const mostFrequentEmotion = computed(() => {
  if (emotionHistory.value.length === 0) return null

  const emotionCounts = {}
  emotionHistory.value.forEach(record => {
    emotionCounts[record.emotion] = (emotionCounts[record.emotion] || 0) + 1
  })

  let maxCount = 0
  let mostFrequent = null

  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostFrequent = emotion
    }
  })

  return mostFrequent
})

const getEmotionIcon = (emotion) => {
  const icons = {
    'happy': 'icon-smile',
    'sad': 'icon-frown',
    'angry': 'icon-angry',
    'surprised': 'icon-surprise',
    'fearful': 'icon-fear',
    'neutral': 'icon-neutral',
    'disgusted': 'icon-disgust'
  }
  return icons[emotion] || 'icon-question'
}

const formatEmotion = (emotion) => {
  const map = {
    'happy': '开心',
    'sad': '悲伤',
    'angry': '生气',
    'surprised': '惊讶',
    'fearful': '害怕',
    'neutral': '中性',
    'disgusted': '厌恶'
  }
  return map[emotion] || emotion
}

const getEmotionPercentage = (emotion) => {
  if (emotionHistory.value.length === 0) return 0
  const count = emotionHistory.value.filter(record => record.emotion === emotion).length
  return Math.round((count / emotionHistory.value.length) * 100)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}



const initEmotionChart = () => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')

  if (emotionChart) {
    emotionChart.destroy()
  }

  const colors = [
    '#FFD93D', '#4FC3F7', '#EF5350', '#AB47BC',
    '#FF7043', '#78909C', '#66BB6A'
  ]

  emotionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: emotionTypes.map(emo => formatEmotion(emo)),
      datasets: [{
        data: emotionTypes.map(() => 0),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.raw || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: ${value}次 (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%',
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  })
}

const updateEmotionChart = () => {
  if (!emotionChart) return

  const emotionCounts = {}
  emotionTypes.forEach(emotion => {
    emotionCounts[emotion] = 0
  })

  emotionHistory.value.forEach(record => {
    if (Object.prototype.hasOwnProperty.call(emotionCounts, record.emotion)) {
      emotionCounts[record.emotion]++
    }
  })

  emotionChart.data.datasets[0].data = Object.values(emotionCounts)
  emotionChart.update()
}

const loadModels = async () => {
  try {
    statusText.value = '开始加载模型...'

    const modelPath = '/models'

    // 模拟加载进度
    const updateProgress = (progress) => {
      loadingProgress.value = Math.round(progress)
    }

    updateProgress(10)
    await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath)

    updateProgress(40)
    await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)

    updateProgress(70)
    await faceapi.nets.faceExpressionNet.loadFromUri(modelPath)

    updateProgress(100)

    statusText.value = '所有模型加载成功'
    modelsLoaded.value = true

    await nextTick()
    initEmotionChart()

    return true
  } catch (e) {
    statusText.value = `模型加载失败: ${e.message}`
    console.error('模型加载错误:', e)
    return false
  }
}

const initCamera = async () => {
  try {
    isInitingCamera.value = true
    statusText.value = '正在初始化摄像头...'

    // 调整摄像头分辨率为1:1正方形，更适合人脸检测
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 640 },
        aspectRatio: 1
      }
    })

    videoRef.value.srcObject = stream

    await new Promise(resolve => {
      videoRef.value.onloadedmetadata = resolve
    })

    // 确保canvas与视频尺寸一致
    canvasRef.value.width = videoRef.value.videoWidth
    canvasRef.value.height = videoRef.value.videoHeight

    hasCameraPermission.value = true
    statusText.value = '摄像头初始化成功，可以开始识别'
  } catch (e) {
    statusText.value = `摄像头初始化失败: ${e.message}`
    console.error('摄像头错误:', e)
  } finally {
    isInitingCamera.value = false
  }
}

const toggleDetection = () => {
  if (isDetecting.value) {
    stopDetection()
  } else {
    startDetection()
  }
}

const toggleLandmarks = () => {
  showLandmarks.value = !showLandmarks.value
}

const startDetection = () => {
  if (!videoRef.value || !canvasRef.value) {
    statusText.value = '摄像头未准备好，请先初始化摄像头'
    return
  }

  isDetecting.value = true
  statusText.value = '正在进行情绪识别...'
  detectionStartTime.value = Date.now()

  // 开始计时
  timeInterval = setInterval(() => {
    if (detectionStartTime.value) {
      const elapsed = Math.floor((Date.now() - detectionStartTime.value) / 1000)
      detectionTime.value = formatTime(elapsed)
    }
  }, 1000)

  let historySaveTimer = 0

  detectionInterval = setInterval(async () => {
    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.value, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, {
          width: videoRef.value.videoWidth,
          height: videoRef.value.videoHeight
        })

        const ctx = canvasRef.value.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

        // 绘制检测框
        faceapi.draw.drawDetections(canvasRef.value, resizedDetections)

        // 绘制特征点
        if (showLandmarks.value) {
          faceapi.draw.drawFaceLandmarks(canvasRef.value, resizedDetections)
        }

        // 绘制表情
        faceapi.draw.drawFaceExpressions(canvasRef.value, resizedDetections)

        currentExpressions.value = resizedDetections.expressions

        // 获取主要情绪
        const emotions = Object.entries(resizedDetections.expressions)
        emotions.sort((a, b) => b[1] - a[1])
        currentDominantEmotion.value = emotions[0][0]

        // 每5次检测保存一次历史记录
        historySaveTimer++
        if (historySaveTimer >= 5) {
          saveEmotionToHistory(
            emotions[0][0],
            resizedDetections.expressions,
            emotions[0][1]
          )
          historySaveTimer = 0
        }
      }
    } catch (e) {
      console.error('检测过程错误:', e)
      statusText.value = `识别过程出错: ${e.message}`
    }
  }, 100)
}

const stopDetection = () => {
  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
  }

  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }

  isDetecting.value = false

  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }

  statusText.value = '识别已停止'
}

const saveEmotionToHistory = (emotion, expressions, confidence) => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')
    }`

  emotionHistory.value.unshift({
    emotion,
    expressions,
    confidence,
    time: timeStr
  })

  if (emotionHistory.value.length > maxHistoryCount) {
    emotionHistory.value.pop()
  }

  updateEmotionChart()
}

const clearHistory = () => {
  emotionHistory.value = []
  updateEmotionChart()
  statusText.value = '历史记录已清空'
}

onMounted(async () => {
  await loadModels()
})

onBeforeUnmount(() => {
  stopDetection()

  if (emotionChart) {
    emotionChart.destroy()
  }

  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped lang="scss">
.face-expression-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;

  &.status-loading {
    background: #ff9800;
  }

  &.status-ready {
    background: #4caf50;
  }

  &.status-active {
    background: #2196f3;

    .pulse-dot {
      animation: pulse 2s infinite;
    }
  }

  &.status-idle {
    background: #9e9e9e;
  }
}

.pulse-dot {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.3;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }

  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
}

.status-text {
  font-weight: 500;
  color: #333;
}

.model-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.progress-bar {
  width: 200px;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4285f4, #0f9d58);
  border-radius: 3px;
  transition: width 0.3s ease;
}

// 调整主内容区域比例为3:2，更协调
.main-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.camera-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;

  i {
    font-size: 20px;
    color: #4285f4;
  }
}

.camera-controls {
  display: flex;
  gap: 12px;
}

.control-group {
  display: flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &.btn-primary {
    background: #4285f4;
    color: white;

    &:hover:not(:disabled) {
      background: #3367d6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
    }
  }

  &.btn-success {
    background: #0f9d58;
    color: white;

    &:hover:not(:disabled) {
      background: #0d8b4d;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 157, 88, 0.3);
    }
  }

  &.btn-danger {
    background: #ea4335;
    color: white;

    &:hover:not(:disabled) {
      background: #d93025;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(234, 67, 53, 0.3);
    }
  }

  &.btn-secondary {
    background: #f1f3f4;
    color: #5f6368;

    &:hover:not(:disabled) {
      background: #e8eaed;
    }
  }

  &.btn-ghost {
    background: transparent;
    color: #5f6368;

    &:hover:not(:disabled) {
      background: #f1f3f4;
    }
  }

  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
}

// 关键修改：将摄像头区域改为1:1正方形比例，更适合人脸和关键点检测
.camera-viewport {
  position: relative;
  aspect-ratio: 3 / 2;
  background: #f1f3f4;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  max-width: 500px;
  margin: 0 auto;
}

.camera-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.placeholder-content {
  text-align: center;
  color: #5f6368;
  transform: translateY(-10px);
  transition: all 0.3s ease;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
    color: #dadce0;
    transition: all 0.3s ease;
  }

  p {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }

  .camera-placeholder:hover & {
    transform: translateY(0);

    i {
      color: #4285f4;
      transform: scale(1.1);
    }
  }
}

.video-container {
  // position: relative;
  width: 100%;
  height: 100%;
}

.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.detection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.dominant-emotion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emotion-label {
  font-size: 14px;
  color: #5f6368;
}

.emotion-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &.emotion-happy {
    background: #fef7e0;
    color: #d97706;
  }

  &.emotion-sad {
    background: #e6f4ea;
    color: #137333;
  }

  &.emotion-angry {
    background: #feebea;
    color: #c5221f;
  }

  &.emotion-surprised {
    background: #f0eefc;
    color: #5c2d91;
  }

  &.emotion-fearful {
    background: #fff4e5;
    color: #c2410c;
  }

  &.emotion-neutral {
    background: #f1f3f4;
    color: #5f6368;
  }

  &.emotion-disgusted {
    background: #e8f0fe;
    color: #1967d2;
  }
}

// 调整情绪网格布局，使其更紧凑
.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 20px;
}

.emotion-item {
  padding: 14px;
  border-radius: 12px;
  background: #f8f9fa;
  border-left: 4px solid;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &.emotion-happy {
    border-left-color: #fbbc04;
  }

  &.emotion-sad {
    border-left-color: #0f9d58;
  }

  &.emotion-angry {
    border-left-color: #ea4335;
  }

  &.emotion-surprised {
    border-left-color: #8e24aa;
  }

  &.emotion-fearful {
    border-left-color: #f57c00;
  }

  &.emotion-neutral {
    border-left-color: #5f6368;
  }

  &.emotion-disgusted {
    border-left-color: #4285f4;
  }
}

.emotion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.emotion-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 16px;
  }
}

.emotion-name {
  flex: 1;
  margin-left: 8px;
  font-weight: 500;
  color: #333;
}

.emotion-percentage {
  font-size: 12px;
  font-weight: 600;
  color: #5f6368;
}

.emotion-bar {
  height: 4px;
  background: #e8eaed;
  border-radius: 2px;
  overflow: hidden;
}

.emotion-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;

  .emotion-happy & {
    background: #fbbc04;
  }

  .emotion-sad & {
    background: #0f9d58;
  }

  .emotion-angry & {
    background: #ea4335;
  }

  .emotion-surprised & {
    background: #8e24aa;
  }

  .emotion-fearful & {
    background: #f57c00;
  }

  .emotion-neutral & {
    background: #5f6368;
  }

  .emotion-disgusted & {
    background: #4285f4;
  }
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-content {
  padding: 20px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 14px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;

  &.emotion-icon-small i {
    font-size: 24px;
    color: #4285f4;
  }
}

.stat-label {
  font-size: 12px;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-container {
  height: 200px;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emotion-chart {
  width: 100% !important;
  height: 100% !important;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.emotion-distribution {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding-left: 8px;
    padding-right: 8px;
  }
}

.distribution-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.distribution-name {
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}

.distribution-percentage {
  font-size: 12px;
  font-weight: 600;
  color: #5f6368;
}

.distribution-bar {
  height: 4px;
  background: #e8eaed;
  border-radius: 2px;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;

  &.bg-happy {
    background: #fbbc04;
  }

  &.bg-sad {
    background: #0f9d58;
  }

  &.bg-angry {
    background: #ea4335;
  }

  &.bg-surprised {
    background: #8e24aa;
  }

  &.bg-fearful {
    background: #f57c00;
  }

  &.bg-neutral {
    background: #5f6368;
  }

  &.bg-disgusted {
    background: #4285f4;
  }
}

.record-count {
  font-size: 12px;
  color: #5f6368;
  background: #f1f3f4;
  padding: 4px 8px;
  border-radius: 12px;
}

.history-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9aa0a6;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
    color: #dadce0;
  }

  p {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
  }

  span {
    font-size: 14px;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 14px;
  border-radius: 12px;
  background: #f8f9fa;
  border-left: 4px solid;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &.history-happy {
    border-left-color: #fbbc04;
  }

  &.history-sad {
    border-left-color: #0f9d58;
  }

  &.history-angry {
    border-left-color: #ea4335;
  }

  &.history-surprised {
    border-left-color: #8e24aa;
  }

  &.history-fearful {
    border-left-color: #f57c00;
  }

  &.history-neutral {
    border-left-color: #5f6368;
  }

  &.history-disgusted {
    border-left-color: #4285f4;
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-emotion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-emotion-name {
  font-weight: 500;
  color: #333;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #5f6368;
}

.history-confidence {
  background: #e8eaed;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.history-details {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 8px;

  &.show-details {
    max-height: 200px;
    opacity: 1;
    margin-top: 12px;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
  font-size: 11px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-name {
  color: #5f6368;
  margin-bottom: 2px;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

/* 图标样式 */
.icon-camera::before {
  content: "📹";
}

.icon-play::before {
  content: "▶️";
}

.icon-stop::before {
  content: "⏹️";
}

.icon-eye::before {
  content: "👁️";
}

.icon-brain::before {
  content: "🧠";
}

.icon-chart::before {
  content: "📊";
}

.icon-history::before {
  content: "🕒";
}

.icon-trash::before {
  content: "🗑️";
}

.icon-camera-off::before {
  content: "📷";
}

.icon-empty::before {
  content: "📂";
}

.icon-smile::before {
  content: "😊";
}

.icon-frown::before {
  content: "😢";
}

.icon-angry::before {
  content: "😠";
}

.icon-surprise::before {
  content: "😲";
}

.icon-fear::before {
  content: "😨";
}

.icon-neutral::before {
  content: "😐";
}

.icon-disgust::before {
  content: "🤢";
}

.icon-question::before {
  content: "❓";
}

/* 文本颜色类 */
.text-happy {
  color: #fbbc04;
}

.text-sad {
  color: #0f9d58;
}

.text-angry {
  color: #ea4335;
}

.text-surprised {
  color: #8e24aa;
}

.text-fearful {
  color: #f57c00;
}

.text-neutral {
  color: #5f6368;
}

.text-disgusted {
  color: #4285f4;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .camera-viewport {
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .face-expression-container {
    padding: 12px;
  }

  .status-bar {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .camera-controls {
    flex-direction: column;
  }

  .emotion-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-details {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .emotion-grid {
    grid-template-columns: 1fr;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .camera-viewport {
    max-width: 100%;
  }
}

/* 滚动条样式优化 */
.history-content::-webkit-scrollbar {
  width: 6px;
}

.history-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.history-content::-webkit-scrollbar-thumb {
  background: #dadce0;
  border-radius: 3px;
}

.history-content::-webkit-scrollbar-thumb:hover {
  background: #b0b6bb;
}
</style>
