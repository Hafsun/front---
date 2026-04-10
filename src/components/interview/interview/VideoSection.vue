<template>
  <div class="video-section">
    <!-- 视频监控容器 - 占据2/3高度 -->
    <div class="video-monitoring-container">
      <!-- 更新头部区域，添加摄像头控制按钮 -->
      <div class="section-header">
        <div class="header-content">
          <div class="title-group">
            <div class="title-icon-wrapper">
              <CameraIcon class="title-icon" />
            </div>
            <div class="title-text">
              <h2 class="section-title">实时视频监控</h2>
              <p class="section-subtitle">AI驱动的面部表情分析</p>
            </div>
          </div>
          <div class="section-actions">
            <!-- 面部关键点显示切换按钮 -->
            <button 
              v-if="interviewStore.hasCameraPermission"
              @click="toggleLandmarks" 
              class="control-btn secondary" 
              :class="{ active: showLandmarks }"
            >
              <EyeIcon class="btn-icon" />
              <span>{{ showLandmarks ? '隐藏' : '显示' }}关键点</span>
            </button>
            
            <!-- 添加情绪反馈切换按钮 -->
            <button 
              v-if="interviewStore.hasCameraPermission"
              @click="toggleEmotionFeedback" 
              class="control-btn secondary" 
              :class="{ active: interviewStore.showEmotionFeedback }"
            >
              <SmileIcon class="btn-icon" />
              <span>{{ interviewStore.showEmotionFeedback ? '隐藏' : '显示' }}情绪面板</span>
            </button>
            
            <button 
              v-if="!interviewStore.hasCameraPermission" 
              @click="initCamera" 
              class="control-btn primary"
              :disabled="!interviewStore.modelsLoaded"
            >
              <PlayIcon class="btn-icon" />
              <span>启动摄像头</span>
            </button>
            
            <div v-else class="status-controls">
              <div class="detection-status" :class="{ active: interviewStore.isDetecting }">
                <div class="status-indicator"></div>
                <span class="status-text">{{ interviewStore.isDetecting ? '检测中' : '已停止' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 更新主监控界面，添加摄像头占位符和视频流 -->
      <div class="video-main-area">
        <div class="video-container">
          <!-- 摄像头占位符 -->
          <div v-if="!interviewStore.hasCameraPermission && !interviewStore.isInitingCamera" class="camera-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon-wrapper">
                <CameraOffIcon class="placeholder-icon" />
              </div>
              <h4 class="placeholder-title">摄像头未启动</h4>
              <p class="placeholder-desc">点击上方按钮启动摄像头开始面试监控</p>
            </div>
          </div>
          
          <!-- 视频流 -->
          <div v-else class="video-stream-wrapper">
            <video 
              ref="videoRef" 
              autoplay 
              playsinline 
              muted 
              class="video-stream"
            ></video>
            <canvas 
              ref="canvasRef" 
              class="detection-canvas"
            ></canvas>
            
            <!-- 实时情感分析面板 -->
            <div v-if="interviewStore.currentExpressions && interviewStore.isDetecting && interviewStore.showEmotionFeedback" class="emotion-panel">
              <div class="panel-header">
                <h5 class="panel-title">实时分析</h5>
                <div class="panel-status">
                  <div class="status-dot active"></div>
                </div>
              </div>
              <div class="emotion-metrics">
                <div class="metric-item primary">
                  <span class="metric-label">主要表情</span>
                  <span class="metric-value">{{ formatEmotion(interviewStore.currentDominantEmotion) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">眼神交流</span>
                  <span class="metric-value" :class="getEyeContactStatus() === '良好' ? 'success' : 'warning'">
                    {{ getEyeContactStatus() }}
                  </span>
                </div>
                <!-- 添加微笑状态显示 -->
                <div class="metric-item">
                  <span class="metric-label">微笑状态</span>
                  <span class="metric-value" :class="getSmileStatus() === '是' ? 'success' : 'neutral'">
                    {{ getSmileStatus() }}
                  </span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">检测帧率</span>
                  <span class="metric-value">{{ interviewStore.faceDataFps }} FPS</span>
                </div>
              </div>
            </div>
            
            <!-- 加载遮罩 -->
            <div v-if="interviewStore.isInitingCamera" class="loading-overlay">
              <div class="loading-content">
                <div class="loading-spinner"></div>
                <span class="loading-text">正在初始化摄像头...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 情绪分析卡片网格布局 -->
    <div class="emotion-analysis-container">
      <div class="analysis-header">
        <div class="header-left">
          <div class="analysis-icon-wrapper">
            <SmileIcon class="analysis-icon" />
          </div>
          <div class="analysis-title-group">
            <h3 class="analysis-title">情绪分析图表</h3>
            <p class="analysis-subtitle">实时表情识别结果</p>
          </div>
        </div>
        <div class="analysis-status">
          <div class="status-indicator" :class="{ active: interviewStore.isDetecting }"></div>
          <span class="status-text">
            {{ interviewStore.isDetecting ? '实时检测中' : '检测已暂停' }}
          </span>
        </div>
      </div>
      
      <div class="chart-container">
        <div class="emotion-chart-container">
          <div v-if="interviewStore.hasCameraPermission && interviewStore.currentExpressions" class="emotion-grid">
            <div 
              v-for="item in emotionList" 
              :key="item.key" 
              class="emotion-card" 
              :style="{ borderLeftColor: item.color }"
            >
              <div class="emotion-info">
                <span class="emotion-emoji">{{ item.icon }}</span>
                <span class="emotion-label">{{ item.label }}</span>
                <span class="emotion-value">{{ item.value }}%</span>
              </div>
              <div class="emotion-progress-bg">
                <div class="emotion-progress-bar" :style="{ width: item.value + '%', backgroundColor: item.color }"></div>
              </div>
            </div>
          </div>
          <div v-else class="no-data-placeholder">
            <div class="placeholder-icon-wrapper">
              <CameraOffIcon class="placeholder-icon" />
            </div>
            <h4 class="placeholder-title">等待摄像头启动</h4>
            <p class="placeholder-text">启动摄像头后将显示实时情绪分析数据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
  CameraIcon, PlayIcon, CameraOffIcon, SmileIcon, EyeIcon
} from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';
import * as faceapi from 'face-api.js';
import { ElMessage } from 'element-plus';
import { throttle } from 'lodash-es';

const videoRef = ref(null);
const canvasRef = ref(null);
const showLandmarks = ref(false);
const currentConfidence = ref(0);

let detectionInterval = null;
let fpsCounter = 0;
let lastFpsTime = Date.now();

const loadModels = async () => {
  try {
    console.log('开始加载面部识别模型...');
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]);
    
    interviewStore.setModelsLoaded(true);
    console.log('面部识别模型加载完成');
  } catch (error) {
    console.error('模型加载失败:', error);
  }
};

const initCamera = async () => {
  if (!interviewStore.modelsLoaded) {
    console.warn('模型未加载完成');
    return;
  }
  
  interviewStore.setInitingCamera(true);
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    });
    videoRef.value.srcObject = stream;
    
    videoRef.value.onloadedmetadata = () => {
      // 设置canvas尺寸与video显示尺寸一致
      const videoRect = videoRef.value.getBoundingClientRect();
      canvasRef.value.width = videoRect.width;
      canvasRef.value.height = videoRect.height;
      
      // 设置canvas样式尺寸
      canvasRef.value.style.width = videoRect.width + 'px';
      canvasRef.value.style.height = videoRect.height + 'px';
      
      interviewStore.setCameraPermission(true);
      
      interviewStore.setInitingCamera(false);
      console.log('摄像头初始化完成');
    };
  } catch (error) {
    console.error('摄像头初始化失败:', error);
    ElMessage.error('摄像头初始化失败，请检查设备权限');
    interviewStore.setCameraPermission(false);
    interviewStore.setInitingCamera(false);
  }
};

