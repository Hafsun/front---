<template>
  <div class="stage-container">
    <div class="interview-card">
      <!-- 采用与其他阶段一致的卡片头部设计 -->
      <div class="card-header gradient-interview">
        <div class="header-content interview-header">
          <div class="header-left">
            <div class="interview-identity">
              <div class="icon-wrapper">
                <component :is="getIconComponent(interviewStore.selectedDirection?.icon)" class="header-icon" />
              </div>
              <div class="identity-info">
                <h1 class="card-title">{{ interviewStore.selectedDirection?.name }} 面试</h1>
                <p class="card-subtitle">第 {{ interviewStore.currentQuestionIndex + 1 }} 轮 · 持续对话模式</p>
              </div>
            </div>
          </div>
          
          <div class="header-right">
            <div class="timer-display">
              <ClockIcon class="timer-icon" />
              <span class="timer-text">{{ formatTime(interviewStore.elapsedTime) }}</span>
            </div>
            <!-- 添加统计按钮 -->
            <button 
              v-if="emotionHistoryStats && emotionHistoryStats.totalDataPoints > 0" 
              @click="showStats" 
              class="stats-btn"
              title="查看表情统计"
            >
              <BarChart3Icon class="stats-icon" />
              统计
            </button>
          </div>
        </div>
      </div>

      <!-- 重新设计主内容区域，采用现代化卡片布局 -->
      <div class="interview-content">
        <div class="content-grid">
          <!-- 使用VideoSection组件替换原来的视频监控代码 -->
          <VideoSection ref="videoSectionRef" />

          <!-- 问题交互卡片 -->
          <div class="question-card">
            <QuestionSection 
              :interview-progress="interviewProgress"
              :displayed-question-text="displayedQuestionText"
              :is-typing-question="isTypingQuestion"
              :display-user-transcript="displayUserTranscript"
              :question-hints="questionHints"
              :is-user-answering="interviewStore.isUserAnswering"
              :is-listening="interviewStore.isListening"
              @update-transcript="handleTranscriptUpdate"
              @pause-interview="pauseInterview"
              @next-question="nextQuestion"
              @end-interview="endInterview"
            />
          </div>
        </div>

        <!-- 添加统计信息弹窗 -->
        <div v-if="showStatsModal" class="stats-modal-overlay" @click="closeStatsModal">
          <div class="stats-modal" @click.stop>
            <div class="stats-modal-header">
              <h3>表情统计信息</h3>
              <button @click="closeStatsModal" class="close-btn">
                <XIcon class="close-icon" />
              </button>
            </div>
            <div class="stats-modal-content" v-if="emotionHistoryStats">
              <div class="stats-overview">
                <div class="stat-card">
                  <div class="stat-label">数据点数</div>
                  <div class="stat-value">{{ emotionHistoryStats.totalDataPoints }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">检测帧率</div>
                  <div class="stat-value">{{ emotionHistoryStats.fps }} FPS</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">时间跨度</div>
                  <div class="stat-value">{{ Math.round(emotionHistoryStats.timeSpan) }}s</div>
                </div>
              </div>
              <div class="emotion-stats">
                <h4>表情分析</h4>
                <div class="emotion-list">
                  <div 
                    v-for="(stat, emotion) in emotionHistoryStats.emotionStats" 
                    :key="emotion" 
                    class="emotion-stat-item"
                  >
                    <div class="emotion-name">{{ formatEmotion(emotion) }}</div>
                    <div class="emotion-values">
                      <span class="emotion-avg">平均: {{ stat.average }}</span>
                      <span class="emotion-max">最高: {{ stat.max }}</span>
                    </div>
                  </div>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ClockIcon, CameraIcon, PlayIcon, CameraOffIcon, BarChart3Icon, XIcon } from 'lucide-vue-next';
import { interviewStore } from '../../stores/interview';
import QuestionSection from './interview/QuestionSection.vue';
import VideoSection from './interview/VideoSection.vue';
import { websocketManager } from '../../utils/request';

