<template>
  <div class="resume-generator-wrapper">
    <div class="resume-generator-container">
      <!-- 导航标签页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="main-tabs">
        <el-tab-pane label="创建简历" name="create">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>AI智能简历生成器</span>
                <div class="header-actions">
                  <el-button type="info" plain @click="saveToLocal" size="small">
                    <el-icon><Document /></el-icon>
                    保存草稿
                  </el-button>
                  <el-button type="success" plain @click="loadFromLocal" size="small">
                    <el-icon><FolderOpened /></el-icon>
                    加载草稿
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="generator-content">
              <el-form :model="resumeForm" label-width="120px" ref="resumeFormRef">
                <!-- 个人信息 -->
                <el-divider content-position="left">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-divider>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="姓名" prop="name" required>
                      <el-input v-model="resumeForm.name" placeholder="请输入您的姓名"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="性别" prop="gender">
                      <el-select v-model="resumeForm.gender" placeholder="请选择">
                        <el-option label="男" value="男"></el-option>
                        <el-option label="女" value="女"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="年龄" prop="age">
                      <el-input-number v-model="resumeForm.age" :min="16" :max="70" placeholder="请输入年龄"></el-input-number>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone" required>
                      <el-input v-model="resumeForm.phone" placeholder="请输入联系电话"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="电子邮箱" prop="email" required>
                      <el-input v-model="resumeForm.email" placeholder="请输入电子邮箱"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="现居地" prop="currentLocation">
                  <el-input v-model="resumeForm.currentLocation" placeholder="例如: 上海市浦东新区"></el-input>
                </el-form-item>
                
                <!-- 求职意向 -->
                <el-divider content-position="left">
                  <el-icon><Briefcase /></el-icon>
                  求职意向
                </el-divider>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="求职意向" prop="jobIntention" required>
                      <el-input v-model="resumeForm.jobIntention" placeholder="例如: 前端开发工程师"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="期望薪资" prop="expectedSalary">
                      <el-input v-model="resumeForm.expectedSalary" placeholder="例如: 15K-20K/月"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="意向城市" prop="desiredCity">
                      <el-input v-model="resumeForm.desiredCity" placeholder="例如: 上海"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="入职时间" prop="availableTime">
                      <el-input v-model="resumeForm.availableTime" placeholder="例如: 一个月内到岗"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <!-- 教育背景 -->
                <el-divider content-position="left">
                  <el-icon><School /></el-icon>
                  教育背景
                </el-divider>
                <div v-for="(edu, index) in resumeForm.educations" :key="index" class="form-section">
                  <div class="section-header">
                    <span class="section-title">教育经历 {{ index + 1 }}</span>
                    <el-button 
                      type="danger" 
                      plain 
                      size="small"
                      @click="removeEducation(index)"
                      v-if="resumeForm.educations.length > 1"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="学校名称" required>
                        <el-input v-model="edu.school" placeholder="例如: 清华大学"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="就读时间" required>
                        <el-input v-model="edu.period" placeholder="例如: 2018-09 ~ 2022-07"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="学历" required>
                        <el-select v-model="edu.degree" placeholder="请选择学历">
                          <el-option label="高中" value="高中"></el-option>
                          <el-option label="大专" value="大专"></el-option>
                          <el-option label="本科" value="本科"></el-option>
                          <el-option label="硕士" value="硕士"></el-option>
                          <el-option label="博士" value="博士"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="专业" required>
                        <el-input v-model="edu.major" placeholder="例如: 计算机科学与技术"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-form-item label="专业成绩">
                    <el-input v-model="edu.gpa" placeholder="例如: GPA 3.8/4.0 (专业前10%)"></el-input>
                  </el-form-item>
                  
                  <el-form-item label="主修课程">
                    <el-input 
                      type="textarea" 
                      :rows="3" 
                      v-model="edu.courses" 
                      placeholder="例如: 数据结构、算法设计、Web开发等"></el-input>
                  </el-form-item>
                </div>
                
                <el-button type="primary" plain @click="addEducation">
                  <el-icon><Plus /></el-icon>
                  添加教育经历
                </el-button>
                
                <!-- 工作经历 -->
                <el-divider content-position="left">
                  <el-icon><Suitcase /></el-icon>
                  工作经历
                </el-divider>
                <div v-for="(exp, index) in resumeForm.experiences" :key="index" class="form-section">
                  <div class="section-header">
                    <span class="section-title">工作经历 {{ index + 1 }}</span>
                    <el-button 
                      type="danger" 
                      plain 
                      size="small"
                      @click="removeExperience(index)"
                      v-if="resumeForm.experiences.length > 1"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="公司名称" required>
                        <el-input v-model="exp.company" placeholder="例如: 阿里巴巴集团"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="工作时间" required>
                        <el-input v-model="exp.period" placeholder="例如: 2022-07 ~ 至今"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="职位名称" required>
                        <el-input v-model="exp.position" placeholder="例如: 前端开发工程师"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="部门">
                        <el-input v-model="exp.department" placeholder="例如: 技术部"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-form-item label="工作内容">
                    <el-input 
                      type="textarea" 
                      :rows="4" 
                      v-model="exp.responsibilities" 
                      placeholder="描述您的工作职责和内容"></el-input>
                  </el-form-item>
                  
                  <el-form-item label="工作业绩">
                    <el-input 
                      type="textarea" 
                      :rows="3" 
                      v-model="exp.achievements" 
                      placeholder="描述您的主要工作成果和业绩"></el-input>
                  </el-form-item>
                </div>
                
                <el-button type="primary" plain @click="addExperience">
                  <el-icon><Plus /></el-icon>
                  添加工作经历
                </el-button>
                
                <!-- 项目经验 -->
                <el-divider content-position="left">
                  <el-icon><Folder /></el-icon>
                  项目经验
                </el-divider>
                <div v-for="(project, index) in resumeForm.projects" :key="index" class="form-section">
                  <div class="section-header">
                    <span class="section-title">项目经验 {{ index + 1 }}</span>
                    <el-button 
                      type="danger" 
                      plain 
                      size="small"
                      @click="removeProject(index)"
                      v-if="resumeForm.projects.length > 1"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="项目名称">
                        <el-input v-model="project.name" placeholder="例如: 电商平台前端重构项目"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="项目时间">
                        <el-input v-model="project.period" placeholder="例如: 2023-01 ~ 2023-06"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-form-item label="担任角色">
                    <el-input v-model="project.role" placeholder="例如: 前端负责人"></el-input>
                  </el-form-item>
                  
                  <el-form-item label="项目描述">
                    <el-input 
                      type="textarea" 
                      :rows="3" 
                      v-model="project.description" 
                      placeholder="简要描述项目背景和目标"></el-input>
                  </el-form-item>
                  
                  <el-form-item label="项目职责">
                    <el-input 
                      type="textarea" 
                      :rows="3" 
                      v-model="project.responsibilities" 
                      placeholder="描述您在项目中的具体职责"></el-input>
                  </el-form-item>
                  
                  <el-form-item label="项目成果">
                    <el-input 
                      type="textarea" 
                      :rows="2" 
                      v-model="project.achievements" 
                      placeholder="描述项目取得的成果"></el-input>
                  </el-form-item>
                </div>
                
                <el-button type="primary" plain @click="addProject">
                  <el-icon><Plus /></el-icon>
                  添加项目经验
                </el-button>
                
                <!-- 技能专长 -->
                <el-divider content-position="left">
                  <el-icon><Star /></el-icon>
                  技能专长
                </el-divider>
                <el-form-item label="专业技能">
                  <el-input 
                    type="textarea" 
                    :rows="3" 
                    v-model="resumeForm.skills" 
                    placeholder="例如: 熟练掌握Vue.js、React、JavaScript、TypeScript等前端技术栈"></el-input>
                </el-form-item>
                
                <el-form-item label="语言能力">
                  <el-input 
                    type="textarea" 
                    :rows="2" 
                    v-model="resumeForm.languages" 
                    placeholder="例如: 英语CET-6，能流利进行技术文档阅读和国际会议交流"></el-input>
                </el-form-item>
                
                <el-form-item label="其他技能">
                  <el-input 
                    type="textarea" 
                    :rows="2" 
                    v-model="resumeForm.otherSkills" 
                    placeholder="例如: 持有C1驾驶证，熟练使用各类设计软件"></el-input>
                </el-form-item>
                
                <!-- 荣誉证书 -->
                <el-divider content-position="left">
                  <el-icon><Trophy /></el-icon>
                  荣誉证书
                </el-divider>
                <el-form-item label="证书">
                  <el-input 
                    type="textarea" 
                    :rows="3" 
                    v-model="resumeForm.certificates" 
                    placeholder="例如: 软件设计师证书、前端开发认证等"></el-input>
                </el-form-item>
                
                <el-form-item label="获奖情况">
                  <el-input 
                    type="textarea" 
                    :rows="2" 
                    v-model="resumeForm.awards" 
                    placeholder="例如: 2023年获得公司年度优秀员工奖、技术创新奖"></el-input>
                </el-form-item>
                
                <!-- 自我评价 -->
                <el-divider content-position="left">
                  <el-icon><ChatDotRound /></el-icon>
                  自我评价
                </el-divider>
                <el-form-item label="自我描述">
                  <el-input 
                    type="textarea" 
                    :rows="4" 
                    v-model="resumeForm.selfEvaluation" 
                    placeholder="描述您的个人特点、优势和职业目标"></el-input>
                </el-form-item>
                
                <!-- 兴趣爱好 -->
                <el-divider content-position="left">
                  <el-icon><Basketball /></el-icon>
                  兴趣爱好
                </el-divider>
                <el-form-item label="兴趣爱好">
                  <el-input 
                    type="textarea" 
                    :rows="2" 
                    v-model="resumeForm.hobbies" 
                    placeholder="例如: 编程、阅读技术博客、参与开源项目、摄影等"></el-input>
                </el-form-item>
                
                <!-- 操作按钮 -->
                <el-form-item class="action-buttons">
                  <el-button 
                    type="primary" 
                    size="large"
                    @click="generateResumeWithAI" 
                    :loading="generating"
                    :disabled="!isFormValid"
                  >
                    <el-icon><MagicStick /></el-icon>
                    {{ generating ? 'AI正在生成中...' : 'AI智能生成简历' }}
                  </el-button>
                  
                  <!-- 修改：保存简历按钮 - 只有AI生成成功后才能点击 -->
                  <el-button 
                    type="warning" 
                    size="large"
                    @click="saveResumeToBackend" 
                    :loading="saving"
                    :disabled="!isAIGenerated"
                  >
                    <el-icon><Upload /></el-icon>
                    {{ saving ? '正在保存中...' : (isAIGenerated ? '保存简历' : '请先AI生成简历') }}
                  </el-button>
                  
                  <el-button size="large" @click="resetForm">
                    <el-icon><RefreshRight /></el-icon>
                    重置表单
                  </el-button>
                  <el-button 
                    type="success" 
                    size="large"
                    @click="exportToPDF" 
                    :disabled="!isAIGenerated"
                  >
                    <el-icon><Download /></el-icon>
                    导出PDF
                  </el-button>
                </el-form-item>
              </el-form>
              
              <!-- AI生成状态提示 -->
              <el-alert
                v-if="isAIGenerated"
                title="AI简历生成成功！"
                description="您的简历已经过AI优化，所有字段已自动填充优化后的内容。您可以继续编辑或直接导出PDF。"
                type="success"
                :closable="false"
                show-icon
                class="ai-success-alert"
              />
              
              <!-- 简历预览 -->
              <div class="resume-preview" v-if="isAIGenerated" id="resume-preview">
                <el-divider content-position="center">
                  <el-icon><View /></el-icon>
                  简历预览
                </el-divider>
                <div class="preview-content">
                  <div class="resume-template">
                    <!-- 头部信息 -->
                    <div class="resume-header">
                      <h1 class="name">{{ resumeForm.name }}</h1>
                      <div class="basic-info">
                        <span v-if="resumeForm.gender || resumeForm.age">
                          {{ [resumeForm.gender, resumeForm.age ? `${resumeForm.age}岁` : ''].filter(Boolean).join(' | ') }}
                        </span>
                      </div>
                      <div class="contact-info">
                        <span>{{ resumeForm.phone }}</span>
                        <span class="separator">|</span>
                        <span>{{ resumeForm.email }}</span>
                        <span v-if="resumeForm.currentLocation" class="separator">|</span>
                        <span v-if="resumeForm.currentLocation">{{ resumeForm.currentLocation }}</span>
                      </div>
                    </div>
                    
                    <!-- 求职意向 -->
                    <div class="resume-section">
                      <h2 class="section-title">求职意向</h2>
                      <div class="section-content">
                        <p><strong>求职意向：</strong>{{ resumeForm.jobIntention }}</p>
                        <p v-if="resumeForm.expectedSalary"><strong>期望薪资：</strong>{{ resumeForm.expectedSalary }}</p>
                        <p v-if="resumeForm.desiredCity"><strong>意向城市：</strong>{{ resumeForm.desiredCity }}</p>
                        <p v-if="resumeForm.availableTime"><strong>入职时间：</strong>{{ resumeForm.availableTime }}</p>
                      </div>
                    </div>
                    
                    <!-- 教育背景 -->
                    <div class="resume-section">
                      <h2 class="section-title">教育背景</h2>
                      <div class="section-content">
                        <div v-for="(edu, index) in resumeForm.educations" :key="index" class="item">
                          <p class="period">{{ edu.period }}</p>
                          <p class="title">{{ edu.school }} | {{ edu.degree }} | {{ edu.major }}</p>
                          <p v-if="edu.gpa"><strong>专业成绩：</strong>{{ edu.gpa }}</p>
                          <p v-if="edu.courses"><strong>主修课程：</strong>{{ edu.courses }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 工作经历 -->
                    <div class="resume-section">
                      <h2 class="section-title">工作经历</h2>
                      <div class="section-content">
                        <div v-for="(exp, index) in resumeForm.experiences" :key="index" class="item">
                          <p class="period">{{ exp.period }}</p>
                          <p class="title">{{ exp.company }} | {{ exp.position }} <span v-if="exp.department">| {{ exp.department }}</span></p>
                          <div v-if="exp.responsibilities">
                            <p class="subtitle">工作内容：</p>
                            <p class="content">{{ exp.responsibilities }}</p>
                          </div>
                          <div v-if="exp.achievements">
                            <p class="subtitle">工作业绩：</p>
                            <p class="content">{{ exp.achievements }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 项目经验 -->
                    <div v-if="resumeForm.projects.some(p => p.name)" class="resume-section">
                      <h2 class="section-title">项目经验</h2>
                      <div class="section-content">
                        <div v-for="(project, index) in resumeForm.projects.filter(p => p.name)" :key="index" class="item">
                          <p class="period">{{ project.period }}</p>
                          <p class="title">{{ project.name }} <span v-if="project.role">| {{ project.role }}</span></p>
                          <p v-if="project.description"><strong>项目描述：</strong>{{ project.description }}</p>
                          <div v-if="project.responsibilities">
                            <p class="subtitle">项目职责：</p>
                            <p class="content">{{ project.responsibilities }}</p>
                          </div>
                          <div v-if="project.achievements">
                            <p class="subtitle">项目成果：</p>
                            <p class="content">{{ project.achievements }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 技能专长 -->
                    <div v-if="resumeForm.skills || resumeForm.languages || resumeForm.otherSkills" class="resume-section">
                      <h2 class="section-title">技能专长</h2>
                      <div class="section-content">
                        <p v-if="resumeForm.skills"><strong>专业技能：</strong>{{ resumeForm.skills }}</p>
                        <p v-if="resumeForm.languages"><strong>语言能力：</strong>{{ resumeForm.languages }}</p>
                        <p v-if="resumeForm.otherSkills"><strong>其他技能：</strong>{{ resumeForm.otherSkills }}</p>
                      </div>
                    </div>
                    
                    <!-- 荣誉证书 -->
                    <div v-if="resumeForm.certificates || resumeForm.awards" class="resume-section">
                      <h2 class="section-title">荣誉证书</h2>
                      <div class="section-content">
                        <p v-if="resumeForm.certificates"><strong>证书：</strong>{{ resumeForm.certificates }}</p>
                        <p v-if="resumeForm.awards"><strong>获奖情况：</strong>{{ resumeForm.awards }}</p>
                      </div>
                    </div>
                    
                    <!-- 自我评价 -->
                    <div v-if="resumeForm.selfEvaluation" class="resume-section">
                      <h2 class="section-title">自我评价</h2>
                      <div class="section-content">
                        <p class="content">{{ resumeForm.selfEvaluation }}</p>
                      </div>
                    </div>
                    
                    <!-- 兴趣爱好 -->
                    <div v-if="resumeForm.hobbies" class="resume-section">
                      <h2 class="section-title">兴趣爱好</h2>
                      <div class="section-content">
                        <p class="content">{{ resumeForm.hobbies }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="历史简历" name="history">
          <ResumeHistoryView 
            @create-resume="handleCreateResume"
            @edit-resume="handleEditResume"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useResumeStore } from '@/stores/resume'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import {
  User, Briefcase, School, Suitcase, Folder, Star, Trophy, 
  ChatDotRound, Basketball, MagicStick, RefreshRight, Download,
  View, Plus, Delete, Document, FolderOpened, Upload
} from '@element-plus/icons-vue'
import ResumeHistoryView from '@/components/resume/ResumeHistoryView.vue'

// 当前激活的标签页
const activeTab = ref('create')

// 使用 Pinia store
const resumeStore = useResumeStore()
const {
  resumeForm,
  isAIGenerated,
  generating,
  saving,
  isFormValid
} = storeToRefs(resumeStore)

const {
  generateResumeWithAI,
  saveResumeToBackend,
  addEducation,
  removeEducation,
  addExperience,
  removeExperience,
  addProject,
  removeProject,
  resetForm,
  saveToLocalStorage,
  loadFromLocalStorage
} = resumeStore

// 标签页切换处理
const handleTabChange = (tabName) => {
  console.log('切换到标签页:', tabName)
}

// 创建简历处理
const handleCreateResume = () => {
  activeTab.value = 'create'
  resetForm()
}

// 编辑简历处理
const handleEditResume = (resumeData) => {
  console.log('编辑简历:', resumeData)
  activeTab.value = 'create'
  
  // 根据简历数据填充表单
  if (resumeData.personal_info) {
    resumeForm.value.name = resumeData.personal_info.name || resumeData.name || ''
    resumeForm.value.gender = resumeData.personal_info.gender || ''
    resumeForm.value.age = resumeData.personal_info.age || resumeData.age || null
    resumeForm.value.phone = resumeData.personal_info.phone || ''
    resumeForm.value.email = resumeData.personal_info.email || ''
    resumeForm.value.currentLocation = resumeData.personal_info.current_location || resumeData.currentLocation || ''
  }
  
  if (resumeData.job_intention) {
    resumeForm.value.jobIntention = resumeData.job_intention.position || resumeData.jobPosition || ''
    resumeForm.value.expectedSalary = resumeData.job_intention.expected_salary || ''
    resumeForm.value.desiredCity = resumeData.job_intention.desired_city || ''
    resumeForm.value.availableTime = resumeData.job_intention.available_time || ''
  }
  
  // 填充其他字段...
  ElMessage.success('简历数据已加载到编辑器')
}

// 保存到本地
const saveToLocal = () => {
  saveToLocalStorage()
}

// 从本地加载
const loadFromLocal = () => {
  loadFromLocalStorage()
}

// 导出PDF
const exportToPDF = async () => {
  if (!isAIGenerated.value) {
    ElMessage.warning('请先生成简历')
    return
  }
  
  try {
    ElMessage.info('正在生成PDF，请稍候...')
    
    const element = document.getElementById('resume-preview')
    if (!element) {
      ElMessage.error('未找到简历预览内容')
      return
    }
    
    const tempContainer = document.createElement('div')
    tempContainer.style.width = '210mm'
    tempContainer.style.padding = '20px'
    tempContainer.style.boxSizing = 'border-box'
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.fontFamily = 'Microsoft YaHei, PingFang SC, sans-serif'
    
    const resumeContent = element.querySelector('.resume-template')
    if (resumeContent) {
      tempContainer.appendChild(resumeContent.cloneNode(true))
    }
    
    document.body.appendChild(tempContainer)
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    document.body.removeChild(tempContainer)
    
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const pageHeight = 297
    let heightLeft = imgHeight
    let position = 0
    
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    const fileName = `${resumeForm.value.name || '简历'}_${new Date().toLocaleDateString()}.pdf`
    pdf.save(fileName)
    
    ElMessage.success('PDF导出成功！')
  } catch (error) {
    console.error('导出PDF失败:', error)
    ElMessage.error('导出PDF失败，请重试')
  }
}
</script>

<style scoped>
.resume-generator-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.resume-generator-container {
  max-width: 1200px;
  margin: 0 auto;
}

.main-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.main-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.main-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

.main-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  height: 50px;
  line-height: 50px;
}

.main-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.box-card {
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.generator-content {
  padding: 20px;
}

.el-divider {
  margin: 30px 0 20px;
}

.el-divider .el-divider__text {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.action-buttons {
  text-align: center;
  margin-top: 40px;
}

.action-buttons .el-button {
  margin: 0 10px;
  padding: 12px 24px;
  font-size: 16px;
}

.ai-success-alert {
  margin: 20px 0;
}

.resume-preview {
  margin-top: 40px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.preview-content {
  padding: 0;
}

.resume-template {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  color: #333;
  line-height: 1.6;
  background: white;
}

.resume-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #409eff;
}

.name {
  font-size: 28px;
  margin: 0 0 10px;
  font-weight: bold;
  color: #2c3e50;
}

.basic-info {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.contact-info {
  margin-top: 15px;
  font-size: 14px;
  color: #555;
}

.separator {
  margin: 0 12px;
  color: #ccc;
}

.resume-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.section-content {
  margin-left: 10px;
}

.item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.period {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px;
  font-weight: 500;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px;
}

.subtitle {
  font-weight: 600;
  color: #495057;
  margin: 8px 0 5px;
  font-size: 14px;
}

.content {
  margin: 5px 0;
  text-indent: 0;
  color: #555;
  line-height: 1.7;
}

.section-content > p {
  margin: 8px 0;
  line-height: 1.7;
}

.section-content > p strong {
  color: #495057;
  font-weight: 600;
}

@media (max-width: 768px) {
  .resume-generator-wrapper {
    padding: 10px;
  }
  
  .generator-content {
    padding: 15px;
  }
  
  .resume-template {
    padding: 20px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .action-buttons .el-button {
    margin: 5px;
    width: 100%;
  }
}

@media print {
  .resume-generator-wrapper,
  .resume-generator-container,
  .box-card {
    box-shadow: none;
    background: white;
  }
  
  .resume-template {
    padding: 0;
    max-width: none;
  }
}
</style>
