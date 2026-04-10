<template>
  <!-- 紧凑的横向提示条 -->
  <div class="resume-banner">
    <div class="banner-content">
      <!-- 选择简历后显示基本信息 -->
      <div v-if="!hasSelectedResume" class="banner-text">
        <FileTextIcon class="text-icon" />
        <span class="prompt-text">使用已保存的简历信息，快速开始面试准备</span>
      </div>
      
      <!-- 已选择简历时显示基本信息 -->
      <div v-else class="selected-resume-info">
        <div class="info-header">
          <FileTextIcon class="text-icon" />
          <span class="info-title">已选择简历</span>
        </div>
        <div class="info-details">
          <div class="info-row">
            <UserIcon class="detail-icon" />
            <span class="detail-label">姓名：</span>
            <span class="detail-value">{{ selectedResumeInfo.name }}</span>
          </div>
          <div class="info-row">
            <BriefcaseIcon class="detail-icon" />
            <span class="detail-label">岗位：</span>
            <span class="detail-value">{{ selectedResumeInfo.position }}</span>
          </div>
          <div class="info-row">
            <MapPinIcon class="detail-icon" />
            <span class="detail-label">地点：</span>
            <span class="detail-value">{{ selectedResumeInfo.location }}</span>
          </div>
        </div>
      </div>
      
      <!-- ========== 核心修改：按钮组（简历+题库） ========== -->
      <div class="button-group">
        <!-- 简历选择按钮 -->
        <button @click="openModal" class="select-button resume-btn">
          <FileTextIcon class="button-icon" />
          <span>{{ hasSelectedResume ? '更换简历' : '选择简历' }}</span>
        </button>
        
        <!-- 题库选择按钮 -->
        <button @click="openBankModal" class="select-button bank-btn">
          <FolderIcon class="button-icon" />
          <span>{{ hasSelectedBank ? `更换题库` : '选择题库' }}</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 简历模态窗口 -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <!-- 原有简历模态窗口内容（保持不变） -->
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <FileTextIcon class="modal-icon" />
              <h2 class="modal-title">选择简历</h2>
            </div>
            <button @click="closeModal" class="modal-close-btn">
              <XIcon class="close-icon" />
            </button>
          </div>

          <div class="modal-body">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <span>加载简历列表中...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!hasResumes" class="empty-state">
              <FileTextIcon class="empty-icon" />
              <p>暂无保存的简历</p>
              <button @click="handleCreateResume" class="create-resume-btn">
                <PlusIcon class="btn-icon" />
                创建简历
              </button>
            </div>

            <!-- 简历列表 -->
            <div v-else-if="!tempSelectedResume" class="resume-grid">
              <div 
                v-for="resume in resumeList" 
                :key="resume.originalPersonalId"
                class="resume-card"
                @click="selectResumeForPreview(resume)"
              >
                <div class="resume-card-header">
                  <div class="resume-avatar">
                    <UserIcon class="avatar-icon" />
                  </div>
                  <div class="resume-info">
                    <h3 class="resume-name">{{ resume.name }}</h3>
                    <p class="resume-position">{{ resume.jobPosition }}</p>
                  </div>
                </div>
                <div class="resume-card-body">
                  <div class="resume-meta-item">
                    <MapPinIcon class="meta-icon" />
                    <span>{{ resume.currentLocation || '未填写' }}</span>
                  </div>
                  <div class="resume-meta-item">
                    <ClockIcon class="meta-icon" />
                    <span>{{ formatTime(resume.updateTime) }}</span>
                  </div>
                </div>
                <div class="resume-card-footer">
                  <button class="select-btn">
                    选择此简历
                    <ArrowRightIcon class="btn-icon" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 简历详情预览 - 显示所有信息 -->
            <div v-else class="resume-preview">
              <div class="preview-header">
                <button @click="backToList" class="back-btn">
                  <ArrowLeftIcon class="btn-icon" />
                  返回列表
                </button>
                <h3 class="preview-title">简历详情</h3>
              </div>

              <div class="preview-content">
                <!-- 个人信息 -->
                <div class="info-section">
                  <h4 class="section-title">
                    <UserIcon class="section-icon" />
                    个人信息
                  </h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>姓名：</label>
                      <span>{{ tempSelectedResume.personal_info?.name || tempSelectedResume.name }}</span>
                    </div>
                    <div class="info-item">
                      <label>性别：</label>
                      <span>{{ tempSelectedResume.personal_info?.gender || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                      <label>年龄：</label>
                      <span>{{ tempSelectedResume.personal_info?.age || tempSelectedResume.age || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                      <label>电话：</label>
                      <span>{{ tempSelectedResume.personal_info?.phone || tempSelectedResume.phone || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                      <label>邮箱：</label>
                      <span>{{ tempSelectedResume.personal_info?.email || tempSelectedResume.email || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                      <label>所在地：</label>
                      <span>{{ tempSelectedResume.personal_info?.current_location || tempSelectedResume.currentLocation || '未填写' }}</span>
                    </div>
                  </div>
                </div>

                <!-- 求职意向 -->
                <div class="info-section">
                  <h4 class="section-title">
                    <BriefcaseIcon class="section-icon" />
                    求职意向
                  </h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>目标岗位：</label>
                      <span>{{ tempSelectedResume.job_intention?.position || tempSelectedResume.jobPosition || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                      <label>期望薪资：</label>
                      <span>{{ tempSelectedResume.job_intention?.expected_salary || tempSelectedResume.expectedSalary || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                      <label>意向城市：</label>
                      <span>{{ tempSelectedResume.job_intention?.desired_city || tempSelectedResume.desiredCity || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                      <label>入职时间：</label>
                      <span>{{ tempSelectedResume.job_intention?.available_time || tempSelectedResume.availableTime || '未填写' }}</span>
                    </div>
                  </div>
                </div>

                <!-- 教育背景 -->
                <div v-if="tempSelectedResume.educations && tempSelectedResume.educations.length > 0" class="info-section">
                  <h4 class="section-title">
                    <GraduationCapIcon class="section-icon" />
                    教育背景
                  </h4>
                  <div class="timeline-list">
                    <div v-for="(edu, index) in tempSelectedResume.educations" :key="index" class="timeline-item">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <strong>{{ edu.school }}</strong>
                          <span class="timeline-date">{{ edu.period }}</span>
                        </div>
                        <p>{{ edu.degree }} · {{ edu.major }}</p>
                        <p v-if="edu.gpa">专业成绩：{{ edu.gpa }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 工作经历 -->
                <div v-if="tempSelectedResume.experiences && tempSelectedResume.experiences.length > 0" class="info-section">
                  <h4 class="section-title">
                    <BriefcaseIcon class="section-icon" />
                    工作经历
                  </h4>
                  <div class="timeline-list">
                    <div v-for="(exp, index) in tempSelectedResume.experiences" :key="index" class="timeline-item">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <strong>{{ exp.company }} - {{ exp.position }}</strong>
                          <span class="timeline-date">{{ exp.period }}</span>
                        </div>
                        <p v-if="exp.responsibilities">{{ exp.responsibilities }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 项目经验 -->
                <div v-if="tempSelectedResume.projects && tempSelectedResume.projects.length > 0" class="info-section">
                  <h4 class="section-title">
                    <FolderIcon class="section-icon" />
                    项目经验
                  </h4>
                  <div class="timeline-list">
                    <div v-for="(project, index) in tempSelectedResume.projects" :key="index" class="timeline-item">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <strong>{{ project.name }}</strong>
                          <span class="timeline-date">{{ project.period }}</span>
                        </div>
                        <p v-if="project.role">担任角色：{{ project.role }}</p>
                        <p v-if="project.description">{{ project.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 技能专长 -->
                <div v-if="tempSelectedResume.skills" class="info-section">
                  <h4 class="section-title">
                    <StarIcon class="section-icon" />
                    技能专长
                  </h4>
                  <div class="skills-content">
                    <p v-if="tempSelectedResume.skills.professional_skills">
                      <strong>专业技能：</strong>{{ tempSelectedResume.skills.professional_skills }}
                    </p>
                    <p v-if="tempSelectedResume.skills.languages">
                      <strong>语言能力：</strong>{{ tempSelectedResume.skills.languages }}
                    </p>
                  </div>
                </div>

                <!-- 荣誉证书 -->
                <div v-if="tempSelectedResume.honors" class="info-section">
                  <h4 class="section-title">
                    <AwardIcon class="section-icon" />
                    荣誉证书
                  </h4>
                  <div class="skills-content">
                    <p v-if="tempSelectedResume.honors.certificates">
                      <strong>证书：</strong>{{ tempSelectedResume.honors.certificates }}
                    </p>
                    <p v-if="tempSelectedResume.honors.awards">
                      <strong>获奖情况：</strong>{{ tempSelectedResume.honors.awards }}
                    </p>
                  </div>
                </div>

                <!-- 自我评价 -->
                <div v-if="tempSelectedResume.self_evaluation" class="info-section">
                  <h4 class="section-title">
                    <MessageSquareIcon class="section-icon" />
                    自我评价
                  </h4>
                  <p class="text-content">{{ tempSelectedResume.self_evaluation }}</p>
                </div>

                <!-- 兴趣爱好 -->
                <div v-if="tempSelectedResume.hobbies" class="info-section">
                  <h4 class="section-title">
                    <HeartIcon class="section-icon" />
                    兴趣爱好
                  </h4>
                  <p class="text-content">{{ tempSelectedResume.hobbies }}</p>
                </div>
              </div>

              <!-- 确认/取消按钮 -->
              <div class="preview-actions">
                <button @click="cancelSelection" class="cancel-btn">
                  <XIcon class="btn-icon" />
                  取消
                </button>
                <button @click="confirmSelection" class="confirm-btn">
                  <CheckIcon class="btn-icon" />
                  确定使用此简历
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ========== 新增：题库选择模态窗口 ========== -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isBankModalOpen" class="modal-overlay" @click="closeBankModal">
        <div class="modal-container" @click.stop>
          <!-- 题库模态窗口头部 -->
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <FolderIcon class="modal-icon" />
              <h2 class="modal-title">选择面试题库</h2>
            </div>
            <button @click="closeBankModal" class="modal-close-btn">
              <XIcon class="close-icon" />
            </button>
          </div>

          <!-- 题库模态窗口内容 -->
          <div class="modal-body">
            <!-- 模块筛选 -->
           <!-- 题库模块筛选下拉框 -->
            <div class="module-filter" style="margin-bottom: 20px;">
              <!-- 强制用原始数据渲染，避开Proxy代理的渲染问题 -->
              <el-select v-model="selectedModuleId" placeholder="选择题库模块" style="width: 200px;" class="module-select"
                :options="Array.from(questionBankStore.moduleList).map(item => ({
                  label: item.title,
                  value: item.id
                }))">
              </el-select>
            </div>

            <!-- 加载状态 -->
            <div v-if="questionBankStore.loading" class="loading-state">
              <div class="loading-spinner"></div>
              <span>加载题库列表中...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="filteredFiles.length === 0" class="empty-state">
              <FolderIcon class="empty-icon" />
              <p>暂无可用题库文件，请先上传</p>
            </div>

            <!-- 题库文件列表 -->
            <div v-else class="resume-grid">
              <div 
                v-for="file in filteredFiles"
                :key="file.id"
                class="resume-card"
                @click="selectBankFileForPreview(file)"
              >
                <div class="resume-card-header">
                  <div class="resume-avatar">
                    <FolderIcon class="avatar-icon" />
                  </div>
                  <div class="resume-info">
                    <h3 class="resume-name">{{ file.name }}</h3>
                    <p class="resume-position">{{ getModuleTitle(file.moduleId) }}</p>
                  </div>
                </div>
                <div class="resume-card-body">
                  <div class="resume-meta-item">
                    <ClockIcon class="meta-icon" />
                    <span>{{ file.updateTime || '未填写' }}</span>
                  </div>
                  <div class="resume-meta-item">
                    <FileTextIcon class="meta-icon" />
                    <span>{{ file.size || '未知大小' }}</span>
                  </div>
                </div>
                <div class="resume-card-footer">
                  <button class="select-btn">
                    选择此题库
                    <ArrowRightIcon class="btn-icon" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 题库详情预览 -->
            <div v-if="tempSelectedBankFile" class="resume-preview">
              <div class="preview-header">
                <button @click="backToBankList" class="back-btn">
                  <ArrowLeftIcon class="btn-icon" />
                  返回列表
                </button>
                <h3 class="preview-title">题库详情</h3>
              </div>

              <div class="preview-content">
                <div class="info-section">
                  <h4 class="section-title">
                    <FolderIcon class="section-icon" />
                    题库信息
                  </h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>题库名称：</label>
                      <span>{{ tempSelectedBankFile.name }}</span>
                    </div>
                    <div class="info-item">
                      <label>所属模块：</label>
                      <span>{{ getModuleTitle(tempSelectedBankFile.moduleId) }}</span>
                    </div>
                    <div class="info-item">
                      <label>文件大小：</label>
                      <span>{{ tempSelectedBankFile.size || '未知' }}</span>
                    </div>
                    <div class="info-item">
                      <label>更新时间：</label>
                      <span>{{ tempSelectedBankFile.updateTime || '未知' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 确认/取消按钮 -->
              <div class="preview-actions">
                <button @click="cancelBankSelection" class="cancel-btn">
                  <XIcon class="btn-icon" />
                  取消
                </button>
                <button @click="confirmBankSelection" class="confirm-btn">
                  <CheckIcon class="btn-icon" />
                  确定使用此题库
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed  } from 'vue';
import { 
  FileTextIcon, UserIcon, ClockIcon, MapPinIcon, 
  PlusIcon, XIcon, ArrowRightIcon, ArrowLeftIcon,
  CheckIcon, BriefcaseIcon, GraduationCapIcon,
  FolderIcon, StarIcon, AwardIcon, MessageSquareIcon,
  HeartIcon
} from 'lucide-vue-next';
import { useResumeHistoryStore } from '../../../stores/resumeHistory';
import { interviewStore } from '../../../stores/interview';
import { questionBankStore } from '@/stores/questionBank'; // 引入题库store
import { storeToRefs } from 'pinia';

const emit = defineEmits(['create-resume']);

// ========== 简历相关逻辑（原有） ==========
const resumeHistoryStore = useResumeHistoryStore();
const { resumeList, loading } = storeToRefs(resumeHistoryStore);
const { fetchResumeList, fetchResumeDetail } = resumeHistoryStore;

const isModalOpen = ref(false);
const tempSelectedResume = ref(null);
const tempSelectedResumeId = ref(null);

const hasResumes = computed(() => resumeList.value && resumeList.value.length > 0);
const hasSelectedResume = computed(() => !!interviewStore.selectedResume);

const selectedResumeInfo = computed(() => {
  if (!interviewStore.selectedResume) return null;
  const resume = interviewStore.selectedResume;
  return {
    name: resume.personal_info?.name || resume.name || '未知',
    position: resume.job_intention?.position || resume.jobPosition || '未填写',
    location: resume.personal_info?.current_location || resume.currentLocation || '未填写'
  };
});

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const openModal = async () => {
  isModalOpen.value = true;
  await fetchResumeList('admin', 1, 20);
};

const closeModal = () => {
  isModalOpen.value = false;
  tempSelectedResume.value = null;
  tempSelectedResumeId.value = null;
};

const selectResumeForPreview = async (resume) => {
  tempSelectedResumeId.value = resume.originalPersonalId;
  const detail = await fetchResumeDetail(resume.originalPersonalId);
  
  if (detail) {
    tempSelectedResume.value = {
      personalId: detail.personalId,
      originalPersonalId: resume.originalPersonalId,
      name: detail.name,
      jobPosition: detail.jobPosition,
      currentLocation: detail.currentLocation,
      age: detail.age,
      phone: detail.phone,
      email: detail.email,
      updateTime: detail.updateTime,
      personal_info: detail.personal_info || {
        name: detail.name,
        gender: detail.gender,
        age: detail.age,
        phone: detail.phone,
        email: detail.email,
        current_location: detail.currentLocation
      },
      job_intention: detail.job_intention || {
        position: detail.jobPosition,
        expected_salary: detail.expectedSalary,
        desired_city: detail.desiredCity,
        available_time: detail.availableTime
      },
      educations: detail.educations || [],
      experiences: detail.experiences || [],
      projects: detail.projects || [],
      skills: detail.skills || {},
      honors: detail.honors || {},
      self_evaluation: detail.self_evaluation || '',
      hobbies: detail.hobbies || ''
    };
  }
};

const backToList = () => {
  tempSelectedResume.value = null;
  tempSelectedResumeId.value = null;
};

const confirmSelection = () => {
  if (tempSelectedResume.value) {
    interviewStore.selectedResume = tempSelectedResume.value;
    interviewStore.isUsingResume = true;
    
    const targetPosition = tempSelectedResume.value.job_intention?.position || tempSelectedResume.value.jobPosition;
    if (targetPosition) {
      interviewStore.selectedTargetPosition = targetPosition;
    }
    
    console.log('[v0] Resume selected:', tempSelectedResume.value);
    closeModal();
  }
};

const cancelSelection = () => {
  backToList();
};

const handleCreateResume = () => {
  closeModal();
  emit('create-resume');
};

// ========== 新增：题库相关逻辑 ==========
const isBankModalOpen = ref(false);
const selectedModuleId = ref(null);
const tempSelectedBankFile = ref(null);

// 是否已选择题库
const hasSelectedBank = computed(() => !!interviewStore.selectedBankFile);

// 过滤后的题库文件列表
const filteredFiles = computed(() => {
  if (!selectedModuleId.value) {
    return questionBankStore.getAllBankFiles() || [];
  }
  return questionBankStore.getFilesByModuleId(selectedModuleId.value) || [];
});

// 打开题库弹窗
const openBankModal = async () => {
  isBankModalOpen.value = true;
  await questionBankStore.fetchAllModules(); // 加载题库列表
};

// 关闭题库弹窗
const closeBankModal = () => {
  isBankModalOpen.value = false;
  tempSelectedBankFile.value = null;
  selectedModuleId.value = null;
};

// 获取模块名称
const getModuleTitle = (moduleId) => {
  const module = questionBankStore.moduleList.find(m => m.id === moduleId);
  return module ? module.title : '未知模块';
};

// 选择题库文件预览
const selectBankFileForPreview = (file) => {
  tempSelectedBankFile.value = file;
};

// 返回题库列表
const backToBankList = () => {
  tempSelectedBankFile.value = null;
};

// 确认选择题库
const confirmBankSelection = () => {
  if (tempSelectedBankFile.value) {
    // 获取选中的模块
    const selectedModule = questionBankStore.moduleList.find(
      m => m.id === tempSelectedBankFile.value.moduleId
    );
    // 保存到interviewStore
    interviewStore.setSelectedBank(tempSelectedBankFile.value, selectedModule);
    console.log('题库已选择：', tempSelectedBankFile.value);
    closeBankModal();
  }
};

// 取消选择题库
const cancelBankSelection = () => {
  backToBankList();
};
</script>

<style scoped>
/* 原有样式保持不变，仅新增以下样式 */

/* ========== 新增：按钮组样式 ========== */
.button-group {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* 题库按钮样式（和简历按钮视觉统一） */
.bank-btn {
  background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.bank-btn:hover {
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

/* ========== 新增：题库筛选下拉框样式 ========== */
.module-select {
  border: 2px solid #e0e7ff;
  border-radius: 8px;
  font-size: 14px;
}

/* 原有样式（完整保留） */
.resume-banner {
  width: 100%;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  padding: 16px 24px;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.banner-text {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.text-icon {
  width: 20px;
  height: 20px;
  color: #667eea;
  flex-shrink: 0;
}

.prompt-text {
  font-size: 15px;
  color: #4a5568;
  font-weight: 500;
}

.selected-resume-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}

.info-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: #667eea;
  flex-shrink: 0;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #2c3e50;
  font-weight: 600;
}

.select-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.select-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.button-icon {
  width: 18px;
  height: 18px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 28px;
  height: 28px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  width: 80px;
  height: 80px;
  opacity: 0.3;
}

.create-resume-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-resume-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.resume-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resume-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.resume-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.resume-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.resume-info {
  flex: 1;
  min-width: 0;
}

.resume-name {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resume-position {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resume-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.resume-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.meta-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.resume-card-footer {
  display: flex;
  justify-content: flex-end;
}

.select-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-btn:hover {
  transform: translateX(4px);
}

.resume-preview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.preview-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px;
}

.section-icon {
  width: 22px;
  height: 22px;
  color: #667eea;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-item label {
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.info-item span {
  color: #2c3e50;
  word-break: break-word;
}

.preview-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 2px solid #e9ecef;
}

.cancel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #666;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #f8f9fa;
  border-color: #d0d5dd;
}

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  position: relative;
  padding-left: 28px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 6px;
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 16px;
  bottom: -20px;
  width: 2px;
  background: #e0e7ff;
}

.timeline-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  border-left: 3px solid #667eea;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.timeline-date {
  font-size: 13px;
  color: #666;
  background: white;
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px solid #e0e7ff;
}

.timeline-content p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.skills-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skills-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.text-content {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #666;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}
</style>