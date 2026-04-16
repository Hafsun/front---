<template>
  <div class="login-container" :class="{ 'right-panel-active': isRightPanelActive }">
    <!-- 登录表单容器 -->
    <div class="form-container sign-in-container">
      <Transition :name="transitionDirection">
        <!-- 登录表单内容 -->
        <div v-if="!showForgotPassword" key="login-form-content" class="form-content">
          <div class="form-header">
            <div class="icon-wrapper login-icon">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录您的账户</p>
          </div>

          <form @submit.prevent="handleLogin" class="form">
            <div class="input-group">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <input v-model="loginForm.username" type="text" placeholder="用户名" class="input" required />
            </div>

            <div class="input-group">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" placeholder="密码"
                class="input" required autocomplete="off" />
              <button type="button" @click="togglePassword" class="password-toggle">
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

            <SliderVerification @verification-success="handleVerificationSuccess" :is-verified="isVerified" />

            <button type="submit" class="btn btn-primary" :disabled="!isVerified || isLoading"
              :class="{ 'btn-disabled': !isVerified || isLoading, 'btn-loading': isLoading }">
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? '登录中...' : '登录' }}
            </button>

            <button type="button" @click="switchToForgotPassword" class="btn btn-text">
              忘记密码?
            </button>
          </form>
        </div>

        <!-- 忘记密码模块 -->
        <ForgotPasswordModal v-else key="forgot-password-modal" @close="closeForgotPassword"
          @submit="handleForgotPassword" />
      </Transition>
    </div>

    <!-- 注册表单 -->
    <div class="form-container sign-up-container">
      <div class="form-content">
        <div class="form-header">
          <div class="icon-wrapper register-icon">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="form-title">创建账户</h2>
          <p class="form-subtitle">注册新用户</p>
        </div>

        <form @submit.prevent="handleRegister" class="form">
          <div class="input-group">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input v-model="registerForm.username" type="text" placeholder="用户名" class="input" required />
          </div>

          <div class="input-group">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input v-model="registerForm.password" :type="showPassword ? 'text' : 'password'" placeholder="密码"
              class="input" required autocomplete="off" />
            <button type="button" @click="togglePassword" class="password-toggle">
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
                d="M8.228 9.247a.75.75 0 01.968-.024l2.51 1.875a.75.75 0 00.968 0l2.51-1.875a.75.75 0 01.968.024l.024.024A.75.75 0 0118 10.5v1.5a.75.75 0 01-.75.75H6.75A.75.75 0 016 12V10.5a.75.75 0 01.024-.024l.024-.024zM12 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75z" />
            </svg>
            <input v-model="registerForm.securityQuestion" type="text" placeholder="密保问题 (例如: 您母亲的姓名是?)" class="input"
              required />
          </div>

          <div class="input-group">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9.247a.75.75 0 01.968-.024l2.51 1.875a.75.75 0 00.968 0l2.51-1.875a.75.75 0 01.968.024l.024.024A.75.75 0 0118 10.5v1.5a.75.75 0 01-.75.75H6.75A.75.75 0 016 12V10.5a.75.75 0 01.024-.024l.024-.024zM12 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75z" />
            </svg>
            <input v-model="registerForm.securityAnswer" type="text" placeholder="密保答案" class="input" required />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="isLoading"
            :class="{ 'btn-disabled': isLoading, 'btn-loading': isLoading }">
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 覆盖面板 -->
    <div class="overlay-container">
      <div class="overlay">
        <!-- 左侧覆盖面板内容 -->
        <div class="overlay-panel overlay-left">
          <h1 class="overlay-title">欢迎回来!</h1>
          <p class="overlay-text">保持联系，请登录您的个人信息</p>
          <button @click="switchToLogin" class="btn btn-outline">
            登录
          </button>
        </div>
        <!-- 右侧覆盖面板内容 -->
        <div class="overlay-panel overlay-right">
          <h1 class="overlay-title">欢迎来到码上通关！</h1>
          <p class="overlay-text">登陆后开始您的智能面试之旅。</p>
          <button @click="switchToRegister" class="btn btn-outline">
            注册
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import SliderVerification from './SliderVerification.vue'
import ForgotPasswordModal from './ForgotPasswordModal.vue'
import { useUserStore } from '@/stores/user' // 导入 Pinia Store
import { register as apiRegister } from '@/api/user' // 导入注册 API
import { ElMessage } from 'element-plus' // 导入 ElMessage