// 使用 throttle 替代 debounce，防止在 requestAnimationFrame 高频调用下永远不执行
const throttledUpdateExpressions = throttle((expressions) => {
  // 浅拷贝确保 Vue 响应式能检测到对象变化
  interviewStore.updateCurrentExpressions({ ...expressions });
}, 100);

const detectFaces = async () => {
  if (!videoRef.value || !canvasRef.value || !interviewStore.isDetecting) return;
  
  try {
    const detections = await faceapi
      .detectAllFaces(videoRef.value, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
      
    if (!canvasRef.value) return;
    
    const ctx = canvasRef.value.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    
    if (detections && detections.length > 0) {
      const resizedDetections = faceapi.resizeResults(detections, {
        width: canvasRef.value.width,
        height: canvasRef.value.height
      });
      
      if (showLandmarks.value) {
        faceapi.draw.drawDetections(canvasRef.value, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.value, resizedDetections);
      }
      
      const expressions = detections[0].expressions;
      
      throttledUpdateExpressions(expressions);
      
      // 计算主导情绪和置信度
      const emotions = Object.entries(expressions);
      emotions.sort((a, b) => b[1] - a[1]);
      const dominantEmotion = emotions[0][0];
      const confidence = emotions[0][1];
      
      interviewStore.setCurrentDominantEmotion(dominantEmotion);
      currentConfidence.value = confidence;
      
      // 更新FPS计数
      fpsCounter++;
      const currentTime = Date.now();
      if (currentTime - lastFpsTime >= 1000) {
        interviewStore.updateFaceDataFps(Math.round((fpsCounter * 1000) / (currentTime - lastFpsTime)));
        fpsCounter = 0;
        lastFpsTime = currentTime;
      }
      
      const emotionData = {
        timestamp: Date.now(),
        expressions: { ...expressions },
        dominantEmotion: dominantEmotion,
        confidence: confidence,
        landmarks: resizedDetections[0].landmarks ? {
          leftEye: resizedDetections[0].landmarks.getLeftEye(),
          rightEye: resizedDetections[0].landmarks.getRightEye(),
          mouth: resizedDetections[0].landmarks.getMouth(),
          nose: resizedDetections[0].landmarks.getNose()
        } : null
      };
      
      // 添加到历史记录
      interviewStore.addEmotionHistory(emotionData);
      
      // 如果正在录音和回答问题，保存到当前回答的情绪数据
      if (interviewStore.isRecordingAudio && interviewStore.isUserAnswering) {
        interviewStore.addAnswerEmotionData(emotionData);
      }
      
      // 限制历史记录长度，避免内存溢出
      if (interviewStore.emotionHistory.length > 100) {
        interviewStore.emotionHistory = interviewStore.emotionHistory.slice(-100);
      }
    } else {
      // 没有检测到面部时的处理
      console.log('[v0] 未检测到面部');
    }
  } catch (error) {
    console.error('Face detection error:', error);
    if (error.message && error.message.includes('ResizeObserver')) {
      // 忽略ResizeObserver错误
      return;
    }
  }
  
  if (interviewStore.isDetecting) {
    requestAnimationFrame(detectFaces);
  }
};

const toggleEmotionFeedback = () => {
  interviewStore.toggleEmotionFeedback();
};

const toggleLandmarks = () => {
  showLandmarks.value = !showLandmarks.value;
  console.log('[v0] 面部关键点显示:', showLandmarks.value ? '开启' : '关闭');
};

const formatEmotion = (emotion) => {
  const map = {
    'happy': '开心',
    'sad': '悲伤',
    'angry': '生气',
    'surprised': '惊讶',
    'fearful': '害怕',
    'disgusted': '厌恶',
    'neutral': '中性'
  };
  return map[emotion] || emotion;
};

const getEyeContactStatus = () => {
  if (!interviewStore.currentExpressions) return '未检测';
  const neutralScore = interviewStore.currentExpressions.neutral || 0;
  const happyScore = interviewStore.currentExpressions.happy || 0;
  const combinedScore = neutralScore + happyScore;
  return combinedScore > 0.4 ? '良好' : '需改善';
};

const getSmileStatus = () => {
  if (!interviewStore.currentExpressions) return '未检测';
  const happyScore = interviewStore.currentExpressions.happy || 0;
  return happyScore > 0.3 ? '是' : '否';
};

const emotionList = computed(() => {
  if (!interviewStore.currentExpressions) return [];
  
  const emotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
  const emotionConfig = {
    'neutral': { label: '中性', icon: '😐', color: '#4b5563' },
    'happy': { label: '开心', icon: '😊', color: '#f59e0b' },
    'sad': { label: '悲伤', icon: '😢', color: '#10b981' },
    'angry': { label: '生气', icon: '😠', color: '#ef4444' },
    'fearful': { label: '害怕', icon: '😨', color: '#f97316' },
    'disgusted': { label: '厌恶', icon: '🤢', color: '#3b82f6' },
    'surprised': { label: '惊讶', icon: '😲', color: '#8b5cf6' }
  };
  
  return emotions.map(key => ({
    key,
    label: emotionConfig[key].label,
    icon: emotionConfig[key].icon,
    color: emotionConfig[key].color,
    value: Math.round((interviewStore.currentExpressions[key] || 0) * 100)
  }));
});

const startDetection = () => {
  if (!videoRef.value || !canvasRef.value || !interviewStore.hasCameraPermission) {
    console.warn('摄像头未准备好');
    return;
  }
  
  if (!interviewStore.modelsLoaded) {
    console.warn('面部识别模型未加载完成');
    return;
  }
  
  console.log('开始面部情绪识别');
  interviewStore.setDetecting(true);
  interviewStore.setAnswerStartTime(Date.now());
  interviewStore.clearAnswerEmotionData();
  fpsCounter = 0;
  lastFpsTime = Date.now();
  
  detectFaces();
};

const stopDetection = () => {
  console.log('停止面部情绪识别');
  interviewStore.setAnswerEndTime(Date.now());
  
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  
  interviewStore.setDetecting(false);
  
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
  
  console.log('表情检测已停止');
};

const calculateAverageEmotions = () => {
  console.log('提取表情数据计算...');
  const answerData = interviewStore.answerEmotionData;
  
  const defaultEmotions = {
    angry: "0%",
    disgusted: "0%",
    fearful: "0%",
    happy: "0%",
    sad: "0%",
    surprised: "0%",
    neutral: "100%"
  };

  if (!answerData || answerData.length === 0) {
    return {
      averageExpressions: defaultEmotions,
      duration: 0
    };
  }

  const emotionTypes = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'neutral', 'disgusted'];
  const totals = { happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, neutral: 0, disgusted: 0 };
  
  answerData.forEach(data => {
    if (data.expressions) {
      emotionTypes.forEach(type => {
        totals[type] += (data.expressions[type] || 0);
      });
    }
  });

  const count = answerData.length;
  const averageExpressions = {};
  emotionTypes.forEach(type => {
    averageExpressions[type] = `${Math.round((totals[type] / count) * 100)}%`;
  });

  const duration = interviewStore.answerStartTime && interviewStore.answerEndTime 
    ? Math.round((interviewStore.answerEndTime - interviewStore.answerStartTime) / 1000) 
    : 0;

  return {
    averageExpressions,
    duration
  };
};

