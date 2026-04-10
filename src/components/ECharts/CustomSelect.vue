<template>
    <div class="custom-select-container" @click="toggleDropdown" v-click-outside="closeDropdown">
        <div ref="triggerRef" class="selected-display"
            :class="{ 'placeholder': !selectedLabel, 'is-open': isOpen, 'is-disabled': disabled }"
            @click.stop="toggleDropdown">
            {{ selectedLabel || placeholder }}
            <ChevronDownIcon class="select-arrow-icon" :class="{ 'rotate-180': isOpen }" />
        </div>
        <teleport to="body">
            <transition name="slide-fade">
                <div v-if="isOpen && !disabled" class="options-list" :style="dropdownStyle">
                    <div v-for="option in options" :key="option.value" class="option-item"
                        :class="{ 'is-selected': option.value === modelValue }" @click.stop="selectOption(option)">
                        {{ option.label }}
                    </div>
                    <div v-if="options.length === 0" class="no-options">
                        暂无可选岗位
                    </div>
                </div>
            </transition>
        </teleport>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { ChevronDownIcon } from 'lucide-vue-next';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    options: {
        type: Array,
        required: true,
    },
    placeholder: {
        type: String,
        default: '请选择',
    },
    disabled: { // Added disabled prop
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const triggerRef = ref(null); // Ref for the element that triggers the dropdown
const dropdownStyle = ref({}); // Dynamic style for the teleported dropdown

const selectedLabel = computed(() => {
    const selected = props.options.find(option => option.value === props.modelValue);
    return selected ? selected.label : '';
});

const calculateDropdownPosition = () => {
    if (triggerRef.value) {
        const rect = triggerRef.value.getBoundingClientRect();
        dropdownStyle.value = {
            top: `${rect.bottom + window.scrollY}px`,
            left: `${rect.left + window.scrollX}px`,
            width: `${rect.width}px`,
            // Max height to prevent it from going off-screen, adjust as needed
            maxHeight: `${window.innerHeight - rect.bottom - 20}px`, // 20px padding from bottom
            overflowY: 'auto',
            zIndex: 10000, // Very high z-index
        };
    }
};

watch(isOpen, (newVal) => {
    if (newVal && !props.disabled) { // Only open if not disabled
        nextTick(() => {
            calculateDropdownPosition();
            // Add event listener for window resize and scroll to recalculate position
            window.addEventListener('resize', calculateDropdownPosition);
            window.addEventListener('scroll', calculateDropdownPosition);
        });
    } else {
        // Remove event listeners when dropdown closes or if it's disabled
        window.removeEventListener('resize', calculateDropdownPosition);
        window.removeEventListener('scroll', calculateDropdownPosition);
    }
});

const toggleDropdown = () => {
    if (props.disabled) return; // Prevent opening if disabled
    isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
    isOpen.value = false;
};

const selectOption = (option) => {
    emit('update:modelValue', option.value);
    closeDropdown();
};

// Click outside directive
const vClickOutside = {
    mounted(el, binding) {
        el.__ClickOutsideHandler__ = (event) => {
            // Check if the clicked element is inside the select container or the teleported dropdown
            const isClickInsideTrigger = el.contains(event.target);
            const isClickInsideTeleportedDropdown = document.querySelector('.options-list')?.contains(event.target);

            if (!isClickInsideTrigger && !isClickInsideTeleportedDropdown) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.__ClickOutsideHandler__);
    },
    unmounted(el) {
        document.removeEventListener('click', el.__ClickOutsideHandler__);
    },
};
</script>

<style scoped>
.custom-select-container {
    position: relative;
    /* Keep relative for trigger positioning */
    width: 100%;
    cursor: pointer;
    font-size: 0.9rem;
    /* z-index is less critical here as options-list is teleported */
}

.selected-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    background: white;
    color: #374151;
    transition: all 0.3s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.selected-display:hover {
    border-color: #d1d5db;
}

.selected-display.is-open {
    /* Apply open styles to the trigger */
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.selected-display.placeholder {
    color: #9ca3af;
}

.select-arrow-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #6b7280;
    transition: transform 0.3s ease;
}

.select-arrow-icon.rotate-180 {
    transform: rotate(180deg);
}

/* Styles for the teleported options list */
.options-list {
    position: absolute;
    /* Position relative to viewport */
    background: white;
    border: 2px solid #667eea;
    border-top: none;
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    /* max-height and overflow-y are set dynamically in JS */
}

.option-item {
    padding: 0.75rem 1rem;
    color: #374151;
    transition: background-color 0.2s ease;
}

.option-item:hover {
    background-color: #f0f4ff;
    color: #3b82f6;
}

.option-item.is-selected {
    background-color: #e0e7ff;
    color: #3b82f6;
    font-weight: 600;
}

.no-options {
    padding: 0.75rem 1rem;
    color: #9ca3af;
    text-align: center;
}

/* Transition for dropdown */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

/* Disabled state styles */
.selected-display.is-disabled {
    background-color: #f3f4f6;
    /* Lighter background */
    color: #9ca3af;
    /* Grayed out text */
    border-color: #e5e7eb;
    /* Lighter border */
    cursor: not-allowed;
    box-shadow: none;
}

.selected-display.is-disabled .select-arrow-icon {
    color: #d1d5db;
    /* Grayed out arrow */
}
</style>
