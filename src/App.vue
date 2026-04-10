<script setup>
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue'

// Initialize all hooks at the very top
const route = useRoute()
const prevRoute = ref(null)

// Setup watchers after hook initialization
watch(() => route.path, (newPath, oldPath) => {
  prevRoute.value = oldPath
}, { immediate: true })
</script>

<template>
  <div class="router-wrapper">
    <router-view />
  </div>
</template>

<style>
@import '@/styles/app.css';

/* 路由容器样式（替代原来无效的 router-view 选择器） */
.router-wrapper {
  position: relative;
  min-height: 100vh; /* 占满屏幕高度 */
  width: 100%;
}
</style>
