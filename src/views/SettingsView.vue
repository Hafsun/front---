<template>
  <div class="settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      <div class="settings-content">
        <p class="description">在这里您可以自定义系统各项参数，以获得更个性化的使用体验。</p>

        <el-form :model="settingsForm" label-width="150px" class="settings-form">
          <el-divider content-position="left">界面设置</el-divider>
          <el-form-item label="系统主题颜色">
            <el-radio-group v-model="settingsForm.theme" @change="handleThemeChange">
              <el-radio label="default">默认 (蓝紫)</el-radio>
              <el-radio label="green">活力绿</el-radio>
              <el-radio label="purple">优雅紫</el-radio>
              <el-radio label="orange">阳光橙</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="语言">
            <el-select v-model="settingsForm.language" placeholder="选择语言" class="full-width">
              <el-option label="简体中文" value="zh-CN"></el-option>
              <el-option label="English" value="en"></el-option>
            </el-select>
          </el-form-item>

          <el-divider content-position="left">通知设置</el-divider>
          <el-form-item label="接收系统通知">
            <el-switch v-model="settingsForm.receiveNotifications"></el-switch>
          </el-form-item>
          <el-form-item label="接收邮件通知">
            <el-switch v-model="settingsForm.receiveEmailNotifications"></el-switch>
          </el-form-item>

          <el-divider content-position="left">隐私设置</el-divider>
          <el-form-item label="允许数据分析">
            <el-switch v-model="settingsForm.allowDataAnalysis"></el-switch>
            <p class="tip">（帮助我们改进产品，您的数据将被匿名化处理）</p>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存配置</el-button>
            <el-button @click="resetSettings">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useThemeStore } from '../stores/theme'; // 导入主题 store

const themeStore = useThemeStore();

const settingsForm = reactive({
  theme: themeStore.currentTheme, // 从主题 store 获取当前主题
  language: 'zh-CN',
  receiveNotifications: true,
  receiveEmailNotifications: false,
  allowDataAnalysis: true,
});

onMounted(() => {
  // 从 localStorage 或其他地方加载用户保存的设置
  const savedSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
  Object.assign(settingsForm, savedSettings);
  // 确保主题设置与 store 同步
  settingsForm.theme = themeStore.currentTheme;
});

const handleThemeChange = (newTheme) => {
  themeStore.setTheme(newTheme);
};

const saveSettings = () => {
  localStorage.setItem('userSettings', JSON.stringify(settingsForm));
  ElMessage.success('系统配置保存成功！');
  console.log('保存的系统配置:', settingsForm);
};

const resetSettings = () => {
  settingsForm.theme = 'default';
  settingsForm.language = 'zh-CN';
  settingsForm.receiveNotifications = true;
  settingsForm.receiveEmailNotifications = false;
  settingsForm.allowDataAnalysis = true;
  themeStore.setTheme('default'); // 重置主题
  localStorage.removeItem('userSettings'); // 清除保存的设置
  ElMessage.info('系统配置已重置为默认值。');
};
</script>

<style scoped lang="scss">
// 注意：这里使用 var() 来引用 CSS 变量
// 如果您希望这些样式也随主题变化，需要确保它们引用的是 CSS 变量
// 而不是 SCSS 变量。
.settings-container {
  padding: var(--spacing-lg);
  background-color: var(--background-color);
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.box-card {
  width: 100%;
  max-width: 1000px;
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-lg);
}

.card-header {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
}

.settings-content {
  padding: var(--spacing-md);
  color: var(--text-color-secondary);
}

.description {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  color: var(--text-color);
}

.settings-form {
  margin-top: var(--spacing-lg);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.full-width {
  width: 100%;
}

.tip {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  margin-top: var(--spacing-xs);
  line-height: 1.4;
}

.el-divider {
  margin: var(--spacing-xl) 0;
  :deep(.el-divider__text) {
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-semibold);
    color: var(--text-color);
  }
}

.el-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.el-form-item__content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

// 覆盖 Element Plus 按钮的背景色，使其随主题变化
:deep(.el-button--primary) {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark-color) 100%) !important;
  border: none !important;
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

@media (max-width: $screen-md) {
  .settings-form {
    padding: 0 var(--spacing-md);
  }
  .el-form-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .el-form-item__label {
    margin-bottom: var(--spacing-xs);
  }
  .full-width, .el-select, .el-textarea {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
