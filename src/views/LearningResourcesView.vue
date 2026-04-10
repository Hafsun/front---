<template>
  <div class="learning-resources-container">
    <div class="main-card">
      <!-- 头部区域 -->
      <div class="card-header">
        <div class="header-content">
          <el-icon class="header-icon">
            <Notebook />
          </el-icon>
          <h2 class="header-title">学习资源中心</h2>
        </div>
        <p class="description">根据您的面试表现和兴趣，我们为您推荐以下学习资源，助您全面提升。</p>
      </div>

      <!-- 标签页区域 - 调整位置和样式 -->
      <div class="tabs-container">
        <el-tabs 
          v-model="activeTab" 
          class="resource-tabs"
          @tab-change="handleTabChange"
        >
          <!-- 表达训练标签页 -->
          <el-tab-pane name="expression">
            <template #label>
              <div class="tab-label">
                <MessageSquare class="tab-icon" />
                <span>表达训练</span>
              </div>
            </template>
            <ResourceGrid :resources="expressionResources" type="expression" />
          </el-tab-pane>

          <!-- 专业知识标签页 -->
          <el-tab-pane name="knowledge">
            <template #label>
              <div class="tab-label">
                <BookOpen class="tab-icon" />
                <span>专业知识</span>
              </div>
            </template>
            <ResourceGrid :resources="knowledgeResources" type="knowledge" />
          </el-tab-pane>

          <!-- 面试题库标签页 -->
          <el-tab-pane name="questions">
            <template #label>
              <div class="tab-label">
                <QuestionFilled class="tab-icon" />
                <span>面试题库</span>
              </div>
            </template>
            <ResourceGrid :resources="questionResources" type="questions" />
          </el-tab-pane>

          <!-- 智能推荐标签页 -->
          <el-tab-pane name="smart-recommendation">
            <template #label>
              <div class="tab-label">
                <Lightbulb class="tab-icon" />
                <span>智能推荐</span>
              </div>
            </template>
            <SmartRecommendation />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
// 脚本部分保持不变
import { ref, reactive } from 'vue';
import { 
    VideoCamera, Reading, QuestionFilled, 
  Lightbulb, MessageSquare, BookOpen 
} from '@element-plus/icons-vue';
import ResourceGrid from '../components/LearningResources/ResourceGrid.vue';
import SmartRecommendation from '../components/LearningResources/SmartRecommendation.vue';

// 当前激活的标签页
const activeTab = ref('expression');
const prevTab = ref('expression');

// 处理标签页切换动画
const handleTabChange = (tabName) => {
  console.debug(`切换到标签页: ${tabName}`);
  
  const contentEl = document.querySelector('.resource-tabs :deep(.el-tabs__content)');
  if (contentEl) {
    const tabIndex = ['expression', 'knowledge', 'questions', 'smart-recommendation'].indexOf(tabName);
    const prevTabIndex = ['expression', 'knowledge', 'questions', 'smart-recommendation'].indexOf(prevTab.value);
    const direction = tabIndex > prevTabIndex ? 'right' : 'left';

    contentEl.classList.add('tab-transition', `tab-transition-${direction}`);
    setTimeout(() => {
      contentEl.classList.remove('tab-transition', `tab-transition-${direction}`);
    }, 300);
  }
  prevTab.value = tabName;
};

// 资源列表数据（保持不变）
const expressionResources = reactive([
  {
    title: '《高效沟通与表达技巧》',
    description: '学习如何在面试中清晰、有逻辑地表达自己，提升口头表达能力。通过案例分析掌握"结论先行、论据支撑"的表达逻辑。',
    link: 'https://www.bilibili.com/video/BV1rB4y1R7rc/?spm_id_from=333.337.search-card.all.click',
    icon: VideoCamera,
    color: '#E53E3E'
  },
  {
    title: '《非语言沟通的艺术》',
    description: '掌握微表情和肢体语言的运用，让您的面试更具说服力。包含眼神交流、手势控制、坐姿调整等实用技巧。',
    link: 'https://www.bilibili.com/video/BV1hiKCzuEja/?spm_id_from=333.337.search-card.all.click',
    icon: VideoCamera,
    color: '#3182CE'
  },
  {
    title: '《演讲技巧实战课》',
    description: '从演讲稿撰写到舞台表现，全方位提升您的演讲能力。适合需要进行小组汇报或公开演讲的面试场景。',
    link: 'https://www.bilibili.com/video/BV1Jt421K7Vq/?spm_id_from=333.337.search-card.all.click',
    icon: VideoCamera,
    color: '#805AD5'
  },
  {
    title: '《商务谈判策略》',
    description: '学习谈判技巧和策略，提高沟通效率和成功率。包含如何提出薪资要求、福利协商等职场必备技能。',
    link: 'https://www.bilibili.com/video/BV1pE41127zs/?spm_id_from=333.337.search-card.all.click',
    icon: VideoCamera,
    color: '#ED8936'
  },
  {
    title: '《结构化表达训练》',
    description: '掌握PREP、STAR等表达框架，让您的回答更有条理。针对面试中"项目经历""优缺点分析"等高频问题设计训练。',
    link: 'https://www.bilibili.com/video/BV12h4y1g7Nt/?spm_id_from=333.337.search-card.all.click&vd_source=efefaed6515a88d7c6aa3daf74a44505',
    icon: VideoCamera,
    color: '#38A169'
  },
  {
    title: '《沟通中的倾听技巧》',
    description: '学习如何有效倾听，理解对方意图并做出恰当回应。避免面试中因误解问题而答非所问的尴尬场景。',
    link: 'https://www.bilibili.com/video/BV1924y127Xw/?spm_id_from=333.337.search-card.all.click&vd_source=efefaed6515a88d7c6aa3daf74a44505',
    icon: VideoCamera,
    color: '#DD6B20'
  }
]);

