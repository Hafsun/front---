<template>
  <div class="slider-verification">
    <div
      ref="sliderTrack"
      class="slider-track"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <div
        class="slider-progress"
        :style="{ width: `${sliderPosition}%` }"
        :class="{ 'verified': isVerified }"
      ></div>

      <div
        ref="sliderButton"
        class="slider-button"
        :style="{ left: `${(sliderPosition / 100) * maxSliderLeft}px` }"
        :class="{
          'dragging': isDragging,
          'verified': isVerified
        }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
      >
        <svg v-if="isVerified" class="slider-icon verified-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="slider-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div class="slider-text">
        <span :class="{ 'text-verified': isVerified }">
          {{ isVerified ? '验证成功' : '向右滑动验证' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Emits
const emit = defineEmits([
  'verification-success'
])

// 响应式数据
const sliderPosition = ref(0)
const isDragging = ref(false)
const sliderTrack = ref(null)
const sliderButton = ref(null)
const isVerified = ref(false)

// 新增响应式属性，用于动态计算最大可移动距离
const maxSliderLeft = ref(0); // 滑块按钮最大可移动的像素距离
const trackWidth = ref(0); // 轨道实际宽度（像素）
const rawPixelPosition = ref(0); // 新增变量 rawPixelPosition

// 方法
// eslint-disable-next-line no-unused-vars
const handleMouseDown = (e) => {
  if (isVerified.value) return; // 验证成功后禁止拖动
  isDragging.value = true
  e.preventDefault()
}

// eslint-disable-next-line no-unused-vars
const handleTouchStart = (e) => {
  if (isVerified.value) return; // 验证成功后禁止拖动
  isDragging.value = true
  e.preventDefault()
}

// 核心计算函数：根据鼠标/触摸位置计算滑块的百分比位置
const calculateSliderPosition = () => {
  if (!sliderTrack.value || !sliderButton.value) return 0;

  const rect = sliderTrack.value.getBoundingClientRect();
  const buttonWidth = sliderButton.value.offsetWidth; // 获取按钮的实际宽度
  const trackWidthPx = rect.width; // 获取轨道的实际宽度 (包括边框)

  // 计算按钮左边缘的最大可移动像素距离
  // 减去按钮宽度和额外的2px微调，确保按钮不会超出轨道
  const maxDraggableLeftPx = trackWidthPx - buttonWidth - 2; // 额外减去2px

  // 将像素位置限制在有效拖动范围内 (0 到 maxDraggableLeftPx)
  const clampedPixelPosition = Math.max(0, Math.min(maxDraggableLeftPx, rawPixelPosition.value));

  // 将限制后的像素位置转换为 0-100 的百分比，用于 sliderPosition
  // 确保 maxDraggableLeftPx 不为0，避免除以零
  return maxDraggableLeftPx > 0 ? (clampedPixelPosition / maxDraggableLeftPx) * 100 : 0;
}

const handleMouseMove = (e) => {
  if (!isDragging.value || isVerified.value) return

  rawPixelPosition.value = e.clientX - sliderTrack.value.getBoundingClientRect().left;
  const newPosition = calculateSliderPosition(e.clientX);
  sliderPosition.value = newPosition;

  // 当滑块接近末端时触发验证成功
  if (newPosition >= 95) { // 使用一个接近100的阈值
    handleVerificationSuccess()
  }
}

const handleTouchMove = (e) => {
  if (!isDragging.value || isVerified.value) return

  const touch = e.touches[0]
  rawPixelPosition.value = touch.clientX - sliderTrack.value.getBoundingClientRect().left;
  const newPosition = calculateSliderPosition(touch.clientX);
  sliderPosition.value = newPosition;

  // 当滑块接近末端时触发验证成功
  if (newPosition >= 95) { // 使用一个接近100的阈值
    handleVerificationSuccess()
  }
}

const handleMouseUp = () => {
  if (!isDragging.value) return

  isDragging.value = false

  // 如果未验证成功，则重置滑块位置
  if (sliderPosition.value < 95) {
    sliderPosition.value = 0
  } else {
    sliderPosition.value = 100 // 验证成功则吸附到100%
  }
}

const handleMouseLeave = () => {
  if (isDragging.value && sliderPosition.value < 95) {
    isDragging.value = false
    sliderPosition.value = 0
  }
}

const handleVerificationSuccess = () => {
  isDragging.value = false
  sliderPosition.value = 100 // 确保最终位置是100%
  isVerified.value = true
  emit('verification-success')
}

// 更新尺寸信息，用于精确计算
const updateDimensions = () => {
  if (sliderTrack.value && sliderButton.value) {
    trackWidth.value = sliderTrack.value.offsetWidth; // This includes padding and border
    const buttonWidth = sliderButton.value.offsetWidth;
    // 减去按钮宽度和额外的2px微调
    maxSliderLeft.value = trackWidth.value - buttonWidth - 2;
  }
};

// 生命周期钩子
onMounted(() => {
  updateDimensions(); // 首次挂载时计算尺寸
  window.addEventListener('resize', updateDimensions); // 窗口大小改变时重新计算

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions); // 移除事件监听器

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleMouseUp)
})
</script>

<style scoped>
.slider-verification {
  margin: 1rem 0;
}

.slider-track {
  position: relative;
  height: 3rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 0.5rem;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-track:hover {
  border-color: #3b82f6;
}

.slider-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
  border-radius: 0.5rem; /* 统一为 0.5rem */
}

.slider-progress.verified {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.slider-button {
  position: absolute;
  top: 0.25rem;
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border-radius: 0.5rem; /* 统一为 0.5rem */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.3s ease;
  z-index: 10;
}

.slider-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.slider-button.dragging {
  cursor: grabbing;
  transform: scale(1.1);
}

.slider-button.verified {
  background: #10b981;
}

.slider-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.verified-icon {
  color: white;
}

.slider-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
}

.slider-text span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: color 0.3s ease;
}

.text-verified {
  color: white !important;
}
</style>
