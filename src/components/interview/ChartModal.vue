<template>
    <div v-if="isVisible" class="chart-modal-overlay" @click.self="close" role="dialog" aria-modal="true"
        aria-labelledby="chart-modal-title">
        <div class="chart-modal-content">
            <button class="chart-modal-close-btn" @click="close" aria-label="关闭">
                <XIcon class="h-6 w-6" />
            </button>
            <div class="chart-modal-body">
                <h2 id="chart-modal-title" class="chart-modal-title">{{ chartTitle }}</h2>
                <v-chart class="chart-modal-instance" :option="chartOption" autoresize />
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart, RadarChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { XIcon } from 'lucide-vue-next';

// Import echarts-gl for 3D charts, it registers itself
import 'echarts-gl';

// Register ECharts components needed for all charts in the modal
use([
    CanvasRenderer,
    PieChart,
    LineChart,
    RadarChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    VisualMapComponent,
]);

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
    chartOption: {
        type: Object,
        default: () => ({}),
    },
    chartTitle: { // 新增 chartTitle prop
        type: String,
        default: '图表',
    },
});
console.log(props.chartOption);

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};
</script>

<style scoped>
.chart-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
    animation: fade-in 0.3s ease-out;
}

.chart-modal-content {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    position: relative;
    width: 90%;
    max-width: 1100px;
    /* Adjusted from 900px to 1100px */
    height: 80%;
    max-height: 700px;
    /* Adjusted from 600px to 700px */
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    animation: slide-up 0.3s ease-out;
}

.chart-modal-close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.2s ease;
    z-index: 1001;
}

.chart-modal-close-btn:hover {
    color: #1f2937;
}

.chart-modal-body {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 0;
    /* Allow content to shrink */
}

.chart-modal-instance {
    width: 100%;
    height: 100%;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slide-up {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .chart-modal-content {
        width: 95%;
        height: 90%;
        padding: 1rem;
    }

    .chart-modal-close-btn {
        top: 0.5rem;
        right: 0.5rem;
    }
}

.chart-modal-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
    text-align: center;
    margin-bottom: 1rem;
    /* Remove sr-only and add visible styles */
}
</style>
