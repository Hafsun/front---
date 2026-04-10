<template>
  <div class="saving-badge-wrapper">
    <el-popover
      :placement="placement"
      :width="width"
      trigger="click" 
      v-model:visible="isVisible"
      show-arrow
      :popper-class="`saving-badge ${customClass}`"
      :arrow-offset="arrowOffset"
      :hide-on-click-outside="true" 
    >
      <template #default>
        <div class="badge-content-container" :style="{ width: '100%', height: height || 'auto' }">
          <div 
            class="badge-content" 
            :style="{ 
              fontSize: fontSize, 
              fontWeight: fontWeight,
              lineHeight: lineHeight,
              color: textColor 
            }"
          >
            {{ text }}
          </div>
        </div>
      </template>
      <!-- 移除手动@click事件，仅保留挂载点样式 -->
      <template #reference>
        <div 
          class="badge-anchor" 
          :style="{ 
            width: anchorSize, 
            height: anchorSize, 
            backgroundColor: anchorColor,
            display: 'block',
            marginLeft: 'auto',
            marginRight: '20px',
            cursor: 'pointer'
          }"
        ></div>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  text: { type: String, default: 'Save 20% with annual plans' },
  visible: { type: Boolean, default: true },
  placement: { type: String, default: 'left' },
  width: { type: [Number, String], default: 400 },
  height: { type: [Number, String], default: 'auto' },
  lineHeight: { type: String, default: '1.2' },
  customClass: { type: String, default: '' },
  arrowOffset: { type: Number, default: 0 },
  fontSize: { type: String, default: 'clamp(12px, 4vw, 22px)' },
  fontWeight: { type: [Number, String], default: 700 },
  anchorSize: { type: String, default: '16px' },
  anchorColor: { type: String, default: '#2563eb' },
  textColor: { type: String, default: '#000000' }
})

const emit = defineEmits(['update:visible'])
const isVisible = ref(props.visible)

// 仅保留v-model同步，移除手动toggleVisible方法
watch(isVisible, (val) => {
  emit('update:visible', val)
})
</script>

<style scoped>
.saving-badge-wrapper {
  display: inline-block;
  margin-left: 20px;
}

.badge-anchor {
  border-radius: 50%;
  cursor: pointer;
  margin: 0;
  transition: all 0.2s ease;
}
.badge-anchor:active {
  transform: scale(0.9);
}

.badge-content-container {
  width: 100%;
  height: 100%;
  padding: 18px 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.badge-content {
  font-family: 'SF Pro Display', 'Segoe UI', Inter, sans-serif;
  text-align: center;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: inherit !important;
}

:deep(.saving-badge) {
  --el-popover-bg-color: #ffffff;
  --el-popover-text-color: #000000;
  --el-popover-border-radius: 12px;
  --el-popover-border-width: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  padding: 0 !important;
  height: auto !important;
}

:deep(.saving-badge .el-popper__arrow::before) {
  background-color: #ffffff;
  border: none;
}

:deep(.custom-blue) {
  --el-popover-bg-color: #1d4ed8 !important;
  --el-popover-text-color: #ffffff !important;
}
</style>