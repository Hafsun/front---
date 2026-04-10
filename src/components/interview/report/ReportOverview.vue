<template>
  <div class="report-section">
    <h3 class="section-title">
      <ClipboardListIcon class="section-icon" />整体表现概览
    </h3>
    <div class="overview-content">
      <p><strong>表现总览:</strong> {{ performanceOverview }}</p>
      <p><strong>表情模式:</strong> {{ expressionPattern }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ClipboardListIcon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';

const performanceOverview = computed(() => {
  return interviewStore.finalReportData?.overall_report?.summary?.performance_overview || 'N/A';
});

const expressionPattern = computed(() => {
  return interviewStore.finalReportData?.overall_report?.summary?.expression_pattern || 'N/A';
});
</script>

<style scoped>
@import '../../../styles/interview/report-overview.css';
</style>
