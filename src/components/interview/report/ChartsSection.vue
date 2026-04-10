<template>
  <div class="report-section chart-section">
    <h3 class="section-title">
      <BarChart2Icon class="section-icon" />数据可视化
    </h3>
    
    <div v-if="!reportData" class="no-data-message">
      <p>暂无报告数据</p>
    </div>
    
    <div v-else class="charts-layout">
      <!-- 综合得分趋势图：放在最上方，宽度接近容器宽度 -->
      <div class="chart-row full-width">
        <div class="chart-card trend-chart">
          <h4 class="chart-title">综合得分趋势</h4>
          <div class="chart-container large" ref="trendChartContainer">
            <EChartsLineChart v-if="scoresTrendOption" :option="scoresTrendOption" />
            <div v-else class="no-data-message">暂无得分数据</div>
          </div>
        </div>
      </div>
      
      <!-- 第二行：每轮综合表现3D图和核心能力评估图，平均占这一行 -->
      <div class="chart-row two-columns">
        <div class="chart-card">
          <h4 class="chart-title">每轮综合表现</h4>
          <div class="chart-container" ref="performanceChartContainer">
            <ECharts3DBarChart v-if="roundPerformanceOption" :option="roundPerformanceOption" />
            <div v-else class="no-data-message">暂无表现数据</div>
          </div>
        </div>
        
        <div class="chart-card">
          <h4 class="chart-title">核心能力评估</h4>
          <div class="chart-container" ref="coreAbilitiesChartContainer">
            <EChartsRadarChart v-if="coreAbilitiesOption" :option="coreAbilitiesOption" />
            <div v-else class="no-data-message">暂无能力评估数据</div>
          </div>
        </div>
      </div>
      
      <!-- 第三行：剩下的三个图，平均大小 -->
      <div class="chart-row three-columns">
        <div class="chart-card">
          <h4 class="chart-title">表情情绪分布</h4>
          <div class="chart-container" ref="emotionChartContainer">
            <EChartsPieChart v-if="emotionDistributionOption" :option="emotionDistributionOption" />
            <div v-else class="no-data-message">暂无情绪数据</div>
          </div>
        </div>
        
        <div class="chart-card">
          <h4 class="chart-title">综合素质评估</h4>
          <div class="chart-container" ref="qualityChartContainer">
            <EChartsRadarChart v-if="overallQualityOption" :option="overallQualityOption" />
            <div v-else class="no-data-message">暂无素质评估数据</div>
          </div>
        </div>
        
        <div class="chart-card">
          <h4 class="chart-title">每题准确率得分</h4>
          <div class="chart-container" ref="accuracyChartContainer">
            <EChartsBarChart v-if="accuracyScoresOption" :option="accuracyScoresOption" />
            <div v-else class="no-data-message">暂无准确率数据</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, nextTick } from 'vue';
import { BarChart2Icon } from 'lucide-vue-next';
import { interviewStore } from '../../../stores/interview';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart, RadarChart } from 'echarts/charts';
import { 
  GridComponent, 
  TooltipComponent, 
  LegendComponent, 
  TitleComponent,
  VisualMapComponent 
} from 'echarts/components';
import 'echarts-gl';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
]);

