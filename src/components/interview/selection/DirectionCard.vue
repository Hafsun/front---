<template>
  <div class="direction-card-wrapper" :class="{
    'selected': interviewStore.selectedDirection?.id === direction.id,
    'collapsed': interviewStore.selectedDirection && interviewStore.selectedDirection.id !== direction.id
  }" :style="{ '--delay': index * 0.1 + 's' }">
    <div class="direction-card" :class="direction.iconClass">
      <!-- 将点击事件移动到 card-main-content -->
      <div class="card-main-content" @click="$emit('select-direction', direction)">
        <div class="direction-icon" :class="direction.iconClass">
          <component :is="getIconComponent(direction.icon)" class="icon" />
        </div>

        <div class="direction-info">
          <h3 class="direction-title">{{ direction.name }}</h3>
          <p class="direction-description">{{ direction.description }}</p>
        </div>

        <!-- 选中指示器 -->
        <div class="selection-indicator" v-if="interviewStore.selectedDirection?.id === direction.id">
          <CheckCircleIcon class="check-icon" />
        </div>
      </div>

      <!-- 方向标签列表 -->
      <TransitionGroup name="tag-slide" tag="div" class="tags-list">
        <div v-for="(tag, tagIndex) in (direction.tags || [])" :key="tag" class="tag"
          :class="[direction.tagClass, { 'tag-selected': interviewStore.selectedTags && interviewStore.selectedTags.includes && interviewStore.selectedTags.includes(tag) }]"
          :style="{ '--tag-delay': tagIndex * 0.05 + 's' }" @click.stop="$emit('toggle-tag', tag)">
          {{ tag }}
        </div>
      </TransitionGroup>

      <!-- 展开内容：目标岗位选择（仅在选中时显示） -->
      <Transition name="expand-content" mode="out-in">
        <PositionSelection 
          v-if="interviewStore.selectedDirection?.id === direction.id"
          :direction="direction"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { 
  CheckCircleIcon,
  MonitorIcon, ServerIcon, LayersIcon 
} from 'lucide-vue-next';
import PositionSelection from './PositionSelection.vue';
import { interviewStore } from '../../../stores/interview';

defineProps({
  direction: Object,
  index: Number
});

defineEmits(['select-direction', 'toggle-tag']);

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    'MonitorIcon': MonitorIcon,
    'ServerIcon': ServerIcon,
    'LayersIcon': LayersIcon
  };
  return iconMap[iconName] || MonitorIcon;
};
</script>

<style scoped>
@import '../../../styles/interview/direction-card.css';
</style>
