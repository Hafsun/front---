<template>
  <div class="stage-container">
    <div class="preparation-card">
      <!-- 卡片头部：返回选择、面试方向标题和开始面试按钮 -->
      <div class="card-header gradient-preparation">
        <div class="header-content preparation-header">
          <div class="header-left">
            <button @click="$emit('back-to-selection')" class="header-back-button">
              <ArrowLeftIcon class="button-icon" />
              重新选择
            </button>
          </div>

          <div class="header-center">
            <div class="icon-wrapper">
              <component :is="getIconComponent(interviewStore.selectedDirection?.icon)" class="header-icon" />
            </div>
            <div class="header-text">
              <h1 class="card-title">面试准备</h1>
              <p class="card-subtitle">请确保您的设备和环境已准备就绪</p>
            </div>
          </div>

          <div class="header-right">
            <button @click="$emit('start-interview')" :disabled="!allDevicesReady" class="header-start-button"
              :class="{ 'disabled': !allDevicesReady, 'button-hint-animation': startButtonHint }">
              <RocketIcon class="button-icon" />
              开始面试
            </button>
          </div>
        </div>
      </div>

      <!-- 准备内容区域 -->
      <div class="preparation-content">
        <div class="preparation-grid">
          <!-- 设备检测部分 -->
          <DeviceCheckSection 
            :camera-ready="cameraReady"
            :microphone-ready="microphoneReady"
            :environment-ready="environmentReady"
            :show-device-ready-message="showDeviceReadyMessage"
            :test-button-clicked="testButtonClicked"
            @test-devices="testDevices"
          />

          <!-- 视频预览部分 -->
          <VideoPreviewSection 
            :video-started="videoStarted"
            :video-enabled="videoEnabled"
            :audio-enabled="audioEnabled"
            :media-stream="mediaStream"
            @toggle-video="toggleVideo"
            @toggle-audio="toggleAudio"
          />
        </div>

        <!-- 面试须知部分 -->
        <InterviewGuidelines />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  ArrowLeftIcon, RocketIcon, MonitorIcon, ServerIcon, LayersIcon 
} from 'lucide-vue-next';
import { interviewStore } from '../../stores/interview';
import DeviceCheckSection from './preparation/DeviceCheckSection.vue';
import VideoPreviewSection from './preparation/VideoPreviewSection.vue';
import InterviewGuidelines from './preparation/InterviewGuidelines.vue';

defineEmits(['back-to-selection', 'start-interview']);

// 设备状态
const cameraReady = ref(false);
const microphoneReady = ref(false);
const environmentReady = ref(false);
const allDevicesReady = computed(() => cameraReady.value && microphoneReady.value && environmentReady.value);

// 视频状态
const videoStarted = ref(false);
const videoEnabled = ref(true);
const audioEnabled = ref(true);
const mediaStream = ref(null);

// UI状态
const showDeviceReadyMessage = ref(false);
const testButtonClicked = ref(false);
const startButtonHint = ref(false);

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    'MonitorIcon': MonitorIcon,
    'ServerIcon': ServerIcon,
    'LayersIcon': LayersIcon
  };
  return iconMap[iconName] || MonitorIcon;
};

const testDevices = async () => {
  testButtonClicked.value = true;
  
  try {
    // 请求摄像头和麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }, 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    mediaStream.value = stream;
    
    // 设备检测成功
    cameraReady.value = true;
    microphoneReady.value = true;
    environmentReady.value = true;
    videoStarted.value = true;
    
    showDeviceReadyMessage.value = true;
    startButtonHint.value = true;
    
    console.log('[v0] 设备测试成功，摄像头和麦克风已启用');
    
  } catch (error) {
    console.error('设备测试失败:', error);
    if (error.name === 'NotAllowedError') {
      alert('请允许访问摄像头和麦克风权限');
    } else if (error.name === 'NotFoundError') {
      alert('未找到摄像头或麦克风设备');
    } else {
      alert('设备测试失败，请检查设备连接');
    }
  }
  
  setTimeout(() => {
    testButtonClicked.value = false;
  }, 300);
};

const toggleVideo = () => {
  videoEnabled.value = !videoEnabled.value;
  if (mediaStream.value) {
    const videoTracks = mediaStream.value.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = videoEnabled.value;
    });
  }
};

const toggleAudio = () => {
  audioEnabled.value = !audioEnabled.value;
  if (mediaStream.value) {
    const audioTracks = mediaStream.value.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = audioEnabled.value;
    });
  }
};

onMounted(() => {
  // 组件挂载时的初始化逻辑
});

onUnmounted(() => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
    mediaStream.value = null;
  }
});
</script>

<style scoped>
@import '../../styles/interview/preparation.css';
@import '../../styles/interview/interview-stage.css';
</style>