const emit = defineEmits(['end-interview']);

const videoSectionRef = ref(null);

// 面试状态
const isTypingQuestion = ref(false);
const displayedQuestionText = ref('');
const displayUserTranscript = ref('');
const questionHints = ref([]);

const isWebSocketConnected = ref(false);
const recognition = ref(null);
const completeUserAnswer = ref('');

// 统计弹窗状态
const showStatsModal = ref(false);

let isIgnoringResults = false;

const handleTranscriptUpdate = (val) => {
  displayUserTranscript.value = val;
  completeUserAnswer.value = val;
  
  // 如果用户手动修改了文本，需要停止当前语音识别段落
  // 以防 WebSpeech API 内部将其原本积攒的旧识别结果继续附加在后面。
  // (调用 stop() 后会引发一两次最后无用的 onresult 输出旧数据，我们需进行拦截)
  if (recognition.value && interviewStore.isListening) {
    isIgnoringResults = true;
    try {
      recognition.value.stop();
    } catch(e) {
      // 忽略重复调用 stop 可能导致的报错
      console.log('忽略调用 stop() 的错误', e);
    }
  }
};

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    'CameraIcon': CameraIcon,
    'PlayIcon': PlayIcon,
    'CameraOffIcon': CameraOffIcon
  };
  return iconMap[iconName] || CameraIcon;
};

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatEmotion = (emotion) => {
  const map = {
    'happy': '开心',
    'sad': '悲伤',
    'angry': '生气',
    'surprised': '惊讶',
    'fearful': '害怕',
    'neutral': '中性',
    'disgusted': '厌恶'
  };
  return map[emotion] || emotion;
};

const connectWebSocket = async () => {
  try {
    await websocketManager.connect(
      handleWebSocketMessage,
      (error) => {
        console.error('WebSocket错误:', error);
        isWebSocketConnected.value = false;
      },
      (event) => {
        console.log('WebSocket连接关闭:', event.code, event.reason);
        isWebSocketConnected.value = false;
      }
    );
    
    isWebSocketConnected.value = true;
    console.log('WebSocket连接已建立');
    
    const contentString = buildContentString();
    // 获取题库URL
    const questionBankUrl = getQuestionBankUrl();
    sendWebSocketMessage({
      action: 'init_system',
      content: contentString,
      url: questionBankUrl // 新增：传递题库URL
    });
  } catch (error) {
    console.error('WebSocket连接失败:', error);
    isWebSocketConnected.value = false;
  }
};

const sendWebSocketMessage = (message) => {
  const success = websocketManager.send(message);
  if (!success) {
    console.warn('WebSocket未连接，无法发送消息');
  }
};

const handleWebSocketMessage = (message) => {
  if (!message || typeof message !== 'object') {
    console.error('无效的WebSocket消息格式:', message);
    return;
  }
  
  switch (message.type) {
    case 'chunk':
      handleQuestionChunk(message.content);
      break;
    case 'question_generated':
      handleQuestionGenerated(message.data);
      break;
    case 'end':
      handleQuestionEnd();
      break;
    case 'evaluation_result':
      handleEvaluationResult(message.data);
      break;
    case 'emotion_update':
      handleEmotionUpdate(message.data);
      break;
    case 'error': {
      const errorMessage = message.data?.message || message.data?.error || message.data || '未知服务器错误';
      console.error('服务器错误:', errorMessage);
      break;
    }
    default:
      console.log('未知消息类型:', message.type, '数据:', message.data);
  }
};

const handleQuestionChunk = (content) => {
  if (content && typeof content === 'string') {
    if (!isTypingQuestion.value) {
      isTypingQuestion.value = true;
      displayedQuestionText.value = '';
      interviewStore.isGeneratingQuestion = false;
    }
    
    displayedQuestionText.value += content;
    interviewStore.currentQuestion = displayedQuestionText.value;
  }
};

