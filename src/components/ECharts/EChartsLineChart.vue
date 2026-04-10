<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
// import { computed } from 'vue';

// 注册 ECharts 必要的组件
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
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
// ECharts 实例将自动响应其容器大小，autoresize 属性确保这一点
// 无需在此处设置 responsive: true 或 maintainAspectRatio: false，vue-echarts 会处理
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%; /* 确保图表填充父容器的固定高度 */
}
</style>