const knowledgeResources = reactive([
  {
    title: '《人工智能基础与应用》',
    description: '系统学习AI核心概念、算法及最新应用，巩固专业知识。涵盖机器学习、深度学习、自然语言处理等基础领域。',
    link: 'https://www.bilibili.com/video/BV1f14y1Y7i7/?spm_id_from=333.337.search-card.all.click',
    icon: Reading,
    color: '#1F77B4'
  },
  {
    title: '《大数据技术栈精讲》',
    description: '深入理解Hadoop、Spark、Kafka等大数据工具，提升实战能力。包含集群搭建、数据处理流程及性能优化方案。',
    link: 'https://www.bilibili.com/video/BV1y7421o7Na/?spm_id_from=333.337.search-card.all.click&vd_source=efefaed6515a88d7c6aa3daf74a44505',
    icon: Reading,
    color: '#FF7F0E'
  },
  {
    title: '《机器学习实战》',
    description: '通过实际案例学习机器学习算法的应用和优化。从数据预处理到模型训练、评估，完整覆盖项目开发流程。',
    link: 'https://www.bilibili.com/video/BV14CUZYzEH4/?spm_id_from=333.337.search-card.all.click',
    icon: Reading,
    color: '#2CA02C'
  },
  {
    title: '《云计算架构与实践》',
    description: '掌握云原生技术和架构设计，适应企业数字化转型需求。包含Docker容器化、K8s编排、云平台部署等内容。',
    link: 'https://www.bilibili.com/video/BV1Ab421b7ba/?spm_id_from=333.337.search-card.all.click&vd_source=efefaed6515a88d7c6aa3daf74a44505',
    icon: Reading,
    color: '#D62728'
  },
  {
    title: '《区块链技术详解》',
    description: '了解区块链底层原理、智能合约开发及应用场景。适合区块链开发岗面试前的知识梳理与强化。',
    link: 'https://www.bilibili.com/video/BV1mL411a7jo/?spm_id_from=333.337.search-card.all.click&vd_source=efefaed6515a88d7c6aa3daf74a44505',
    icon: Reading,
    color: '#9467BD'
  },
  {
    title: '《Python数据分析实战》',
    description: '学习使用Python进行数据清洗、分析和可视化的核心技能。包含Pandas、NumPy、Matplotlib等库的实战应用。',
    link: 'https://www.bilibili.com/video/BV1er421H7eZ/?spm_id_from=333.337.search-card.all.click',
    icon: Reading,
    color: '#8C564B'
  }
]);

const questionResources = reactive([
  {
    title: '人工智能技术岗高频面试题',
    description: '精选AI领域常见面试问题及答案解析，助您从容应对。包含算法题、理论题、项目设计题三大类共150+题目。',
    link: 'https://m.nowcoder.com/mianshi/top',
    icon: QuestionFilled,
    color: '#FF6B6B'
  },
  {
    title: '产品经理面试200题',
    description: '涵盖产品设计、市场分析、用户体验等全方位面试题。包含需求分析、PRD撰写、竞品分析等核心能力考察点。',
    link: 'https://www.bilibili.com/list/ml2485520711?oid=902961633&bvid=BV1BP4y1R7f9',
    icon: QuestionFilled,
    color: '#4ECDC4'
  },
  {
    title: '技术面经大全',
    description: '收集各大互联网公司技术面试真题及解题思路。包含字节、阿里、腾讯等大厂近3年面试原题与参考答案。',
    link: 'https://blog.csdn.net/weixin_44934424/article/details/115066562',
    icon: QuestionFilled,
    color: '#45B7D1'
  },
  {
    title: '面试算法题库',
    description: '针对性训练常见面试算法题，提升编程能力。按难度分级（Easy/Medium/Hard），附时间/空间复杂度分析。',
    link: 'https://www.nowcoder.com/exam/oj?questionJobId=10&subTabName=online_coding_page',
    icon: QuestionFilled,
    color: '#FFA07A'
  },
  {
    title: '系统设计面试指南',
    description: '学习大规模系统设计的核心原则和常见架构模式。包含分布式系统、高并发处理、数据一致性等关键知识点。',
    link: 'https://www.imooc.com/article/373941',
    icon: QuestionFilled,
    color: '#98D8C8'
  },
  {
    title: '行为面试问题与回答技巧',
    description: '准备STAR法则回答行为面试问题，展现个人能力和特质。包含"团队冲突处理""失败经历反思"等10类经典问题。',
    link: 'https://wenku.so.com/tfd/320f7747f20f2c2ecf0e8921ab1c3b77',
    icon: QuestionFilled,
    color: '#F7DC6F'
  }
]);
</script>

