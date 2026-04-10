<template>
  <Transition name="fade-up" appear :delay="600">
    <div class="custom-input-section">
      <div class="custom-input-card">
        <div class="custom-input-header">
          <div class="custom-icon-wrapper">
            <EditIcon class="custom-icon" />
          </div>
          <div class="custom-text">
            <h3 class="custom-title">自定义面试领域</h3>
            <p class="custom-subtitle">输入您想要面试的专业领域和目标岗位</p>
          </div>
        </div>

        <div class="custom-input-content">
          <div class="input-row">
            <div class="input-group">
              <label for="custom-field" class="input-label">面试领域 *</label>
              <input id="custom-field" v-model="customField" type="text" placeholder="例如：前端开发、后端架构、数据分析..."
                class="custom-input" :class="{ 'filled': customField.trim() }" @input="onCustomInputChange" />
            </div>

            <div class="input-group">
              <label for="custom-position" class="input-label">目标岗位 *</label>
              <input id="custom-position" v-model="customPosition" type="text"
                placeholder="例如：前端架构师、后端开发工程师..." class="custom-input"
                :class="{ 'filled': customPosition.trim() }" />
            </div>
          </div>

          <div class="input-group">
            <label for="custom-keywords" class="input-label">技术关键词 (可选)</label>
            <textarea id="custom-keywords" v-model="customKeywords"
              placeholder="输入相关技术栈、工具或概念，用逗号分隔，例如：React, Node.js, MongoDB, RESTful API"
              class="custom-textarea" rows="2"></textarea>
          </div>

          <button @click="createCustomDirection" :disabled="!customField.trim() || !customPosition.trim()"
            class="custom-confirm-button"
            :class="{ 'disabled': !customField.trim() || !customPosition.trim() }">
            <CheckIcon class="button-icon" />
            确认自定义领域
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { EditIcon, CheckIcon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';

// 自定义输入字段
const customField = ref('');
const customPosition = ref('');
const customKeywords = ref('');

// 自定义输入变化处理
const onCustomInputChange = () => {
  // 可以添加实时验证逻辑
};

// 创建自定义面试方向
const createCustomDirection = () => {
  if (!customField.value.trim() || !customPosition.value.trim()) return;
  
  // 创建自定义方向对象
  const customDirection = {
    id: 'custom',
    name: customField.value.trim(),
    description: `自定义${customField.value.trim()}领域面试`,
    icon: 'EditIcon',
    iconClass: 'custom-icon',
    tagClass: 'custom-tag',
    duration: '30-35分钟',
    questions: '10-12',
    tags: customKeywords.value ? customKeywords.value.split(',').map(tag => tag.trim()).filter(tag => tag) : []
  };
  
  // 设置选中的方向和岗位
  interviewStore.selectedDirection = customDirection;
  interviewStore.selectedTargetPosition = customPosition.value.trim();
  interviewStore.selectedTags = [...customDirection.tags];
  
  // 清空输入框
  customField.value = '';
  customPosition.value = '';
  customKeywords.value = '';
};
</script>

<style scoped>
@import '../../../styles/interview/custom-input.css';
</style>
