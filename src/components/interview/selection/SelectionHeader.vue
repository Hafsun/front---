<template>
  <div class="card-header gradient-ai">
    <div class="header-content">
      <div class="header-left">
        <div class="icon-wrapper">
          <BrainCircuitIcon class="header-icon" />
        </div>
        <div class="header-text">
          <h1 class="card-title">智能面试评测系统</h1>
          <p class="card-subtitle">选择您的面试方向，开启专业评测之旅</p>
        </div>
      </div>
      <div class="header-right">
        <button @click="$emit('proceed')" :disabled="!canProceed" class="header-proceed-button"
          :class="{ 'disabled': !canProceed }">
          <ArrowRightIcon class="button-icon" />
          开始准备面试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { BrainCircuitIcon, ArrowRightIcon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';

defineEmits(['proceed']);

// 检查是否可以进入下一阶段
const canProceed = computed(() => {
  return interviewStore.selectedDirection && interviewStore.selectedTargetPosition;
});
</script>

<style scoped>
@import '../../../styles/interview/interview-stage.css';
@import '../../../styles/interview/selection-header.css';
</style>
