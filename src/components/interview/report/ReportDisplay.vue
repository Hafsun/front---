<template>
  <div class="report-display">
    <h2 class="report-main-title">综合面试报告</h2>
    
    <!-- 报告摘要 -->
    <ReportSummary />
    
    <!-- 整体表现概览 -->
    <ReportOverview />
    
    <!-- 关键问题分析 -->
    <KeyIssuesAnalysis />
    
    <!-- 图表区域 -->
    <ChartsSection />
    
    <!-- 每轮问题详细分析 -->
    <RoundAnalysis />
    
    <!-- 报告操作按钮 -->
    <div class="report-actions">
      <button @click="$emit('view-report')" class="view-report-button" :class="{ 'disabled': !isReportSaved }"
        :disabled="!isReportSaved">
        <FileTextIcon class="button-icon" />
        查看详细报告
      </button>
      <button @click="$emit('start-new-interview')" class="new-interview-button">
        <RefreshCwIcon class="button-icon" />
        开始新面试
      </button>
      <!-- 修改保存报告按钮，添加保存状态显示 -->
      <button 
        @click="$emit('save-report')" 
        class="save-report-button"
        :class="{ 'saved': isReportSaved, 'saving': isSaving }"
        :disabled="isSaving || isReportSaved"
      >
        <SaveIcon v-if="!isSaving && !isReportSaved" class="button-icon" />
        <div v-if="isSaving" class="loading-spinner"></div>
        <CheckIcon v-if="isReportSaved" class="button-icon" />
        {{ saveButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { FileTextIcon, RefreshCwIcon, SaveIcon, CheckIcon } from 'lucide-vue-next';
import ReportSummary from './ReportSummary.vue';
import ReportOverview from './ReportOverview.vue';
import KeyIssuesAnalysis from './KeyIssuesAnalysis.vue';
import ChartsSection from './ChartsSection.vue';
import RoundAnalysis from './RoundAnalysis.vue';

const props = defineProps({
  isReportSaved: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view-report', 'start-new-interview', 'save-report']);

const saveButtonText = computed(() => {
  if (props.isSaving) {
    return '保存中...';
  }
  if (props.isReportSaved) {
    return '已保存';
  }
  return '保存报告';
});
</script>

<style scoped>
@import '../../../styles/interview/report-display.css';

/* 添加保存按钮状态样式 */
.save-report-button.saving {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-report-button.saved {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  cursor: default;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
