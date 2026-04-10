
<template>
  <div class="report-section">
    <h3 class="section-title">
      <StarIcon class="section-icon" />关键问题分析
    </h3>
    <div class="key-issues-grid">
      <div class="key-issue-card top-performance">
        <h4>
          <AwardIcon class="issue-icon" />表现最佳
        </h4>
        <ul v-if="topPerformance.length">
          <li v-for="(item, index) in topPerformance" :key="index">
            <strong>第{{ item.round_number }}轮:</strong> {{ item.problem_summary }}
            <p class="issue-detail">{{ item.strengths }}</p>
          </li>
        </ul>
        <p v-else class="no-data">暂无最佳表现问题。</p>
      </div>
      <div class="key-issue-card weak-performance">
        <h4>
          <AlertTriangleIcon class="issue-icon" />表现薄弱
        </h4>
        <ul v-if="weakPerformance.length">
          <li v-for="(item, index) in weakPerformance" :key="index">
            <strong>第{{ item.round_number }}轮:</strong> {{ item.problem_summary }}
            <p class="issue-detail">{{ item.weakness_analysis }}</p>
          </li>
        </ul>
        <p v-else class="no-data">暂无薄弱表现问题。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { StarIcon, AwardIcon, AlertTriangleIcon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';

const topPerformance = computed(() => {
  return interviewStore.finalReportData?.overall_report?.key_issues?.top_performance || [];
});

const weakPerformance = computed(() => {
  return interviewStore.finalReportData?.overall_report?.key_issues?.weak_performance || [];
});
</script>

<style scoped>
@import '../../../styles/interview/key-issues.css';
</style>
