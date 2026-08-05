<template>
  <div class="dashboard-container">
    <!-- 顶部用户信息 -->
    <header class="dash-header">
      <div class="user-greeting">
        <h1>Ready to level up, <span class="text-primary">{{ userInfo.username || '挑战者' }}</span>?</h1>
        <p>连续打卡 <el-tag type="success" effect="dark" round size="small">{{ userInfo.consecutiveDays || 0 }} 天</el-tag>，超越了 85% 的挑战者。</p>
      </div>
      <div class="level-badge">
        <div class="level-info">
          <span class="level-text">Lv.{{ userInfo.level || 1 }} 极客</span>
          <span class="exp-text">{{ userInfo.exp || 0 }} / {{ (userInfo.level || 1) * 1000 }} EXP</span>
        </div>
        <el-progress 
          :percentage="expPercentage" 
          :show-text="false" 
          color="#4f46e5" 
        />
      </div>
    </header>

    <div class="bento-grid">
      <!-- 模块1：每日挑战 -->
      <div class="bento-card hero-card span-2">
        <div class="hero-top">
          <el-tag type="danger" effect="dark" round>⚡ DAILY QUEST</el-tag>
          <el-radio-group v-model="currentDirection" @change="fetchDailyQuestion" size="small">
            <el-radio-button label="frontend">前端</el-radio-button>
            <el-radio-button label="backend">后端</el-radio-button>
            <el-radio-button label="fullstack">全栈</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="quest-content">
          <el-skeleton :loading="loading.daily" animated>
            <template #template>
              <el-skeleton-item variant="h1" style="width: 50%; margin-bottom: 15px;" />
              <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px;" />
              <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 20px;" />
            </template>
            <template #default>
              <div v-if="dailyQuestion">
                <h2 class="quest-title">{{ dailyQuestion.title }}</h2>
                <p class="quest-desc">{{ dailyQuestion.description }}</p>
                <div class="quest-meta">
                  <el-tag :type="getDiffType(dailyQuestion.difficulty)" effect="light">{{ dailyQuestion.difficulty }}</el-tag>
                  <el-tag type="warning" effect="light">💡 理论深度解析</el-tag>
                  <span class="pass-rate">热度: {{ dailyQuestion.hotScore }}+</span>
                </div>
              </div>
              <el-empty v-else description="今日暂无该方向题目" :image-size="80" />
            </template>
          </el-skeleton>
        </div>

        <el-button type="primary" size="large" class="btn-launch" :loading="loading.daily" :disabled="!dailyQuestion" @click="$emit('start-challenge', dailyQuestion?.id)">
          开始深度解析 <el-icon class="el-icon--right"><EditPen /></el-icon>
        </el-button>
      </div>

      <!-- 模块2：AI 能力图谱 -->
      <div class="bento-card bg-white">
        <h3 class="card-title"><el-icon color="#4f46e5"><DataLine /></el-icon> AI 能力图谱</h3>
        <div class="skill-list" v-if="skills && skills.length">
          <div class="skill-item" v-for="skill in skills" :key="skill.id">
            <div class="skill-label">
              <span>{{ skill.skillName }}</span>
              <span class="skill-score">{{ skill.masteryScore }}</span>
            </div>
            <el-progress :percentage="skill.masteryScore" :color="getScoreColor(skill.masteryScore)" :show-text="false" />
          </div>
        </div>
        <div class="empty-state" v-else>
          <el-empty description="暂无能力数据，快去刷题吧" :image-size="80"></el-empty>
        </div>
      </div>

      <!-- 模块3：卷王排行榜 (TOP 5) -->
      <div class="bento-card bg-white span-3">
        <h3 class="card-title"><el-icon color="#eab308"><Trophy /></el-icon> 卷王排行榜 (TOP 5)</h3>
        <div class="rank-list" v-if="leaderBoard && leaderBoard.length">
          <div class="rank-item" v-for="(user, index) in leaderBoard" :key="user.userId">
            <div class="r-badge" :class="'top-' + (index + 1)">{{ index + 1 }}</div>
            <el-avatar :size="48" style="background: #4f46e5; margin-bottom: 8px;">{{ (user.username || 'U').charAt(0) }}</el-avatar>
            <div class="r-name">{{ user.username }}</div>
            <div class="r-score">已解 <span class="text-primary">{{ user.totalSolved }}</span> 题</div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <el-empty description="暂无排行榜数据" :image-size="80"></el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { EditPen, DataLine, Trophy } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { goService } from "@/utils/request"