onMounted(async () => {
  console.log('VideoSection组件挂载，开始初始化');
  await loadModels();
  console.log('模型加载完成');
  
  const defaultEmotions = {
    happy: 0, sad: 0, angry: 0, surprised: 0, 
    fearful: 0, neutral: 1, disgusted: 0
  };
  interviewStore.updateCurrentExpressions(defaultEmotions);
  interviewStore.setCurrentDominantEmotion('neutral');
  
  console.log('模型加载完成，准备自动启动摄像头');
  if (interviewStore.modelsLoaded) {
    await initCamera();
  }
});

onUnmounted(() => {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  
  if (videoRef.value && videoRef.value.srcObject) {
    const tracks = videoRef.value.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  }
});

defineExpose({
  startDetection,
  stopDetection,
  calculateAverageEmotions,
  initCamera
});
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

/* 更新整体布局，使用现代化设计系统 */
.video-section {
  display: flex;
  flex-direction: column;
  min-width: 600px;
  height: 100%;
  background: $video-bg-primary;
  gap: 1rem;
  padding: 2px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 优化视频监控容器设计 */
.video-monitoring-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: $video-bg-card;
  border-radius: $video-radius-2xl;
  box-shadow: $video-shadow-lg;
  border: 1px solid $video-border;
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: 500px;
}

