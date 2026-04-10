<template>
  <div class="question-bank-container">
    <div class="global-big-card">
    <!-- <div class="ambient-light light-1"></div> -->
    <!-- <div class="ambient-light light-2"></div> -->
      <QuestionBankHead v-model="selectedModule" />
      <el-divider class="content-divider" />
      <transition name="fade-slide" mode="out-in">
        <div :key="selectedModule">
          <QuestionBankBody v-if="selectedModule === 'questionBank'" />
          <KnowledgeView v-else-if="selectedModule === 'knowledge'" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import QuestionBankHead from '@/components/QuestionBankView/QuestionBankHead.vue'
import QuestionBankBody from '@/components/QuestionBankView/QuestionBankBody.vue'
import KnowledgeView from '@/components/QuestionBankView/KnowledgeView.vue'
import { ref } from 'vue'

const selectedModule = ref('questionBank')
</script>

<style scoped>
.question-bank-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* background: white; */
}
.global-big-card {
  background-color: white; /* 白色背景 */
  border-radius: 8px; /* 和你现有卡片圆角统一 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.12); /* 和现有卡片阴影统一 */
  padding: 20px; /* 内部留白，避免内容贴边 */
  box-sizing: border-box;
}
/* 核心：控制分割线的上下间距 */
.content-divider {
  margin-top: 60px;    /* 分割线与头部的间距 */
  margin-bottom: 50px; /* 分割线与主体的间距 */
  /* 可选：调整分割线颜色，适配白色背景 */
  --el-divider-color: #e5e7eb;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 弥散光球体 - 营造呼吸感和未来感 */
.ambient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  z-index: 0;
  animation: float 15s infinite alternate ease-in-out;
}
.light-1 {
  width: 400px; height: 400px;
  background: #e0c3fc;
  top: 100px; left: 10px;
}
.light-2 {
  width: 500px; height: 500px;
  background: #8ec5fc;
  bottom: -150px; right: -100px;
  animation-delay: -5s;
}
</style>