<style scoped lang="scss">
// 基础变量
$primary-color: #4361EE;
$primary-light: rgba(67, 97, 238, 0.1);
$card-radius: 16px;
$tab-radius: 16px 16px 0 0; // 标签顶部圆角
$tab-height: 42px;
$transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 容器样式
.learning-resources-container {
  padding: 20px;
  background-color: #F8FAFC;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

// 主卡片
.main-card {
  width: 100%;
  max-width: 1200px;
  background-color: #FFFFFF;
  border-radius: $card-radius;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

// 卡片头部
.card-header {
  padding: 24px 24px 16px; // 增加底部内边距，与标签页保持距离
  
  .header-content {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .header-icon {
      font-size: 24px;
      margin-right: 12px;
      color: $primary-color;
    }
    
    .header-title {
      font-size: 20px;
      font-weight: 700;
      color: #1E293B;
      margin: 0;
    }
  }
  
  .description {
    font-size: 14px;
    color: #64748B;
    line-height: 1.5;
    margin: 0;
    padding-left: 36px;
    margin-bottom: 8px; // 增加底部外边距
  }
}

// 标签容器 - 新增样式，控制标签整体位置
.tabs-container {
  padding: 0 24px; // 与标题保持相同的左右内边距
  margin-top: -8px; // 微调位置，与标题区域更协调
}

// 标签页样式 - 修复样式问题
.resource-tabs {
  width: 100%;
  
  ::v-deep(.el-tabs) {
    --el-tabs-bottom-bar-color: transparent; // 隐藏默认下划线
    
    ::v-deep(.el-tabs__header) {
      padding: 4px 0 0; // 调整标签容器位置
      margin: 0 !important; // 移除默认外边距
      background-color: transparent; // 透明背景，与卡片融合
      border-bottom: 1px solid #E2E8F0;
    }
    
    // 标签项样式 - 修复显示问题
    ::v-deep(.el-tabs__item) {
      height: $tab-height;
      line-height: $tab-height;
      padding: 0 20px;
      margin-right: 6px;
      border-radius: $tab-radius;
      font-size: 14px;
      color: #64748B;
      transition: $transition-base;
      
      // 激活状态
      &.is-active {
        background-color: #FFFFFF;
        color: $primary-color;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border-top: 2px solid $primary-color;
        border-left: 1px solid #E2E8F0;
        border-right: 1px solid #E2E8F0;
        margin-top: -1px; // 对齐底部边框
      }
      
      // 悬停状态
      &:hover:not(.is-active) {
        background-color: $primary-light;
        color: $primary-color;
      }
    }
    
    // 标签内容区域
    ::v-deep(.el-tabs__content) {
      padding: 24px 0; // 调整内容区域内边距
    }
  }
  
  // 标签内部图标和文字布局
  .tab-label {
    display: flex;
    align-items: center;
    
    .tab-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
  
  // 标签切换动画
  .tab-transition {
    animation-duration: 0.3s;
    animation-timing-function: ease;
    animation-fill-mode: forwards;
  }

  .tab-transition-right {
    animation-name: tabFadeRight;
  }

  .tab-transition-left {
    animation-name: tabFadeLeft;
  }
}

// 标签切换动画
@keyframes tabFadeRight {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes tabFadeLeft {
  0% {
    opacity: 0;
    transform: translateX(10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .card-header {
    padding: 20px 16px 12px;
    
    .header-content {
      .header-icon {
        font-size: 20px;
      }
      
      .header-title {
        font-size: 18px;
      }
    }
    
    .description {
      padding-left: 32px;
      font-size: 13px;
    }
  }
  
  .tabs-container {
    padding: 0 16px;
  }
  
  .resource-tabs {
    ::v-deep(.el-tabs__header) {
      padding: 4px 0 0;
      overflow-x: auto;
      scrollbar-width: none;
      
      &::-webkit-scrollbar {
        display: none;
      }
    }
    
    ::v-deep(.el-tabs__item) {
      padding: 0 14px;
      font-size: 13px;
    }
    
    ::v-deep(.el-tabs__content) {
      padding: 16px 0;
    }
  }
}
</style>