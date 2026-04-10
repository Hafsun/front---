<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ScatterChart } from 'echarts/charts'; // 导入散点图
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent, // 导入视觉映射组件
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

// 注册 ECharts 必要的组件
use([
  CanvasRenderer,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
]);

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
});

console.log(props.option);
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%; /* 确保图表填充父容器的固定高度 */
}
</style>
