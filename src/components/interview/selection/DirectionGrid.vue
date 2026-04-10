<template>
  <div class="direction-grid">
    <!-- 面试方向选择卡片列表，带有过渡动画 -->
    <TransitionGroup name="card-morph" tag="div" class="cards-container">
      <DirectionCard 
        v-for="(direction, index) in interviewDirections" 
        :key="direction.id"
        :direction="direction"
        :index="index"
        @select-direction="selectDirection"
        @toggle-tag="toggleTag"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DirectionCard from './DirectionCard.vue';
import { interviewStore } from '../../../stores/interview';

// 面试方向数据
const interviewDirections = ref([
  {
    id: 'frontend',
    name: '前端开发',
    description: '专注于用户界面和用户体验的开发技能评测',
    icon: 'MonitorIcon',
    iconClass: 'frontend-icon',
    tagClass: 'frontend-tag',
    tags: ['HTML/CSS', 'JavaScript', 'Vue.js', 'React', '响应式设计', '性能优化', 'Webpack', 'TypeScript']
  },
  {
    id: 'backend',
    name: '后端开发',
    description: '服务器端开发和系统架构能力的综合评测',
    icon: 'ServerIcon',
    iconClass: 'backend-icon',
    tagClass: 'backend-tag',
    tags: ['Java', 'Python', 'Node.js', '数据库设计', 'API设计', '微服务', 'Redis', 'MySQL', 'Spring Boot']
  },
  {
    id: 'fullstack',
    name: '全栈开发',
    description: '前后端一体化开发能力的全面评测',
    icon: 'LayersIcon',
    iconClass: 'fullstack-icon',
    tagClass: 'fullstack-tag',
    tags: ['前后端分离', '系统设计', 'DevOps', '云服务', 'Docker', 'CI/CD', '架构设计', '项目管理']
  }
]);

// 选择面试方向
const selectDirection = (direction) => {
  // If clicking on the already selected direction, collapse it
  if (interviewStore.selectedDirection?.id === direction.id) {
    interviewStore.selectedDirection = null;
    interviewStore.selectedTags.length = 0; // 清空已选标签
    interviewStore.selectedTargetPosition = ''; // 清空已选岗位
  } else {
    // Otherwise, expand the clicked direction
    interviewStore.selectedDirection = direction;
    interviewStore.selectedTags.length = 0; // 清空已选标签
    interviewStore.selectedTargetPosition = ''; // 清空已选岗位
  }
};

// 切换标签选择状态
const toggleTag = (tag) => {
  // Find which direction this tag belongs to
  const targetDirection = interviewDirections.value.find(direction => 
    direction.tags && direction.tags.includes(tag)
  );
  
  if (!targetDirection) return;
  
  // If the tag belongs to a different direction than currently selected
  if (!interviewStore.selectedDirection || interviewStore.selectedDirection.id !== targetDirection.id) {
    // Switch to the target direction and select the tag
    interviewStore.selectedDirection = targetDirection;
    interviewStore.selectedTags.length = 0; // Clear previous tags
    interviewStore.selectedTags.push(tag); // Select the clicked tag
    interviewStore.selectedTargetPosition = ''; // Clear selected position
  } else {
    // If it's the same direction, toggle the tag selection
    const index = interviewStore.selectedTags.indexOf(tag);
    if (index > -1) {
      interviewStore.selectedTags.splice(index, 1);
    } else {
      interviewStore.selectedTags.push(tag);
    }
  }
};
</script>

<style scoped>
@import '../../../styles/interview/direction-grid.css';
</style>
