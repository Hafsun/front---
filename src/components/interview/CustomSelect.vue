<template>
  <div class="custom-select" :class="{ 'disabled': disabled }">
    <div 
      class="select-trigger" 
      :class="{ 'open': isOpen, 'has-value': modelValue }"
      @click="toggleDropdown"
    >
      <span class="select-value">
        {{ displayValue || placeholder }}
      </span>
      <ChevronDownIcon class="select-arrow" :class="{ 'rotated': isOpen }" />
    </div>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="select-dropdown">
        <div class="dropdown-content">
          <div 
            v-for="option in options" 
            :key="option.value"
            class="select-option"
            :class="{ 'selected': option.value === modelValue }"
            @click="selectOption(option)"
          >
            <span>{{ option.label }}</span>
            <CheckIcon v-if="option.value === modelValue" class="check-icon" />
          </div>
          <div v-if="options.length === 0" class="no-options">
            暂无可选项
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

// 显示值
const displayValue = computed(() => {
  if (!props.modelValue) return '';
  const option = props.options.find(opt => opt.value === props.modelValue);
  return option ? option.label : props.modelValue;
});

// 切换下拉框
const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

// 选择选项
const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const selectElement = event.target.closest('.custom-select');
  if (!selectElement) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.select-trigger:hover:not(.disabled) {
  border-color: #43e97b;
  background: white;
}

.select-trigger.open {
  border-color: #43e97b;
  background: white;
  box-shadow: 0 0 0 3px rgba(67, 233, 123, 0.1);
}

.select-trigger.has-value {
  background: white;
  border-color: #43e97b;
}

.custom-select.disabled .select-trigger {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6;
}

.select-value {
  flex: 1;
  font-size: 16px;
  color: #374151;
  text-align: left;
}

.select-trigger:not(.has-value) .select-value {
  color: #9ca3af;
}

.select-arrow {
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
}

.dropdown-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: rgba(67, 233, 123, 0.1);
}

.select-option.selected {
  background: rgba(67, 233, 123, 0.15);
  color: #43e97b;
  font-weight: 600;
}

.select-option span {
  flex: 1;
  font-size: 14px;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #43e97b;
  flex-shrink: 0;
}

.no-options {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
}

/* 下拉动画 */
.dropdown-enter-active {
  transition: all 0.3s ease;
}

.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 滚动条样式 */
.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .select-trigger {
    padding: 10px 12px;
    min-height: 44px;
  }

  .select-value {
    font-size: 14px;
  }

  .select-option {
    padding: 10px 12px;
  }

  .select-option span {
    font-size: 13px;
  }
}
</style>