// --- 状态定义 ---
const userInfo = ref({ 
  username: '',
  level: 1,
  exp: 0,
  consecutiveDays: 0
}); 
const currentDirection = ref('frontend');
const loading = reactive({ daily: false });
const dailyQuestion = ref(null);
const skills = ref([]);
const leaderBoard = ref([]);

// --- 计算属性 ---
const expPercentage = computed(() => {
  const exp = userInfo.value.exp || 0;
  const level = userInfo.value.level || 1;
  const expToNext = level * 1000;
  return (exp / expToNext) * 100;
});

// --- API 调用函数 ---

// 1. 获取用户信息
const fetchUserInfo = async () => {
  try {
    console.log('开始获取用户信息...');
    const res = await goService.get('/ai-training/info');
    console.log('用户信息响应:', res);
    
    // 修改：后端成功码是 1，不是 200
    if (res.data && res.data.code === 1) {
        const userData = res.data.data;
        console.log('用户数据:', userData);
        userInfo.value = {
          username: userData.username || '挑战者',
          level: userData.level || 1,
          exp: userData.exp || 0,
          consecutiveDays: userData.consecutiveDays || 0,
          expToNextLevel: userData.expToNextLevel || 1000
        };
    } else {
      console.error('获取用户信息失败，code:', res.data?.code);
    }
  } catch (error) { 
    console.error('获取用户信息异常:', error); 
  }
};

// 2. 获取每日挑战
const fetchDailyQuestion = async () => {
  loading.daily = true;
  dailyQuestion.value = null;
  try {
    console.log('获取每日挑战，方向:', currentDirection.value);
    const res = await goService.get('/ai-training/daily', { 
      params: { category: currentDirection.value } 
    });
    
    console.log('完整响应:', res.data);
    
    // 修改：后端成功码是 1，不是 200
    if (res.data && res.data.code === 1) {
        const questionData = res.data.data;
        if (questionData) {
          console.log('题目数据:', questionData);
          dailyQuestion.value = questionData;
        } else {
          console.warn('题目数据为空');
          ElMessage.info('今日暂无该方向题目');
        }
    } else {
      console.error('获取题目失败，code:', res.data?.code);
      ElMessage.warning(res.data?.msg || '获取每日挑战失败');
    }
  } catch (error) { 
    console.error('获取每日一题失败:', error); 
  } finally { 
    loading.daily = false; 
  }
};

// 3. 获取用户技能图谱
const fetchUserSkills = async () => {
  try {
    console.log('获取用户技能图谱...');
    const res = await goService.get('/ai-training/skills');
    console.log('技能响应:', res.data);
    
    // 修改：后端成功码是 1，不是 200
    if (res.data && res.data.code === 1) {
        skills.value = res.data.data || [];
        console.log('技能数据:', skills.value);
    } else {
      console.error('获取技能失败，code:', res.data?.code);
      skills.value = [];
    }
  } catch (error) { 
    console.error('获取用户技能失败:', error); 
    skills.value = [];
  }
};

