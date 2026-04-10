<template>
  <div class="ai-setup-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>AI面试配置</span>
        </div>
      </template>
      <div class="setup-content">
        <p class="description">在这里您可以自定义AI面试的各项参数，以获得更贴合您需求的模拟体验。</p>

        <el-form :model="aiConfigForm" label-width="150px" class="ai-config-form">
          <el-form-item label="AI模型选择">
            <el-select v-model="aiConfigForm.aiModel" placeholder="选择AI模型" class="full-width">
              <el-option label="GPT-4o (推荐)" value="gpt4o"></el-option>
              <el-option label="Claude 3 Opus" value="claude3opus"></el-option>
              <el-option label="Gemini 1.5 Pro" value="gemini15pro"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="面试难度">
            <el-slider
              v-model="aiConfigForm.difficulty"
              :min="1"
              :max="5"
              :step="1"
              show-stops
              :marks="difficultyMarks"
            ></el-slider>
          </el-form-item>

          <el-form-item label="面试时长 (分钟)">
            <el-input-number v-model="aiConfigForm.duration" :min="10" :max="60" :step="5"></el-input-number>
          </el-form-item>

          <el-form-item label="重点考察能力">
            <el-checkbox-group v-model="aiConfigForm.focusAbilities">
              <el-checkbox label="专业知识水平"></el-checkbox>
              <el-checkbox label="语言表达能力"></el-checkbox>
              <el-checkbox label="逻辑思维能力"></el-checkbox>
              <el-checkbox label="创新能力"></el-checkbox>
              <el-checkbox label="应变抗压能力"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="自定义问题">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="输入您希望AI提问的自定义问题，每行一个。"
              v-model="aiConfigForm.customQuestions"
            ></el-input>
            <p class="tip">（可选）AI将在常规问题之外，额外提问您设定的问题。</p>
          </el-form-item>

          <el-form-item label="是否开启实时反馈">
            <el-switch v-model="aiConfigForm.realtimeFeedback"></el-switch>
            <p class="tip">（开启后，面试过程中会收到即时提示，可能影响沉浸感）</p>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveAIConfig">保存配置</el-button>
            <el-button @click="resetAIConfig">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const aiConfigForm = reactive({
  aiModel: 'gpt4o',
  difficulty: 3,
  duration: 30,
  focusAbilities: ['专业知识水平', '语言表达能力'],
  customQuestions: '',
  realtimeFeedback: false,
});

const difficultyMarks = reactive({
  1: '简单',
  3: '中等',
  5: '困难',
});

const saveAIConfig = () => {
  ElMessage.success('AI面试配置保存成功！(模拟)');
  console.log('保存的AI配置:', aiConfigForm);
};

const resetAIConfig = () => {
  aiConfigForm.aiModel = 'gpt4o';
  aiConfigForm.difficulty = 3;
  aiConfigForm.duration = 30;
  aiConfigForm.focusAbilities = ['专业知识水平', '语言表达能力'];
  aiConfigForm.customQuestions = '';
  aiConfigForm.realtimeFeedback = false;
  ElMessage.info('AI面试配置已重置。');
};
</script>

<style scoped lang="scss">
@import "../assets/styles/variables.scss";

.ai-setup-container {
  padding: $spacing-lg;
  background-color: $background-color;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.box-card {
  width: 100%;
  max-width: 1000px;
  box-shadow: $shadow-md;
  border-radius: $border-radius-lg;
}

.card-header {
  font-size: $font-size-large;
  font-weight: $font-weight-semibold;
  color: $text-color;
}

.setup-content {
  padding: $spacing-md;
  color: $text-color-secondary;
}

.description {
  font-size: $font-size-base;
  margin-bottom: $spacing-lg;
  text-align: center;
  color: $text-color;
}

.ai-config-form {
  margin-top: $spacing-lg;
  max-width: 800px; // 限制表单宽度
  margin-left: auto;
  margin-right: auto;
}

.full-width {
  width: 100%;
}

.tip {
  font-size: $font-size-small;
  color: $text-color-secondary;
  margin-top: $spacing-xs;
  line-height: 1.4;
}

.el-slider {
  margin-top: $spacing-md;
  margin-bottom: $spacing-md;
}

.el-input-number {
  width: 100%;
  max-width: 150px; // 限制数字输入框宽度
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.el-checkbox {
  margin-right: $spacing-md;
}

.el-form-item__content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

@media (max-width: $screen-md) {
  .ai-config-form {
    padding: 0 $spacing-md;
  }
  .el-form-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .el-form-item__label {
    margin-bottom: $spacing-xs;
  }
  .el-input-number, .el-select, .el-textarea {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
