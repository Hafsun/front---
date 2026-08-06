<template>
    <div class="smart-recommendation">
        <!-- 顶部装饰元素 -->
        <div class="top-decoration"></div>

        <!-- 主容器 -->
        <div class="container">
            <!-- 标题区域 -->
            <div class="header">
                <h1 class="main-title">
                    <span class="title-icon">🧠</span>
                    个性化学习方案生成器
                </h1>
                <p class="subtitle">告诉我你的面试挑战，获取量身定制的提升计划</p>
            </div>

            <!-- 输入卡片 -->
            <div class="input-card">
                <div class="card-inner">
                    <label for="feedback-input" class="input-label">描述你的面试挑战</label>
                    <!-- 替换为原生 textarea -->
                    <textarea id="feedback-input" v-model="interviewDefects" rows="4"
                        placeholder="例如：技术问题阐述时逻辑不清晰，缺乏行业术语应用..." class="custom-textarea"
                        @focus="textareaFocused = true" @blur="textareaFocused = false">
                    </textarea>

                    <div class="action-buttons">
                        <button type="button" @click="clearInput" class="reset-btn"
                            :disabled="!interviewDefects.trim()">
                            <span class="icon">
                                <!-- 这里暂时用 span 代替图标，你可以自行替换 -->
                                🔄
                            </span>
                            重置
                        </button>

                        <button type="button" :disabled="!interviewDefects.trim() || isLoading"
                            @click="generateSmartResources" class="generate-btn">
                            <span v-if="isLoading" class="loading-icon">
                                <!-- 这里暂时用 span 代替图标，你可以自行替换 -->
                                ⌛
                            </span>
                            <span>{{ isLoading ? '生成中...' : '生成学习方案' }}</span>
                            <span v-if="!isLoading" class="arrow-icon">
                                <!-- 这里暂时用 span 代替图标，你可以自行替换 -->
                                →
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 结果区域 -->
            <div v-if="showResults" class="results-section">
                <!-- 结果标题 -->
                <div class="results-header">
                    <h2>为你定制的提升方案</h2>
                    <p class="results-desc">基于你的描述："{{ interviewDefects }}"</p>

                    <div class="results-actions">
                        <button type="button" class="regenerate-btn" @click="regenerateResources">
                            <span class="icon">
                                <!-- 这里暂时用 span 代替图标，你可以自行替换 -->
                                🔄
                            </span>
                            重新生成
                        </button>

                        <button type="button" class="download-btn" @click="downloadPlan">
                            <span class="icon">
                                <!-- 这里暂时用 span 代替图标，你可以自行替换 -->
                                ⬇️
                            </span>
                            保存方案
                        </button>
                    </div>
                </div>

                <!-- 结果卡片网格 -->
                <div class="resources-grid">
                    <div v-for="(item, index) in smartResources" :key="index" class="resource-card" :style="{
                        background: `linear-gradient(145deg, ${item.lightColor}, #ffffff)`,
                        borderColor: item.themeColor + '20',
                        cursor: 'pointer'
                    }" @click="openPlanDetail(item)">
                        <!-- 卡片头部 -->
                        <div class="resource-card-header">
                            <div class="card-icon" :style="{ backgroundColor: item.themeColor }">
                                <span :class="item.iconComponent" class="icon" />
                            </div>

                            <div class="card-title-group">
                                <h3 class="card-title">{{ item.aspect }}</h3>
                                <div class="difficulty-tag"
                                    :style="{ backgroundColor: item.themeColor + '15', color: item.themeColor }">
                                    {{ item.difficulty === 'beginner' ? '入门级' :
                                        item.difficulty === 'intermediate' ? '进阶级' : '专家级' }}
                                </div>
                            </div>
                        </div>

                        <!-- 卡片内容 -->
                        <div class="resource-card-content">
                            <div class="core-advice">
                                <p>{{ item.coreAdvice }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <!-- 详细方案弹窗 -->
            <el-dialog
                v-model="dialogVisible"
                title="定制提升方案详情"
                width="65%"
                class="plan-detail-dialog"
                destroy-on-close
                align-center
            >
                <div v-if="currentPlan" class="plan-detail-content">
                    <div class="plan-header" :style="{ backgroundColor: currentPlan.lightColor, borderColor: currentPlan.themeColor }">
                        <div class="header-icon" :style="{ backgroundColor: currentPlan.themeColor }">
                            <span :class="currentPlan.iconComponent" class="icon" />
                        </div>
                        <div class="header-info">
                            <h3>{{ currentPlan.aspect }}</h3>
                            <p>{{ currentPlan.coreAdvice }}</p>
                        </div>
                        <div class="difficulty-badge" :style="{ backgroundColor: currentPlan.themeColor + '15', color: currentPlan.themeColor }">
                            {{ currentPlan.difficulty === 'beginner' ? '入门级' :
                            currentPlan.difficulty === 'intermediate' ? '进阶级' : '专家级' }}
                        </div>
                    </div>

                    <div class="plan-body">
                        <!-- 学习路线 -->
                        <div class="plan-section">
                            <h4 class="section-title">
                                <span class="icon">📍</span> 学习路线
                            </h4>
                            <el-steps direction="vertical" :active="currentPlan.learningSteps.length" class="custom-steps">
                                <el-step v-for="(step, idx) in currentPlan.learningSteps" :key="idx" :title="'阶段 ' + (idx + 1)">
                                    <template #description>
                                        <div class="step-desc">{{ step }}</div>
                                    </template>
                                </el-step>
                            </el-steps>
                        </div>

                        <!-- 技术栈与行业经验并排 -->
                        <div class="plan-row">
                            <div class="plan-section half">
                                <h4 class="section-title">
                                    <span class="icon">💻</span> 核心技术栈
                                </h4>
                                <div class="tech-stack-tags">
                                    <el-tag v-for="(tech, idx) in currentPlan.techStack" :key="idx" 
                                        :color="currentPlan.lightColor" 
                                        :style="{ color: currentPlan.themeColor, borderColor: currentPlan.themeColor + '40' }" 
                                        class="tech-tag"
                                        effect="plain"
                                        round>
                                        {{ tech }}
                                    </el-tag>
                                </div>
                            </div>

                            <div class="plan-section half">
                                <h4 class="section-title">
                                    <span class="icon">🏢</span> 行业经验解析
                                </h4>
                                <div class="experience-cards">
                                    <div v-for="(exp, idx) in currentPlan.industryExperience" :key="idx" class="exp-card">
                                        <div class="exp-title">{{ exp.title }}</div>
                                        <div class="exp-desc">{{ exp.desc }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 推荐资源 -->
                        <div class="plan-section">
                            <h4 class="section-title">
                                <span class="icon">📚</span> 推荐学习资源
                            </h4>
                            <div class="resources-grid-small">
                                <a v-for="(resource, rIdx) in currentPlan.learningResources" :key="rIdx"
                                    :href="resource.url" target="_blank" class="resource-item"
                                    @click.prevent="handleResourceClick(resource.url)">
                                    <div class="resource-type-icon"
                                        :style="{ backgroundColor: currentPlan.themeColor + '10', color: currentPlan.themeColor }">
                                        <span :class="resource.type === 'video' ? 'Video' :
                                            resource.type === 'article' ? 'FileText' : 'Book' " class="icon" />
                                    </div>
                                    <div class="resource-info">
                                        <h5>{{ resource.name }}</h5>
                                        <p class="resource-meta">{{ resource.duration }} · {{ resource.source }}
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogVisible = false">关闭</el-button>
                        <el-button :style="{ color: currentPlan?.saved ? currentPlan.themeColor : '' }" @click="saveResource(currentPlan)">
                            {{ currentPlan?.saved ? '已收藏' : '收藏方案' }}
                        </el-button>
                        <el-button type="primary" 
                            :style="{ backgroundColor: currentPlan?.themeColor, borderColor: currentPlan?.themeColor }"
                            @click="startLearning(currentPlan)">
                            开始学习
                        </el-button>
                    </div>
                </template>
            </el-dialog>

            <!-- 加载状态 -->
            <div v-if="isLoading && !showResults" class="loading-state">
                <div class="loading-animation">
                    <div class="spinner" :style="{ borderTopColor: themeConfig[0].themeColor }"></div>
                </div>
                <p>正在分析你的需求，生成个性化方案...</p>
            </div>

            <!-- 空状态 -->
            <div v-if="submitted && !isLoading && !showResults" class="empty-state">
                <div class="empty-illustration">
                    <div class="illustration-icon">✏️</div>
                </div>
                <h3>还没有生成学习方案</h3>
                <p>请描述你的面试挑战，我们会为你定制专属提升计划</p>
                <button type="button" class="generate-now-btn" @click="scrollToInput">
                    立即生成
                </button>
            </div>
        </div>

        <!-- 底部装饰 -->
        <div class="bottom-decoration"></div>
    </div>
</template>
<script setup>
import { ref, nextTick } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { getSmartLearningResources } from '@/api/user';
// 状态管理
const interviewDefects = ref('');
const smartResources = ref([]);
const isLoading = ref(false);
const submitted = ref(false);
const showResults = ref(false);
const dialogVisible = ref(false);
const currentPlan = ref(null);
const textareaFocused = ref(false);

// 主题配置 - 丰富色彩系统
const themeConfig = [
    {
        themeColor: '#6366F1', // 靛蓝色
        lightColor: 'rgba(99, 102, 241, 0.05)',
        icon: 'ChatSquare'
    },
    {
        themeColor: '#10B981', // 绿色
        lightColor: 'rgba(16, 185, 129, 0.05)',
        icon: 'BookOpen'
    },
    {
        themeColor: '#F59E0B', // 琥珀色
        lightColor: 'rgba(245, 158, 11, 0.05)',
        icon: 'BarChart3'
    },
    {
        themeColor: '#EC4899', // 粉色
        lightColor: 'rgba(236, 72, 153, 0.05)',
        icon: 'Code'
    },
    {
        themeColor: '#06B6D4', // 青色
        lightColor: 'rgba(6, 182, 212, 0.05)',
        icon: 'Users'
    }
];

// 图标映射
const iconComponents = {
    'ChatSquare': 'ChatSquare',
    'BookOpen': 'BookOpen',
    'BarChart3': 'BarChart3',
    'Code': 'Code',
    'Users': 'Users'
};

// 将 AI 学习建议映射到现有卡片结构。
const mapSuggestionToPlan = (result) => ({
    aspect: result.aspect,
    themeColor: themeConfig[0].themeColor,
    lightColor: themeConfig[0].lightColor,
    iconComponent: iconComponents[themeConfig[0].icon],
    difficulty: 'intermediate',
    coreAdvice: result.suggestions[0],
    learningSteps: result.learningDirections,
    techStack: [],
    industryExperience: result.suggestions.slice(1).map((suggestion, index) => ({
        title: `补充建议 ${index + 1}`,
        desc: suggestion
    })),
    learningResources: result.learningResources.map((resource) => ({
        name: resource,
        type: 'article',
        duration: '在线资源',
        source: new URL(resource).hostname,
        url: resource
    })),
    saved: false
});

// 生成推荐
const generateSmartResources = async () => {
    if (!interviewDefects.value.trim()) {
        ElMessage.warning('请输入你的面试反馈内容');
        return;
    }

    isLoading.value = true;
    submitted.value = true;
    showResults.value = false;

    try {
        const { data } = await getSmartLearningResources({
            interviewDefects: interviewDefects.value.trim()
        });
        if (data?.statusCode !== 1 || !data.response) {
            throw new Error(data?.response || '模型未返回有效学习建议');
        }
        smartResources.value = [mapSuggestionToPlan(data.response)];

        // 显示结果
        nextTick(() => {
            showResults.value = true;
            ElNotification.success({
                title: '方案生成成功',
                message: `已为你生成${smartResources.value.length}个提升方向，点击卡片可查看详情`,
                duration: 3000
            });
        });

    } catch (error) {
        ElMessage.error('方案生成失败，请稍后重试');
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

// 交互方法
const openPlanDetail = (item) => {
    currentPlan.value = item;
    dialogVisible.value = true;
};

const clearInput = () => {
    interviewDefects.value = '';
    showResults.value = false;
    submitted.value = false;
};

const regenerateResources = () => {
    generateSmartResources();
};

const downloadPlan = () => {
    ElMessage.success('学习方案已保存到本地');
};

const handleResourceClick = (url) => {
    window.open(url, '_blank');
    ElMessage.info('正在打开学习资源');
};

const saveResource = (item) => {
    item.saved = !item.saved;
    ElMessage.success(item.saved ? '已添加到收藏' : '已取消收藏');
};

const startLearning = (item) => {
    ElNotification({
        title: '开始学习',
        message: `已为你打开「${item.aspect}」的学习路径`,
        duration: 2000
    });
    // 滚动到第一个资源
    nextTick(() => {
        const firstResource = document.querySelector(`.resource-item`);
        firstResource?.scrollIntoView({ behavior: 'smooth' });
    });
};

const scrollToInput = () => {
    const textarea = document.querySelector('.custom-textarea');
    textarea?.scrollIntoView({ behavior: 'smooth' });
    textarea?.focus();
};
</script>

<style scoped lang="scss">
// 基础变量
$radius-xs: 8px;
$radius-sm: 12px;
$radius-md: 16px;
$radius-lg: 24px;
$radius-full: 999px;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;

$shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.05);
$shadow-md: 0 6px 20px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.12);

$transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);


.custom-textarea {
    border-radius: $radius-md;
    border: 2px solid #E2E8F0;
    padding: $spacing-md;
    font-size: 1rem;
    min-height: 140px;
    transition: all 0.3s ease;
    resize: vertical;
    width: 100%;
    box-sizing: border-box;

    &:focus {
        border-color: #6366F1;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        outline: none;
    }
}
// 主样式
.smart-recommendation {
    min-height: 100vh;
    background-color: #FAFAFC;
    position: relative;
    padding: $spacing-lg 0;

    // 装饰元素
    .top-decoration,
    .bottom-decoration {
        position: absolute;
        left: 0;
        right: 0;
        height: 120px;
        z-index: 0;
        background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    }

    .top-decoration {
        top: 0;
    }

    .bottom-decoration {
        bottom: 0;
        transform: rotate(180deg);
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 $spacing-lg;
        position: relative;
        z-index: 1;
    }

    // 标题区域
    .header {
        text-align: center;
        margin-bottom: $spacing-xxl;
        padding-top: $spacing-lg;

        .main-title {
            font-size: 2.2rem;
            font-weight: 700;
            color: #1E293B;
            margin: 0 0 $spacing-sm 0;
            display: inline-flex;
            align-items: center;
            gap: $spacing-sm;

            .title-icon {
                font-size: 1.2em;
            }
        }

        .subtitle {
            font-size: 1.1rem;
            color: #64748B;
            margin: 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
    }

    // 输入卡片
    .input-card {
        background-color: white;
        border-radius: $radius-lg;
        box-shadow: $shadow-md;
        margin-bottom: $spacing-xxl;
        transition: $transition-base;
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #6366F1, #8B5CF6);
        }

        .card-inner {
            padding: $spacing-xl;
        }

        .input-label {
            display: block;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: $spacing-md;
            font-size: 1rem;
        }

        .custom-textarea {
            :deep(.el-textarea__inner) {
                border-radius: $radius-md;
                border: 2px solid #E2E8F0;
                padding: $spacing-md;
                font-size: 1rem;
                min-height: 140px;
                transition: $transition-base;
                resize: vertical;

                &:focus {
                    border-color: #6366F1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }
            }
        }

        .action-buttons {
            display: flex;
            justify-content: flex-end;
            gap: $spacing-md;
            margin-top: $spacing-lg;

            .reset-btn {
                background-color: transparent;
                border: 1px solid #E2E8F0;
                color: #64748B;
                padding: 10px $spacing-lg;
                border-radius: $radius-full;
                font-weight: 500;
                transition: $transition-base;

                &:hover {
                    background-color: #F8FAFC;
                    border-color: #CBD5E1;
                }

                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .icon {
                    margin-right: $spacing-xs;
                }
            }

            .generate-btn {
                background: linear-gradient(90deg, #6366F1, #8B5CF6);
                border: none;
                color: white;
                padding: 10px $spacing-xl;
                border-radius: $radius-full;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: $spacing-xs;
                transition: $transition-base;
                cursor: pointer;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                    background: linear-gradient(90deg, #585ADB, #7C3AED);
                }

                &:disabled {
                    opacity: 0.7;
                    transform: none;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .loading-icon {
                    animation: spin 1.5s linear infinite;
                }

                .arrow-icon {
                    transition: $transition-base;
                }

                &:hover .arrow-icon {
                    transform: translateX(3px);
                }
            }
        }
    }

    // 结果区域
    .results-section {
        .results-header {
            display: flex;
            flex-direction: column;
            margin-bottom: $spacing-xl;

            h2 {
                font-size: 1.5rem;
                color: #1E293B;
                margin: 0 0 $spacing-sm 0;
                display: flex;
                align-items: center;

                &::after {
                    content: '';
                    flex-grow: 1;
                    height: 2px;
                    background-color: #E2E8F0;
                    margin-left: $spacing-md;
                    max-width: 300px;
                }
            }

            .results-desc {
                color: #64748B;
                margin: 0 0 $spacing-md 0;
                font-size: 0.95rem;
                max-width: 800px;
            }

            .results-actions {
                display: flex;
                gap: $spacing-md;
                align-self: flex-end;

                .regenerate-btn,
                .download-btn {
                    color: #6366F1;
                    font-weight: 500;
                    padding: $spacing-xs $spacing-md;
                    border-radius: $radius-full;
                    display: inline-flex;
                    align-items: center;
                    gap: $spacing-xs;
                    transition: $transition-base;

                    &:hover {
                        background-color: rgba(99, 102, 241, 0.05);
                        color: #585ADB;
                    }

                    .icon {
                        font-size: 1rem;
                    }
                }
            }
        }

        .resources-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: $spacing-xl;
        }

        .resource-card {
            border-radius: $radius-lg;
            border: 1px solid;
            padding: $spacing-lg;
            transition: $transition-base;
            position: relative;
            overflow: hidden;

            &:hover {
                transform: translateY(-5px);
                box-shadow: $shadow-lg;
            }

            .resource-card-header {
                display: flex;
                align-items: center;
                gap: $spacing-md;
                margin-bottom: $spacing-lg;

                .card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: $radius-md;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;

                    .icon {
                        font-size: 1.5rem;
                    }
                }

                .card-title-group {
                    flex-grow: 1;

                    .card-title {
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: #1E293B;
                        margin: 0 0 $spacing-xs 0;
                    }

                    .difficulty-tag {
                        display: inline-block;
                        padding: 3px 10px;
                        border-radius: $radius-full;
                        font-size: 0.8rem;
                        font-weight: 500;
                    }
                }

                .toggle-details-btn {
                    background: none;
                    border: none;
                    color: #94A3B8;
                    cursor: pointer;
                    padding: $spacing-xs;
                    border-radius: $radius-full;
                    transition: $transition-base;

                    &:hover {
                        background-color: rgba(0, 0, 0, 0.03);
                        color: #6366F1;
                    }

                    .icon {
                        font-size: 1.2rem;
                        transition: $transition-base;
                    }
                }
            }

            .resource-card-content {
                .core-advice {
                    color: #334155;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
            }
        }
    }

    // 详细弹窗样式
    :deep(.plan-detail-dialog) {
        border-radius: $radius-lg;
        overflow: hidden;

        .el-dialog__header {
            padding: 20px 24px 0;
            margin-right: 0;
            border-bottom: none;
            .el-dialog__title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #1E293B;
            }
        }

        .el-dialog__body {
            padding: 24px;
        }

        .plan-detail-content {
            .plan-header {
                display: flex;
                align-items: center;
                gap: $spacing-md;
                padding: $spacing-lg;
                border-radius: $radius-md;
                border: 1px solid;
                margin-bottom: $spacing-xl;
                position: relative;

                .header-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: $radius-md;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;

                    .icon {
                        font-size: 1.8rem;
                    }
                }

                .header-info {
                    flex-grow: 1;

                    h3 {
                        font-size: 1.3rem;
                        font-weight: 700;
                        color: #1E293B;
                        margin: 0 0 $spacing-xs 0;
                    }

                    p {
                        color: #475569;
                        margin: 0;
                        font-size: 0.95rem;
                        line-height: 1.5;
                    }
                }

                .difficulty-badge {
                    position: absolute;
                    top: $spacing-md;
                    right: $spacing-md;
                    padding: 4px 12px;
                    border-radius: $radius-full;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
            }

            .plan-body {
                .plan-section {
                    margin-bottom: $spacing-xl;

                    .section-title {
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: #1E293B;
                        margin: 0 0 $spacing-md 0;
                        display: flex;
                        align-items: center;
                        gap: $spacing-xs;

                        .icon {
                            font-size: 1.2rem;
                        }
                    }
                }

                .plan-row {
                    display: flex;
                    gap: $spacing-xl;
                    margin-bottom: $spacing-xl;

                    .half {
                        flex: 1;
                        margin-bottom: 0;
                    }
                }

                .custom-steps {
                    margin-left: $spacing-sm;
                    .step-desc {
                        font-size: 0.95rem;
                        color: #475569;
                        line-height: 1.5;
                        margin-top: $spacing-xs;
                        margin-bottom: $spacing-md;
                    }
                }

                .tech-stack-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: $spacing-sm;

                    .tech-tag {
                        font-size: 0.9rem;
                        padding: 6px 12px;
                        height: auto;
                        border-width: 1px;
                    }
                }

                .experience-cards {
                    display: flex;
                    flex-direction: column;
                    gap: $spacing-md;

                    .exp-card {
                        background-color: #F8FAFC;
                        border-radius: $radius-md;
                        padding: $spacing-md;
                        border-left: 4px solid #CBD5E1;

                        .exp-title {
                            font-weight: 600;
                            color: #334155;
                            margin-bottom: $spacing-xs;
                            font-size: 0.95rem;
                        }

                        .exp-desc {
                            color: #64748B;
                            font-size: 0.9rem;
                            line-height: 1.5;
                        }
                    }
                }

                .resources-grid-small {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: $spacing-md;

                    .resource-item {
                        display: flex;
                        align-items: center;
                        padding: $spacing-md;
                        border-radius: $radius-md;
                        background-color: #F8FAFC;
                        text-decoration: none;
                        transition: $transition-base;
                        border: 1px solid transparent;

                        &:hover {
                            background-color: white;
                            border-color: #E2E8F0;
                            box-shadow: $shadow-sm;
                            transform: translateY(-2px);
                        }

                        .resource-type-icon {
                            width: 40px;
                            height: 40px;
                            border-radius: $radius-sm;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: $spacing-md;
                            flex-shrink: 0;

                            .icon {
                                font-size: 1.2rem;
                            }
                        }

                        .resource-info {
                            flex-grow: 1;

                            h5 {
                                font-size: 0.95rem;
                                font-weight: 600;
                                color: #1E293B;
                                margin: 0 0 $spacing-xs 0;
                            }

                            .resource-meta {
                                font-size: 0.8rem;
                                color: #64748B;
                                margin: 0;
                            }
                        }
                    }
                }
            }
        }
    }

    // 加载状态
    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: $spacing-xxl 0;
        text-align: center;

        .loading-animation {
            margin-bottom: $spacing-lg;

            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(0, 0, 0, 0.05);
                border-radius: 50%;
                border-top-color: currentColor;
                animation: spin 1s linear infinite;
            }
        }

        p {
            color: #64748B;
            font-size: 1rem;
        }
    }

    // 空状态
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: $spacing-xxl 0;
        text-align: center;

        .empty-illustration {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: rgba(99, 102, 241, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: $spacing-xl;

            .illustration-icon {
                font-size: 2.5rem;
                color: #6366F1;
            }
        }

        h3 {
            font-size: 1.5rem;
            color: #1E293B;
            margin: 0 0 $spacing-sm 0;
        }

        p {
            color: #64748B;
            max-width: 400px;
            margin: 0 0 $spacing-lg 0;
        }

        .generate-now-btn {
            background: linear-gradient(90deg, #6366F1, #8B5CF6);
            border: none;
            color: white;
            padding: 10px $spacing-xl;
            border-radius: $radius-full;
            font-weight: 600;
            transition: $transition-base;
            cursor: pointer;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                background: linear-gradient(90deg, #585ADB, #7C3AED);
            }
        }
    }
}

// 动画
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

// 响应式
@media (max-width: 768px) {
    .smart-recommendation {
        .container {
            padding: 0 $spacing-md;
        }

        .header {
            .main-title {
                font-size: 1.8rem;
            }

            .subtitle {
                font-size: 1rem;
            }
        }

        .input-card {
            .card-inner {
                padding: $spacing-lg;
            }

            .action-buttons {
                flex-direction: column;
                gap: $spacing-sm;

                .reset-btn,
                .generate-btn {
                    width: 100%;
                }
            }
        }

        .results-section {
            .results-header {
                h2 {
                    font-size: 1.3rem;
                }

                .results-actions {
                    align-self: flex-start;
                }
            }

            .resources-grid {
                grid-template-columns: 1fr;
            }
        }
    }
}
</style>
