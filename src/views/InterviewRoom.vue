<template>
  <div class="interview-room-container">
    <!-- 阶段切换动画，根据 animationDirection 决定前进或后退动画 -->
    <Transition :name="transitionName" mode="out-in">
      <!-- 面试方向选择阶段 -->
      <SelectionStage 
        v-if="currentStage === 'selection'" 
        key="selection"
        @proceed-to-preparation="proceedToPreparation"
      />

      <!-- 面试准备阶段 -->
      <PreparationStage 
        v-else-if="currentStage === 'preparation'" 
        key="preparation"
        @back-to-selection="backToSelection"
        @start-interview="startInterview"
      />

      <!-- 面试进行阶段 -->
      <InterviewStage 
        v-else-if="currentStage === 'interview'" 
        key="interview"
        @end-interview="endInterview"
      />

      <!-- 面试报告阶段 -->
      <ReportStage 
        v-else-if="currentStage === 'report'" 
        key="report"
        @start-new-interview="startNewInterview"
        @view-report="viewReport"
      />
    </Transition>

    <!-- Chart Modal Component -->
    <ChartModal 
      :is-visible="showChartModal" 
      :chart-option="modalChartOption" 
      @close="closeChartModal" 
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// 导入子组件
import SelectionStage from '../components/interview/SelectionStage.vue';
import PreparationStage from '../components/interview/PreparationStage.vue';
import InterviewStage from '../components/interview/InterviewStage.vue';
import ReportStage from '../components/interview/ReportStage.vue';
import ChartModal from '../components/interview/ChartModal.vue';

// 导入面试状态存储
import { interviewStore } from '../stores/interview';

// 确保所有 hooks 都在顶层调用
const router = useRouter();

// 当前面试阶段：'selection' (选择), 'preparation' (准备), 'interview' (面试), 'report' (报告)
const currentStage = ref('selection');

// 动画方向，用于控制阶段切换动画
const animationDirection = ref('forward');

// 图表模态框相关
const showChartModal = ref(false);
const modalChartOption = ref(null);

// 根据动画方向计算过渡名称
const transitionName = computed(() => {
  return `stage-transition-${animationDirection.value}`;
});

// 阶段切换方法
const proceedToPreparation = () => {
  animationDirection.value = 'forward';
  currentStage.value = 'preparation';
};

const backToSelection = () => {
  animationDirection.value = 'backward';
  currentStage.value = 'selection';
};

const startInterview = () => {
  animationDirection.value = 'forward';
  currentStage.value = 'interview';
};

const endInterview = () => {
  animationDirection.value = 'forward';
  currentStage.value = 'report';
};

const startNewInterview = () => {
  // 重置面试状态
  interviewStore.resetInterviewState();
  interviewStore.resetSelectionParams();
  
  animationDirection.value = 'backward';
  currentStage.value = 'selection';
};

// 固定导航到使用正确的路由路径
const viewReport = () => {
  router.push('/home/reports');
};

const closeChartModal = () => {
  showChartModal.value = false;
  modalChartOption.value = null;
};
</script>

<style scoped>
@import '../styles/interview/main.css';
</style>
