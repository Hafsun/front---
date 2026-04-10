<template>
  <div class="knowledge-universe">
    <div class="kb-content-wrapper">
      <!-- 顶部看板：Bento Box -->
      <div class="bento-board">
        <!-- Bento 1: 快捷上传区 -->
        <div class="bento-card upload-bento glass-panel">
          <el-upload
            class="bento-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <div class="upload-inner">
              <div class="icon-pulse"><el-icon><UploadFilled /></el-icon></div>
              <h4>拖拽文件至此，或点击上传</h4>
              <p>支持 PDF, Word, Excel (Max 100MB)</p>
            </div>
          </el-upload>
        </div>

        <!-- Bento 2: 存储统计 (保持演示) -->
        <div class="bento-card stats-bento glass-panel">
          <div class="stats-header">
            <el-icon><TakeawayBox /></el-icon>
            <span>知识库容量</span>
          </div>
          <div class="stats-body">
            <div class="ring-chart">
              <svg viewBox="0 0 36 36" class="circular-chart blue">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle" stroke-dasharray="65, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="ring-text">65%</div>
            </div>
            <div class="stats-info">
              <h3>1.2 GB</h3>
              <p>已用 / 共 2 GB</p>
            </div>
          </div>
        </div>

        <!-- Bento 3: AI 状态 -->
        <div class="bento-card ai-bento glass-panel">
          <div class="ai-header">
            <el-icon class="spin-icon"><Cpu /></el-icon>
            <span>AI 引擎状态</span>
          </div>
          <div class="ai-status">
            <div class="status-dot active"></div>
            <span>向量化检索已就绪</span>
          </div>
          <button class="glass-btn ai-btn" @click="exportKnowledgeList">
            <el-icon><MagicStick /></el-icon> 导出 CSV 列表
          </button>
        </div>
      </div>

      <!-- 中间控制栏 -->
      <div class="control-bar glass-panel">
        <div class="search-group">
          <el-input
            v-model="searchQuery"
            placeholder="在知识宇宙中搜索文件名或标签..."
            class="glass-input"
            prefix-icon="Search"
            clearable
          />
          <div class="tag-cloud">
            <span
              v-for="tag in ['全部', ...availableTags]"
              :key="tag"
              class="cloud-tag"
              :class="[getTagColor(tag), { active: activeTag === tag }]"
              @click="activeTag = tag"
            >
              {{ tag.startsWith('#') ? tag : '#' + tag }}
            </span>
          </div>
        </div>

        <div class="view-toggles">
          <el-radio-group v-model="viewMode" class="glass-radio">
            <el-radio-button label="grid"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button label="list"><el-icon><List /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 内容区 -->
      <transition name="view-fade" mode="out-in">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="grid-view" key="grid">
          <div v-for="item in filteredKnowledgeList" :key="item.id" class="doc-card glass-panel">
            <div class="card-top-accent" :class="item.fileType"></div>
            <div class="doc-icon-large" :class="item.fileType">
              <el-icon v-if="item.fileType === 'pdf'"><Document /></el-icon>
              <el-icon v-else-if="item.fileType?.includes('doc')"><Tickets /></el-icon>
              <el-icon v-else><Collection /></el-icon>
            </div>
            <h3 class="doc-title" :title="item.name">{{ item.name }}</h3>
            <div class="doc-tags">
              <span v-for="tag in item.tags?.slice(0,2)" :key="tag" class="mini-tag" :class="getTagColor(tag)">{{ tag }}</span>
              <span v-if="item.tags?.length > 2" class="mini-tag">...</span>
            </div>
            <div class="doc-footer">
              <span class="doc-size">{{ item.size }}</span>
              <div class="doc-actions">
                <el-icon class="action-icon hover-blue"><View /></el-icon>
                <el-icon class="action-icon hover-red" @click="handleDelete(item)"><Delete /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 (略, 逻辑同网格) -->
        <div v-else class="list-view" key="list">
          <div v-for="item in filteredKnowledgeList" :key="item.id" class="list-row glass-panel">
             <div class="row-left">
              <div class="row-icon" :class="item.fileType">
                <el-icon><Document /></el-icon>
              </div>
              <div class="row-info">
                <h4>{{ item.name }}</h4>
                <p>{{ item.uploadTime }} · {{ item.size }}</p>
              </div>
            </div>
            <div class="row-center">
              <span v-for="tag in item.tags" :key="tag" class="glass-tag" :class="getTagColor(tag)">
                {{ tag }}
              </span>
            </div>
            <div class="row-right">
              <button class="icon-btn" @click="handleEdit(item)"><el-icon><EditPen /></el-icon></button>
              <button class="icon-btn delete" @click="handleDelete(item)"><el-icon><Delete /></el-icon></button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 上传文件信息设置对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="🚀 上传知识文件"
      width="460px"
      append-to-body
      custom-class="glass-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form :model="uploadForm" ref="uploadFormRef" :rules="uploadRules" label-position="top">
        <el-form-item label="文件名" prop="customFilename">
          <el-input v-model="uploadForm.customFilename" placeholder="请输入文件名">
            <template #append>.{{ fileExtension }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="分类标签" prop="selectedTags">
          <el-select
            v-model="uploadForm.selectedTags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入新标签"
            style="width: 100%"
          >
            <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <div class="file-mini-info">
          大小: {{ (currentUploadingRawFile?.size / 1024 / 1024).toFixed(2) }} MB
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUploadDialog = false">取 消</el-button>
          <el-button type="primary" :loading="isUploading" @click="confirmUpload">
            开始上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { 
  UploadFilled, Document, Tickets, Collection, View, 
  EditPen, Delete, Grid, List, TakeawayBox, Cpu, MagicStick 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { javaService } from '@/utils/request'

// --- 状态变量 ---
const searchQuery = ref('')
const viewMode = ref('grid')
const activeTag = ref('全部')
const knowledgeList = ref([])
const availableTags = ref(['前端开发', '后端开发', '全栈开发'])

// 上传相关
const showUploadDialog = ref(false)
const isUploading = ref(false)
const currentUploadingRawFile = ref(null)
const fileExtension = ref('')
const uploadFormRef = ref(null)
const uploadForm = reactive({
  customFilename: '',
  selectedTags: []
})

const uploadRules = {
  customFilename: [{ required: true, message: '文件名不能为空', trigger: 'blur' }],
  selectedTags: [{ required: true, message: '请至少选择一个标签', trigger: 'change' }]
}

const fetchKnowledgeList = async () => {
  try {
    console.log('=== 开始获取知识库列表 ===')
    
    const response = await javaService.get('/knowledge/list')
    const result = response.data
    
    if (result.code === 1) {
      console.log('✅ 成功码验证通过')
      const rawData = result.data || []
     
      
      if (Array.isArray(rawData)) {
        knowledgeList.value = rawData.map(item => ({
          ...item,
          tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || [])
        }))
      } else {
        knowledgeList.value = []
      }
      
      console.log(`✅ 成功获取 ${knowledgeList.value.length} 条数据`)
      // 成功时不显示错误提示
    } else {
      // 修改这里：使用 msg 而不是 message
      ElMessage.error(result.msg || '获取知识库失败')
      knowledgeList.value = []
    }
  } catch (error) {
    console.error('❌ 获取知识库失败:', error)
    ElMessage.error('获取知识库失败')
    knowledgeList.value = []
  }
}
onMounted(fetchKnowledgeList)