.video-monitoring-container:hover {
  box-shadow: $video-shadow-xl;
}

/* 重新设计头部区域 */
.section-header {
  flex-shrink: 0;
  padding: 6px;
  background: linear-gradient(135deg, $video-bg-primary 0%, $video-bg-card 100%);
  border-bottom: 1px solid $video-border;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, $video-primary, $video-primary-light);
  border-radius: $video-radius-lg;
  box-shadow: $video-shadow-md;
}

.title-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: $video-text-light;
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: $video-text-primary;
  letter-spacing: -0.025em;
}

.section-subtitle {
  font-size: 0.75rem;
  margin: 0;
  color: $video-text-secondary;
  font-weight: 500;
}

/* 重新设计按钮样式 */
.section-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: $video-radius-lg;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: $video-shadow-sm;
}

.control-btn.primary {
  background: linear-gradient(135deg, $video-primary, $video-primary-light);
  color: $video-text-light;
}

.control-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, darken($video-primary, 5%), $video-primary);
  transform: translateY(-1px);
  box-shadow: $video-shadow-md;
}

.control-btn.secondary {
  background: $video-bg-primary;
  color: $video-text-secondary;
  border: 1px solid $video-border;
}

.control-btn.secondary:hover {
  background: $video-bg-card;
  border-color: $video-primary;
  color: $video-primary;
}

