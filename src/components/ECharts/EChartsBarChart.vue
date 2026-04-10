<template>
  <v-chart 
    ref="chartRef"
    class="chart" 
    :option="option" 
    :autoresize="false"
    @finished="onChartFinished"
  />
</template>

<script setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

use([
  CanvasRenderer,
  BarChart,
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

const chartRef = ref(null);
let resizeObserver = null;
let resizeTimeout = null;

// 防抖resize函数
const debouncedResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    if (chartRef.value) {
      try {
        chartRef.value.resize();
      } catch (error) {
        // 忽略resize错误
      }
    }
  }, 100);
};

const onChartFinished = () => {
  nextTick(() => {
    if (chartRef.value) {
      try {
        chartRef.value.resize();
      } catch (error) {
        // 忽略初始化错误
      }
    }
  });
};

// 监听option变化
watch(() => props.option, () => {
  nextTick(() => {
    debouncedResize();
  });
}, { deep: true });

onMounted(() => {
  // 全局错误处理，抑制ResizeObserver错误
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (message && message.includes('ResizeObserver loop completed')) {
      return true; // 阻止错误显示
    }
    if (originalError) {
      return originalError(message, source, lineno, colno, error);
    }
    return false;
  };

  // 手动创建ResizeObserver来替代autoresize
  if (chartRef.value && chartRef.value.$el) {
    try {
      resizeObserver = new ResizeObserver(() => {
        debouncedResize();
      });
      resizeObserver.observe(chartRef.value.$el);
    } catch (error) {
      // 如果ResizeObserver不支持，使用window resize事件
      window.addEventListener('resize', debouncedResize);
    }
  }

  nextTick(() => {
    debouncedResize();
  });
});

onUnmounted(() => {
  // 清理定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  } else {
    window.removeEventListener('resize', debouncedResize);
  }

  // 清理图表实例
  if (chartRef.value) {
    try {
      chartRef.value.dispose();
    } catch (error) {
      // 忽略清理错误
    }
  }
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
