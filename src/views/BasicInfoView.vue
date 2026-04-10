<template>
  <div class="personal-info-container">
    <el-card class="box-card">
      <div class="card-header">
        <span>个人信息</span>
      </div>
      <div class="main-content-wrapper" v-loading="isLoadingUserInfo">
        <!-- 左侧列：头像、用户名和基本信息表单 -->
        <div class="left-column">
          <div class="top-profile-section">
            <div class="avatar-display">
              <img :src="userStore.userInfo?.pictureUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                alt="User Avatar" class="user-avatar" />
              <div class="username-display">
                <span class="username-text">{{ userStore.userInfo?.username || 'N/A' }}</span>
                <div class="avatar-actions">
                  <el-button type="info" plain size="small" @click="viewAvatar">查看头像</el-button>
                  <el-button type="primary" size="small" @click="triggerAvatarUpload" :loading="isUploadingAvatar">
                    {{ isUploadingAvatar ? '上传中...' : '修改头像' }}
                  </el-button>
                  <input 
                    type="file" 
                    ref="avatarFileInput" 
                    @change="handleAvatarFileChange" 
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp"
                    style="display: none;" 
                  />
                </div>
              </div>
            </div>
          </div>

          <el-divider content-position="left">基本资料</el-divider>
          <div class="basic-info-form-section">
            <el-form label-width="80px" class="info-form">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="姓名">
                    <el-input v-model="editableUserInfo.fullName"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="性别">
                    <el-select v-model="editableUserInfo.gender" placeholder="请选择性别" style="width: 100%;">
                      <el-option label="男" value="男"></el-option>
                      <el-option label="女" value="女"></el-option>
                      <el-option label="保密" value="保密"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="专业">
                    <el-input v-model="editableUserInfo.major"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱">
                    <el-input v-model="editableUserInfo.email"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="电话">
                    <el-input v-model="editableUserInfo.phone"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <!-- 占位，保持布局对齐 -->
                </el-col>
              </el-row>
              <el-form-item class="save-button-item">
                <el-button type="primary" @click="savePersonalInfo" :loading="isLoading" class="save-button">
                  {{ isLoading ? '保存中...' : '保存信息' }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 右侧列：面试统计和账户概览 (上下结构) -->
        <div class="right-column">
          <el-card class="stats-card">
            <div class="card-header-small">
              <span>面试统计</span>
            </div>
            <div class="stats-content">
              <div class="stat-item">
                <span class="stat-label">面试次数</span>
                <span class="stat-value">{{ userStore.userInfo?.interviewCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">综合分数</span>
                <span class="stat-value">{{ userStore.userInfo?.comprehensiveScore || 0 }}</span>
              </div>
            </div>
          </el-card>

          <el-card class="extra-info-card">
            <div class="card-header-small">
              <span>账户概览</span>
            </div>
            <div class="extra-info-content">
              <p>在这里管理您的账户设置和偏好。</p>
              <div class="account-actions">
                <el-button type="text" @click="$router.push('/home/account/change-password')">修改密码</el-button>
                <el-button type="text" @click="$router.push('/home/account/change-security')">修改密保</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 查看头像的对话框 -->
    <el-dialog v-model="dialogVisible" title="用户头像" width="30%">
      <img :src="userStore.userInfo?.pictureUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" alt="User Avatar"
        style="width: 100%; display: block;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, watch, ref, onMounted } from 'vue';
import { ElMessage, ElDialog } from 'element-plus';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const isLoading = ref(false);
const isUploadingAvatar = ref(false);
const dialogVisible = ref(false);
const isLoadingUserInfo = ref(false);

// 支持的图片格式配置
const SUPPORTED_IMAGE_TYPES = {
  'image/jpeg': { ext: 'JPEG', maxSize: 10 },
  'image/jpg': { ext: 'JPG', maxSize: 10 },
  'image/png': { ext: 'PNG', maxSize: 10 },
  'image/gif': { ext: 'GIF', maxSize: 5 },
  'image/bmp': { ext: 'BMP', maxSize: 15 },
  'image/webp': { ext: 'WebP', maxSize: 8 }
};

// 用于表单编辑的响应式数据
const editableUserInfo = reactive({
  fullName: '',
  gender: '',
  major: '',
  email: '',
  phone: '',
});

const avatarFileInput = ref(null);

// 监听用户信息变化
watch(() => userStore.userInfo, (newInfo) => {
  if (newInfo) {
    editableUserInfo.fullName = newInfo.name || '';
    editableUserInfo.gender = newInfo.sex || '';
    editableUserInfo.major = newInfo.major || '';
    editableUserInfo.email = newInfo.email || '';
    editableUserInfo.phone = newInfo.phone || '';
  }
}, { immediate: true, deep: true });

// 保存个人信息
const savePersonalInfo = async () => {
  isLoading.value = true;
  try {
    const updatedFields = {
      name: editableUserInfo.fullName,
      sex: editableUserInfo.gender,
      major: editableUserInfo.major,
      email: editableUserInfo.email,
      phone: editableUserInfo.phone,
    };
    await userStore.updateBasicInfo(updatedFields);
    ElMessage.success('个人信息保存成功！');
  } catch (error) {
    ElMessage.error(error.message || '个人信息保存失败，请稍后重试！');
    console.error('保存个人信息失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 触发头像文件选择
const triggerAvatarUpload = () => {
  avatarFileInput.value.click();
};

// 验证图片文件
const validateImageFile = (file) => {
  console.log('🔍 开始验证文件:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toLocaleString()
  });

  // 检查文件类型
  if (!SUPPORTED_IMAGE_TYPES[file.type]) {
    const supportedFormats = Object.values(SUPPORTED_IMAGE_TYPES).map(t => t.ext).join(', ');
    throw new Error(`不支持的图片格式！支持的格式：${supportedFormats}`);
  }

  // 检查文件大小
  const maxSizeMB = SUPPORTED_IMAGE_TYPES[file.type].maxSize;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`${SUPPORTED_IMAGE_TYPES[file.type].ext} 格式图片大小不能超过 ${maxSizeMB}MB！`);
  }

  // 检查文件名
  if (!file.name || file.name.length === 0) {
    throw new Error('文件名不能为空！');
  }

  console.log('✅ 文件验证通过');
  return true;
};

// 处理头像文件选择和上传
const handleAvatarFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.log('❌ 没有选择文件');
    return;
  }

  try {
    // 验证文件
    validateImageFile(file);

    console.log('🚀 开始上传头像...');
    isUploadingAvatar.value = true;

    // 调用上传方法
    const success = await userStore.uploadUserAvatar(file);
    
    if (success) {
      ElMessage.success('头像上传成功！');
      console.log('✅ 头像上传成功，用户信息已更新');
    }
  } catch (error) {
    console.error('❌ 头像上传失败:', error);
    ElMessage.error(error.message || '头像上传失败，请稍后重试！');
  } finally {
    isUploadingAvatar.value = false;
    // 清空文件输入
    event.target.value = '';
  }
};

// 查看头像
const viewAvatar = () => {
  dialogVisible.value = true;
};

// 组件挂载时获取用户信息
onMounted(async () => {
  try {
    isLoadingUserInfo.value = true;
    await userStore.fetchUserInfo();
    console.log('用户信息获取成功:', userStore.userInfo);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败，请刷新页面重试');
  } finally {
    isLoadingUserInfo.value = false;
  }
});
</script>

<style scoped lang="scss">
@import "../assets/styles/variables.scss";

// Define new modern theme variables (can be moved to variables.scss)
$primary-modern: #6366F1; // A modern, slightly muted purple/blue
$accent-modern: #10B981; // A vibrant green for success/highlights
$background-light: #F9FAFB; // Light grey background
$card-bg-light: #FFFFFF; // White cards
$text-dark: #1F2937; // Dark grey for main text
$text-medium: #6B7280; // Medium grey for secondary text
$border-light: #E5E7EB; // Light border color
$shadow-subtle: 0 4px 12px rgba(0, 0, 0, 0.06); // More subtle shadow
$border-radius-card: 12px; // Softer card corners
$transition-ease: all 0.3s ease-in-out;

.personal-info-container {
  padding: $spacing-md;
  background-color: $background-light; // Use new background color
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  overflow-y: auto;
}

.box-card {
  width: 100%;
  max-width: 960px; // Slightly wider for better two-column balance
  box-shadow: $shadow-subtle; // Use new subtle shadow
  border-radius: $border-radius-card; // Use new border radius
  background-color: $card-bg-light;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.card-header {
  font-size: $font-size-large;
  font-weight: $font-weight-semibold;
  color: $text-dark; // Use new text color
  padding: 10px 10px;
  border-bottom: 1px solid $border-light; // Use new border color
  background-color: lighten($background-light, 2%); // Slightly darker header
}

.main-content-wrapper {
  display: flex; // Use flexbox for main columns
  gap: $spacing-lg; // Gap between columns
  padding: 10px;
  flex: 1;
  overflow-y: auto;
  align-items: stretch; // Crucial for equal height columns

  @media (max-width: 992px) {
    flex-direction: column; // Stack columns on smaller screens
    gap: $spacing-md;
    padding: $spacing-md;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: $spacing-md; // Internal spacing for elements within columns
  flex: 1; // Allow columns to grow and take equal space
  min-width: 0; // Allow content to shrink
}

.left-column {
  flex: 2; // Left column takes more space
}

.right-column {
  flex: 1; // Right column takes less space
}

.top-profile-section {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border-light;
}

.avatar-display {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid $primary-modern; // Use new primary color
  transition: $transition-ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 0 5px rgba($primary-modern, 0.2); // Subtle hover effect
  }
}

.username-display {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.username-text {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-dark;
  margin-bottom: $spacing-xs;
}

.avatar-actions {
  display: flex;
  gap: $spacing-xs;

  .el-button {
    padding: 6px 12px; // Slightly more padding for buttons
    font-size: $font-size-sm;
    border-radius: $border-radius-sm;
    transition: $transition-ease;

    &.el-button--info.is-plain {
      color: $text-medium;
      border-color: $border-light;
      background-color: transparent;

      &:hover {
        color: $primary-modern;
        border-color: $primary-modern;
        background-color: lighten($primary-modern, 40%);
      }
    }

    &.el-button--primary {
      background-color: $primary-modern;
      border-color: $primary-modern;

      &:hover {
        background-color: darken($primary-modern, 8%);
        border-color: darken($primary-modern, 8%);
        box-shadow: 0 2px 8px rgba($primary-modern, 0.3);
      }
    }
  }
}

.el-divider {
  margin: $spacing-md 0;

  .el-divider__text {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-dark;
  }
}

.basic-info-form-section {
  padding: $spacing-md; // Keep some padding for content
  background-color: $card-bg-light;
  border-radius: $border-radius-card;
  box-shadow: $shadow-subtle;
  flex: 1; // Allow form section to fill available height in left column
}

.info-form {
  .el-form-item {
    margin-bottom: $spacing-sm; // Slightly more space for form items

    .el-input,
    .el-select {
      .el-input__inner {
        border-radius: $border-radius-sm;
        padding: 0.6rem 0.8rem;
        font-size: $font-size-base;
        border: 1px solid $border-light;

        &:focus {
          border-color: $primary-modern;
          box-shadow: 0 0 0 2px rgba($primary-modern, 0.2);
        }
      }
    }
  }

  .save-button-item {
    margin-top: $spacing-md;
    text-align: right;
  }

  .save-button {
    width: auto;
    padding: 8px 20px;
    background-color: $primary-modern;
    border-color: $primary-modern;
    border-radius: $border-radius-sm;
    transition: $transition-ease;

    &:hover {
      background-color: darken($primary-modern, 8%);
      border-color: darken($primary-modern, 8%);
      box-shadow: 0 2px 8px rgba($primary-modern, 0.3);
    }
  }
}

.stats-card,
.extra-info-card {
  box-shadow: $shadow-subtle;
  border-radius: $border-radius-card;
  background-color: $card-bg-light;
  height: fit-content; // Allow cards to adapt to content
  transition: $transition-ease;

  &:hover {
    transform: translateY(-3px); // Subtle lift effect
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
}

.card-header-small {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-dark;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $border-light;
  background-color: lighten($background-light, 1%);
}

.stats-content {
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-xs 0;
  border-bottom: 1px dashed $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.stat-label {
  font-size: $font-size-sm;
  color: $text-medium;
}

.stat-value {
  font-size: $font-size-large;
  font-weight: $font-weight-bold;
  color: $primary-modern; // Use new primary color
}

.extra-info-content {
  padding: $spacing-md;

  p {
    font-size: $font-size-base;
    color: $text-medium;
    margin-bottom: $spacing-md;
  }

  .account-actions {
    display: flex;
    gap: $spacing-sm;

    .el-button--text {
      color: $primary-modern;
      font-weight: $font-weight-medium;
      transition: $transition-ease;

      &:hover {
        text-decoration: underline;
        color: darken($primary-modern, 10%);
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .personal-info-container {
    padding: $spacing-sm;
  }

  .box-card {
    min-height: auto;
  }

  .main-content-wrapper {
    padding: $spacing-md;
  }

  .top-profile-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-display {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .username-display {
    align-items: flex-start;
    flex: 1;
  }

  .avatar-actions {
    width: 100%;
    justify-content: flex-start;
    margin-top: $spacing-sm;
  }

  .info-form {
    .el-row {
      flex-direction: column;

      .el-col {
        width: 100%;
      }
    }
  }

  .save-button-item {
    text-align: center;
  }

  .save-button {
    width: 100%;
  }
}
</style>