.control-btn.secondary.active {
  background: linear-gradient(135deg, $video-primary, $video-primary-light);
  color: $video-text-light;
  border-color: transparent;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* 优化状态控制区域 */
.status-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detection-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: $video-bg-primary;
  border: 1px solid $video-border;
  border-radius: $video-radius-md;
  font-size: 0.75rem;
  font-weight: 500;
}

.detection-status.active {
  background: rgba($video-success, 0.1);
  border-color: $video-success;
  color: $video-success;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $video-text-muted;
  transition: all 0.3s ease;
}

.detection-status.active .status-indicator {
  background: $video-success;
  animation: pulse 2s infinite;
}

/* 优化主视频区域 */
.video-main-area {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.video-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
  width: 100%;
}

/* 优化摄像头占位符 */
.camera-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: $video-bg-primary;
  border-radius: $video-radius-xl;
  border: 2px dashed $video-border;
  min-height: 200px;
}

.placeholder-content {
  text-align: center;
  max-width: 250px;
}

.placeholder-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: $video-bg-card;
  border-radius: $video-radius-lg;
  margin: 0 auto 1rem;
  box-shadow: $video-shadow-sm;
}

.placeholder-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: $video-text-muted;
}

.placeholder-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.375rem;
  color: $video-text-primary;
}

.placeholder-desc {
  font-size: 0.75rem;
  margin: 0;
  color: $video-text-secondary;
  line-height: 1.5;
}

/* 优化视频流容器 */
.video-stream-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: $video-radius-xl;
  overflow: hidden;
  box-shadow: $video-shadow-xl;
  background: $video-text-primary;
}

.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: $video-text-primary;
}

.detection-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 重新设计实时分析面板 */
.emotion-panel {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba($video-bg-primary, 0.15);
  backdrop-filter: blur(20px);
  border-radius: $video-radius-lg;
  padding: 0.75rem;
  min-width: 180px;
  box-shadow: $video-shadow-lg;
  border: 1px solid rgba($video-border, 0.3);
}

