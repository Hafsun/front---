<template>
  <div class="stage-container">
    <div class="selection-card">
      <!-- 卡片头部：智能面试评测系统标题和开始准备按钮 -->
      <SelectionHeader @proceed="$emit('proceed-to-preparation')" />

      <!-- 选择内容区域 -->
      <div class="selection-content">
        <DirectionGrid />
        <CustomInputSection />
      </div>
    </div>
  </div>
</template>

<script setup>
import SelectionHeader from './selection/SelectionHeader.vue';
import DirectionGrid from './selection/DirectionGrid.vue';
import CustomInputSection from './selection/CustomInputSection.vue';

defineEmits(['proceed-to-preparation']);
</script>

<style scoped>
@import '../../styles/interview/selection.css';

/* 简历选择器现在是全宽横向条 */
.resume-selector-wrapper {
  margin-bottom: 24px;
}
</style>
