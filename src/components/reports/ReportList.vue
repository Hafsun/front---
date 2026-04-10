<template>
  <div class="report-list" ref="reportListRef">
    <div class="reports-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="sortedReports.length === 0" class="empty-state">
        <el-empty description="暂无面试报告">
          <el-button type="primary" @click="$emit('start-interview')">
            开始面试
          </el-button>
        </el-empty>
      </div>

      <!-- 报告列表 -->
      <div v-else>
        <!-- 删除了移动端卡片布局，只保留桌面端表格布局 -->
        <el-table 
          :data="sortedReports" 
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          class="responsive-table"
          ref="tableRef"
        >
          <el-table-column prop="index" label="序号" width="80" align="center">
            <template #default="{ $index }">
              {{ (currentPage - 1) * pageSize + $index + 1 }}
            </template>
          </el-table-column>
          
          <el-table-column prop="beginTime" label="面试时间" width="180" sortable>
            <template #default="{ row }">
              <div class="time-cell">
                <el-icon><Clock /></el-icon>
                <span>{{ row.beginTime }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="interviewField" label="面试领域" width="120">
            <template #default="{ row }">
              <el-tag type="info">{{ row.interviewField }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="interviewPosition" label="面试职位" min-width="150">
            <template #default="{ row }">
              <span class="position-text">{{ row.interviewPosition }}</span>
            </template>
          </el-table-column>
          
          <!-- 关键词列支持多个关键词显示 -->
          <el-table-column prop="interviewPositionKeyword" label="关键词" min-width="200">
            <template #default="{ row }">
              <div class="keywords-container" v-if="row.interviewPositionKeyword">
                <el-tag 
                  v-for="keyword in parseKeywords(row.interviewPositionKeyword)" 
                  :key="keyword"
                  size="small"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </el-tag>
              </div>
              <span v-else class="no-keywords">暂无关键词</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="interviewScore" label="面试得分" width="120" align="center" sortable>
            <template #default="{ row }">
              <div class="score-display">
                <span class="score-value" :class="getScoreClass(row.interviewScore)">
                  {{ row.interviewScore }}
                </span>
                <span class="score-unit">分</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="totalInterviewTime" label="面试时长" width="120" align="center">
            <template #default="{ row }">
              {{ formatTime(row.totalInterviewTime) || '未记录' }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click="$emit('view-report', row)"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="$emit('delete-report', row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="$emit('size-change', $event)"
            @current-change="$emit('page-change', $event)"
            class="responsive-pagination"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, View, Delete } from '@element-plus/icons-vue'
import { formatDurationMinSec } from '@/utils/report'

const props = defineProps({
  reports: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  }
})

defineEmits(['start-interview', 'view-report', 'delete-report', 'size-change', 'page-change'])

const parseKeywords = (keywordString) => {
  if (!keywordString) return []
  return keywordString.split(/[、,，]/).filter(keyword => keyword.trim()).map(keyword => keyword.trim())
}

const sortedReports = computed(() => {
  if (!props.reports || props.reports.length === 0) return []
  
  return [...props.reports].sort((a, b) => {
    const timeA = new Date(a.beginTime || a.createTime || 0)
    const timeB = new Date(b.beginTime || b.createTime || 0)
    return timeB - timeA // 降序排列，最新的在前面
  })
})

const formatTime = (seconds) => {
  return formatDurationMinSec(seconds)
}

// 分数等级样式
const getScoreClass = (score) => {
  if (score >= 8) return 'score-excellent'
  if (score >= 6) return 'score-good'
  if (score >= 4) return 'score-average'
  return 'score-poor'
}
</script>

<style lang="scss" scoped>
@import '@/styles/reports/report-list.scss';

.report-list {
  width: 100%;
  min-height: 400px;
}
</style>