// 4. 获取排行榜
const fetchLeaderboard = async () => {
  try {
    console.log('获取排行榜...');
    const res = await goService.get('/ai-training/leaderboard');
    console.log('排行榜响应:', res.data);
    
    // 修改：后端成功码是 1，不是 200
    if (res.data && res.data.code === 1) {
        leaderBoard.value = res.data.data || [];
        console.log('排行榜数据:', leaderBoard.value);
    } else {
      console.error('获取排行榜失败，code:', res.data?.code);
      leaderBoard.value = [];
    }
  } catch (error) { 
    console.error('获取排行榜失败:', error); 
    leaderBoard.value = [];
  }
};

// --- 辅助函数 ---
const getDiffType = (diff) => {
  if (diff === '简单') return 'success';
  if (diff === '地狱' || diff === '困难') return 'danger';
  return 'warning';
};

const getScoreColor = (score) => {
  if (score < 50) return '#f56c6c';
  if (score < 80) return '#e6a23c';
  return '#67c23a';
};

// --- 生命周期钩子 ---
onMounted(async () => {
  console.log('页面加载开始...');
  await Promise.all([
    fetchUserInfo(),
    fetchDailyQuestion(),
    fetchUserSkills(),
    fetchLeaderboard()
  ]);
  console.log('所有数据加载完成');
});
</script>

<style scoped>
/* 样式部分保持不变 */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg-dark: #f1f5f9;
  --card-bg: #ffffff;
  --text-main: #1e293b;
  --text-sub: #64748b;
  --border-color: #e2e8f0;
}

.dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
.text-primary { color: #4f46e5 !important; font-weight: bold; }

/* 头部 */
.dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.user-greeting h1 { margin: 0 0 8px 0; font-size: 24px; color: #1e293b; }
.user-greeting p { margin: 0; color: #64748b; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.level-badge { background: #fff; padding: 15px 20px; border-radius: 12px; border: 1px solid #e2e8f0; width: 260px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.level-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: bold; color: #334155; }

/* 网格系统 */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(240px, auto);
  gap: 20px;
}
.span-2 { grid-column: span 2; }
.span-3 { grid-column: span 3; }

.bento-card { border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: transform 0.2s; background: #ffffff; }
.bento-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
.bg-white { background: #ffffff; }

/* 卡片标题 */
.card-title { margin: 0 0 20px 0; font-size: 16px; color: #1e293b; display: flex; align-items: center; gap: 8px; }

/* 英雄卡片 */
.hero-card { background: linear-gradient(135deg, #1e1b4b, #4338ca); color: #ffffff; border: none; display: flex; flex-direction: column; justify-content: space-between; }
.hero-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.quest-content { min-height: 120px; margin-bottom: 20px; }
.quest-title { margin: 0 0 10px 0; font-size: 22px; color: #ffffff; }
.quest-desc { color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 15px; }
.quest-meta { display: flex; gap: 10px; align-items: center; }
.pass-rate { font-size: 12px; color: #94a3b8; margin-left: auto; white-space: nowrap; }
.btn-launch { width: 100%; background: #4f46e5; border: none; font-size: 16px; font-weight: bold; }
.btn-launch:hover { background: #6366f1; }

/* 图谱 */
.skill-list { display: flex; flex-direction: column; gap: 15px; }
.skill-label { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 5px; }
.skill-score { font-weight: bold; color: #1e293b; }

/* 排行榜 */
.rank-list { display: flex; justify-content: space-between; gap: 15px; }
.rank-item { flex: 1; display: flex; flex-direction: column; align-items: center; background: #f8fafc; padding: 20px 10px; border-radius: 12px; position: relative; }
.r-badge { position: absolute; top: -10px; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.top-1 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.top-2 { background: linear-gradient(135deg, #94a3b8, #cbd5e1); }
.top-3 { background: linear-gradient(135deg, #b45309, #d97706); }
.top-4, .top-5 { background: #cbd5e1; }
.r-name { font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 4px; }
.r-score { font-size: 12px; color: #64748b; }

/* 响应式 */
@media (max-width: 1200px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .span-3 {
    grid-column: span 2;
  }
}

.empty-state {
  padding: 20px 0;
}
</style>
