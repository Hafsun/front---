<template>
  <div class="report-loading">
    <div class="loading-animation">
      <div class="loading-circle"></div>
      <div class="loading-text">
        <Loader2Icon class="loading-icon animate-spin" />
        <span>AI正在分析您的面试表现...</span>
      </div>
    </div>
    <div class="loading-steps">
      <TransitionGroup name="step-fade" tag="div">
        <div :key="1" class="step" :class="{ 'active': interviewStore.reportStep >= 1 }">
          <BrainIcon class="step-icon" />
          <span>分析语音表达</span>
        </div>
        <div :key="2" class="step" :class="{ 'active': interviewStore.reportStep >= 2 }">
          <EyeIcon class="step-icon" />
          <span>评估视觉表现</span>
        </div>
        <div :key="3" class="step" :class="{ 'active': interviewStore.reportStep >= 3 }">
          <FileTextIcon class="step-icon" />
          <span>生成评测报告</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { Loader2Icon, BrainIcon, EyeIcon, FileTextIcon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';
</script>

<style scoped>
@import '../../../styles/interview/report-loading.css';
</style>
