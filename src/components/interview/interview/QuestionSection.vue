<template>
  <Transition name="slide-left" appear>
    <div class="question-section">
      <!-- 重构为三个同级容器：问题容器、聆听状态容器、用户回答容器 -->
      
      <!-- 第一个容器：当前问题显示 -->
      <Transition name="question-change" mode="out-in">
        <div :key="interviewStore.currentQuestionIndex" class="current-question">
          <div class="question-header">
            <h3 class="question-title">
              <MessageSquareIcon class="question-icon" />
              当前问题
            </h3>
            <div class="question-progress">
              <span class="question-number">第 {{ interviewStore.currentQuestionIndex + 1 }} 题</span>
              <div class="progress-circle-indicator">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <defs>
                    <linearGradient :id="`gradient-${interviewStore.currentQuestionIndex}`" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop v-for="(color, index) in getProgressColors(interviewStore.currentQuestionIndex + 1)" 
                            :key="index"
                            :offset="`${(index / (getProgressColors(interviewStore.currentQuestionIndex + 1).length - 1)) * 100}%`" 
                            :stop-color="color" />
                    </linearGradient>
                  </defs>
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="14" 
                    :fill="`url(#gradient-${interviewStore.currentQuestionIndex})`"
                    stroke="#e5e7eb" 
                    stroke-width="2"
                  />
                  <text x="16" y="20" text-anchor="middle" class="circle-text">{{ interviewStore.currentQuestionIndex + 1 }}</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="question-content">
            <span v-if="interviewStore.isGeneratingQuestion">
              <Loader2Icon class="inline-block animate-spin mr-2" />
              正在生成问题...
            </span>
            <div v-else class="question-typed-content">
              <div class="question-text-container">
                <p class="question-text">{{ displayedQuestionText }}<span v-if="isTypingQuestion" class="cursor">|</span></p>
              </div>
              
              <!-- 移除嵌套的回答提示，保持问题容器的独立性 -->
              <div v-if="questionHints.length > 0 && !isTypingQuestion" class="question-hints">
                <h4 class="hints-title">
                  <LightbulbIcon class="hints-icon" />
                  回答提示
                </h4>
                <ul class="hints-list">
                  <li v-for="hint in questionHints" :key="hint" class="hint-item">
                    {{ hint }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 第二个容器：聆听状态显示（独立容器） -->
      <Transition name="fade" appear>
        <div v-if="isUserAnswering && !isTypingQuestion" class="listening-status-section">
          <div class="speech-status">
            <div class="status-indicator" :class="{ 'listening': isListening }">
              <MicIcon class="mic-icon" :class="{ 'active': isListening }" />
              <div class="pulse-ring" v-if="isListening"></div>
            </div>
            <div class="status-text">
              <h4 class="status-title">
                {{ isListening ? '正在聆听您的回答...' : '请开始回答问题' }}
              </h4>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 第三个容器：用户回答显示（独立容器） -->
      <Transition name="slide-up" appear>
        <div v-if="(isUserAnswering || interviewStore.isRecordingAudio) && !isTypingQuestion" class="user-answer-section">
          <!-- 用户回答模式 -->
          <div v-if="isUserAnswering" class="answer-content">
            <h4 class="answer-title">
              <MicIcon class="answer-icon" />
              您的回答（可直接在此修改文字）
            </h4>
            <div class="answer-scroll-container">
              <el-input
                v-model="editableTranscript"
                type="textarea"
                :rows="4"
                resize="none"
                :placeholder="isListening ? '正在聆听，请开始说话...' : '等待语音输入，或直接在此打字...'"
                class="editable-transcript"
                @input="onTranscriptInput"
              />
            </div>
          </div>
          
          <!-- 录音模式 -->
          <div v-else-if="interviewStore.isRecordingAudio" class="transcript-content">
            <h4 class="transcript-title">
              <MicIcon class="transcript-icon" />
              您的回答
            </h4>
            <div class="transcript-scroll-container scrollable-content">
              <el-input
                v-model="editableTranscript"
                type="textarea"
                :rows="4"
                resize="none"
                placeholder="等待您的回答，或直接在此打字..."
                class="editable-transcript"
                @input="onTranscriptInput"
              />
            </div>
          </div>
        </div>
      </Transition>

      <!-- 控制按钮保持在底部 -->
      <Transition name="slide-up" appear :delay="200">
        <div class="interview-controls">
          <button @click="$emit('pause-interview')" class="control-btn pause-btn">
            <PauseIcon class="btn-icon" />
            暂停
          </button>
          <button @click="$emit('next-question')" class="control-btn next-btn"
            :disabled="interviewStore.isGeneratingQuestion || isTypingQuestion">
            <span v-if="interviewStore.isGeneratingQuestion" class="loading-content">
              <Loader2Icon class="btn-icon animate-spin" />
              生成中...
            </span>
            <span v-else class="btn-content">
              <SkipForwardIcon class="btn-icon" />
              下一题
            </span>
          </button>
          <button @click="$emit('end-interview')" class="control-btn end-btn">
            <StopCircleIcon class="btn-icon" />
            结束面试
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { 
  MessageSquareIcon, Loader2Icon, MicIcon, LightbulbIcon,
  PauseIcon, SkipForwardIcon, StopCircleIcon
} from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';

const props = defineProps({
  interviewProgress: Number,
  displayedQuestionText: String,
  isTypingQuestion: Boolean,
  displayUserTranscript: String,
  questionHints: Array,
  isUserAnswering: Boolean,
  isListening: Boolean
});

const emit = defineEmits(['pause-interview', 'next-question', 'end-interview', 'update-transcript']);

const editableTranscript = ref(props.displayUserTranscript || '');

watch(() => props.displayUserTranscript, (newVal) => {
  if (editableTranscript.value !== newVal) {
    editableTranscript.value = newVal || '';
  }
});

const onTranscriptInput = (value) => {
  emit('update-transcript', value);
};

const getProgressColors = (questionNumber) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
  const result = [];
  for (let i = 0; i < questionNumber; i++) {
    result.push(colors[i % colors.length]);
  }
  return result.length === 1 ? [result[0], result[0]] : result;
};
</script>

<!-- 移除所有内联样式，样式已合并到CSS文件中 -->
<style scoped>
@import '../../../styles/interview/question-section.css';
</style>
