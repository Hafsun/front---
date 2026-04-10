<template>
  <div class="stage-container">
    <div class="report-card">
      <!-- 卡片头部：面试完成标题和报告生成提示 -->
      <div class="card-header gradient-report">
        <div class="header-content">
          <div class="icon-wrapper">
            <TrophyIcon class="header-icon" />
          </div>
          <h1 class="card-title">面试完成</h1>
          <p class="card-subtitle">{{ reportHeaderSubtitle }}</p>
        </div>
      </div>

      <!-- 报告内容区域 -->
      <div class="report-content">
        <Transition name="fade" mode="out-in">
          <!-- 报告生成加载动画 -->
          <ReportLoading v-if="interviewStore.isGeneratingReport" />

          <!-- 报告显示区域 -->
          <ReportDisplay 
            v-else
            :is-report-saved="isReportSaved"
            :is-saving="isSaving"
            @view-report="$emit('view-report')"
            @start-new-interview="$emit('start-new-interview')"
            @save-report="saveReport"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { TrophyIcon } from 'lucide-vue-next';
import { interviewStore } from '../../stores/interview';
import { interviewApi } from '../../api/interview';
import { ElNotification } from 'element-plus'; // Import ElNotification for elegant success message
import ReportLoading from './report/ReportLoading.vue';
import ReportDisplay from './report/ReportDisplay.vue';

const emit = defineEmits(['view-report', 'start-new-interview']);

const isReportSaved = ref(false);
const isSaving = ref(false);

const reportHeaderSubtitle = computed(() => {
  if (interviewStore.isGeneratingReport) {
    return '正在生成您的面试报告，请稍候...';
  }
  return '您的面试报告已生成完成';
});

onMounted(() => {
  // 当组件挂载时，如果还没有报告数据，则开始生成报告
  if (!interviewStore.finalReportData) {
    generateReport();
  }
});

const generateReport = async () => {
  try {
    console.log('开始调用后端生成报告...');
    // console.log('当前interviewHistory数据:', interviewStore.interviewHistory);
    
    interviewStore.isGeneratingReport = true;
    
    if (!interviewStore.interviewHistory || interviewStore.interviewHistory.length === 0) {
      console.error('面试历史数据为空，无法生成报告');
      interviewStore.isGeneratingReport = false;
      alert('您还没有回答任何问题，无法生成面试报告！');
      emit('start-new-interview');
      return;
    }
    
    // console.log('开始获取格式化数据...');
    const formattedData = interviewStore.getFormattedInterviewData();
    console.log('格式化后的面试数据:', formattedData);
    
    // 验证必要的数据字段
    if (!formattedData.interviewRecords || formattedData.interviewRecords.length === 0) {
      console.error('格式化后的面试记录为空');
      interviewStore.isGeneratingReport = false;
      alert('面试记录数据异常或您没有任何有效作答记录，无法生成报告');
      emit('start-new-interview');
      return;
    }
    
    const reportRequestData = {
      interviewRecords: formattedData.interviewRecords,
      majorDirection: formattedData.majorDirection,
      minorDirection: formattedData.minorDirection,
      position: formattedData.position
    };

    // console.log('发送给后端的完整数据:', reportRequestData);

    const reportResponse = await interviewApi.endInterview(reportRequestData, {
      timeout: 6000000 // 同步 request.js 超时设置
    });

    // console.log('后端返回的原始数据:', reportResponse);

    let finalReportData = null;
    
    // 处理新的数据结构：.data.response
    if (reportResponse?.data) { // 此时的reportResponse?.data就是后端返回的data.response
      // console.log('检测到data字段，使用data作为报告数据');
      finalReportData = reportResponse.data;
    } else {
      console.log('使用原始返回数据');
      finalReportData = reportResponse;
    }



    if (!finalReportData) {
      throw new Error('无法解析后端返回的报告数据');
    }

    interviewStore.setFinalReportData(finalReportData);
    interviewStore.setReportRequestData(reportRequestData);
    interviewStore.isGeneratingReport = false;
    
    console.log('报告生成完成，等待用户点击保存');
    
  } catch (error) {
    console.error('生成报告失败:', error);
    interviewStore.isGeneratingReport = false;
    
    let errorMessage = '报告生成失败，请重试或联系技术支持';
    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，可能是网络问题或服务器处理时间过长，请重试';
    } else if (error.response?.status === 400) {
      errorMessage = '请求参数错误，请检查面试数据是否完整';
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试';
    }
    
    alert(errorMessage);
  }
};

const saveReport = async () => {
  if (isSaving.value || isReportSaved.value) {
    return;
  }

  try {
    isSaving.value = true;
    console.log('开始保存报告到Java后端...');
    
    if (!interviewStore.finalReportData) {
      throw new Error('报告数据不存在，无法保存');
    }

    // 使用store中的新方法保存报告
    const result = await interviewStore.saveReportToJavaBackend();
    
    if (result.success) {
      console.log('报告保存成功:', result.data);
      isReportSaved.value = true;
      
      ElNotification({
        title: '保存成功',
        message: '您的面试报告已成功保存到系统中，可在报告历史中查看',
        type: 'success',
        duration: 4000,
        position: 'top-right',
        showClose: true,
        customClass: 'report-save-notification'
      });
    } else {
      throw new Error(result.message || '保存失败');
    }
    
  } catch (error) {
    console.error('保存报告失败:', error);
    
    let errorMessage = '保存报告失败：' + (error.message || '未知错误');
    if (error.code === 'ECONNABORTED') {
      errorMessage = '保存超时，请检查网络连接后重试';
    } else if (error.response?.status === 400) {
      errorMessage = '数据格式错误，请重新生成报告后再试';
    } else if (error.response?.status === 500) {
      errorMessage = '服务器错误，请稍后重试';
    }
    
    ElNotification({
      title: '保存失败',
      message: errorMessage,
      type: 'error',
      duration: 5000,
      position: 'top-right',
      showClose: true
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
@import '../../styles/interview/report-stage.css';

/* Add custom styles for the notification */
:global(.report-save-notification) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 4px solid #10b981;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15);
}

:global(.report-save-notification .el-notification__title) {
  color: #065f46;
  font-weight: 600;
}

:global(.report-save-notification .el-notification__content) {
  color: #047857;
}

:global(.report-save-notification .el-notification__icon) {
  color: #10b981;
}
</style>
