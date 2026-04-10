<template>
  <div class="resume-history-wrapper">
    <div class="resume-history-container">
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon"><Document /></el-icon>
              <span class="header-title">历史简历</span>
              <el-tag v-if="totalCount > 0" type="info" size="small">
                共 {{ totalCount }} 份简历
              </el-tag>
            </div>
            <div class="header-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click="refreshList"
                :loading="loading"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <!-- 搜索和筛选区域 -->
        <div class="search-section">
          <el-row :gutter="20" align="middle">
            <el-col :span="8">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索简历（姓名、职位）"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="handleSearch" :loading="loading">
                搜索
              </el-button>
            </el-col>
            <el-col :span="12" class="text-right">
              <span class="page-size-label">每页显示：</span>
              <el-select 
                v-model="currentPageSize" 
                @change="handlePageSizeChange"
                size="small"
                style="width: 80px"
              >
                <el-option label="5" :value="5" />
                <el-option label="10" :value="10" />
                <el-option label="20" :value="20" />
                <el-option label="50" :value="50" />
              </el-select>
            </el-col>
          </el-row>
        </div>

        <!-- 简历列表 -->
        <div class="resume-list-section">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>

          <!-- 空状态 -->
          <div v-else-if="!hasData" class="empty-container">
            <el-empty description="暂无简历记录">
              <el-button type="primary" @click="$emit('create-resume')">
                创建第一份简历
              </el-button>
            </el-empty>
          </div>

          <!-- 简历列表 -->
          <div v-else class="resume-grid">
            <div 
              v-for="resume in resumeList" 
              :key="resume.originalPersonalId"
              class="resume-card"
            >
              <div class="resume-card-header">
                <div class="resume-number">{{ resume.serialNumber }}</div>
                <div class="resume-actions">
                  <el-dropdown @command="(command) => handleAction(command, resume)">
                    <el-button type="text" size="small">
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="view">
                          <el-icon><View /></el-icon>
                          查看详情
                        </el-dropdown-item>
                        <el-dropdown-item command="edit">
                          <el-icon><Edit /></el-icon>
                          编辑简历
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          <el-icon><Delete /></el-icon>
                          删除简历
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="resume-card-body" @click="viewResumeDetail(resume)">
                <div class="resume-avatar">
                  <el-avatar :size="60" :src="resume.avatar">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                </div>
                
                <div class="resume-info">
                  <h3 class="resume-name">{{ resume.name }}</h3>
                  <div class="resume-meta">
                    <div class="meta-item">
                      <el-icon><Briefcase /></el-icon>
                      <span>{{ resume.jobPosition }}</span>
                    </div>
                    <div class="meta-item" v-if="resume.age">
                      <el-icon><Calendar /></el-icon>
                      <span>{{ resume.age }}岁</span>
                    </div>
                    <div class="meta-item">
                      <el-icon><Location /></el-icon>
                      <span>{{ resume.currentLocation }}</span>
                    </div>
                  </div>
                  <div class="resume-time">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatTime(resume.updateTime) }}</span>
                  </div>
                </div>
              </div>

              <div class="resume-card-footer">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewResumeDetail(resume)"
                >
                  查看详情
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="editResume(resume)"
                >
                  编辑
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="hasData" class="pagination-section">
          <el-pagination
            v-model:current-page="currentPageNum"
            v-model:page-size="currentPageSize"
            :page-sizes="[5, 10, 20, 50]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
            background
          />
        </div>
      </el-card>
    </div>

    <!-- 简历详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="简历详情"
      width="80%"
      :before-close="handleCloseDetail"
      append-to-body
    >
      <div v-if="detailLoading" class="detail-loading">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else-if="currentResumeDetail" class="resume-detail-content">
        <ResumeDetailView :resume-data="currentResumeDetail" />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editCurrentResume">
            编辑简历
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useResumeHistoryStore } from '@/stores/resumeHistory'
import { ElMessageBox } from 'element-plus'
import {
  Document, Refresh, Search, MoreFilled, View, Edit, Delete,
  User, Briefcase, Calendar, Location, Clock
} from '@element-plus/icons-vue'
import ResumeDetailView from './ResumeDetailView.vue'

// 定义事件
const emit = defineEmits(['create-resume', 'edit-resume'])

// 使用store
const resumeHistoryStore = useResumeHistoryStore()
const {
  resumeList,
  loading,
  currentPage,
  pageSize,
  totalCount,
  currentResumeDetail,
  detailLoading,
  hasData
} = storeToRefs(resumeHistoryStore)

const {
  fetchResumeList,
  fetchResumeDetail,
  deleteResume,
  changePage,
  changePageSize,
  refreshList
} = resumeHistoryStore

// 本地状态
const searchKeyword = ref('')
const detailDialogVisible = ref(false)
const currentPageNum = ref(1)
const currentPageSize = ref(10)

// 计算属性
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听页码变化
watch(currentPage, (newVal) => {
  currentPageNum.value = newVal
})

watch(pageSize, (newVal) => {
  currentPageSize.value = newVal
})

// 方法
const handleSearch = async () => {
  // 这里可以添加搜索逻辑
  console.log('搜索关键词:', searchKeyword.value)
  await refreshList()
}

const handlePageChange = async (page) => {
  await changePage(page)
}

const handlePageSizeChange = async (size) => {
  await changePageSize(size)
}

const handleAction = async (command, resume) => {
  switch (command) {
    case 'view':
      await viewResumeDetail(resume)
      break
    case 'edit':
      editResume(resume)
      break
    case 'delete':
      await confirmDeleteResume(resume)
      break
  }
}

const viewResumeDetail = async (resume) => {
  const detail = await fetchResumeDetail(resume.originalPersonalId)
  if (detail) {
    detailDialogVisible.value = true
  }
}

const editResume = (resume) => {
  emit('edit-resume', resume)
}

const editCurrentResume = () => {
  if (currentResumeDetail.value) {
    emit('edit-resume', currentResumeDetail.value)
    detailDialogVisible.value = false
  }
}

const confirmDeleteResume = async (resume) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${resume.name}" 的简历吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await deleteResume(resume.originalPersonalId)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除简历失败:', error)
    }
  }
}

const handleCloseDetail = (done) => {
  detailDialogVisible.value = false
  done()
}

// 生命周期
onMounted(async () => {
  await fetchResumeList()
})
</script>

<style scoped>
.resume-history-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.resume-history-container {
  max-width: 1400px;
  margin: 0 auto;
}

.history-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 20px;
  color: #409eff;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.page-size-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.text-right {
  text-align: right;
}

.resume-list-section {
  margin-bottom: 24px;
}

.loading-container {
  padding: 20px;
}

.empty-container {
  padding: 40px 20px;
}

.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.resume-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.resume-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.resume-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 0;
}

.resume-number {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.resume-card-body {
  padding: 20px;
  cursor: pointer;
}

.resume-avatar {
  text-align: center;
  margin-bottom: 16px;
}

.resume-info {
  text-align: center;
}

.resume-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px;
}

.resume-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.meta-item .el-icon {
  font-size: 16px;
  color: #409eff;
}

.resume-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.resume-card-footer {
  padding: 16px 20px;
  background: #f8f9fa;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.detail-loading {
  padding: 40px;
}

.resume-detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .resume-history-wrapper {
    padding: 10px;
  }
  
  .resume-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .search-section .el-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .text-right {
    text-align: left;
  }
}
</style>