// --- 过滤逻辑 ---
const filteredKnowledgeList = computed(() => {
  return knowledgeList.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.tags?.some(t => t.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesTag = activeTag.value === '全部' || item.tags?.includes(activeTag.value)
    return matchesSearch && matchesTag
  })
})

// --- 上传核心逻辑 ---
const handleFileChange = (uploadFile) => {
  const file = uploadFile.raw
  const ext = file.name.split('.').pop().toLowerCase()
  
  // 1. 简单校验
  const allowed = ['pdf', 'docx', 'xlsx', 'doc', 'xls', 'ppt']
  if (!allowed.includes(ext)) {
    ElMessage.error('不支持该文件格式')
    return
  }
  if (file.size > 100 * 1024 * 1024) {
    ElMessage.error('文件不能超过100MB')
    return
  }

  // 2. 准备对话框
  currentUploadingRawFile.value = file
  fileExtension.value = ext
  uploadForm.customFilename = file.name.replace(`.${ext}`, '')
  uploadForm.selectedTags = []
  showUploadDialog.value = true
}

const confirmUpload = async () => {
  if (!uploadFormRef.value) return
  
  await uploadFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    isUploading.value = true
    const formData = new FormData()
    formData.append('file', currentUploadingRawFile.value)
    formData.append('name', `${uploadForm.customFilename}.${fileExtension.value}`)
    formData.append('tags', JSON.stringify(uploadForm.selectedTags))

    try {
      const response = await javaService.post('/knowledge/upload', formData)
      
      // 获取后端返回的 Result 对象
      const result = response.data
      
      // 判断 Result 的 code 是否为 1（成功）
      // 注意：后端返回的 Result 对象结构是 { code: 1, msg: "", data: {} }
      if (result && result.code === 1) {
        ElMessage.success(result.msg || '上传成功')
        
        // 关闭对话框
        showUploadDialog.value = false
        
        // 等待对话框关闭动画完成
        await nextTick()
        
        // 清空上传相关数据
        uploadForm.customFilename = ''
        uploadForm.selectedTags = []
        currentUploadingRawFile.value = null
        
        // 重置表单
        uploadFormRef.value?.resetFields()
        
        // 刷新知识库列表
        await fetchKnowledgeList()
      } else {
        // 显示详细的错误信息
        const errorMsg = result?.msg || result?.message || '上传失败'
        console.error('上传失败，result:', result)
        ElMessage.error(errorMsg)
      }
    } catch (e) {
      console.error('=== 上传错误详情 ===')
      console.error('错误对象:', e)
      console.error('错误响应:', e.response)
      console.error('错误响应数据:', e.response?.data)
      console.error('错误状态码:', e.response?.status)
      console.error('==================')
      
      // 更详细的错误信息
      let errorMsg = '上传失败，请稍后重试'
      if (e.response?.data) {
        errorMsg = e.response.data.msg || e.response.data.message || errorMsg
      } else if (e.message) {
        errorMsg = e.message
      }
      ElMessage.error(errorMsg)
    } finally {
      isUploading.value = false
    }
  })
}

