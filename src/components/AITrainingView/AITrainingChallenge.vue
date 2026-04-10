<template>
  <div class="challenge-container">
    <!-- 顶部操作栏 -->
    <div class="challenge-header">
      <div class="header-left">
        <el-button icon="ArrowLeft" @click="handleBack" circle plain></el-button>
        <span class="q-title">{{ questionData.title || '题目加载中...' }}</span>
        <el-tag :type="getDiffType(questionData.difficulty)" size="small" effect="dark" style="margin-left: 10px;">
          {{ questionData.difficulty || '中等' }}
        </el-tag>
      </div>
      <div class="header-right">
        <span class="timer"><el-icon><Timer /></el-icon> {{ timeStr }}</span>
        <el-button type="primary" icon="Position" @click="submitAnswer" :loading="submitting" v-if="!isSubmitted">
          提交回答
        </el-button>
        <el-button type="success" plain @click="handleBack" v-else>
          完成并返回
        </el-button>
      </div>
    </div>

    <!-- 核心分栏区域 -->
    <div class="challenge-body">
      
      <!-- 左侧：情景描述与考察点 -->
      <div class="pane pane-left">
        <div class="pane-header">
          <el-icon><Document /></el-icon> 情景与要求
        </div>
        <div class="pane-content markdown-body">
          <el-skeleton :rows="6" animated v-if="loading" />
          <div v-else>
            <div class="scenario-box">
              <p class="scenario-text">{{ questionData.description }}</p>
            </div>
            
            <h4 class="section-title">🎯 核心考察点：</h4>
            <ul class="hint-list">
              <li v-for="(hint, index) in questionData.hints" :key="index">{{ hint }}</li>
            </ul>

            <el-alert title="面试官提示" type="info" description="请尽量结构化地表述你的思路，可以分点作答。条理清晰将获得更高的 AI 评分。" show-icon :closable="false" style="margin-top: 30px;" />
          </div>
        </div>
      </div>

      <!-- 右侧：作答区 OR AI评估区 -->
      <div class="pane pane-right">
        
        <!-- 状态1：作答中 -->
        <div class="answer-section" v-if="!isSubmitted">
          <div class="pane-header editor-header">
            <span><el-icon><Edit /></el-icon> 你的回答</span>
            <span class="word-count" :class="{ 'text-danger': answerText.length < 50 }">
              已输入 {{ answerText.length }} 字 (建议不少于 50 字)
            </span>
          </div>
          <div class="editor-container">
            <el-input
              v-model="answerText"
              type="textarea"
              :rows="20"
              placeholder="面试官正看着你，请开始你的表演...\n\n例如：\n1. 首先，我会排查...\n2. 其次，针对这个问题，我的架构设计是...\n3. 最后..."
              class="custom-textarea"
              resize="none"
            />
          </div>
        </div>

        <!-- 状态2：提交后展示 AI 评估结果 -->
        <div class="result-section" v-else>
          <div class="pane-header result-header">
            <span><el-icon><Cpu /></el-icon> AI 面试官评估报告</span>
          </div>
          
          <div class="result-content">
            <!-- 骨架屏：模拟 AI 思考过程 -->
            <div v-if="aiThinking" class="ai-thinking">
              <el-icon class="is-loading" :size="40" color="#4f46e5"><Loading /></el-icon>
              <p>AI 面试官正在仔细阅读你的回答...</p>
            </div>

            <!-- 评估结果 -->
            <transition name="el-fade-in-linear">
              <div v-if="!aiThinking" class="evaluation-report">
                <div class="score-card">
                  <div class="score-circle">
                    <span class="score-num">{{ evaluationResult.score || 0 }}</span>
                    <span class="score-label">综合得分</span>
                  </div>
                  <div class="score-details">
                    <div class="detail-item">
                      <span>逻辑清晰度</span>
                      <el-progress :percentage="evaluationResult.logic || 0" color="#4f46e5" />
                    </div>
                    <div class="detail-item">
                      <span>技术深度</span>
                      <el-progress :percentage="evaluationResult.depth || 0" color="#10b981" />
                    </div>
                    <div class="detail-item">
                      <span>完整性</span>
                      <el-progress :percentage="evaluationResult.completeness || 0" color="#f59e0b" />
                    </div>
                  </div>
                </div>

                <h4 class="section-title text-primary"><el-icon><ChatDotRound /></el-icon> AI 导师点评</h4>
                <div class="ai-comment">
                  {{ evaluationResult.comment || 'AI评估完成，暂无详细点评。' }}
                </div>

                <h4 class="section-title text-success" style="margin-top: 20px;"><el-icon><Key /></el-icon> 参考标准答案提纲</h4>
                <div class="standard-answer">
                  <p v-html="formatStandardAnswer(questionData.standardAnswer)"></p>
                </div>
              </div>
            </transition>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Timer, Document, Edit, Cpu, Loading, ChatDotRound, Key } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { javaService } from "@/utils/request"

