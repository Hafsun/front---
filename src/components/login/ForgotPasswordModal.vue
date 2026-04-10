<template>
  <div class="forgot-password-panel">
    <div class="panel-content">
      <!-- 使用 Transition 包裹步骤内容，实现渐隐渐显 -->
      <Transition name="fade" mode="out-in">
        <!-- 步骤1: 输入用户名 -->
        <div v-if="currentStep === 1" key="step-1" class="step-container">
          <div class="panel-header">
            <div class="icon-wrapper forgot-icon"> <!-- 统一使用更小的图标类 -->
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="panel-title">找回密码</h2>
            <p class="panel-subtitle">输入您的用户名，我们将获取密保问题</p>
          </div>

          <form @submit.prevent="requestSecurityQuestion" class="panel-form">
            <div class="input-group">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                v-model="username"
                type="text"
                placeholder="用户名"
                class="input"
                required
                :disabled="isLoading"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :class="{ 'btn-loading': isLoading }"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? '请求中...' : '下一步' }}
            </button>

            <button
              type="button"
              @click="handleClose"
              class="btn btn-text"
            >
              返回登录
            </button>
          </form>
        </div>

        <!-- 步骤2: 输入密保答案和新密码 -->
        <div v-else-if="currentStep === 2" key="step-2" class="step-container">
          <div class="panel-header">
            <div class="icon-wrapper forgot-icon-lock"> <!-- 新增锁图标类 -->
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="panel-title">重置密码</h2>
            <p class="panel-subtitle">请回答密保问题并设置新密码</p>
          </div>

          <form @submit.prevent="resetPassword" class="panel-form">
            <!-- 密保问题显示区域 -->
            <div class="security-question-group">
              <p class="security-question-label">密保问题:</p>
              <div class="security-question-box">
                <span class="question-text">{{ securityQuestion || '加载中...' }}</span>
              </div>
            </div>

            <div class="input-group">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zM12 11a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <input
                v-model="securityAnswer"
                type="text"
                placeholder="密保答案"
                class="input"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="input-group">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="新密码"
                class="input"
                required
                autocomplete="off"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="togglePassword"
                class="password-toggle"
              >
                <svg v-if="showPassword" class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>

            <div class="input-group">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                v-model="confirmNewPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="确认新密码"
                class="input"
                required
                autocomplete="off"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="togglePassword"
                class="password-toggle"
              >
                <svg v-if="showPassword" class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :class="{ 'btn-loading': isLoading }"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? '重置中...' : '重置密码' }}
            </button>

            <button
              type="button"
              @click="currentStep = 1"
              class="btn btn-text"
            >
              返回上一步
            </button>
          </form>
        </div>
      </Transition>
    </div>
    <button @click="handleClose" class="close-button">
      <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getPassProtect, forgotPassword as apiForgotPassword } from '../../api/user.js' // 导入新的 API 函数
import { ElMessage } from 'element-plus' // 导入 ElMessage

// Emits
const emit = defineEmits([
  'close',
  'submit' // 这个emit现在可能不再直接使用，因为逻辑在组件内部处理
])

// 响应式数据
const currentStep = ref(1) // 1: 输入用户名, 2: 输入密保答案和新密码
const username = ref('')
const securityQuestion = ref('')
const securityAnswer = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const isLoading = ref(false)
const showPassword = ref(false) // 重新添加 showPassword

// 方法
const requestSecurityQuestion = async () => {
  if (!username.value) {
    ElMessage.warning('请输入用户名。')
    return
  }

  isLoading.value = true
  try {
    const response = await getPassProtect({ username: username.value })
    if (response.data.code === 1) {
      securityQuestion.value = response.data.data
      currentStep.value = 2
      ElMessage.success('密保问题获取成功！')
    } else {
      ElMessage.error(response.data.msg || '获取密保问题失败。')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '获取密保问题失败，请稍后再试。')
    console.error('获取密保问题失败:', error)
  } finally {
    isLoading.value = false
  }
}

