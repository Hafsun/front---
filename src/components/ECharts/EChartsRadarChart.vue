<template>
    <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart } from 'echarts/charts';
import {
    RadarComponent,
    TooltipComponent,
    LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
// import { computed } from 'vue';

// 注册 ECharts 必要的组件
use([
    CanvasRenderer,
    RadarChart,
    RadarComponent,
    TooltipComponent,
    LegendComponent,
]);

const props = defineProps({
    option: {
        type: Object,
        required: true,
    },
});
console.log(props);

</script>

<style scoped>
.chart {
    width: 100%;
    height: 100%;
}
</style>
