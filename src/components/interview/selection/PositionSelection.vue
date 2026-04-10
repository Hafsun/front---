<template>
  <div class="expanded-content">
    <div class="content-divider">
      <div class="divider-line"></div>
      <div class="divider-text">
        <TargetIcon class="divider-icon" />
        <span>选择目标岗位</span>
      </div>
      <div class="divider-line"></div>
    </div>

    <div class="position-selection">
      <CustomSelect 
        v-model="interviewStore.selectedTargetPosition"
        :options="currentPositionOptions" 
        placeholder="请选择您要面试的具体岗位..."
        :disabled="interviewStore.selectedDirection?.id !== 'custom' && interviewStore.selectedTags.length === 0" 
      />

      <!-- 岗位选择提示或确认信息 -->
      <div class="selection-hint" v-if="!interviewStore.selectedTargetPosition">
        <InfoIcon class="hint-icon" />
        <span>请选择一个具体岗位以继续面试准备</span>
      </div>

      <div class="selection-confirm" v-if="interviewStore.selectedTargetPosition">
        <div class="confirm-info">
          <CheckCircleIcon class="confirm-icon" />
          <span>已选择：{{ getPositionLabel(interviewStore.selectedTargetPosition) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TargetIcon, InfoIcon, CheckCircleIcon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';
import CustomSelect from '../CustomSelect.vue';

defineProps({
  direction: Object
});

// 根据选中的方向和标签生成岗位选项
const currentPositionOptions = computed(() => {
  if (!interviewStore.selectedDirection) return [];
  
  const direction = interviewStore.selectedDirection;
//   const selectedTags = interviewStore.selectedTags || [];
  
  // 基础岗位选项
  const basePositions = {
    'frontend': [
      { value: 'frontend_junior', label: '前端开发工程师（初级）' },
      { value: 'frontend_senior', label: '前端开发工程师（高级）' },
      { value: 'frontend_architect', label: '前端架构师' },
      { value: 'ui_developer', label: 'UI开发工程师' }
    ],
    'backend': [
      { value: 'backend_junior', label: '后端开发工程师（初级）' },
      { value: 'backend_senior', label: '后端开发工程师（高级）' },
      { value: 'backend_architect', label: '后端架构师' },
      { value: 'api_developer', label: 'API开发工程师' }
    ],
    'fullstack': [
      { value: 'fullstack_junior', label: '全栈开发工程师（初级）' },
      { value: 'fullstack_senior', label: '全栈开发工程师（高级）' },
      { value: 'tech_lead', label: '技术负责人' },
      { value: 'solution_architect', label: '解决方案架构师' }
    ]
  };
  
  return basePositions[direction.id] || [];
});

// 获取岗位标签
const getPositionLabel = (value) => {
  const option = currentPositionOptions.value.find(opt => opt.value === value);
  return option ? option.label : value;
};
</script>

<style scoped>
@import '../../../styles/interview/position-selection.css';
</style>