// --- 操作函数 ---
const handleDelete = (item) => {
  ElMessageBox.confirm(`确定删除 ${item.name} 吗？`, '警告', { type: 'warning' }).then(async () => {
    await javaService.delete(`/knowledge/list/${item.id}`)
    ElMessage.success('已删除')
    fetchKnowledgeList()
  })
  .catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleEdit = (item) => {
  ElMessageBox.prompt('修改文件名', '编辑', {
    inputValue: item.name.split('.')[0],
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空'
  }).then(async ({ value }) => {
    const ext = item.name.split('.').pop()
    
    // ✅ 将 tags 数组转换为 JSON 字符串，与上传时保持一致
    const tagsString = JSON.stringify(item.tags)
    
    await javaService.put(`/knowledge/update/${item.id}`, { 
      name: `${value}.${ext}`, 
      tags: tagsString  // 传递 JSON 字符串，而不是数组
    })
    ElMessage.success('更新成功')
    fetchKnowledgeList()
  }).catch(() => {
    ElMessage.info('已取消更新')
  })
}

const exportKnowledgeList = () => {
  const csvContent = "\ufeffID,文件名,标签,大小\n" + 
    knowledgeList.value.map(i => `${i.id},${i.name},${i.tags?.join('|')},${i.size}`).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", "knowledge_export.csv")
  link.click()
}

const getTagColor = (tag) => {
  // 标签颜色映射
  if (tag === '前端' || tag === '前端开发') return 'tag-frontend'
  if (tag === '后端' || tag === '后端开发') return 'tag-backend'
  if (tag === '全栈' || tag === '全栈开发') return 'tag-fullstack'
  if (tag === '全部') return 'tag-all'
  return 'tag-gray'
}
</script>

<style scoped>
/* 1. 搜索框高亮优化：解决“移过去要有蓝色边框” */
.glass-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05) inset !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
}

