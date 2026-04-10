<template>
  <div class="change-security-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>更改密保</span>
        </div>
      </template>
      <div class="content-wrapper">
        <div class="form-section">
          <p class="description">您可以在这里修改您的密保问题和答案。为了账户安全，请提供您的账号密码进行验证。</p>
          <el-form :model="securityForm" status-icon :rules="rules" ref="securityFormRef" label-width="120px" class="security-form">
            <el-form-item label="新密保问题" prop="newQuestion">
              <el-input v-model="securityForm.newQuestion" placeholder="例如: 您最喜欢的颜色是?"></el-input>
            </el-form-item>
            <el-form-item label="新密保答案" prop="newAnswer">
              <el-input v-model="securityForm.newAnswer" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="账号密码" prop="accountPassword">
              <el-input type="password" v-model="securityForm.accountPassword" autocomplete="off" show-password></el-input>
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
          <img src="/placeholder.svg?height=150&width=150&text=SecurityShield" alt="Security Shield Icon" class="shield-icon" />
          <p class="icon-tip">
            <span class="tip-title">密保问题的重要性</span>
            <br />
            密保问题是您找回账户的重要凭证。
            <br />
            请设置一个只有您知道答案的问题。
          </p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { changeSecurityQuestion } from '@/api/user';
import { useUserStore } from '@/stores/user'; // 导入 Pinia Store

const userStore = useUserStore();
const securityFormRef = ref(null);
const securityForm = reactive({
  newQuestion: '',
  newAnswer: '',
  accountPassword: '', // 新增账号密码字段
});
const isLoading = ref(false); // 添加加载状态

const rules = reactive({
  newQuestion: [
    { required: true, message: '请输入新密保问题', trigger: 'blur' },
    { min: 2, message: '密保问题至少5个字符', trigger: 'blur' },
  ],
  newAnswer: [
    { required: true, message: '请输入新密保答案', trigger: 'blur' },
    { min: 2, message: '密保答案至少2个字符', trigger: 'blur' },
  ],
  accountPassword: [
    { required: true, message: '请输入账号密码', trigger: 'blur' },
    { min: 3, message: '密码长度至少为6位', trigger: 'blur' },
  ],
});

const submitForm = async () => {
  try {
    await securityFormRef.value.validate(); // 使用 await 确保验证完成
    isLoading.value = true; // 开始加载
    // 调用修改密保接口，发送用户名、新密保问题、新密保答案、账号密码
    const res = await changeSecurityQuestion({
      username: userStore.userInfo.username, // 从 Pinia store 获取当前用户名
      newQuestion: securityForm.newQuestion,
      newAnswer: securityForm.newAnswer,
      accountPassword: securityForm.accountPassword,
    });
    if (res.data.code === 1) {
      ElMessage.success('密保修改成功！');
      resetForm();
    } else {
      ElMessage.error(res.data.msg || '密保修改失败，请稍后重试！');
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.msg) {
      ElMessage.error(err.response.data.msg);
    } else if (err.errors) { // Element Plus 验证失败会返回 errors 数组
      ElMessage.error('请检查输入项！');
    } else {
      ElMessage.error('密保修改失败，请稍后重试！');
      console.error('密保修改失败:', err);
    }
  } finally {
    isLoading.value = false; // 结束加载
  }
};

const resetForm = () => {
  securityFormRef.value.resetFields();
};
</script>

<style scoped lang="scss">
@import "../assets/styles/variables.scss";

.change-security-container {
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
  overflow: hidden;
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

.security-form {
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

.shield-icon {
  width: 150px;
  height: 150px;
  color: $info-color; // 蓝色
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