const router = useRouter()
const userStore = useUserStore() // 初始化 Pinia Store

// 响应式数据
const isRightPanelActive = ref(false)
const showPassword = ref(false) // 重新添加 showPassword
const isVerified = ref(false)
const showForgotPassword = ref(false) // 控制忘记密码模块的显示
const isLoading = ref(false)
const transitionDirection = ref('slide-up'); // 控制过渡方向

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  securityQuestion: '', // 新增密保问题
  securityAnswer: ''    // 新增密保答案
})

// 方法
const handleLogin = async () => {
  if (!isVerified.value) {
    ElMessage.warning('请完成滑动验证')
    return
  }
  isLoading.value = true
  try {
    const userInfo = await userStore.login({ username: loginForm.username, password: loginForm.password })
    ElMessage.success('登录成功！')
    console.log('登录成功，获取到用户信息:', userInfo)
    router.push('/home')
  } catch (error) {
    ElMessage.error(error.message || '登录失败，请稍后再试。')
    console.error('登录失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  isLoading.value = true
  try {
    const response = await apiRegister({
      username: registerForm.username,
      password: registerForm.password,
      securityQuestion: registerForm.securityQuestion,
      securityAnswer: registerForm.securityAnswer
    })

    if (response.data.code === 1) {
      ElMessage.success(response.data.msg || '注册成功！请登录。')
      // 注册成功后切换到登录界面
      switchToLogin()
    } else {
      ElMessage.error(response.data.msg || '注册失败。')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '注册失败，请稍后再试。')
    console.error('注册失败:', error)
  } finally {
    isLoading.value = false
  }
}

// handleForgotPassword 在 LoginForm.vue 中不再直接处理 API 调用，
// 而是由 ForgotPasswordModal 内部处理。这里仅作为事件触发器。
const handleForgotPassword = () => {
  // 可以在这里添加一些日志或父组件需要知道的逻辑
  console.log('忘记密码流程已触发');
}

const switchToRegister = () => {
  isRightPanelActive.value = true
  isVerified.value = false // 重置验证状态
  showForgotPassword.value = false; // 确保切换到注册时关闭忘记密码
}

const switchToLogin = () => {
  isRightPanelActive.value = false
  isVerified.value = false // 重置验证状态
  showForgotPassword.value = false; // 确保切换到登录时关闭忘记密码
}

const switchToForgotPassword = () => {
  transitionDirection.value = 'slide-up'; // 登录界面上滑，找回密码界面从下往上滑
  showForgotPassword.value = true
}

const closeForgotPassword = () => {
  transitionDirection.value = 'slide-down'; // 找回密码界面向下滑，登录界面从上往下划
  showForgotPassword.value = false
}

const togglePassword = () => { // 重新添加 togglePassword 方法
  showPassword.value = !showPassword.value
}

const handleVerificationSuccess = () => {
  isVerified.value = true
}
</script>

<style scoped>
/* 整个登录/注册模块的基础容器 */
.login-container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  height: 100%;
  /* 填���父容器的高度 */
  width: 100%;
  /* 填充父容器的宽度 */
}

/* 表单容器 (登录和注册) */
.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  /* 每个表单占据 50% 宽度 */
  transition: all 0.6s ease-in-out;
  /* 确保所有属性都有平滑过渡 */
}

.sign-in-container {
  left: 0;
  /* 初始时在左半部分 */
  z-index: 2;
  /* 初始时在上方 */
}

.sign-up-container {
  left: 0;
  /* 初始时与登录表单重叠，但隐藏 */
  opacity: 0;
  /* 初始时隐藏 */
  z-index: 1;
  /* 初始时在下方 */
}