/* 优化加载遮罩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba($video-text-primary, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid rgba($video-text-light, 0.3);
  border-top: 2px solid $video-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: $video-text-light;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 重新设计情绪分析容器 */
.emotion-analysis-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: $video-bg-card;
  border-radius: $video-radius-2xl;
  box-shadow: $video-shadow-lg;
  border: 1px solid $video-border;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 100px;
}

.emotion-analysis-container:hover {
  box-shadow: $video-shadow-xl;
}

.analysis-header {
  flex-shrink: 0;
  padding: 0.5rem;
  background: linear-gradient(135deg, $video-bg-primary 0%, $video-bg-card 100%);
  border-bottom: 1px solid $video-border;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.analysis-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, $video-primary, $video-primary-light);
  border-radius: $video-radius-lg;
  box-shadow: $video-shadow-sm;
}

.analysis-icon {
  width: 1rem;
  height: 1rem;
  color: $video-text-light;
}

.analysis-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.analysis-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: $video-text-primary;
  letter-spacing: -0.025em;
}

.analysis-subtitle {
  font-size: 0.75rem;
  margin: 0;
  color: $video-text-secondary;
  font-weight: 500;
}

.analysis-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: $video-bg-primary;
  border: 1px solid $video-border;
  border-radius: $video-radius-md;
  font-size: 0.75rem;
  font-weight: 500;
}

.analysis-status .status-indicator.active {
  background: $video-success;
  animation: pulse 2s infinite;
}

.chart-container {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  min-height: 100px;
}

.emotion-chart-container {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.emotion-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.5rem;
  overflow-y: auto;
  align-content: flex-start;
  height: 100%;
}

.emotion-card {
  flex: 1 1 calc(25% - 0.75rem);
  min-width: 130px;
  background: $video-bg-primary;
  border-radius: $video-radius-md;
  padding: 0.75rem;
  border-left: 4px solid;
  box-shadow: $video-shadow-sm;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.emotion-card:hover {
  transform: translateY(-2px);
  box-shadow: $video-shadow-md;
}

.emotion-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: $video-text-primary;
}

.emotion-emoji {
  font-size: 1.125rem;
}

.emotion-label {
  flex: 1;
}

.emotion-value {
  font-weight: 700;
  color: $video-text-primary;
}

.emotion-progress-bg {
  height: 6px;
  background: $video-border;
  border-radius: 3px;
  overflow: hidden;
}

.emotion-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.no-data-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: $video-bg-primary;
  border-radius: $video-radius-xl;
  border: 2px dashed $video-border;
  min-height: 200px;
}

.placeholder-content {
  text-align: center;
  max-width: 250px;
}

.placeholder-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: $video-bg-card;
  border-radius: $video-radius-lg;
  margin: 0 auto 1rem;
  box-shadow: $video-shadow-sm;
}

.placeholder-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: $video-text-muted;
}

.placeholder-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.375rem;
  color: $video-text-primary;
}

.placeholder-text {
  font-size: 0.75rem;
  margin: 0;
  color: $video-text-secondary;
  line-height: 1.5;
}

/* 添加动画效果 */
@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.05);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .video-section {
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .section-header,
  .video-main-area,
  .emotion-analysis-container {
    padding: 0.75rem;
  }
  
  .header-content {
    flex-direction: column;
    // gap: 0.75rem;
    align-items: flex-start;
  }
  
  .title-group {
    width: 100%;
  }
  
  .section-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .emotion-grid {
    gap: 0.5rem;
  }
  
  .emotion-card {
    padding: 0.5rem;
    flex: 1 1 calc(33.33% - 0.5rem);
    min-width: 110px;
  }
}

@media (max-width: 480px) {
  .video-section {
    padding: 0.5rem;
  }
  
  .section-header,
  .video-main-area,
  .emotion-analysis-container {
    padding: 0.75rem;
  }
  
  .section-title {
    font-size: 1.125rem;
  }
  
  .analysis-title {
    font-size: 1rem;
  }
}
</style>
