<template>
  <div class="resume-detail-wrapper">
    <div class="resume-detail-container">
      <!-- 头部信息 -->
      <div class="resume-header">
        <div class="header-avatar">
          <el-avatar :size="80" :src="resumeData.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>
        <div class="header-info">
          <h1 class="name">{{ resumeData.personal_info?.name || resumeData.name }}</h1>
          <div class="basic-info">
            <span v-if="resumeData.personal_info?.gender">{{ resumeData.personal_info.gender }}</span>
            <span v-if="resumeData.personal_info?.age">{{ resumeData.personal_info.age }}岁</span>
          </div>
          <div class="contact-info">
            <div class="contact-item" v-if="resumeData.personal_info?.phone">
              <el-icon><Phone /></el-icon>
              <span>{{ resumeData.personal_info.phone }}</span>
            </div>
            <div class="contact-item" v-if="resumeData.personal_info?.email">
              <el-icon><Message /></el-icon>
              <span>{{ resumeData.personal_info.email }}</span>
            </div>
            <div class="contact-item" v-if="resumeData.personal_info?.current_location">
              <el-icon><Location /></el-icon>
              <span>{{ resumeData.personal_info.current_location }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 求职意向 -->
      <div v-if="resumeData.job_intention" class="resume-section">
        <h2 class="section-title">
          <el-icon><Briefcase /></el-icon>
          求职意向
        </h2>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item" v-if="resumeData.job_intention.position">
              <label>求职意向：</label>
              <span>{{ resumeData.job_intention.position }}</span>
            </div>
            <div class="info-item" v-if="resumeData.job_intention.expected_salary">
              <label>期望薪资：</label>
              <span>{{ resumeData.job_intention.expected_salary }}</span>
            </div>
            <div class="info-item" v-if="resumeData.job_intention.desired_city">
              <label>意向城市：</label>
              <span>{{ resumeData.job_intention.desired_city }}</span>
            </div>
            <div class="info-item" v-if="resumeData.job_intention.available_time">
              <label>入职时间：</label>
              <span>{{ resumeData.job_intention.available_time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 教育背景 -->
      <div v-if="resumeData.educations && resumeData.educations.length > 0" class="resume-section">
        <h2 class="section-title">
          <el-icon><School /></el-icon>
          教育背景
        </h2>
        <div class="section-content">
          <div v-for="(edu, index) in resumeData.educations" :key="index" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h3>{{ edu.school }}</h3>
                <span class="timeline-date">{{ edu.period }}</span>
              </div>
              <div class="timeline-body">
                <p><strong>{{ edu.degree }} · {{ edu.major }}</strong></p>
                <p v-if="edu.gpa">专业成绩：{{ edu.gpa }}</p>
                <p v-if="edu.courses">主修课程：{{ edu.courses }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作经历 -->
      <div v-if="resumeData.experiences && resumeData.experiences.length > 0" class="resume-section">
        <h2 class="section-title">
          <el-icon><Suitcase /></el-icon>
          工作经历
        </h2>
        <div class="section-content">
          <div v-for="(exp, index) in resumeData.experiences" :key="index" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h3>{{ exp.company }}</h3>
                <span class="timeline-date">{{ exp.period }}</span>
              </div>
              <div class="timeline-body">
                <p><strong>{{ exp.position }}</strong><span v-if="exp.department"> · {{ exp.department }}</span></p>
                <div v-if="exp.responsibilities" class="content-block">
                  <h4>工作内容：</h4>
                  <p>{{ exp.responsibilities }}</p>
                </div>
                <div v-if="exp.achievements" class="content-block">
                  <h4>工作业绩：</h4>
                  <p>{{ exp.achievements }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目经验 -->
      <div v-if="resumeData.projects && resumeData.projects.length > 0" class="resume-section">
        <h2 class="section-title">
          <el-icon><Folder /></el-icon>
          项目经验
        </h2>
        <div class="section-content">
          <div v-for="(project, index) in resumeData.projects" :key="index" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h3>{{ project.name }}</h3>
                <span class="timeline-date">{{ project.period }}</span>
              </div>
              <div class="timeline-body">
                <p v-if="project.role"><strong>担任角色：</strong>{{ project.role }}</p>
                <div v-if="project.description" class="content-block">
                  <h4>项目描述：</h4>
                  <p>{{ project.description }}</p>
                </div>
                <div v-if="project.responsibilities" class="content-block">
                  <h4>项目职责：</h4>
                  <p>{{ project.responsibilities }}</p>
                </div>
                <div v-if="project.achievements" class="content-block">
                  <h4>项目成果：</h4>
                  <p>{{ project.achievements }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 技能专长 -->
      <div v-if="resumeData.skills" class="resume-section">
        <h2 class="section-title">
          <el-icon><Star /></el-icon>
          技能专长
        </h2>
        <div class="section-content">
          <div class="skills-grid">
            <div v-if="resumeData.skills.professional_skills" class="skill-category">
              <h4>专业技能</h4>
              <p>{{ resumeData.skills.professional_skills }}</p>
            </div>
            <div v-if="resumeData.skills.languages" class="skill-category">
              <h4>语言能力</h4>
              <p>{{ resumeData.skills.languages }}</p>
            </div>
            <div v-if="resumeData.skills.other_skills" class="skill-category">
              <h4>其他技能</h4>
              <p>{{ resumeData.skills.other_skills }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 荣誉证书 -->
      <div v-if="resumeData.honors" class="resume-section">
        <h2 class="section-title">
          <el-icon><Trophy /></el-icon>
          荣誉证书
        </h2>
        <div class="section-content">
          <div class="honors-grid">
            <div v-if="resumeData.honors.certificates" class="honor-category">
              <h4>证书</h4>
              <p>{{ resumeData.honors.certificates }}</p>
            </div>
            <div v-if="resumeData.honors.awards" class="honor-category">
              <h4>获奖情况</h4>
              <p>{{ resumeData.honors.awards }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 自我评价 -->
      <div v-if="resumeData.self_evaluation" class="resume-section">
        <h2 class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          自我评价
        </h2>
        <div class="section-content">
          <p class="evaluation-text">{{ resumeData.self_evaluation }}</p>
        </div>
      </div>

      <!-- 兴趣爱好 -->
      <div v-if="resumeData.hobbies" class="resume-section">
        <h2 class="section-title">
          <el-icon><Basketball /></el-icon>
          兴趣爱好
        </h2>
        <div class="section-content">
          <p class="hobbies-text">{{ resumeData.hobbies }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  User, Phone, Message, Location, Briefcase, School, Suitcase,
  Folder, Star, Trophy, ChatDotRound, Basketball
} from '@element-plus/icons-vue'

// 定义props
const props = defineProps({
  resumeData: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
console.log(props);

</script>

<style scoped>
.resume-detail-wrapper {
  background: white;
  border-radius: 8px;
}

.resume-detail-container {
  padding: 0;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  line-height: 1.6;
  color: #333;
}

.resume-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.header-avatar {
  flex-shrink: 0;
}

.header-info {
  flex: 1;
}

.name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.basic-info {
  font-size: 16px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.basic-info span:not(:last-child)::after {
  content: ' | ';
  margin: 0 8px;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.resume-section {
  padding: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.resume-section:last-child {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.section-title .el-icon {
  font-size: 22px;
  color: #409eff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.timeline-item {
  position: relative;
  padding-left: 32px;
  margin-bottom: 32px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 8px;
  width: 12px;
  height: 12px;
  background: #409eff;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #409eff;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 20px;
  bottom: -32px;
  width: 2px;
  background: #e9ecef;
}

.timeline-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #409eff;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.timeline-date {
  font-size: 14px;
  color: #666;
  background: white;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.timeline-body p {
  margin: 8px 0;
}

.content-block {
  margin-top: 16px;
}

.content-block h4 {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 8px;
}

.content-block p {
  margin: 0;
  color: #666;
  line-height: 1.7;
}

.skills-grid, .honors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.skill-category, .honor-category {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
}

.skill-category h4, .honor-category h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px;
}

.skill-category p, .honor-category p {
  margin: 0;
  color: #666;
  line-height: 1.7;
}

.evaluation-text, .hobbies-text {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #e6a23c;
  margin: 0;
  color: #666;
  line-height: 1.8;
  font-size: 15px;
}

@media (max-width: 768px) {
  .resume-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .contact-info {
    justify-content: center;
  }
  
  .resume-section {
    padding: 20px;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-grid, .skills-grid, .honors-grid {
    grid-template-columns: 1fr;
  }
}
</style>