import EChartsLineChart from '../../ECharts/EChartsLineChart.vue';
import EChartsBarChart from '../../ECharts/EChartsBarChart.vue';
import ECharts3DBarChart from '../../ECharts/ECharts3DBarChart.vue';
import EChartsRadarChart from '../../ECharts/EChartsRadarChart.vue';
import EChartsPieChart from '../../ECharts/EChartsPieChart.vue';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const handleResizeObserverError = (event) => {
  if (event.message && event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
};

onMounted(() => {
  window.addEventListener('error', handleResizeObserverError);
  
  nextTick(() => {
    const debouncedResize = debounce(() => {
      // 触发图表重新渲染
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    window.addEventListener('resize', debouncedResize);
  });
});

onUnmounted(() => {
  window.removeEventListener('error', handleResizeObserverError);
});

const reportData = computed(() => interviewStore.finalReportData);

const scoresTrendOption = computed(() => {
 const roundDetails = reportData.value?.overall_report?.roundDetails || [];
  // console.log('综合得分趋势数据:', roundDetails);
  
  if (roundDetails.length === 0) return null;
  
  const categories = roundDetails.map((_, index) => `第${index + 1}轮`);
  const dimensions = ['major', 'expression', 'logic', 'stable', 'strain'];
  const dimensionNames = ['专业能力', '表情情绪', '逻辑思维', '稳定能力', '应变能力'];
  
  const series = dimensions.map((dim, index) => ({
    name: dimensionNames[index],
    type: 'line',
    smooth: true,
    data: roundDetails.map(round => {
      const integratedScore = round.integrated_score || {};
      const score = integratedScore[dim];
      // console.log(`轮次 ${round.round_number || 'unknown'}, 维度 ${dim}, 分数:`, score);
      return parseFloat(score) || 0;
    }),
    lineStyle: { width: 2 },
    itemStyle: { 
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index] 
    }
  }));
  
  // console.log('生成的series数据:', series);
  
  return {
    title: {
      text: '综合得分趋势',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].axisValue + '<br/>';
        params.forEach(param => {
          result += `${param.seriesName}: ${param.value}分<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: dimensionNames,
      bottom: 10
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { fontSize: 12, formatter: '{value}分' }
    },
    series: series
  };
});

const roundPerformanceOption = computed(() => {
  const roundDetails = reportData.value?.overall_report?.roundDetails || [];
  // console.log('每轮表现数据:', roundDetails);
  
  if (roundDetails.length === 0) return null;
  
  const dimensions = ['major', 'expression', 'logic', 'stable', 'strain'];
  const dimensionNames = ['专业能力', '表情情绪', '逻辑思维', '稳定能力', '应变能力'];
  
  const data = [];
  roundDetails.forEach((round, roundIndex) => {
    dimensions.forEach((dim, dimIndex) => {
      const integratedScore = round.integrated_score || {};
      const score = integratedScore[dim];
      // console.log(`3D图数据 - 轮次 ${roundIndex}, 维度 ${dim}, 分数:`, score);
      data.push([roundIndex, dimIndex, parseFloat(score) || 0]);
    });
  });
  
  // console.log('3D图最终数据:', data);
  
  return {
    title: {
      text: '每轮综合表现',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      formatter: function(params) {
        const roundIndex = params.data[0];
        const dimIndex = params.data[1];
        const score = params.data[2];
        return `第${roundIndex + 1}轮<br/>${dimensionNames[dimIndex]}: ${score}分`;
      }
    },
    visualMap: {
      max: 100,
      min: 0,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    xAxis3D: {
      type: 'category',
      data: roundDetails.map((_, index) => `第${index + 1}轮`),
      name: '面试轮次'
    },
    yAxis3D: {
      type: 'category',
      data: dimensionNames,
      name: '能力维度'
    },
    zAxis3D: {
      type: 'value',
      min: 0,
      max: 100,
      name: '得分'
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 150,
      boxHeight: 120,
      viewControl: {
        projection: 'orthographic',
        autoRotate: false,
        distance: 220,
        alpha: 20,
        beta: 40
      },
      light: {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
      }
    },
    series: [{
      type: 'bar3D',
      data: data,
      shading: 'lambert',
      label: {
        show: false,
        fontSize: 16,
        borderWidth: 1
      },
      itemStyle: {
        opacity: 0.8
      },
      emphasis: {
        label: {
          fontSize: 20,
          color: '#900'
        },
        itemStyle: {
          color: '#900'
        }
      }
    }]
  };
});

const coreAbilitiesOption = computed(() => {
  const roundDetails = reportData.value?.overall_report?.roundDetails || [];
  // console.log('核心能力数据:', roundDetails);
  
  if (roundDetails.length === 0) return null;
  
  const dimensions = ['major', 'expression', 'logic', 'stable', 'strain'];
  const dimensionNames = ['专业能力', '表情情绪', '逻辑思维', '稳定能力', '应变能力'];
  
  const maxValues = [];
  const minValues = [];
  const avgValues = [];
  
  dimensions.forEach(dim => {
    const scores = roundDetails.map(round => {
      const integratedScore = round.integrated_score || {};
      const score = integratedScore[dim];
      // console.log(`核心能力维度 ${dim}, 分数:`, score);
      return parseFloat(score) || 0;
    }).filter(score => score > 0); // 过滤掉0值
    
    if (scores.length > 0) {
      maxValues.push(Math.max(...scores));
      minValues.push(Math.min(...scores));
      avgValues.push(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    } else {
      maxValues.push(0);
      minValues.push(0);
      avgValues.push(0);
    }
  });
  
  // console.log('核心能力统计 - 最大值:', maxValues, '最小值:', minValues, '平均值:', avgValues);
  
  return {
    title: {
      text: '核心能力评估',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const value = typeof params.value === 'number' ? params.value : (parseFloat(params.value) || 0);
        return `${params.name}<br/>${params.seriesName}: ${value.toFixed(1)}分`;
      }
    },
    legend: {
      data: ['最大值', '最小值', '平均值'],
      bottom: 10
    },
    radar: {
      indicator: dimensionNames.map(name => ({
        name: name,
        max: 100,
        min: 0
      })),
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: maxValues,
          name: '最大值',
          itemStyle: { color: '#ef4444' },
          areaStyle: { color: 'rgba(239, 68, 68, 0.2)' }
        },
        {
          value: minValues,
          name: '最小值',
          itemStyle: { color: '#3b82f6' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.2)' }
        },
        {
          value: avgValues,
          name: '平均值',
          itemStyle: { color: '#10b981' },
          areaStyle: { color: 'rgba(16, 185, 129, 0.2)' }
        }
      ]
    }]
  };
});

const emotionDistributionOption = computed(() => {
  const interviewHistory = interviewStore.interviewHistory || [];
  // console.log('情绪分布数据源:', interviewHistory);
  
  if (interviewHistory.length === 0) return null;
  
  const emotionTotals = {
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    surprised: 0,
    disgusted: 0,
    neutral: 0
  };
  
  let totalRounds = 0;
  
  interviewHistory.forEach(round => {
    if (round.avgFacialData) {
      totalRounds++;
      Object.keys(emotionTotals).forEach(emotion => {
        const value = round.avgFacialData[emotion];
        // console.log(`轮次情绪数据 - ${emotion}:`, value);
        if (value && typeof value === 'string' && value.includes('%')) {
          emotionTotals[emotion] += parseFloat(value.replace('%', ''));
        } else if (typeof value === 'number') {
          emotionTotals[emotion] += value * 100; // 如果是小数，转换为百分比
        }
      });
    }
  });
  
  // console.log('聚合后的情绪数据:', emotionTotals, '总轮数:', totalRounds);
  
  if (totalRounds === 0) return null;
  
  const emotionData = Object.keys(emotionTotals).map(emotion => ({
    name: getEmotionLabel(emotion),
    value: parseFloat((emotionTotals[emotion] / totalRounds).toFixed(1))
  })).filter(item => item.value > 0);
  
  // console.log('最终情绪饼图数据:', emotionData);
  
  if (emotionData.length === 0) return null;
  
  return {
    title: {
      text: '表情情绪分布',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: emotionData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}: {c}%'
      }
    }]
  };
});

const overallQualityOption = computed(() => {
  const roundDetails = reportData.value?.overall_report?.roundDetails || [];
  // console.log('综合素质数据:', roundDetails);
  
  if (roundDetails.length === 0) return null;
  
  const dimensions = ['adaptability', 'concentration', 'confidence', 'doubtfulness', 'emotionalStability', 'happiness', 'nervousness'];
  const dimensionNames = ['适应性', '专注度', '自信度', ' 疑惑度', '情感稳定性', '快乐度', '焦虑度'];
  
  const maxValues = [];
  const minValues = [];
  const avgValues = [];
  
  dimensions.forEach(dim => {
    const scores = roundDetails.map(round => {
      const expressionInfo = round.expression_info || {};
      const score = expressionInfo[dim];
      // console.log(`综合素质维度 ${dim}, 分数:`, score);
      return parseFloat(score) || 0;
    }).filter(score => score > 0); // 过滤掉0值
    
    if (scores.length > 0) {
      maxValues.push(Math.max(...scores));
      minValues.push(Math.min(...scores));
      avgValues.push(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    } else {
      maxValues.push(0);
      minValues.push(0);
      avgValues.push(0);
    }
  });
  
  // console.log('综合素质统计 - 最大值:', maxValues, '最小值:', minValues, '平均值:', avgValues);
  
  return {
    title: {
      text: '综合素质评估',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const value = typeof params.value === 'number' ? params.value : (parseFloat(params.value) || 0);
        return `${params.name}<br/>${params.seriesName}: ${value.toFixed(1)}分`;
      }
    },
    legend: {
      data: ['最大值', '最小值', '平均值'],
      bottom: 10
    },
    radar: {
      indicator: dimensionNames.map(name => ({
        name: name,
        max: 100,
        min: 0
      })),
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: maxValues,
          name: '最大值',
          itemStyle: { color: '#f59e0b' },
          areaStyle: { color: 'rgba(245, 158, 11, 0.2)' }
        },
        {
          value: minValues,
          name: '最小值',
          itemStyle: { color: '#8b5cf6' },
          areaStyle: { color: 'rgba(139, 92, 246, 0.2)' }
        },
        {
          value: avgValues,
          name: '平均值',
          itemStyle: { color: '#06b6d4' },
          areaStyle: { color: 'rgba(6, 182, 212, 0.2)' }
        }
      ]
    }]
  };
});

const accuracyScoresOption = computed(() => {
  const roundAnalysis = reportData.value?.overall_report?.round_analysis || [];
  // console.log('准确率数据:', roundAnalysis);
  
  if (roundAnalysis.length === 0) return null;
  
  const accuracyData = roundAnalysis.map((round, index) => {
    const accuracyEvaluation = round.accuracy_evaluation || {};
    const score = accuracyEvaluation.score;
    // console.log(`题目 ${index + 1} 准确率分数:`, score);
    return {
      name: `Q${index + 1}`,
      value: parseFloat(score) || 0
    };
  });
  
  // console.log('准确率柱状图数据:', accuracyData);
  
  return {
    title: {
      text: '每题准确率得分',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}分'
    },
    xAxis: {
      type: 'category',
      data: accuracyData.map(d => d.name),
      axisLabel: { fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { fontSize: 12, formatter: '{value}分' }
    },
    series: [{
      data: accuracyData.map(d => d.value),
      type: 'bar',
      itemStyle: { 
        color: function(params) {
          const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981'];
          return colors[params.dataIndex % colors.length];
        }
      },
      barWidth: '60%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}分'
      }
    }]
  };
});

const getEmotionLabel = (emotion) => {
  const labels = {
    happy: '开心',
    sad: '悲伤',
    angry: '愤怒',
    fearful: '恐惧',
    surprised: '惊讶',
    disgusted: '厌恶',
    neutral: '中性'
  };
  return labels[emotion] || emotion;
};
</script>

<style scoped>
@import '../../../styles/interview/charts-section.css';

/* 新的布局样式 */
.charts-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-row {
  display: flex;
  gap: 1rem;
  width: 100%;
}

/* 第一行：综合得分趋势图，占满宽度 */
.chart-row.full-width {
  justify-content: center;
}

.chart-row.full-width .chart-card {
  width: 100%;
  max-width: none;
}

/* 第二行：两个图平均分配 */
.chart-row.two-columns {
  justify-content: space-between;
}

.chart-row.two-columns .chart-card {
  flex: 1;
  min-width: 0;
}

/* 第三行：三个图平均分配 */
.chart-row.three-columns {
  justify-content: space-between;
}

.chart-row.three-columns .chart-card {
  flex: 1;
  min-width: 0;
}

/* 调整图表容器样式适配ECharts */
.chart-container {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 添加overflow hidden防止ResizeObserver问题 */
  overflow: hidden;
  position: relative;
}

/* 趋势图使用更大的高度 */
.chart-container.large {
  height: 400px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  /* 添加contain属性优化渲染性能 */
  contain: layout style paint;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  color: #374151;
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 14px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .chart-row.three-columns {
    flex-direction: column;
  }
  
  .chart-row.three-columns .chart-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .chart-row.two-columns {
    flex-direction: column;
  }
  
  .chart-row.two-columns .chart-card {
    width: 100%;
  }
  
  .chart-container,
  .chart-container.large {
    height: 250px;
  }
}
</style>