/* 覆盖面板容器 */
.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  /* 初始时在右半部分 */
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 3;
  /* 确保覆盖层始终在表单之上，防止突变 */
}

.overlay {
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  /* 示例渐变 */
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  /* 覆盖层内容初始时在容器左侧之外，使其右半部分可见 */
  height: 100%;
  width: 200%;
  /* 占据容器两倍宽度 */
  transform: translateX(0);
  /* 初始时显示右侧面板内容 */
  /* 添加 opacity 过渡 */
  transition: transform 0.6s ease-in-out, opacity 0.6s ease-in-out;
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  /* 为 overlay-panel 自身添加 opacity 过渡 */
  transition: transform 0.6s ease-in-out, opacity 0.6s ease-in-out;
}

/* 初始状态：overlay-right 可见，overlay-left 隐藏 */
.overlay-left {
  transform: translateX(0);
  /* 保持在左侧 */
  opacity: 0;
  /* 初始隐藏 */
}

.overlay-right {
  right: 0;
  /* 保持在右侧 */
  transform: translateX(0);
  opacity: 1;
  /* 初始可见 */
  z-index: 1;
  /* 初始时在下方 */
}

/* 右侧面板激活状态 (切换到注册) */
.login-container.right-panel-active .sign-in-container {
  transform: translateX(100%);
  /* 登录表单向右滑出屏幕 */
  opacity: 0;
  /* 登录表单渐隐 */
  z-index: 1;
  /* 登录表单移到下方 */
}

.login-container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  /* 注册表单向右滑动，进入左侧区域 */
  opacity: 1;
  /* 注册表单变为可见 */
  z-index: 2;
  /* 注册表单移到上方 */
}

.login-container.right-panel-active .overlay-container {
  transform: translateX(-100%);
  /* 覆盖层容器向左滑动 */
}

.login-container.right-panel-active .overlay {
  transform: translateX(50%);
  /* 覆盖层内容在容器内向右滑动，显示左侧面板 */
  /* 激活时，橙色面板的 opacity 保持 1，因为它是背景 */
  /* 如果希望它也渐隐渐显，需要调整这里的 opacity */
  /* 假设您希望它在切换时保持可见，但其内部的文本面板渐隐渐显 */
}

/* 激活状态下，overlay-left 渐入，overlay-right 渐出 */
.login-container.right-panel-active .overlay-left {
  opacity: 1;
  /* 渐入 */
}

.login-container.right-panel-active .overlay-right {
  opacity: 0;
  /* 渐出 */
}

/* 表单内容样式 - 确保绝对定位以配合 Transition */
.form-content {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  /* 垂直居中内容 */
  padding: 0 50px;
  height: 100%;
  width: 100%;
  /* 确保填充父容器 */
  text-align: center;
  position: absolute;
  /* 绝对定位以配合 Transition */
  top: 0;
  left: 0;
}

.form-header {
  margin-bottom: 1.5rem;
}

.form-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-subtitle {
  color: #666;
  font-size: 0.9rem;
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

.login-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.icon {
  width: 32px;
  height: 32px;
  color: white;
}

.input-group {
  position: relative;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px;
  /* 限制输入框宽度，使其居中 */
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #996161;
}

.input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  /* 调整内边距以适应图标 */
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.password-toggle {
  /* 重新添加 password-toggle 样式 */
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.icon-sm {
  /* 确保 icon-sm 样式存在并应用于眼睛图标 */
  width: 18px;
  height: 18px;
  color: #999;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  width: 100%;
  max-width: 300px;
  /* 限制按钮宽度，使其与输入框对齐 */
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

.btn-outline {
  background-color: transparent;
  border: 1px solid white;
  color: white;
}

.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.1);
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

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载状态的 spinner 样式 (保留自原始代码) */
.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 过渡动画样式 */
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  position: absolute;
  /* 确保元素在过渡时占据相同空间 */
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* slide-up 动画：进入从下往上，离开从上往上 */
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* slide-down 动画：进入从上往下，离开从上往下 */
.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