const resetPassword = async () => {
  if (newPassword.value !== confirmNewPassword.value) {
    ElMessage.warning('两次输入的密码不一致。')
    return
  }
  if (!securityAnswer.value || !newPassword.value) {
    ElMessage.warning('请填写所有必填字段。')
    return
  }

  isLoading.value = true
  try {
    const response = await apiForgotPassword({
      username: username.value,
      passProtectAnswer: securityAnswer.value,
      newPassword: newPassword.value
    })

    if (response.data.code === 1) {
      ElMessage.success(response.data.msg || '密码修改成功！')
      handleClose() // 重置成功后关闭模态框并返回登录界面
    } else {
      ElMessage.error(response.data.msg || '重置密码失败。')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '重置密码失败，请稍后再试。')
    console.error('重置密码失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  // 重置所有状态
  currentStep.value = 1
  username.value = ''
  securityQuestion.value = ''
  securityAnswer.value = ''
  newPassword.value = ''
  confirmNewPassword.value = ''
  isLoading.value = false
  showPassword.value = false // 重置 showPassword
  emit('close') // 通知父组件关闭
}

const togglePassword = () => { // 重新添加 togglePassword 方法
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.forgot-password-panel {
  background: white;
  border-radius: 10px; /* 保持圆角 */
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22); /* 保持阴影 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden;

  /* 确保绝对定位以配合 Transition */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%; /* 确保内容区域填充可用空间 */
  width: 100%;
  text-align: center;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%; /* 确保步骤容器填充可用空间 */
  /* 确��过渡时元素不脱离文档流，且能正确应用 opacity */
  position: absolute;
  top: 0;
  left: 0;
}

.panel-header {
  margin-bottom: 1rem; /* 调整间距 */
  width: 100%;
}

.panel-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.panel-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem; /* 调整间距 */
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 找回密码第一步的图标背景 */
.forgot-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 重置密码第二步的图标背景 (锁图标) */
.forgot-icon-lock {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 与登录图标背景一致 */
}

.icon { /* 保持与LoginForm中图标大小一致 */
  width: 32px;
  height: 32px;
  color: white;
}

.input-group {
  position: relative;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px; /* 限制输入框宽度，使其居中 */
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #999;
}

.input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem; /* 调整内边距以适应图标 */
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.password-toggle { /* 重新添加 password-toggle 样式 */
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.icon-sm { /* 确保 icon-sm 样式存在并应用于眼睛图标 */
  width: 18px;
  height: 18px;
  color: #999;
}

.panel-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 50px; /* 保持与LoginForm一致的左右内边距 */
  box-sizing: border-box;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  width: 100%;
  max-width: 300px; /* 限制按钮宽度，使其与输入框对齐 */
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-text {
  background: none;
  border: none;
  color: #666;
  text-decoration: underline;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.btn-text:hover {
  color: #3b82f6;
}

.btn-loading {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1; /* 确保在最上层 */
}

.close-button:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

/* 密保问题显示组 */
.security-question-group {
  width: 100%;
  max-width: 300px; /* Align with input width */
  margin-bottom: 1rem; /* Consistent spacing */
  text-align: left; /* Align label to left */
}

.security-question-label {
  font-size: 0.9rem; /* Smaller font for label */
  color: #666; /* Softer color */
  margin-bottom: 0.25rem; /* 调整间距，使其更紧凑 */
  display: block; /* Ensure it takes full width */
}

.security-question-box {
  width: 100%;
  padding: 0.75rem 1rem; /* Similar padding to input */
  border: 1px solid #ddd; /* Solid border like input */
  border-radius: 0.5rem; /* Rounded corners */
  background-color: #fcfcfc; /* Slightly off-white background */
  display: flex; /* To center text if needed */
  align-items: center;
  min-height: 40px; /* Ensure consistent height with inputs */
}

.question-text {
  font-weight: bold;
  color: #333; /* Darker color for question */
  word-break: break-word;
  flex-grow: 1; /* Allow text to grow */
  text-align: left; /* Align question text to left within its box */
}

/* 确保过渡动画的元素在过渡期间保持绝对定位，避免布局抖动 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
