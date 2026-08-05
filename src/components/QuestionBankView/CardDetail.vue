<template>
  <div class="page-container">
    <!-- 模块列表 -->
    <div class="module-wrapper" v-for="module in moduleList" :key="module.id">
      <!-- 标题栏：图标 + 标题 + 操作按钮 -->
      <div class="module-header">
        <div class="title-wrapper">
          <el-icon class="title-icon"><CollectionTag /></el-icon>
          <h2 class="module-title">{{ module.title }}</h2>
        </div>
        <div class="action-buttons">
          <el-button
            icon="Plus"
            text
            size="small"
            @click="store.openUploadDialog(module.id)"
            class="action-btn"
          />
          <el-button
            icon="Edit"
            text
            size="small"
            @click="store.openRenameDialog(module.id)"
            class="action-btn"
          />
          <!-- 更多下拉菜单 -->
          <el-dropdown @command="(cmd) => handleMoreCommand(module.id, cmd)">
            <el-button
              icon="MoreFilled"
              text
              size="small"
              class="action-btn"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="refresh" icon="Refresh">
                  刷新列表
                </el-dropdown-item>
                <el-dropdown-item command="batch-upload" icon="UploadFilled">
                  批量上传
                </el-dropdown-item>
                <el-dropdown-item command="batch-delete" icon="Delete">
                  批量删除
                </el-dropdown-item>
                <el-dropdown-item command="export" icon="Download">
                  导出文件列表
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容卡片：已上传文件列表 -->
      <div class="content-card">
        <!-- 文件项 -->
        <div class="file-item" v-for="file in module.files" :key="file.id" @click="store.openFileDetailDialog(file, module.id)">
          <el-icon class="file-icon"><Document /></el-icon>
          <div class="file-info">
            <p class="file-name">{{ file.name }}</p>
            <p class="file-meta">{{ file.size }} · {{ file.updateTime }}</p>
          </div>
          <el-button
            icon="Download"
            text
            size="small"
            @click.stop="store.handleDownload(file.id)"
            class="download-btn"
          />
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="module.files.length === 0">
          <el-icon class="empty-icon"><FolderOpened /></el-icon>
          <p class="empty-text">暂无已上传内容</p>
        </div>
      </div>
    </div>

    <!-- 批量删除 - 选择文件弹窗 -->
    <el-dialog
      v-model="store.batchDeleteDialogVisible"
      title="选择要删除的文件"
      width="500px"
      destroy-on-close
    >
      <div class="delete-file-list">
        <div class="batch-select-header">
          <el-checkbox v-model="store.selectAllFiles" @change="store.handleSelectAllInDialog" label="全选" />
          <span class="selected-count">已选择：{{ store.selectedFileIds.length }} 个文件</span>
        </div>

        <div class="file-list-container">
          <div
            class="dialog-file-item"
            v-for="file in store.deleteFileList"
            :key="file.id"
          >
            <el-checkbox
              v-model="store.selectedFileIds"
              :label="file.id"
            />
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ file.name }}</span>
          </div>

          <div class="empty-state" v-if="store.deleteFileList.length === 0">
            <p>该模块暂无文件</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="store.closeBatchDeleteDialog">取消</el-button>
        <el-button
          type="danger"
          @click="store.showDeleteConfirm"
          :disabled="store.selectedFileIds.length === 0"
        >
          确认选择
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="store.deleteConfirmDialogVisible"
      title="批量删除文件"
      width="400px"
      destroy-on-close
    >
      <div class="delete-tip">
        <el-icon class="warning-icon"><WarningFilled /></el-icon>
        <p>
          确定要删除选中的 {{ store.selectedFileIds.length }} 个文件吗？此操作不可恢复！
        </p>
      </div>
      <template #footer>
        <el-button @click="store.deleteConfirmDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          @click="store.handleDeleteConfirm"
          :loading="store.deleteLoading"
        >
          确认删除
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量上传弹窗 -->
    <el-dialog
      v-model="store.batchUploadDialogVisible"
      title="批量上传文件"
      width="500px"
      destroy-on-close
      @close="batchUploadDialogClose"
    >
      <el-upload
        ref="batchUploadRef"
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :file-list="store.batchUploadFileList"
        :on-change="store.handleBatchFileChange"
        :on-remove="store.handleBatchFileRemove"
        multiple
        accept=".pdf,.docx,.xlsx,.doc,.xls,.txt"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖放文件到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 pdf、docx、xlsx、doc、xls 格式文件，单个文件不超过100MB，最多同时上传10个文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="store.closeBatchUploadDialog">取消</el-button>
        <el-button
          type="primary"
          @click="store.handleBatchUploadSubmit"
          :loading="store.batchUploadLoading"
          :disabled="store.batchUploadFileList.length === 0"
        >
          确认上传
        </el-button>
      </template>
    </el-dialog>

    <!-- 上传弹窗 -->
    <el-dialog
      v-model="store.uploadDialogVisible"
      title="上传文件"
      width="400px"
      destroy-on-close
      @close="singleUploadDialogClose"
    >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :file-list="store.uploadFileList"
        :on-change="store.handleFileChange"
        :on-remove="store.handleFileRemove"
        accept=".pdf,.docx,.xlsx,.doc,.xls,.txt"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖放文件到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 pdf、docx、xlsx、doc、xls 格式文件，单个文件不超过100MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="store.closeUploadDialog">取消</el-button>
        <el-button
          type="primary"
          @click="store.handleUploadSubmit"
          :loading="store.uploadLoading"
          :disabled="store.uploadFileList.length === 0"
        >
          确认上传
        </el-button>
      </template>
    </el-dialog>

    <!-- 重命名弹窗 -->
    <el-dialog
      v-model="store.renameDialogVisible"
      title="修改文件名"
      width="400px"
      destroy-on-close
      @close="store.closeRenameDialog"
    >
      <div v-if="!store.selectedFile">
        <p class="select-file-tip">请选择要修改名称的文件：</p>
        <el-select
          v-model="store.fileSelectValue"
          placeholder="选择文件"
          style="width: 100%; margin-bottom: 20px;"
        >
          <el-option
            v-for="file in store.currentModuleFiles"
            :key="file.id"
            :label="file.name"
            :value="file.id"
          />
        </el-select>
      </div>

      <div v-else>
        <el-form :model="store.renameForm" label-width="80px">
          <el-form-item label="原文件名：">
            <el-input v-model="store.selectedFile.name" disabled />
          </el-form-item>
          <el-form-item
            label="新文件名："
            :rules="[{ required: true, message: '请输入新文件名', trigger: 'blur' }]"
          >
            <el-input
              v-model="store.renameForm.newName"
              placeholder="请输入新文件名（无需后缀）"
            />
            <p class="suffix-tip">文件后缀：{{ store.fileSuffix }}</p>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="!store.selectedFile" @click="store.closeRenameDialog">取消</el-button>
          <el-button
            v-if="!store.selectedFile"
            type="primary"
            @click="store.confirmSelectFile"
            :disabled="!store.fileSelectValue"
          >
            下一步
          </el-button>
          <div v-else style="display: inline-flex; gap: 8px;">
            <el-button @click="store.resetRenameStep">返回</el-button>
            <el-button
              type="primary"
              @click="store.handleRenameSubmit"
              :loading="store.renameLoading"
              :disabled="!store.renameForm.newName"
            >
              确认修改
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 文件详情弹窗 -->
<el-dialog
      v-model="store.fileDetailVisible"
      title="文件详情"
      width="1200px"  
      destroy-on-close
      @close="store.closeFileDetailDialog"
      class="file-detail-dialog" 
    >
      <div class="file-detail-content-layout" v-if="store.currentFile">
        <!-- 左侧面板：文件基本信息 -->
        <div class="detail-left-panel">
          <h3 class="panel-title">文件基本信息</h3>
          <el-form :model="store.fileDetailForm" label-width="90px" label-position="left" class="file-info-form">
            <el-form-item label="文件名称:">
              <div class="display-with-edit">
                <el-input
                  v-model="store.fileDetailForm.name"
                  :disabled="!store.isEditingName"
                  :class="{ 'editing-input-active': store.isEditingName }"
                  class="display-input"
                ></el-input>
                <el-button
                  size="small"
                  text
                  @click="store.toggleEditName"
                  class="edit-action-btn"
                >
                  {{ store.isEditingName ? '取消编辑' : '编辑名称' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="所属模块:">
              <div class="display-with-edit">
                <el-select
                  v-model="store.fileDetailForm.moduleId"
                  placeholder="选择所属模块"
                  :disabled="!store.isEditingModule"
                  :class="{ 'editing-select-active': store.isEditingModule }"
                  class="display-select"
                >
                  <el-option
                    v-for="module in store.moduleList"
                    :key="module.id"
                    :label="module.title"
                    :value="module.id"
                  />
                </el-select>
                <el-button
                  size="small"
                  text
                  @click="store.toggleEditModule"
                  class="edit-action-btn"
                >
                  {{ store.isEditingModule ? '取消编辑' : '编辑模块' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="文件大小:">
              <span class="detail-display-text">{{ store.currentFile.size }}</span>
            </el-form-item>

            <el-form-item label="上传时间:">
              <span class="detail-display-text">{{ store.currentFile.createTime }}</span>
            </el-form-item>

            <el-form-item label="更新时间:">
              <span class="detail-display-text">{{ store.currentFile.updateTime }}</span>
            </el-form-item>

            <el-form-item label="文件ID:">
              <span class="detail-display-text">{{ store.currentFile.id }}</span>
            </el-form-item>
          </el-form>
        </div>

        <!-- 右侧面板：题库内容预览 -->
        <div class="detail-right-panel">
          <h3 class="panel-title">题库内容预览</h3>
          <el-input
            v-model="store.searchKeyword"
            placeholder="搜索题目或答案"
            clearable
            prefix-icon="Search"
            style="margin-bottom: 15px;"
          />
          <div class="question-answer-container">
            <div v-if="store.questionsLoading" class="loading-qa-state">
              <el-icon class="is-loading" :size="32" color="#409EFF"><Loading /></el-icon>
              <p>正在加载题库内容...</p>
            </div>
            <div v-else-if="store.currentFileQuestionsAndAnswers.length === 0" class="empty-qa-state">
              <el-icon :size="48" color="#909399"><Reading /></el-icon>
              <p>该题库暂无题目内容。</p>
            </div>
            <div v-else-if="store.filteredQuestionsAndAnswers.length === 0" class="empty-qa-state">
              <el-icon :size="48" color="#909399"><FolderOpen /></el-icon>
              <p>没有找到匹配的题目或答案。</p>
            </div>
            <div v-else class="question-list">
              <div v-for="(item, index) in store.filteredQuestionsAndAnswers" :key="index" class="qa-item">
                <p class="qa-question"><strong>Q{{ index + 1 }}:</strong> {{ item.question }}</p>
                <p class="qa-answer"><strong>A:</strong> {{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="store.closeFileDetailDialog">关闭</el-button>
        <el-button
          type="primary"
          @click="store.saveFileDetail"
          :loading="store.detailLoading"
          :disabled="!store.isEditingName && !store.isEditingModule"
        >
          保存修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  Document, FolderOpened, CollectionTag, UploadFilled, WarningFilled,
  Reading, Loading
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// 文件详情通过题库 store 统一访问 Go 后端。
import * as XLSX from 'xlsx'
import { questionBankStore } from '@/stores/questionBank' // 引入你的 store

// const emit = defineEmits(['module-list-change']) // 不再需要，所有更新通过 store 完成

const store = questionBankStore // 获取 store 实例

// El-upload 的 ref 仍然需要保持本地引用
const uploadRef = ref(null)
const batchUploadRef = ref(null)

// 替换本地 moduleList 为 store 中的 moduleList
const moduleList = computed(() => store.moduleList)


// 生命周期钩子，加载数据
onMounted(() => {
  store.fetchAllModules()
})

// 弹窗关闭时清除el-upload的文件列表
const singleUploadDialogClose = () => {
  store.closeUploadDialog();
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
    uploadRef.value.abort(); // 如果有正在上传的任务，中止它
  }
};

const batchUploadDialogClose = () => {
  store.closeBatchUploadDialog();
  if (batchUploadRef.value) {
    batchUploadRef.value.clearFiles();
    batchUploadRef.value.abort();
  }
};

// 更多操作
const handleMoreCommand = async (moduleId, command) => {
  // store.currentUploadModuleId = moduleId; // 已经在 openBatchDeleteDialog 等方法中设置

  switch(command) {
    case 'refresh':
      await store.fetchAllModules();
      ElMessage.success('列表已刷新');
      break;

    case 'batch-upload':
      store.openBatchUploadDialog(moduleId); // 调用 store 中的方法打开弹窗
      break;

    case 'batch-delete':
      store.openBatchDeleteDialog(moduleId); // 调用 store 中的方法打开弹窗
      break;

    case 'export':
      try {
        const module = store.moduleList.find(m => m.id === moduleId);
        if (!module || !module.files.length) {
          ElMessage.warning('该模块暂无文件可导出');
          return;
        }

        const exportData = module.files.map((file, index) => ({
          序号: index + 1,
          文件ID: file.id || '',
          文件名: file.name || '',
          文件大小: file.size || '',
          所属模块: module.title || '',
          上传时间: file.uploadTime || '未记录',
          最后更新时间: file.updateTime || '未记录'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const wscols = [
          { wch: 6 },{ wch: 12 },{ wch: 30 },{ wch: 10 },
          { wch: 12 },{ wch: 20 },{ wch: 20 }
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, module.title);

        const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
        const fileName = `${module.title}_文件列表_${dateStr}.xlsx`;

        XLSX.writeFile(workbook, fileName);
        ElMessage.success('文件列表导出成功');
      } catch (error) {
        console.error('导出失败：', error);
        ElMessage.error('导出失败：' + error.message);
      }
      break;
  }
};
</script>

<style scoped>
/* 基础样式 */
.upload-demo {
  margin-bottom: 20px;
}

.el-upload {
  text-align: center;
}

.page-container {
  min-height: 100vh;
  padding: 40px 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.module-wrapper {
  margin-bottom: 32px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 20px;
  color: #2563eb;
}

.module-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  color: #666;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #2563eb;
  border-radius: 6px; 
  border: 1px solid #e0e0e0;
}

.content-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  border-left: 4px solid #2563eb;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: #f8f9fa;
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
  font-size: 24px;
  color: #2563eb;
  margin-right: 16px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 16px;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.file-meta {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.download-btn {
  color: #666;
}

.download-btn:hover {
  color: #2563eb;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  margin: 0;
}

.select-file-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.suffix-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  margin-bottom: 0;
}

/* 编辑按钮 */
.edit-btn {
  margin-top: 5px;
  color: #666;
  transition: color 0.2s;
}

.edit-btn-active {
  color: #2563eb !important;
}

.edit-btn:hover {
  color: #1d4ed8;
}

.editing-text {
  --el-input-text-color: #2563eb !important;
  --el-select-text-color: #2563eb !important;
  --el-input-placeholder-color: #2563eb80 !important;
}

.editing-text .el-input__inner,
.editing-text .el-select__wrapper {
  color: #2563eb !important;
  border-color: #2563eb !important;
}

.editing-text .el-select .el-input__suffix-inner {
  color: #2563eb !important;
}

/* 删除提示 */
.delete-tip {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  color: #666;
}

.warning-icon {
  color: #f59e0b;
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
}

/* 批量删除选择弹窗样式 */
.delete-file-list {
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.batch-select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.selected-count {
  color: #666;
  font-size: 14px;
}
.file-list-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
}
.dialog-file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #f5f5f5;
}
.dialog-file-item:last-child {
  border-bottom: none;
}
.dialog-file-item .file-name {
  flex: 1;
  font-size: 14px;
}

/* 批量上传列表高度 */
:deep(.el-upload-list--text) {
  max-height: 200px;
  overflow-y: auto;
}

/* 文件详情弹窗的自定义样式 */
.file-detail-dialog .el-dialog__body {
  padding: 20px;
}

.file-detail-content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列布局 */
  gap: 20px; /* 列间距 */
}

.detail-left-panel,
.detail-right-panel {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ebebeb;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.file-info-form .el-form-item {
  margin-bottom: 15px;
}

.file-info-form :deep(.el-form-item__label) {
  color: #666;
  font-weight: normal;
}

.detail-display-text {
  color: #333;
  font-size: 14px;
  line-height: var(--el-input-height); /* 与 input 高度对齐 */
}

.display-with-edit {
  display: flex;
  align-items: center;
  width: 100%;
}

.display-with-edit .display-input,
.display-with-edit .display-select {
  flex: 1;
  margin-right: 10px;
}

/* 非编辑状态下的 input 样式，使其看起来像文本 */
.display-input.is-disabled :deep(.el-input__wrapper) {
  box-shadow: none !important;
  background-color: transparent !important;
}
.display-input.is-disabled :deep(.el-input__inner) {
  color: #333 !important;
  cursor: default;
}
.display-select.is-disabled :deep(.el-select__wrapper) {
  box-shadow: none !important;
  background-color: transparent !important;
}
.display-select.is-disabled :deep(.el-select__input) {
  color: #333 !important;
  cursor: default;
}
.display-select.is-disabled :deep(.el-select__suffix) {
  display: none; /* 隐藏选择框的箭头 */
}


/* 编辑状态下的输入框/选择框边框和文本颜色 */
.editing-input-active :deep(.el-input__wrapper) {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 1px #2563eb !important;
}
.editing-input-active :deep(.el-input__inner) {
  color: #2563eb !important;
}

.editing-select-active :deep(.el-select__wrapper) {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 1px #2563eb !important;
}
.editing-select-active :deep(.el-select__input) {
  color: #2563eb !important;
}
.editing-select-active :deep(.el-select__suffix) {
  color: #2563eb !important;
}


.edit-action-btn {
  color: #2563eb;
  font-size: 13px;
}
.edit-action-btn:hover {
  color: #1d4ed8;
}


/* 右侧题库内容样式 */
.question-answer-container {
  max-height: 400px; /* 限制高度并添加滚动条 */
  overflow-y: auto;
  padding-right: 10px; /* 防止滚动条遮挡内容 */
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.qa-item {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.qa-question {
  font-size: 15px;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.5;
  font-weight: 500;
}

.qa-answer {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

.loading-qa-state,
.empty-qa-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #909399;
  font-size: 15px;
}

.loading-qa-state .el-icon,
.empty-qa-state .el-icon {
  margin-bottom: 15px;
}

/* 新增的样式用于“没有找到匹配项”的提示 */
.empty-qa-state .el-icon {
  margin-bottom: 15px;
}
</style>
