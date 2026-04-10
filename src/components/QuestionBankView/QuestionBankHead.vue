<template>
  <div class="bank-head-container">
    <div class="title-container text-focus-in">
      <h1 class="title">
        Empower your team with our<br>
        <span class="highlight-gradient">Intelligent Asset Hub</span>
      </h1>
      <p class="subtitle">Seamlessly switch between Question Bank and AI Knowledge Graph</p>
    </div>
    
    <div class="switch-container slide-in-elliptic-top-fwd slide-delay-03">
      <div class="glass-switch-wrapper">
        <div 
          class="switch-btn" 
          :class="{ active: modelValue === 'questionBank' }"
          @click="emit('update:modelValue', 'questionBank')"
        >
          <el-icon><Menu /></el-icon> 题库中心
        </div>
        <div 
          class="switch-btn" 
          :class="{ active: modelValue === 'knowledge' }"
          @click="emit('update:modelValue', 'knowledge')"
        >
          <el-icon><Cpu /></el-icon> AI 知识库
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Menu, Cpu } from '@element-plus/icons-vue'

defineProps({ modelValue: { type: String, default: 'questionBank' } })
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.bank-head-container { text-align: center; position: relative; }
.title { font-size: 2rem; font-weight: 800; line-height: 1.2; color: #1d1d1f; margin: 0; }
.highlight-gradient {
  background: linear-gradient(135deg, #6A8FF1, #B061FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle { font-size: 1rem; color: #86868b; margin-top: 12px; font-weight: 500; }

/* 玻璃态自定义切换器 */
.glass-switch-wrapper {
  display: inline-flex; background: rgba(255,255,255,0.5); border-radius: 30px;
  padding: 6px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.switch-btn {
  padding: 10px 24px; border-radius: 24px; font-weight: 600; font-size: 14px;
  color: #606266; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;
}
.switch-btn:hover { color: #6A8FF1; }
.switch-btn.active {
  background: white; color: #6A8FF1; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.switch-container { margin-top: 30px; }

/* 动画保持你原来的设定 */
.text-focus-in { animation: text-focus-in 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both; }
@keyframes text-focus-in { 0% { filter: blur(12px); opacity: 0; } 100% { filter: blur(0px); opacity: 1; } }
.slide-in-elliptic-top-fwd { animation: slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
@keyframes slide-in-elliptic-top-fwd { 0% { transform: translateY(-200px) scale(0); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
.slide-delay-03 { animation-delay: 0.3s; }
</style>