const handleQuestionGenerated = (data) => {
  if (isTypingQuestion.value) {
    isTypingQuestion.value = false;
    console.log('问题生成完成，启动麦克风和面部识别');
    startUserAnswering();
    if (videoSectionRef.value) {
      videoSectionRef.value.startDetection();
    }
  } else {
    interviewStore.isGeneratingQuestion = false;
    interviewStore.setCurrentQuestion(data.question, data.index, data.total);
    
    isTypingQuestion.value = true;
    displayedQuestionText.value = '';
    typeQuestion(data.question);
  }
  
  if (data.hints) {
    questionHints.value = data.hints;
  }
};

const typeQuestion = (question) => {
  let index = 0;
  const typeInterval = setInterval(() => {
    if (index < question.length) {
      displayedQuestionText.value += question[index];
      index++;
    } else {
      clearInterval(typeInterval);
      isTypingQuestion.value = false;
      console.log('问题打字完成，启动麦克风和面部识别');
      startUserAnswering();
      if (videoSectionRef.value) {
        videoSectionRef.value.startDetection();
      }
    }
  }, 50);
};

const handleEvaluationResult = (data) => {
  if (data.expression_info) {
    interviewStore.setLastQuestionEvaluation(data.expression_info, data.integrated_score);
  }
};

const handleEmotionUpdate = (data) => {
  interviewStore.updateCurrentEmotions(data);
};

const handleQuestionEnd = () => {
  console.log('问题生成结束，开启用户回答模式');
  
  isTypingQuestion.value = false;
  
  startUserAnswering();
  
  if (videoSectionRef.value) {
    videoSectionRef.value.startDetection();
  }
};

const initSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('浏览器不支持语音识别');
    return false;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition.value = new SpeechRecognition();
  
  recognition.value.continuous = true;
  recognition.value.interimResults = true;
  recognition.value.lang = 'zh-CN';
  recognition.value.maxAlternatives = 1;
  
  recognition.value.onstart = () => {
    console.log('语音识别开始');
    interviewStore.setListening(true);
    isIgnoringResults = false; // 每次重开识别，释放拦截
  };
  
  recognition.value.onresult = (event) => {
    if (isIgnoringResults) return; // 拦截被停止引发的滞后回调
    
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    if (finalTranscript) {
      completeUserAnswer.value += finalTranscript;
      console.log('完整用户回答:', completeUserAnswer.value);
    }
    
    displayUserTranscript.value = completeUserAnswer.value + interimTranscript;
  };
  
  recognition.value.onerror = (event) => {
    console.error('语音识别错误:', event.error);
    interviewStore.setListening(false);
    
    switch (event.error) {
      case 'aborted':
        console.log('语音识别被中止，不自动重启');
        break;
      case 'no-speech':
        console.log('未检测到语音，1秒后重启');
        setTimeout(() => {
          if (interviewStore.isUserAnswering && !interviewStore.isListening) {
            startSpeechRecognition();
          }
        }, 1000);
        break;
      case 'audio-capture':
        console.log('音频捕获失败，检查麦克风权限');
        break;
      case 'not-allowed':
        console.log('麦克风权限被拒绝');
        break;
      case 'network':
        console.log('网络错误，2秒后重试');
        setTimeout(() => {
          if (interviewStore.isUserAnswering && !interviewStore.isListening) {
            startSpeechRecognition();
          }
        }, 2000);
        break;
      default:
        console.log('其他错误，500ms后重试');
        setTimeout(() => {
          if (interviewStore.isUserAnswering && !interviewStore.isListening) {
            startSpeechRecognition();
          }
        }, 500);
    }
  };
  
  recognition.value.onend = () => {
    console.log('语音识别结束');
    interviewStore.setListening(false);
    
    if (interviewStore.isUserAnswering && !interviewStore.isListening) {
      setTimeout(() => {
        console.log('自动重启语音识别');
        startSpeechRecognition();
      }, 100);
    }
  };
  
  return true;
};

