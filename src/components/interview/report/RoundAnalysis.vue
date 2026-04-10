<template>
  <div class="report-section">
    <h3 class="section-title">
      <MessageSquareTextIcon class="section-icon" />每轮问题详细分析
    </h3>
    <div class="round-analysis-list">
      <div v-for="(round, index) in roundAnalysis" :key="index" class="round-analysis-card">
        <h4>第 {{ round.round_number }} 轮问题</h4>
        <div class="analysis-item">
          <strong>问题:</strong> {{ round.question }}
        </div>
        <div class="analysis-item">
          <strong>回答:</strong> {{ round.answer }}
        </div>
        <div class="analysis-item">
          <strong>准确率评估 (得分: {{ round.accuracy_evaluation?.score}}) :</strong>
          <ul>
            <li>完整性: {{ round.accuracy_evaluation?.completeness }}</li>
            <li>逻辑严谨性: {{ round.accuracy_evaluation?.logical_rigor }}</li>
            <li>匹配度: {{ round.accuracy_evaluation?.matching_degree }}</li>
            <li>技术正确性: {{ round.accuracy_evaluation?.technical_correctness }}</li>
          </ul>
        </div>
        <div class="analysis-item">
          <strong>表情分析 (主导情绪: {{ round.expression_analysis?.dominant_emotion }}):</strong>
          <ul>
            <li>强度与持续时间: {{ round.expression_analysis?.intensity_duration }}</li>
            <li>合理性分析: {{ round.expression_analysis?.rationality_analysis }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { MessageSquareTextIcon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';

const roundAnalysis = computed(() => {
  return interviewStore.finalReportData?.overall_report?.round_analysis || [];
});
</script>

<style scoped>
@import '../../../styles/interview/round-analysis.css';
</style>