.glass-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 0 0 1px #409eff inset !important; /* 悬停蓝色边框 */
  background: rgba(255, 255, 255, 0.8) !important;
}

.glass-input :deep(.el-input__wrapper).is-focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2), 0 0 0 1px #409eff inset !important; /* 聚焦发光 */
}

/* 2. 标签样式优化 */
.tag-cloud {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.cloud-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid transparent;
  transition: all 0.3s;
}
.cloud-tag:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}
.cloud-tag.active {
  background: #409eff;
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 3. 上传对话框内部样式 */
.file-mini-info {
  font-size: 12px;
  color: #909399;
  margin-top: -10px;
  text-align: right;
}

/* 4. 玻璃态面板通用样式 (补全) */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

/* 5. 网格布局样式 */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 20px 0;
}
.doc-card {
  padding: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s;
}
.doc-card:hover {
  transform: translateY(-5px);
}
.doc-title {
  font-size: 15px;
  margin: 12px 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mini-tag {
  font-size: 10px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 4px;
}
/* =======================================
   全局变量与底层画布 (解决白底Bug的关键)
======================================= */
.knowledge-universe {
  position: relative;
  width: 100%;
  min-height: 600px;
  border-radius: 12px;
  
  /* background-color: #f8faff;  */
  /* background-color: white; */
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
}

/* 弥散光球体 - 营造呼吸感和未来感 */
/* .ambient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  z-index: 0;
  animation: float 15s infinite alternate ease-in-out;
}
.light-1 {
  width: 400px; height: 400px;
  background: #e0c3fc;
  top: -100px; left: -100px;
}
.light-2 {
  width: 500px; height: 500px;
  background: #8ec5fc;
  bottom: -150px; right: -100px;
  animation-delay: -5s;
} */

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, 30px) scale(1.1); }
}

.kb-content-wrapper {
  position: relative;
  z-index: 1; 
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* =======================================
   通用玻璃态面板 (Glass Panel)
======================================= */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
}

/* =======================================
   1. Bento Box (便当盒看板)
======================================= */
.bento-board {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr; /* 左侧上传区占大头 */
  gap: 20px;
  height: 180px;
}

.bento-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.08);
}

