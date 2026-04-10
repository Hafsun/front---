<template>
  <div class="report-summary-section">
    <div class="summary-item">
      <span class="summary-label">面试方向:</span>
      <span class="summary-value">{{ interviewStore.selectedDirection?.name }}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">目标岗位:</span>
      <span class="summary-value">{{ targetPosition }}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">综合得分:</span>
      <span class="summary-value score-highlight">{{ overallScore }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { interviewStore } from '../../../stores/interview';

const targetPosition = computed(() => {
  return interviewStore.selectedTargetPosition || '自定义岗位';
});

const overallScore = computed(() => {
  return interviewStore.finalReportData?.overall_report?.summary?.average_accuracy_score;
});
</script>

<style scoped>
@import '../../../styles/interview/report-summary.css';
</style>