const props = defineProps({
  questionId: { type: Number, required: true }
});

const emit = defineEmits(['back']);

// 状态控制
const loading = ref(true);
const submitting = ref(false);
const isSubmitted = ref(false);
const aiThinking = ref(false);

const questionData = ref({
  title: '',
  difficulty: '',
  description: '',
  hints: [],
  standardAnswer: ''
});
const answerText = ref('');
const evaluationResult = ref({
  score: 0,
  logic: 0,
  depth: 0,
  completeness: 0,
  comment: ''
});

// 计时器
const seconds = ref(0);
let timer = null;
const timeStr = computed(() => {
  const m = Math.floor(seconds.value / 60).toString().padStart(2, '0');
  const s = (seconds.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

// 格式化标准答案
const formatStandardAnswer = (answer) => {
  if (!answer) return '暂无标准答案';
  return answer.replace(/\n/g, '<br>');
};

// 获取题目详情
const fetchQuestionDetail = async () => {
  loading.value = true;
  try {
    console.log('获取题目详情，ID:', props.questionId);
    const res = await javaService.get(`/ai-training/detail/${props.questionId}`);
    console.log('题目详情响应:', res.data);
    
    // 后端成功码是 1
    if (res.data && res.data.code === 1) {
      const data = res.data.data;
      questionData.value = {
        title: data.title || '题目加载失败',
        difficulty: data.difficulty || '中等',
        description: data.description || '暂无题目描述',
        hints: data.hints || ['暂无提示'],
        standardAnswer: data.standardAnswer || '暂无标准答案'
      };
      console.log('题目数据加载成功:', questionData.value);
    } else {
      ElMessage.error(res.data?.msg || '获取题目详情失败');
      // 加载失败时使用模拟数据（可选）
      useMockData();
    }
  } catch (error) {
    console.error('获取题目详情失败:', error);
    ElMessage.error('获取题目详情失败，请检查网络连接');
    // 加载失败时使用模拟数据作为降级方案
    useMockData();
  } finally {
    loading.value = false;
  }
};

// 模拟数据（作为降级方案）
const useMockData = () => {
  questionData.value = {
    title: '千万级高并发秒杀系统架构',
    difficulty: '地狱',
    description: '请设计一个能够支撑双11千万级 QPS 的秒杀系统。假设活动商品只有100件，但瞬间涌入流量达到1000万。请详细阐述你的系统架构设计，以及每个环节如何保证高可用和防止超卖。',
    hints: [
      '前端请求拦截与限流策略',
      '网关层的负载均衡与风控',
      'Redis 缓存在秒杀中的核心作用及 Lua 脚本应用',
      '消息队列 (MQ) 的削峰填谷',
      '数据库底层的乐观锁/悲观锁机制'
    ],
    standardAnswer: '1. 前端层面：按钮置灰、验证码防刷、请求防抖。\n2. 接入层：Nginx 负载均衡，基于 IP/User ID 频次限流。\n3. 缓存层：预扣减库存放入 Redis，利用 Lua 脚本保证原子性，拦截99%的无效请求。\n4. 消息队列：Redis 扣减成功的请求放入 MQ，异步下单，保护数据库。\n5. 数据库层：利用版本号（乐观锁） UPDATE goods SET stock = stock - 1 WHERE id = 1 AND stock > 0 进行最终兜底。'
  };
};

// 提交回答
const submitAnswer = () => {
  if (answerText.value.length < 20) {
    ElMessage.warning('回答字数太少，请再详细阐述一下你的思路。');
    return;
  }

  ElMessageBox.confirm('确定要提交回答吗？提交后将由 AI 进行评分。', '确认提交', {
    confirmButtonText: '确定',
    cancelButtonText: '继续修改',
    type: 'info',
  }).then(async () => {
    submitting.value = true;
    
    try {
      // 调用后端提交接口
      const res = await javaService.post('/ai-training/submit', {
        questionId: props.questionId,
        userAnswer: answerText.value
      });
      
      console.log('提交响应:', res.data);
      
      if (res.data && res.data.code === 1) {
        // 提交成功
        submitting.value = false;
        isSubmitted.value = true;
        clearInterval(timer); // 停止计时
        
        // 开始 AI 评估
        aiThinking.value = true;
        
        // 获取评估结果（后端已经在 submit 接口中返回了评估结果）
        setTimeout(() => {
          const resultData = res.data.data;
          evaluationResult.value = {
            score: resultData.score || 0,
            logic: resultData.logic || 0,
            depth: resultData.depth || 0,
            completeness: resultData.completeness || 0,
            comment: resultData.comment || 'AI评估完成，暂无详细点评。'
          };
          aiThinking.value = false;
          
          ElMessage.success('提交成功！AI评估已完成。');
        }, 500); // 稍微延迟一下，让用户看到思考动画
      } else {
        submitting.value = false;
        ElMessage.error(res.data?.msg || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      submitting.value = false;
      ElMessage.error('提交失败，请检查网络连接');
    }
  }).catch(() => {
    // 用户取消提交
    console.log('用户取消提交');
  });
};

// 返回上一页
const handleBack = () => {
  if (!isSubmitted.value && answerText.value.length > 0) {
    ElMessageBox.confirm('您的回答尚未提交，确定要离开吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      emit('back');
    }).catch(() => {});
  } else {
    emit('back');
  }
};

// 难度标签样式
const getDiffType = (diff) => {
  if (diff === '简单') return 'success';
  if (diff === '地狱' || diff === '困难') return 'danger';
  return 'warning';
};

// 生命周期
onMounted(() => {
  fetchQuestionDetail();
  timer = setInterval(() => seconds.value++, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.challenge-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); 
  background: #f4f6f8;
}

/* 顶部操作栏 */
.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  z-index: 10;
}
.header-left { display: flex; align-items: center; }
.q-title { font-size: 18px; font-weight: bold; margin-left: 15px; color: #1e293b; }
.header-right { display: flex; align-items: center; gap: 20px; }
.timer { font-family: monospace; font-size: 16px; color: #64748b; display: flex; align-items: center; gap: 5px; }

/* 核心布局：左右分栏 */
.challenge-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
}

.pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  overflow: hidden;
}
.pane-left { flex: 0 0 40%; }
.pane-right { flex: 1; }

/* 栏目头部 */
.pane-header {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 15px;
  font-weight: bold;
  color: #334155;
  gap: 8px;
}

/* 左侧内容区 */
.pane-content { padding: 24px; overflow-y: auto; flex: 1; color: #334155; line-height: 1.7; }
.scenario-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px 20px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px; }
.scenario-text { margin: 0; font-size: 15px; color: #0f172a; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 6px; }
.hint-list { padding-left: 20px; color: #475569; }
.hint-list li { margin-bottom: 8px; }

/* 右侧作答区 */
.answer-section { display: flex; flex-direction: column; height: 100%; }
.editor-header { justify-content: space-between; }
.word-count { font-size: 12px; font-weight: normal; color: #94a3b8; }
.text-danger { color: #ef4444; }
.editor-container { flex: 1; padding: 20px; background: #fafafa; }
/* 深度定制 Element Plus Textarea 样式 */
:deep(.custom-textarea .el-textarea__inner) {
  height: 100% !important;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  font-size: 15px;
  line-height: 1.8;
  color: #1e293b;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.3s;
}
:deep(.custom-textarea .el-textarea__inner:focus) {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* 右侧 AI 评估结果区 */
.result-section { display: flex; flex-direction: column; height: 100%; background: #ffffff; }
.result-header { background: linear-gradient(90deg, #f0f9ff, #e0e7ff); color: #4f46e5; border-bottom: none; }
.result-content { padding: 30px; overflow-y: auto; flex: 1; }

.ai-thinking { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; gap: 20px; }

.score-card { display: flex; align-items: center; background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
.score-circle { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #ec4899); color: white; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
.score-num { font-size: 32px; font-weight: bold; line-height: 1; }
.score-label { font-size: 12px; opacity: 0.9; margin-top: 4px; }
.score-details { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 15px; }
.detail-item span { font-size: 13px; color: #475569; margin-bottom: 5px; display: block; }

.text-primary { color: #4f46e5; }
.text-success { color: #10b981; }
.ai-comment { background: #eff6ff; padding: 20px; border-radius: 8px; color: #1e293b; line-height: 1.6; border-left: 4px solid #3b82f6; margin-bottom: 30px; }
.standard-answer { background: #f0fdf4; padding: 20px; border-radius: 8px; color: #065f46; line-height: 1.8; border: 1px solid #a7f3d0; }

/* 响应式调整 */
@media (max-width: 1024px) {
  .challenge-body {
    flex-direction: column;
  }
  .pane-left {
    flex: 0 0 auto;
    max-height: 40%;
  }
  .score-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>