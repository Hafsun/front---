<template>
  <Transition name="slide-right" appear>
    <div class="device-check-section">
      <h3 class="section-title">
        <SettingsIcon class="section-icon" />
        设备检测
      </h3>
      <div class="device-checks">
        <!-- 摄像头检测项 -->
        <Transition name="check-item" appear :delay="100">
          <div class="check-item" :class="{ 'checked': cameraReady }">
            <VideoIcon class="check-icon" />
            <span>摄像头</span>
            <div class="check-status">
              <CheckCircleIcon v-if="cameraReady" class="status-icon success" />
              <AlertCircleIcon v-else class="status-icon warning" />
            </div>
          </div>
        </Transition>
        <!-- 麦克风检测项 -->
        <Transition name="check-item" appear :delay="200">
          <div class="check-item" :class="{ 'checked': microphoneReady }">
            <MicIcon class="check-icon" />
            <span>麦克风</span>
            <div class="check-status">
              <CheckCircleIcon v-if="microphoneReady" class="status-icon success" />
              <AlertCircleIcon v-else class="status-icon warning" />
            </div>
          </div>
        </Transition>
        <!-- 环境光线检测项 -->
        <Transition name="check-item" appear :delay="300">
          <div class="check-item" :class="{ 'checked': environmentReady }">
            <SunIcon class="check-icon" />
            <span>环境光线</span>
            <div class="check-status">
              <CheckCircleIcon v-if="environmentReady" class="status-icon success" />
              <AlertCircleIcon v-else class="status-icon warning" />
            </div>
          </div>
        </Transition>
      </div>
      <button @click="$emit('test-devices')" class="test-button"
        :class="{ 'button-clicked-animation': testButtonClicked }">
        <PlayIcon class="button-icon" />
        测试设备
      </button>
      <Transition name="fade">
        <div v-if="showDeviceReadyMessage" class="device-ready-message">
          <CheckCircleIcon class="message-icon" />
          <span>所有设备已检查完毕，可以开始面试！</span>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { 
  SettingsIcon, VideoIcon, MicIcon, SunIcon, 
  CheckCircleIcon, AlertCircleIcon, PlayIcon 
} from 'lucide-vue-next';

defineProps({
  cameraReady: Boolean,
  microphoneReady: Boolean,
  environmentReady: Boolean,
  showDeviceReadyMessage: Boolean,
  testButtonClicked: Boolean
});

defineEmits(['test-devices']);
</script>

<style scoped>
@import '../../../styles/interview/device-check.css';
</style>
