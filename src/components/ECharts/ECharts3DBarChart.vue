<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
// 导入 echarts-gl 的 3D 组件，它会自行注册 3D 图表和组件
import 'echarts-gl'; 
// 无需在此处显式导入 Bar3DChart 或 Grid3DComponent 并传递给 use 函数
// 它们通过 'echarts-gl' 的导入副作用自动注册

import {
  VisualMapComponent, // 导入视觉映射组件
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

// 注册 ECharts 必要的组件，不包括 echarts-gl 自动注册的 3D 组件
use([
  CanvasRenderer,
  VisualMapComponent,
  TooltipComponent,
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
