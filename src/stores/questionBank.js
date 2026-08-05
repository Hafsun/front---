// src/stores/questionBank.js
import { reactive, computed } from "vue"
import { goService } from '@/utils/request'; // 阶段 4 题库接口统一由 Go 接管
import { ElMessage } from 'element-plus';

// 定义题库状态的响应式存储
export const questionBankStore = reactive({
  // 题库模块列表（前端/后端/全栈）
  moduleList: [
    { id: 1, title: '前端开发', files: [] },
    { id: 2, title: '后端开发', files: [] },
    { id: 3, title: '全栈开发', files: [] }
  ],
  // 选中的题库文件/模块
  selectedBankFile: null,
  // selectedModuleId: null, // 可以废弃，统一使用 currentUploadModuleId - 备注：已在上面建议废弃

  // 通用加载状态
  loading: false, // 用于全局数据加载

  // 单个文件上传状态
  uploadLoading: false,
  uploadDialogVisible: false,
  uploadFileList: [],
  currentUploadModuleId: 0, // 用于跟踪当前正在操作的模块ID（上传、重命名、批量操作）

  // 重命名/文件详情修改状态
  renameLoading: false,
  renameDialogVisible: false,
  currentModuleFiles: [], // 当前模块下可供重命名选择的文件列表
  fileSelectValue: 0, // 重命名弹窗中选择的文件ID
  selectedFile: null, // 正在重命名的文件
  renameForm: { newName: '' },
  fileSuffix: '',
  detailLoading: false, // 文件详情保存加载状态

  // 文件详情弹窗状态
  fileDetailVisible: false,
  currentFile: null, // 正在查看详情的文件
  fileDetailForm: {
    name: '',
    moduleId: 0
  },
  isEditingName: false,
  isEditingModule: false,

  // =========================================================
  // >>> 新增状态：用于存储题库文件的题目和答案，以及其加载状态 <<<
  // =========================================================
  currentFileQuestionsAndAnswers: [], // 存储当前文件解析出的题目和答案
  questionsLoading: false,             // 题目和答案的加载状态

  // 批量操作状态
  batchUploadDialogVisible: false,
  batchUploadFileList: [], // 批量上传文件列表（通常由el-upload管理，但store可持有引用或为空）
  batchUploadLoading: false,

  batchDeleteDialogVisible: false,
  deleteFileList: [], // 批量删除弹窗中显示的文件列表
  selectedFileIds: [], // 批量删除中选中的文件ID
  selectAllFiles: false, // 批量删除弹窗中的全选状态
  deleteConfirmDialogVisible: false, // 批量删除确认弹窗
  deleteLoading: false,

  searchKeyword: '', // 用于绑定搜索框的输入值

  // 错误信息
  error: null,

  /**
   * 加载所有题库模块和文件
   */
  fetchAllModules: async () => {
    questionBankStore.loading = true;
    questionBankStore.error = null;

    // 模块ID和名称的映射（固定1-前端、2-后端、3-全栈）
    const moduleTitleMap = {
      1: '前端开发',
      2: '后端开发',
      3: '全栈开发'
    };

    try {
      // ----------------------------------------------------
      // 后端交互点 1: 获取所有题库模块和文件列表
      // ----------------------------------------------------
      const response = await goService.get('/question-bank/list');
      const res = response.data;

      if (res.code === 1) {
        const fetchedModules = res.data.map(item => ({
          id: item.moduleId,
          title: moduleTitleMap[item.moduleId] || `未知模块(${item.moduleId})`,
          files: item.files || []
        }));

        // 确保 moduleList 始终包含所有固定模块，即使后端没有返回某个模块的文件
        questionBankStore.moduleList = [
          { id: 1, title: '前端开发', files: [] },
          { id: 2, title: '后端开发', files: [] },
          { id: 3, title: '全栈开发', files: [] }
        ].map(baseModule => {
          const matchingModule = fetchedModules.find(fm => fm.id === baseModule.id);
          return matchingModule ? matchingModule : baseModule;
        });

        ElMessage.success('题库列表加载成功');
      } else {
        questionBankStore.error = res.msg || '获取题库列表失败';
        ElMessage.warning(questionBankStore.error);
        // 加载失败时重置为默认模块结构
        questionBankStore.moduleList = [
          { id: 1, title: '前端开发', files: [] },
          { id: 2, title: '后端开发', files: [] },
          { id: 3, title: '全栈开发', files: [] }
        ];
      }
    } catch (error) {
      questionBankStore.error = error.response?.data?.msg || error.message || '获取题库列表异常';
      ElMessage.error(questionBankStore.error);
      // 异常时也重置为默认模块结构
      questionBankStore.moduleList = [
        { id: 1, title: '前端开发', files: [] },
        { id: 2, title: '后端开发', files: [] },
        { id: 3, 3: '全栈开发', files: [] }
      ];
    } finally {
      questionBankStore.loading = false;
      console.log('适配后端后的模块列表：', questionBankStore.moduleList);
    }
  },

  /**
   * 上传单个题库文件
   * @param {File} file - 上传的文件
   * @param {Number} moduleId - 所属模块ID
   */
  uploadBankFile: async (file, moduleId) => {
    if (!file || !moduleId) return false;

    questionBankStore.uploadLoading = true;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('moduleId', moduleId);

      // ----------------------------------------------------
      // 后端交互点 2: 上传单个题库文件
      // ----------------------------------------------------
      const response = await goService.post('/question-bank/upload', formData);
      const res = response.data;

      if (res.code === 1) {
        ElMessage.success('文件上传成功');
        await questionBankStore.fetchAllModules(); // 重新加载列表以更新UI
        return true;
      } else {
        questionBankStore.error = res.msg || '文件上传失败';
        ElMessage.error(questionBankStore.error);
        return false;
      }
    } catch (error) {
      questionBankStore.error = error.response?.data?.msg || error.message || '上传异常';
      ElMessage.error(questionBankStore.error);
      return false;
    } finally {
      questionBankStore.uploadLoading = false;
    }
  },

  /**
   * 批量上传题库文件
   * @param {Array<File>} files - 文件数组
   * @param {Number} moduleId - 所属模块ID
   */
  batchUploadFiles: async (files, moduleId) => {
    if (!files || files.length === 0 || !moduleId) return false;

    questionBankStore.batchUploadLoading = true;
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file); // 后端接收多个文件时，通常使用相同的参数名
      });
      formData.append('moduleId', moduleId);

      // ----------------------------------------------------
      // 后端交互点 3: 批量上传题库文件
      // ----------------------------------------------------
      const response = await goService.post('/question-bank/batch-upload', formData);
      const res = response.data;

      if (res.code === 1) {
        ElMessage.success(`成功上传 ${files.length} 个文件`);
        await questionBankStore.fetchAllModules(); // 重新加载列表以更新UI
        return true;
      } else {
        questionBankStore.error = res.msg || '批量上传失败';
        ElMessage.error(questionBankStore.error);
        return false;
      }
    } catch (error) {
      questionBankStore.error = error.response?.data?.msg || error.message || '批量上传异常';
      ElMessage.error(questionBankStore.error);
      return false;
    } finally {
      questionBankStore.batchUploadLoading = false;
    }
  },

  /**
   * 重命名/移动题库文件
   * @param {Number} fileId - 文件ID
   * @param {Object} updateData - { name, moduleId }
   *   - name: 新的文件名（包含后缀）
   *   - moduleId: 新的所属模块ID
   */
  updateBankFile: async (fileId, updateData) => {
    if (!fileId || !updateData) return false;

    questionBankStore.renameLoading = true;
    questionBankStore.detailLoading = true; // 文件详情页面的保存加载状态
    try {
      // ----------------------------------------------------
      // 后端交互点 4: 更新文件信息 (重命名或移动模块)
      // ----------------------------------------------------
      // 注意：您的后端接口 `/question-bank/${fileId}/rename` 似乎是针对重命名。
      // 如果需要同时支持重命名和移动模块，后端接口可能需要更通用或提供额外参数。
      // 我这里假设 `rename` 接口也能处理 `moduleId` 的更新，如果不是，需要调整后端接口或前端调用。
      const response = await goService.put(
		`/question-bank/${fileId}/rename`,
        updateData // 例如 { name: '新的文件名.pdf', moduleId: 2 }
      );
      const res = response.data;

      if (res.code === 1) {
        ElMessage.success('文件信息修改成功');
        await questionBankStore.fetchAllModules(); // 重新加载列表以更新UI
        return true;
      } else {
        questionBankStore.error = res.msg || '修改失败';
        ElMessage.error(questionBankStore.error);
        return false;
      }
    } catch (error) {
      questionBankStore.error = error.response?.data?.msg || error.message || '修改异常';
      ElMessage.error(questionBankStore.error);
      return false;
    } finally {
      questionBankStore.renameLoading = false;
      questionBankStore.detailLoading = false;
    }
  },

  /**
   * 批量删除题库文件
   * @param {Array<Number>} ids - 文件ID数组
   * @param {Number} moduleId - 所属模块ID (用于后端区分，或作为删除的条件)
   */
  batchDeleteFiles: async (ids, moduleId) => {
    if (!ids || ids.length === 0 || !moduleId) return false;

    questionBankStore.deleteLoading = true;
    try {
      // ----------------------------------------------------
      // 后端交互点 5: 批量删除题库文件
      // ----------------------------------------------------
      // DELETE请求通常将数据放在 `data` 字段中
      const response = await goService.delete(`/question-bank/batch-delete`, {
        data: { ids: ids, moduleId: moduleId } // 根据后端接口调整参数名
      });

      const res = response.data;
      if (res.code === 1) {
        ElMessage.success(`成功删除 ${ids.length} 个文件`);
        await questionBankStore.fetchAllModules(); // 重新加载列表以更新UI
        return true;
      } else {
        questionBankStore.error = res.msg || '删除失败';
        ElMessage.error(questionBankStore.error);
        return false;
      }
    } catch (error) {
      questionBankStore.error = error.response?.data?.msg || error.message || '删除异常';
      ElMessage.error(questionBankStore.error);
      return false;
    } finally {
      questionBankStore.deleteLoading = false;
    }
  },

  /**
   * 计算各模块文件总数
   */
  getModuleFileCounts: () => {
    return questionBankStore.moduleList.map(module => ({
      id: module.id,
      title: module.title,
      count: module.files.length
    }));
  },

  /**
   * 计算所有题库文件总数
   */
  getTotalFileCount: () => {
    return questionBankStore.moduleList.reduce((sum, module) => {
      return sum + module.files.length;
    }, 0);
  },

  /**
   * 按模块ID获取文件列表
   * @param {Number} moduleId - 模块ID
   */
  getFilesByModuleId: (moduleId) => {
    const module = questionBankStore.moduleList.find(m => m.id === moduleId);
    return module ? module.files : [];
  },

  /**
   * 获取所有题库文件（扁平列表）
   */
  getAllBankFiles: () => {
    return questionBankStore.moduleList.flatMap(module =>
      module.files.map(file => ({ ...file, moduleId: module.id, moduleTitle: module.title }))
    );
  },

  // --- 弹窗及相关状态管理方法 ---

  /**
   * 打开上传弹窗
   * @param {Number} moduleId - 模块ID
   */
  openUploadDialog: (moduleId) => {
    questionBankStore.currentUploadModuleId = moduleId;
    questionBankStore.uploadDialogVisible = true;
    questionBankStore.uploadFileList = [];
    questionBankStore.uploadLoading = false;
  },

  /**
   * 关闭上传弹窗
   */
  closeUploadDialog: () => {
    questionBankStore.uploadDialogVisible = false;
    questionBankStore.uploadFileList = [];
    questionBankStore.uploadLoading = false;
  },

  /**
   * 处理单个文件选择变化（el-upload on-change）
   * @param {Object} file - el-upload 包装的文件对象
   */
  handleFileChange: (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过100MB');
      questionBankStore.uploadFileList = []; // 清空，不添加大文件
      return;
    }
    questionBankStore.uploadFileList = [file]; // 只允许单个文件
  },

  /**
   * 移除单个选中的上传文件（el-upload on-remove）
   */
  handleFileRemove: () => {
    questionBankStore.uploadFileList = [];
  },

  /**
   * 提交单个文件上传
   */
  handleUploadSubmit: async () => {
    if (questionBankStore.uploadFileList.length === 0) {
      ElMessage.warning('请选择要上传的文件');
      return;
    }
    const success = await questionBankStore.uploadBankFile(
      questionBankStore.uploadFileList[0].raw, // 获取原始文件对象
      questionBankStore.currentUploadModuleId
    );
    if (success) {
      questionBankStore.closeUploadDialog();
    }
  },

  /**
   * 打开重命名弹窗
   * @param {Number} moduleId - 模块ID
   */
  openRenameDialog: (moduleId) => {
    const targetModule = questionBankStore.moduleList.find(module => module.id === moduleId);
    if (!targetModule) {
      ElMessage.warning('未找到该模块');
      return;
    }
    if (targetModule.files.length === 0) {
      ElMessage.warning('该模块暂无文件可修改');
      return;
    }

    questionBankStore.currentUploadModuleId = moduleId;
    questionBankStore.currentModuleFiles = [...targetModule.files]; // 复制一份文件列表
    questionBankStore.fileSelectValue = 0; // 重置选中值
    questionBankStore.selectedFile = null;
    questionBankStore.renameForm = { newName: '' };
    questionBankStore.fileSuffix = '';
    questionBankStore.renameDialogVisible = true;
    questionBankStore.renameLoading = false;
  },

  /**
   * 关闭重命名弹窗
   */
  closeRenameDialog: () => {
    questionBankStore.renameDialogVisible = false;
    questionBankStore.resetRenameStep(); // 重置重命名相关的状态
  },

  /**
   * 重置重命名步骤中的数据
   */
  resetRenameStep: () => {
    questionBankStore.selectedFile = null;
    questionBankStore.renameForm = { newName: '' };
    questionBankStore.fileSuffix = '';
    questionBankStore.fileSelectValue = 0;
  },

  /**
   * 确认选择要重命名的文件 (重命名弹窗的下一步)
   */
  confirmSelectFile: () => {
    const fileId = Number(questionBankStore.fileSelectValue);
    if (!fileId) {
      ElMessage.warning('请选择有效的文件');
      return;
    }

    const file = questionBankStore.currentModuleFiles.find(f => f.id === fileId);
    if (!file) {
      ElMessage.warning('未找到该文件');
      return;
    }

    if (file.name) {
      const lastDotIndex = file.name.lastIndexOf('.');
      if (lastDotIndex > 0) {
        questionBankStore.fileSuffix = file.name.slice(lastDotIndex); // 包含点号的后缀
        questionBankStore.renameForm.newName = file.name.slice(0, lastDotIndex); // 不包含后缀的文件名
      } else {
        questionBankStore.fileSuffix = '';
        questionBankStore.renameForm.newName = file.name;
      }
    }
    questionBankStore.selectedFile = file; // 设置选中的文件
  },

  /**
   * 提交重命名请求
   */
  handleRenameSubmit: async () => {
    if (!questionBankStore.selectedFile) {
      ElMessage.warning('请先选择要修改的文件');
      return;
    }
    if (!questionBankStore.renameForm.newName || questionBankStore.renameForm.newName.trim() === '') {
      ElMessage.warning('请输入有效的新文件名');
      return;
    }

    const newNameTrimmed = questionBankStore.renameForm.newName.trim();
    const fullNewName = newNameTrimmed + questionBankStore.fileSuffix; // 拼接完整新文件名

    if (fullNewName === questionBankStore.selectedFile.name) {
      ElMessage.info('新文件名与原文件名一致，无需修改');
      return;
    }

    const success = await questionBankStore.updateBankFile(
      questionBankStore.selectedFile.id,
      {
        name: fullNewName,
        moduleId: questionBankStore.currentUploadModuleId // 模块ID不变，传递当前模块ID
      }
    );
    if (success) {
      questionBankStore.closeRenameDialog();
    }
  },

  /**
   * 打开文件详情弹窗
   * @param {Object} file - 文件对象
   * @param {Number} moduleId - 模块ID
   */
  openFileDetailDialog: async (file, moduleId) => {
    questionBankStore.currentFile = { ...file }; // 复制文件数据，避免直接修改props
    questionBankStore.fileDetailForm = {
      name: file.name,
      moduleId: moduleId
    };
    // 初始化编辑状态
    questionBankStore.isEditingName = false;
    questionBankStore.isEditingModule = false;
    questionBankStore.fileDetailVisible = true;
    questionBankStore.detailLoading = false;

    // =========================================================
    // >>> 后端交互点 6: 获取题库文件的题目和答案内容 <<<
    // ---------------------------------------------------------
    questionBankStore.currentFileQuestionsAndAnswers = []; // 清空之前的题目和答案
    questionBankStore.questionsLoading = true;             // 开始加载题目和答案

    try {
      // 假设您的后端提供一个接口，根据 fileId 获取其解析后的题目和答案
      const response = await goService.get(`/question-bank/${file.id}/questions-answers`);
      const res = response.data;

      if (res.code === 1) {
        // 假设后端返回的数据结构是 `{ code: 1, msg: '...', data: [{ question: '...', answer: '...' }] }`
        questionBankStore.currentFileQuestionsAndAnswers = res.data || [];
        ElMessage.success('题库内容加载成功');
      } else {
        questionBankStore.error = res.msg || '获取题库内容失败';
        ElMessage.warning(questionBankStore.error);
        questionBankStore.currentFileQuestionsAndAnswers = []; // 加载失败时清空
      }
    } catch (error) {
      questionBankStore.error = error.response?.data?.msg || error.message || '获取题库内容异常';
      ElMessage.error(questionBankStore.error);
      questionBankStore.currentFileQuestionsAndAnswers = []; // 异常时清空
    } finally {
      questionBankStore.questionsLoading = false; // 结束加载题目和答案
    }
    // =========================================================
  },

  /**
   * 关闭文件详情弹窗
   */
  closeFileDetailDialog: () => {
    questionBankStore.fileDetailVisible = false;
    questionBankStore.resetFileDetail(); // 重置文件详情相关状态
  },

  /**
   * 重置文件详情弹窗状态
   */
  resetFileDetail: () => {
    questionBankStore.currentFile = null;
    questionBankStore.fileDetailForm = { name: '', moduleId: 0 };
    questionBankStore.isEditingName = false;
    questionBankStore.isEditingModule = false;
    questionBankStore.detailLoading = false;
    questionBankStore.currentFileQuestionsAndAnswers = []; // 清空题目和答案
    questionBankStore.questionsLoading = false;             // 重置加载状态
    questionBankStore.searchKeyword = '';
  },

  /**
   * 切换文件名编辑状态
   */
  toggleEditName: () => {
    if (questionBankStore.isEditingName) {
      // 取消编辑时，恢复文件名到 currentFile 中的原始值
      questionBankStore.fileDetailForm.name = questionBankStore.currentFile.name;
    }
    questionBankStore.isEditingName = !questionBankStore.isEditingName;
  },

  /**
   * 切换模块编辑状态
   */
  toggleEditModule: () => {
    if (questionBankStore.isEditingModule) {
      // 取消编辑时，恢复模块ID到 currentFile 实际所属的模块ID
      questionBankStore.fileDetailForm.moduleId = questionBankStore.currentFile.moduleId;
    }
    questionBankStore.isEditingModule = !questionBankStore.isEditingModule;
  },

  /**
   * 保存文件详情修改 (重命名或移动模块)
   */
  saveFileDetail: async () => {
    if (!questionBankStore.currentFile) return;

    if (questionBankStore.isEditingName && (!questionBankStore.fileDetailForm.name || questionBankStore.fileDetailForm.name.trim() === '')) {
      ElMessage.warning('文件名不能为空');
      return;
    }

    // 构造要发送到后端的数据
    const updateData = {};
    let hasChanges = false;

    // 检查文件名是否改变
    const newNameTrimmed = questionBankStore.fileDetailForm.name.trim();
    if (questionBankStore.isEditingName && newNameTrimmed !== questionBankStore.currentFile.name) {
      updateData.name = newNameTrimmed; // 后端可能需要完整文件名，这里假设前端UI不处理后缀，如果需要，要在这里加上
      hasChanges = true;
    } else {
      updateData.name = questionBankStore.currentFile.name; // 未修改时也传入原文件名
    }

    // 检查模块ID是否改变
    if (questionBankStore.isEditingModule && questionBankStore.fileDetailForm.moduleId !== questionBankStore.currentFile.moduleId) {
      updateData.moduleId = questionBankStore.fileDetailForm.moduleId;
      hasChanges = true;
    } else {
      updateData.moduleId = questionBankStore.currentFile.moduleId; // 未修改时也传入原模块ID
    }

    if (!hasChanges) {
      ElMessage.info('未做任何修改');
      return;
    }

    // 调用通用的文件更新接口
    const success = await questionBankStore.updateBankFile(questionBankStore.currentFile.id, updateData);
    if (success) {
      // 保存成功后，更新 currentFile 的显示值
      if (updateData.name) questionBankStore.currentFile.name = updateData.name;
      if (updateData.moduleId) questionBankStore.currentFile.moduleId = updateData.moduleId;

      questionBankStore.closeFileDetailDialog(); // 关闭弹窗
    }
  },

  /**
   * 下载题库文件
   * @param {Number} fileId - 文件ID
   */
  handleDownload: (fileId) => {
    const file = questionBankStore.getAllBankFiles().find(f => f.id === fileId);
    if (file && file.url) {
      // ----------------------------------------------------
      // 后端交互点 7：文件下载通常直接使用 Go 返回的对象地址。
      // ----------------------------------------------------
      window.open(file.url, '_blank');
    } else {
      ElMessage.warning('文件下载链接不存在');
    }
  },

  /**
   * 打开批量上传弹窗
   * @param {Number} moduleId - 模块ID
   */
  openBatchUploadDialog: (moduleId) => {
    questionBankStore.currentUploadModuleId = moduleId;
    questionBankStore.batchUploadDialogVisible = true;
    questionBankStore.batchUploadFileList = [];
    questionBankStore.batchUploadLoading = false;
  },

  /**
   * 关闭批量上传弹窗
   */
  closeBatchUploadDialog: () => {
    questionBankStore.batchUploadDialogVisible = false;
    questionBankStore.batchUploadFileList = [];
    questionBankStore.batchUploadLoading = false;
  },

  /**
   * 处理批量文件选择变化 (el-upload on-change)
   * @param {Object} file - el-upload 包装的文件对象
   * @param {Array<Object>} fileList - 当前文件列表
   */
  handleBatchFileChange: (file, fileList) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const maxCount = 10;

    // 过滤掉超大文件
    const filteredList = fileList.filter(f => {
      if (f.size > maxSize) {
        ElMessage.error(`${f.name} 大小超过100MB，已自动移除`);
        return false;
      }
      return true;
    });

    // 限制文件数量
    if (filteredList.length > maxCount) {
      ElMessage.error(`最多只能上传${maxCount}个文件，已自动截取前${maxCount}个`);
      questionBankStore.batchUploadFileList = filteredList.slice(0, maxCount);
    } else {
      questionBankStore.batchUploadFileList = filteredList;
    }
  },

  /**
   * 移除批量上传文件 (el-upload on-remove)
   */
  handleBatchFileRemove: (file, fileList) => {
    questionBankStore.batchUploadFileList = fileList;
  },

  /**
   * 提交批量上传文件
   */
  handleBatchUploadSubmit: async () => {
    if (questionBankStore.batchUploadFileList.length === 0) {
      ElMessage.warning('请选择要上传的文件');
      return;
    }
    const filesToUpload = questionBankStore.batchUploadFileList.map(f => f.raw); // 获取原始文件对象数组
    const success = await questionBankStore.batchUploadFiles(
      filesToUpload,
      questionBankStore.currentUploadModuleId
    );
    if (success) {
      questionBankStore.closeBatchUploadDialog();
    }
  },

  /**
   * 打开批量删除弹窗
   * @param {Number} moduleId - 模块ID
   */
  openBatchDeleteDialog: (moduleId) => {
    const targetModule = questionBankStore.moduleList.find(module => module.id === moduleId);
    if (!targetModule || targetModule.files.length === 0) {
      ElMessage.warning('该模块暂无文件可删除');
      return;
    }
    questionBankStore.currentUploadModuleId = moduleId;
    questionBankStore.deleteFileList = [...targetModule.files]; // 复制文件列表
    questionBankStore.selectedFileIds = []; // 清空选中项
    questionBankStore.selectAllFiles = false; // 取消全选
    questionBankStore.batchDeleteDialogVisible = true;
    questionBankStore.deleteLoading = false;
  },

  /**
   * 关闭批量删除弹窗 (选择文件界面)
   */
  closeBatchDeleteDialog: () => {
    questionBankStore.batchDeleteDialogVisible = false;
    questionBankStore.selectedFileIds = [];
    questionBankStore.selectAllFiles = false;
  },

  /**
   * 批量删除弹窗 - 全选/取消全选
   */
  handleSelectAllInDialog: () => {
    if (questionBankStore.selectAllFiles) {
      questionBankStore.selectedFileIds = questionBankStore.deleteFileList.map(f => f.id);
    } else {
      questionBankStore.selectedFileIds = [];
    }
  },

  /**
   * 显示删除确认框
   */
  showDeleteConfirm: () => {
    if (questionBankStore.selectedFileIds.length === 0) {
      ElMessage.warning('请选择要删除的文件');
      return;
    }
    questionBankStore.batchDeleteDialogVisible = false; // 关闭文件选择弹窗
    questionBankStore.deleteConfirmDialogVisible = true; // 打开确认弹窗
  },

  /**
   * 确认批量删除
   */
  handleDeleteConfirm: async () => {
    if (questionBankStore.selectedFileIds.length === 0) {
      ElMessage.warning('请选择要删除的文件');
      questionBankStore.deleteConfirmDialogVisible = false;
      return;
    }
    const success = await questionBankStore.batchDeleteFiles(
      questionBankStore.selectedFileIds,
      questionBankStore.currentUploadModuleId
    );
    if (success) {
      questionBankStore.deleteConfirmDialogVisible = false; // 关闭确认弹窗
      questionBankStore.selectedFileIds = []; // 清空选中项
      questionBankStore.selectAllFiles = false; // 取消全选
    }
  },

  //筛选后的题目和答案
  filteredQuestionsAndAnswers: computed(() => {
    const keyword = questionBankStore.searchKeyword.toLowerCase().trim(); // 获取关键词并转小写、去空格
    if (!keyword) {
      return questionBankStore.currentFileQuestionsAndAnswers; // 如果关键词为空，返回所有题目
    }
    return questionBankStore.currentFileQuestionsAndAnswers.filter(item => {
      const questionText = item.question ? item.question.toLowerCase() : '';
      const answerText = item.answer ? item.answer.toLowerCase() : '';
      // 在题目或答案中进行模糊匹配
      return questionText.includes(keyword) || answerText.includes(keyword);
    });
  }),



  /**
   * 重置所有题库状态
   */
  resetBankState: () => {
    questionBankStore.moduleList = [
      { id: 1, title: '前端开发', files: [] },
      { id: 2, title: '后端开发', files: [] },
      { id: 3, title: '全栈开发', files: [] }
    ];
    questionBankStore.selectedBankFile = null;
    // questionBankStore.selectedModuleId = null; // 已建议废弃
    questionBankStore.loading = false;
    questionBankStore.uploadLoading = false;
    questionBankStore.renameLoading = false;
    questionBankStore.error = null;
    questionBankStore.uploadDialogVisible = false;
    questionBankStore.uploadFileList = [];
    questionBankStore.currentUploadModuleId = 0;
    questionBankStore.renameDialogVisible = false;
    questionBankStore.currentModuleFiles = [];
    questionBankStore.fileSelectValue = 0;
    questionBankStore.selectedFile = null;
    questionBankStore.renameForm = { newName: '' };
    questionBankStore.fileSuffix = '';
    questionBankStore.fileDetailVisible = false;
    questionBankStore.currentFile = null;
    questionBankStore.fileDetailForm = { name: '', moduleId: 0 };
    questionBankStore.isEditingName = false;
    questionBankStore.isEditingModule = false;
    questionBankStore.detailLoading = false;
    questionBankStore.batchUploadDialogVisible = false;
    questionBankStore.batchUploadFileList = [];
    questionBankStore.batchUploadLoading = false;
    questionBankStore.batchDeleteDialogVisible = false;
    questionBankStore.deleteFileList = [];
    questionBankStore.selectedFileIds = [];
    questionBankStore.selectAllFiles = false;
    questionBankStore.deleteConfirmDialogVisible = false;
    questionBankStore.deleteLoading = false;

    // =========================================================
    // >>> 重置新增状态 <<<
    // =========================================================
    questionBankStore.currentFileQuestionsAndAnswers = [];
    questionBankStore.questionsLoading = false;
    // =========================================================

    localStorage.removeItem('selectedBankFile');
  }
});