/* 上传便当盒 (深度定制 Element Upload) */
.upload-bento { padding: 0; overflow: hidden; }
:deep(.bento-uploader .el-upload), 
:deep(.bento-uploader .el-upload-dragger) {
  width: 100%; height: 100%; background: transparent; border: none; border-radius: 16px;
}
:deep(.bento-uploader .el-upload-dragger) {
  display: flex; align-items: center; justify-content: center;
}
:deep(.bento-uploader .el-upload-dragger.is-dragover) {
  background: rgba(106, 143, 241, 0.1);
}
.upload-inner {
  text-align: center; color: #606266;
}
.icon-pulse {
  font-size: 36px; color: #6A8FF1; margin-bottom: 10px;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
.upload-inner h4 { margin: 0 0 8px 0; font-size: 16px; color: #303133; font-weight: 600; }
.upload-inner p { margin: 0; font-size: 12px; color: #909399; }

/* 统计便当盒 */
.stats-header, .ai-header {
  display: flex; align-items: center; gap: 8px; font-weight: 600; color: #303133; margin-bottom: 16px;
}
.stats-body { display: flex; align-items: center; gap: 20px; }
.stats-info h3 { margin: 0 0 4px 0; font-size: 24px; color: #6A8FF1; }
.stats-info p { margin: 0; font-size: 12px; color: #909399; }

/* CSS 环形图 */
.ring-chart { position: relative; width: 60px; height: 60px; }
.circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 250px; }
.circle-bg { fill: none; stroke: rgba(106, 143, 241, 0.1); stroke-width: 3.8; }
.circle { fill: none; stroke-width: 3.8; stroke-linecap: round; animation: progress 1s ease-out forwards; }
.blue .circle { stroke: #6A8FF1; }
.ring-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 14px; font-weight: bold; color: #303133; }
@keyframes progress { 0% { stroke-dasharray: 0 100; } }

/* AI 状态便当盒 */
.spin-icon { animation: spin 4s linear infinite; color: #B061FF; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.ai-status { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #606266; margin-bottom: auto; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
.status-dot.active { background: #67C23A; box-shadow: 0 0 8px #67C23A; }
.ai-btn {
  width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(176, 97, 255, 0.3);
  background: linear-gradient(135deg, rgba(176, 97, 255, 0.1), rgba(176, 97, 255, 0.2));
  color: #B061FF; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.ai-btn:hover { background: #B061FF; color: white; }

/* =======================================
   2. 控制栏 (搜索与视图切换)
======================================= */
.control-bar {
  display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-radius: 100px; /* 胶囊形状 */
}
.search-group { display: flex; align-items: center; gap: 20px; flex: 1; }
:deep(.glass-input .el-input__wrapper) {
  background: rgba(255,255,255,0.5); box-shadow: none; border-radius: 20px; width: 250px; border: 1px solid rgba(255,255,255,0.8);
}
.tag-cloud { display: flex; gap: 10px; }
.cloud-tag {
  font-size: 13px; color: #606266; padding: 4px 12px; border-radius: 16px; cursor: pointer; transition: 0.3s; background: rgba(255,255,255,0.4);
}
.cloud-tag:hover { background: rgba(255,255,255,0.8); }
.cloud-tag.active { background: #303133; color: white; }

:deep(.glass-radio .el-radio-button__inner) {
  background: rgba(255,255,255,0.5); border: none; box-shadow: none !important; color: #606266;
}
:deep(.glass-radio .el-radio-button:first-child .el-radio-button__inner) { border-radius: 8px 0 0 8px; }
:deep(.glass-radio .el-radio-button:last-child .el-radio-button__inner) { border-radius: 0 8px 8px 0; }
:deep(.glass-radio .el-radio-button.is-active .el-radio-button__inner) {
  background: #6A8FF1; color: white;
}

/* 新增：搜索图标悬停效果 */
/* 使用深度选择器 targeting the Element Plus internal icon */
:deep(.glass-input .el-input__prefix .el-input__icon) {
  transition: color 0.3s ease; /* 平滑过渡效果 */
  cursor: pointer; /* 提示可点击 */
}

:deep(.glass-input .el-input__prefix .el-input__icon:hover) {
  color: #6A8FF1; /* 悬停时变为蓝色 */
}


/* =======================================
   3. 视图区域：Grid & List
======================================= */
/* 视图切换动画 */
.view-fade-enter-active, .view-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.view-fade-enter-from, .view-fade-leave-to { opacity: 0; transform: translateY(10px); }

/* 网格视图 (类似桌面文件夹) */
.grid-view {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;
}
.doc-card {
  position: relative; padding: 24px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; overflow: hidden; cursor: pointer;
}
.doc-card:hover { transform: translateY(-5px) scale(1.02); }
.card-top-accent { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
.card-top-accent.pdf { background: #FE728F; }
.card-top-accent.word { background: #6A8FF1; }
.card-top-accent.md { background: #B061FF; } /* Placeholder for markdown if ever used */
.card-top-accent.doc, .card-top-accent.docx, .card-top-accent.xls, .card-top-accent.xlsx { background: #6A8FF1; } /* Word and Excel colors */


.doc-icon-large {
  font-size: 48px; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.doc-icon-large.pdf { color: #FE728F; }
.doc-icon-large.word { color: #6A8FF1; }
.doc-icon-large.md { color: #B061FF; } /* Placeholder for markdown if ever used */
.doc-icon-large.doc, .doc-icon-large.docx, .doc-icon-large.xls, .doc-icon-large.xlsx { color: #6A8FF1; } /* Word and Excel colors */


.doc-title { margin: 0; font-size: 15px; font-weight: 600; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.doc-tags { display: flex; gap: 6px; justify-content: center; width: 100%; }
.mini-tag { font-size: 11px; padding: 2px 8px; background: rgba(0,0,0,0.05); border-radius: 4px; color: #606266; }
.doc-footer {
  display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: auto; padding-top: 12px; border-top: 1px dashed rgba(0,0,0,0.1);
}
.doc-size { font-size: 12px; color: #909399; }
.doc-actions { display: flex; gap: 8px; }
.action-icon { font-size: 16px; color: #909399; cursor: pointer; transition: 0.2s; }
.hover-blue:hover { color: #6A8FF1; }
.hover-red:hover { color: #FE728F; }

/* 列表视图 (List Row) */
.list-view { display: flex; flex-direction: column; gap: 12px; }
.list-row {
  display: flex; justify-content: space-between; align-items: center; padding: 16px 24px;
}
.list-row:hover { transform: translateX(4px); border-color: #6A8FF1; }
.row-left { display: flex; align-items: center; gap: 16px; flex: 2; }
.row-icon { font-size: 24px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.8); }
.row-icon.pdf { color: #FE728F; }
.row-icon.word { color: #6A8FF1; }
.row-icon.md { color: #B061FF; } /* Placeholder for markdown if ever used */
.row-icon.doc, .row-icon.docx, .row-icon.xls, .row-icon.xlsx { color: #6A8FF1; } /* Word and Excel colors */

.row-info h4 { margin: 0 0 4px 0; font-size: 15px; color: #303133; }
.row-info p { margin: 0; font-size: 12px; color: #909399; }

.row-center { flex: 1.5; display: flex; gap: 8px; }
.glass-tag { padding: 4px 12px; border-radius: 20px; font-size: 12px; background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.9); }
.tag-blue { color: #6A8FF1; } .tag-pink { color: #FE728F; } .tag-purple { color: #B061FF; } .tag-orange { color: #FF9D66; }
.tag-green { color: #4CAF50; }
.tag-red { color: #F44336; }
.tag-gray { color: #9E9E9E; }


.row-right { flex: 0.5; display: flex; justify-content: flex-end; gap: 8px; }
.icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(255,255,255,0.8); color: #606266; cursor: pointer; transition: 0.2s; }
.icon-btn:hover { background: #6A8FF1; color: white; transform: scale(1.1); }
.icon-btn.delete:hover { background: #FE728F; }

/* Custom style for El-Input append slot in dialog */
:deep(.el-input-group__append) {
  background-color: transparent !important;
  border-left: none !important;
  padding-right: 0;
  color: #606266;
  padding-left: 0; /* Adjust padding if needed */
}
/* 标签颜色 */
.tag-frontend { color: #6A8FF1; }  /* 前端: rgb(114, 158, 254) */
.tag-backend { color: #FF728A; }   /* 后端: rgb(255, 114, 138) */
.tag-fullstack { color: #FFA664; } /* 全栈: rgb(255, 166, 100) */
.tag-all { color: #B15CFD; }       /* 全部: rgb(177, 92, 253) */
.tag-gray { color: #9E9E9E; }

/* 标签云基础样式 - 未选中状态 */
.cloud-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
  color: #303133;
  border: 1px solid transparent;
}

.cloud-tag:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* 选中状态 - 显示对应背景色和白色字体 */
.cloud-tag.active.tag-frontend { 
  background: #6A8FF1;
  color: white;
  border-color: #6A8FF1;
}

.cloud-tag.active.tag-backend { 
  background: #FF728A;
  color: white;
  border-color: #FF728A;
}

.cloud-tag.active.tag-fullstack { 
  background: #FFA664;
  color: white;
  border-color: #FFA664;
}

.cloud-tag.active.tag-all { 
  background: #B15CFD;
  color: white;
  border-color: #B15CFD;
}

/* 如果没有匹配到颜色类的激活状态，使用默认 */
.cloud-tag.active {
  background: #409eff;
  color: white;
}

</style>