const startSpeechRecognition = () => {
  if (interviewStore.isListening) {
    console.log('语音识别已在运行中');
    return;
  }
  
  if (!recognition.value) {
    if (!initSpeechRecognition()) {
      console.error('无法初始化语音识别');
      return;
    }
  }
  
  try {
    if (recognition.value.state === 'started') {
      recognition.value.stop();
      setTimeout(() => {
        recognition.value.start();
        console.log('重新启动语音识别');
      }, 100);
    } else {
      recognition.value.start();
      console.log('开始语音识别');
    }
  } catch (error) {
    console.error('启动语音识别失败:', error);
    setTimeout(() => {
      if (interviewStore.isUserAnswering && !interviewStore.isListening) {
        startSpeechRecognition();
      }
    }, 2000);
  }
};

const stopSpeechRecognition = () => {
  if (recognition.value && interviewStore.isListening) {
    interviewStore.setUserAnswering(false);
    interviewStore.isRecordingAudio = false;
    console.log('设置录音状态为false');
    recognition.value.stop();
  }
};

const showStats = () => {
  const stats = interviewStore.getEmotionHistoryStats();
  if (stats) {
    showStatsModal.value = true;
  } else {
    console.log('暂无表情统计数据');
  }
};

const closeStatsModal = () => {
  showStatsModal.value = false;
};

const startUserAnswering = () => {
  console.log('开始用户回答模式');
  interviewStore.setUserAnswering(true);
  completeUserAnswer.value = '';
  displayUserTranscript.value = '';
  
  interviewStore.setAnswerStartTime(Date.now());
  interviewStore.setAnswerEndTime(null);
  
  interviewStore.isRecordingAudio = true;
  interviewStore.currentStage = 'answering';
  console.log('设置录音状态为true，当前阶段为answering');
  
  startSpeechRecognition();
};

const nextQuestion = () => {
  console.log('点击下一题，停止面部识别和语音识别');
  
  stopSpeechRecognition();
  
  if (videoSectionRef.value) {
    videoSectionRef.value.stopDetection();
    const avgEmotionData = videoSectionRef.value.calculateAverageEmotions();
    console.log('获取到的平均情绪数据:', avgEmotionData);
    

    const safeEmotionData = avgEmotionData || { averageExpressions: { neutral: "100%" } };

    const currentAnswer = displayUserTranscript.value.trim() || completeUserAnswer.value.trim();
    const currentQuestion = interviewStore.currentQuestion;
    
    if (currentQuestion) {
      interviewStore.saveInterviewRound(currentQuestion, currentAnswer, safeEmotionData);
      console.log('保存了当前轮次数据:', {
        question: currentQuestion,
        answer: currentAnswer,
        emotion: safeEmotionData
      });
    }
  }
  
  generateNextQuestion();
};

const pauseInterview = () => {
  console.log('暂停面试');
};

const endInterview = () => {
  console.log('结束面试，准备生成报告');
  
  stopSpeechRecognition();
  
  if (videoSectionRef.value) {
    videoSectionRef.value.stopDetection();
    const avgEmotionData = videoSectionRef.value.calculateAverageEmotions();
    console.log('最后一轮的平均情绪数据:', avgEmotionData);
    
    const currentAnswer = displayUserTranscript.value.trim() || completeUserAnswer.value.trim();
    const currentQuestion = interviewStore.currentQuestion;
    
    if (currentQuestion) {
      interviewStore.saveInterviewRound(currentQuestion, currentAnswer, avgEmotionData);
      console.log('保存了最后一轮数据:', {
        question: currentQuestion,
        answer: currentAnswer,
        emotion: avgEmotionData
      });
    }
  }
  
  interviewStore.setAnswerEndTime(Date.now());
  interviewStore.setUserAnswering(false);
  interviewStore.isGeneratingReport = true;
  
  emit('end-interview');
};

