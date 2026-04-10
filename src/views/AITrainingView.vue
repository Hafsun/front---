<template>
  <div class="training-layout">
    <!-- 视图 1：仪表盘 -->
    <transition name="fade" mode="out-in">
      <AITrainingDashboard 
        v-if="currentView === 'dashboard'" 
        @start-challenge="handleStartChallenge" 
      />
      
      <!-- 视图 2：做题界面 -->
      <AITrainingChallenge 
        v-else-if="currentView === 'challenge'" 
        :questionId="activeQuestionId"
        @back="currentView = 'dashboard'" 
      />
    </transition>
  </div>
</template>

<script setup>
import AITrainingChallenge from '@/components/AITrainingView/AITrainingChallenge.vue';
import { ref } from 'vue';
import AITrainingDashboard from '@/components/AITrainingView/AITrainingDashboard.vue';


// 视图状态控制: 'dashboard' | 'challenge'
const currentView = ref('dashboard');
const activeQuestionId = ref(null);

// 接收仪表盘传来的“开始挑战”事件
const handleStartChallenge = (id) => {
  activeQuestionId.value = id;
  currentView.value = 'challenge';
};
</script>

<style scoped>
.training-layout {
  min-height: calc(100vh - 60px); /* 减去你顶部导航栏的高度 */
  background: #f4f6f8;
}

/* 平滑的视图切换动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>