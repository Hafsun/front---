<template>
  <Transition name="slide-left" appear>
    <div class="video-preview-section">
      <h3 class="section-title">
        <EyeIcon class="section-icon" />
        视频预览
      </h3>
      <div class="video-preview-area">
        <!-- 视频流显示区域 -->
        <video ref="videoRef" autoplay playsinline muted class="video-element"></video>
        <!-- 隐藏的 canvas 用于捕获视频帧 -->
        <canvas ref="canvasRef" class="hidden-canvas"></canvas>

        <!-- 视频未启动时的覆盖层 -->
        <Transition name="fade">
          <div v-if="!videoStarted" class="video-overlay">
            <VideoIcon class="overlay-icon animate-pulse" />
            <p class="overlay-text">点击"测试设备"启用摄像头</p>
          </div>
        </Transition>

        <!-- 视频控制按钮（启用/禁用视频、音频） -->
        <Transition name="slide-up">
          <div v-if="videoStarted" class="video-controls">
            <button @click="$emit('toggle-video')" class="control-button">
              <VideoIcon v-if="videoEnabled" class="control-icon" />
              <VideoOffIcon v-else class="control-icon" />
            </button>
            <button @click="$emit('toggle-audio')" class="control-button">
              <MicIcon v-if="audioEnabled" class="control-icon" />
              <MicOffIcon v-else class="control-icon" />
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { 
  EyeIcon, VideoIcon, VideoOffIcon, MicIcon, MicOffIcon 
} from 'lucide-vue-next';

const props = defineProps({
  videoStarted: Boolean,
  videoEnabled: Boolean,
  audioEnabled: Boolean,
  mediaStream: Object
});

defineEmits(['toggle-video', 'toggle-audio']);

const videoRef = ref(null);
const canvasRef = ref(null);

watch(() => props.mediaStream, async (newStream) => {
  if (newStream && videoRef.value) {
    await nextTick();
    videoRef.value.srcObject = newStream;
    console.log('视频流已设置到video元素');
  }
}, { immediate: true });

watch(() => props.videoStarted, async (started) => {
  if (started && props.mediaStream && videoRef.value) {
    await nextTick();
    videoRef.value.srcObject = props.mediaStream;
  }
});
</script>

<style scoped>
@import '../../../styles/interview/video-preview.css';
</style>