const generateNextQuestion = () => {
  if (!websocketManager.isConnected()) {
    console.warn('WebSocket未连接，无法生成问题');
    return;
  }
  
  interviewStore.setAnswerEndTime(Date.now());
  interviewStore.setUserAnswering(false);
  interviewStore.isGeneratingQuestion = true;
  interviewStore.isRecordingAudio = false;
  
  const currentAnswer = displayUserTranscript.value.trim() || completeUserAnswer.value.trim();
  // 获取题库URL
  const questionBankUrl = getQuestionBankUrl();
  
  sendWebSocketMessage({
    action: 'generate_next_question',
    content: currentAnswer,
    questionIndex: interviewStore.currentQuestionIndex,
    totalAnswered: interviewStore.interviewHistory.length,
    url: questionBankUrl // 新增：传递题库URL
  });
  
  displayUserTranscript.value = '';
  completeUserAnswer.value = '';
  interviewStore.clearCurrentRoundData();
  
  interviewStore.currentQuestionIndex++;
};

// ========== 修正：获取题库URL（适配实际字段名） ==========
const getQuestionBankUrl = () => {
  // 实际存储的是 selectedBankFile，不是 selectedBank.file
  if (interviewStore.selectedBankFile) {
    return interviewStore.selectedBankFile.url || '';
  }
  return '';
};

const interviewProgress = computed(() => {
  return interviewStore.interviewHistory.length * 20;
});

const emotionHistoryStats = computed(() => {
  return interviewStore.getEmotionHistoryStats();
});

const buildContentString = () => {
  const direction = interviewStore.selectedDirection;
  const tags = interviewStore.selectedTags;
  const targetPosition = interviewStore.selectedTargetPosition;
  
  let contentParts = [];
  
  // 添加面试方向信息
  if (direction) {
    contentParts.push(`面试方向：${direction.name}`);
    if (direction.description) {
      contentParts.push(`专业领域：${direction.description}`);
    }
  }
  
  // 添加技术标签信息
  if (tags && tags.length > 0) {
    const tagNames = tags.map(tag => tag.name).join('、');
    contentParts.push(`技术重点：${tagNames}`);
  }
  
  // 添加目标岗位信息
  if (targetPosition && targetPosition.trim()) {
    contentParts.push(`目标岗位：${targetPosition}`);
  }
  
  // 新增：添加题库URL信息
  // if (questionBankUrl) {
  //   contentParts.push(`题库文件URL：${questionBankUrl}`);
  // }
  
  // 添加面试要求说明
  contentParts.push('请根据以上信息生成针对性的面试问题，注重实际应用和技术深度。');
  
  return contentParts.join('；');
};

onMounted(async () => {
  console.log('组件挂载，开始初始化');
  
  // 清空旧的面试记录和报告缓存，防止因为跳过“Start New Interview”导致历史数据残留互相影响
  interviewStore.interviewHistory = [];
  interviewStore.finalReportData = null;
  interviewStore.isGeneratingReport = false;
  
  initSpeechRecognition();
  connectWebSocket();
  
  interviewStore.setCurrentQuestion('', 0, 5);
  displayedQuestionText.value = '正在生成第一个问题，请稍候...';
  
  console.log('面试开始，立即启动摄像头');
  await nextTick();
  if (videoSectionRef.value) {
    console.log('VideoSection组件已准备好，开始初始化摄像头');
    await videoSectionRef.value.initCamera();
  }
  
  interviewStore.timerRef = setInterval(() => {
    interviewStore.elapsedTime++;
  }, 1000);
});

onUnmounted(() => {
  websocketManager.close();
  stopSpeechRecognition();
  
  if (interviewStore.timerRef) {
    clearInterval(interviewStore.timerRef);
    interviewStore.timerRef = null;
  }
});
</script>

<style scoped>
@import '../../styles/interview/interview-stage.css';
</style>