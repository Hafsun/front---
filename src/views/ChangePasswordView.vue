<template>
  <div class="change-password-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>更改密码</span>
        </div>
      </template>
      <div class="content-wrapper">
        <div class="form-section">
          <p class="description">您可以在这里修改您的登录密码。请确保输入的信息准确无误。</p>
          <el-form :model="passwordForm" status-icon :rules="rules" ref="passwordFormRef" label-width="120px" class="password-form">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input type="password" v-model="passwordForm.oldPassword" autocomplete="off" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input type="password" v-model="passwordForm.newPassword" autocomplete="off" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input type="password" v-model="passwordForm.confirmPassword" autocomplete="off" show-password></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="isLoading" class="submit-button">
                {{ isLoading ? '提交中...' : '提交' }}
              </el-button>
              <el-button @click="resetForm" class="reset-button">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="icon-section">
          <img src="/placeholder.svg?height=150&width=150&text=SecureLock" alt="Secure Lock Icon" class="lock-icon" />
          <p class="icon-tip">
            <span class="tip-title">账户安全提示</span>
            <br />
            定期更换密码，使用强密码组合，保护您的账户安全。
            <br />
            请勿将密码告知他人。
          </p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { changePassword } from '@/api/user';
import { useUserStore } from '@/stores/user'; // 导入 Pinia Store

const userStore = useUserStore();
const passwordFormRef = ref(null);
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const isLoading = ref(false); // 添加加载状态

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'));
  } else {
    if (passwordForm.confirmPassword !== '') {
      passwordFormRef.value.validateField('confirmPassword');
    }
    callback();
  }
};
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const rules = reactive({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
    { max: 20, message: '密码长度不能超过20位', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/, message: '密码需包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' },
  ],
});

const submitForm = async () => {
  try {
    await passwordFormRef.value.validate(); // 使用 await 确保验证完成
    isLoading.value = true; // 开始加载
    // 调用修改密码接口，发送用户名、旧密码、新密码
    const res = await changePassword({
      username: userStore.userInfo.username, // 从 Pinia store 获取当前用户名
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
    if (res.data.code === 1) {
      ElMessage.success('密码修改成功！');
      resetForm();
    } else {
      ElMessage.error(res.data.msg || '密码修改失败，请稍后重试！');
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.msg) {
      ElMessage.error(err.response.data.msg);
    } else if (err.errors) { // Element Plus 验证失败会返回 errors 数组
      ElMessage.error('请检查输入项！');
    } else {
      ElMessage.error('密码修改失败，请稍后重试！');
      console.error('密码修改失败:', err);
    }
  } finally {
    isLoading.value = false; // 结束加载
  }
};

const resetForm = () => {
  passwordFormRef.value.resetFields();
};
</script>

<style scoped lang="scss">
@import "../assets/styles/variables.scss";

.change-password-container {
  padding: $spacing-lg;
  background-color: $background-color;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; // 顶部对齐
  box-sizing: border-box;
}

.box-card {
  width: 100%;
  max-width: 1000px; // 增加最大宽度以容纳两列布局
  box-shadow: $shadow-prominent; // 更突出的阴影
  border-radius: $border-radius-lg;
  background-color: white;
  overflow: hidden; // 确保内容不溢出圆角
}

.card-header {
  font-size: $font-size-large;
  font-weight: $font-weight-semibold;
  color: $text-color;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.content-wrapper {
  display: flex;
  padding: $spacing-xl;
  gap: $spacing-xl * 2; // 增加两列之间的间距
  align-items: center; // 垂直居中对齐
  justify-content: center; // 水平居中
  flex-wrap: wrap; // 允许换行在小屏幕上
}

.form-section {
  flex: 1;
  min-width: 350px; // 确保表单有最小宽度
  max-width: 500px;
  padding-right: $spacing-lg; // 与右侧图标区留白
}

.description {
  font-size: $font-size-base;
  color: $text-color-secondary;
  margin-bottom: $spacing-lg;
  line-height: 1.6;
}

.password-form {
  margin-top: $spacing-md;
  .el-form-item {
    margin-bottom: $spacing-md;
    .el-input {
      .el-input__inner {
        border-radius: $border-radius-sm;
        padding: 0.75rem 1rem;
        font-size: $font-size-base;
      }
    }
  }
  .submit-button {
    background-color: $primary-color;
    border-color: $primary-color;
    &:hover {
      background-color: darken($primary-color, 10%);
      border-color: darken($primary-color, 10%);
    }
  }
  .reset-button {
    color: $text-color-secondary;
    border-color: #dcdfe6;
    &:hover {
      color: $primary-color;
      border-color: $primary-color;
    }
  }
}

.icon-section {
  flex: 1;
  min-width: 250px; // 确保图标区有最小宽度
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f8ff; // 浅蓝色背景
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-md;
}

.lock-icon {
  width: 150px;
  height: 150px;
  color: $success-color; // 绿色
  margin-bottom: $spacing-md;
}

.icon-tip {
  font-size: $font-size-base;
  color: $text-color-secondary;
  line-height: 1.8;
  .tip-title {
    font-weight: $font-weight-bold;
    color: $text-color;
    font-size: $font-size-large;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-lg;
  }
  .form-section, .icon-section {
    width: 100%;
    max-width: 100%;
    padding-right: 0;
  }
}
</style>
