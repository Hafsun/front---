<template>
  <div class="login-page-wrapper">
    <!-- 这个 div 就是您提到的“盒子”，它将包含 LoginForm -->
    <div class="login-box-container">
      <!-- LoginForm 将在这里被渲染 -->
      <LoginForm />
    </div>
  </div>
</template>

<script setup>
import LoginForm from '../components/login/LoginForm.vue' // 导入 LoginForm 组件
// 移除了 backgroundUrl 导入，因为现在使用 Tailwind 的 bg-gradient
</script>

<style scoped>
.login-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(to bottom right, #dbeafe, #e9d5ff);
}

.login-box-container {
  position: relative;
  width: 100%;
  max-width: 960px; /* max-w-4xl 对应 960px */
  min-width: 768px; /* 添加最小宽度 */
  aspect-ratio: 768 / 480; /* 保持原始宽高比 */
  min-height: 480px; 
  background-color: #ffffff;
  border-radius: 1rem; /* rounded-2xl 对应 1rem */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl 对应此值 */
  overflow: hidden;
}
</style>
