<template>
  <Transition name="fade-up" appear :delay="400">
    <div class="interview-guidelines">
      <h3 class="section-title">
        <InfoIcon class="section-icon" />
        面试须知
      </h3>
      <div class="guidelines-grid">
        <div class="guideline-item">
          <ClockIcon class="guideline-icon" />
          <div class="guideline-content">
            <h4>时间安排</h4>
            <p>预计用时 {{ interviewStore.selectedDirection?.duration }}，请确保时间充裕</p>
          </div>
        </div>
        <div class="guideline-item">
          <EyeIcon class="guideline-icon" />
          <div class="guideline-content">
            <h4>视线交流</h4>
            <p>面试过程中请保持与摄像头的眼神交流</p>
          </div>
        </div>
        <div class="guideline-item">
          <VolumeXIcon class="guideline-icon" />
          <div class="guideline-content">
            <h4>环境要求</h4>
            <p>请选择安静、光线充足的环境进行面试</p>
          </div>
        </div>
        <div class="guideline-item">
          <BrainIcon class="guideline-icon" />
          <div class="guideline-content">
            <h4>评测维度</h4>
            <p>将从专业知识、表达能力、逻辑思维等多维度评测</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { 
  InfoIcon, ClockIcon, EyeIcon, VolumeXIcon, BrainIcon 
} from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';
</script>

<style scoped>
@import '../../../styles/interview/guidelines.css';
</style>
