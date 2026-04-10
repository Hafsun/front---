<!-- components/LearningResources/ResourceGrid.vue -->
<template>
  <div class="resource-grid">
    <!-- 资源过滤搜索框 -->
    <div class="resource-filter">
      <el-input 
        v-model="searchQuery" 
        placeholder="搜索资源..." 
        prefix-icon="Search"
        size="small"
        class="search-input"
      />
      <el-select 
        v-model="sortType" 
        placeholder="排序方式" 
        size="small"
        class="sort-select"
        @change="handleSortChange"
      >
        <el-option label="默认排序" value="default" />
        <el-option label="按名称排序" value="name" />
      </el-select>
    </div>
    
    <!-- 资源网格 -->
    <div class="grid-container">
      <div 
        v-for="(resource, index) in filteredResources" 
        :key="index" 
        class="resource-card"
        :style="{ 
          backgroundColor: getResourceBgColor(index),
          borderLeft: `5px solid ${getResourceColor(index)}`
        }"
        @mouseenter="hoverIndex = index"
        @mouseleave="hoverIndex = -1"
        @click="handleResourceClick(resource)"
      >
        <!-- 资源图标 -->
        <div class="resource-icon">
          <component 
            :is="resource.icon" 
            :style="{ 
              color: getResourceColor(index),
              transform: hoverIndex === index ? 'scale(1.2)' : 'scale(1)'
            }" 
            class="icon-transition"
          />
        </div>
        
        <!-- 资源信息 -->
        <div class="resource-content">
          <h3 class="resource-title" :style="{ color: getResourceColor(index) }">{{ resource.title }}</h3>
          <p class="resource-description">{{ resource.description }}</p>
          
          <!-- 交互按钮组 -->
          <div class="resource-actions">
            <el-button 
              size="small" 
              type="text" 
              :style="{ color: getResourceColor(index) }"
              @click.stop="handleResourceClick(resource)"
            >
              查看详情
              <el-icon class="action-icon">
                <ArrowRight />
              </el-icon>
            </el-button>
            
            <el-tooltip effect="light" content="收藏">
              <el-button 
                size="small" 
                icon="Star" 
                circle 
                type="text"
                :style="{ 
                  color: hoverIndex === index ? getResourceColor(index) : '#909399',
                  opacity: hoverIndex === index ? 1 : 0.6
                }"
                @click.stop="handleFavoriteClick(resource, index)"
              />
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态提示 -->
    <div v-if="filteredResources.length === 0" class="empty-state">
      <el-empty 
        description="没有找到匹配的资源" 
        :image-size="100"
      />
      <el-button 
        type="text" 
        @click="resetFilter"
        class="reset-filter"
      >
        清除筛选条件
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
// import { ArrowRight, Star } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'; // 导入路由

// 初始化路由
const router = useRouter();

// 接收父组件传递的资源和类型
const props = defineProps({
  resources: {
    type: Array,
    required: true,
    default: () => []
  },
  type: {
    type: String,
    required: true,
    validator: (value) => {
      return ['expression', 'knowledge', 'questions'].includes(value);
    }
  }
});

// 颜色组定义
const colorGroups = {
  expression: [
    '#E53E3E', '#3182CE', '#805AD5', '#ED8936', '#38A169', '#DD6B20'
  ],
  knowledge: [
    '#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B'
  ],
  questions: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'
  ]
};

// 背景色组
const bgColorGroups = {
  expression: [
    '#FFF5F5', '#EDF2F7', '#FAF5FF', '#FFF7ED', '#F0FFF4', '#FFFBEB'
  ],
  knowledge: [
    '#F0F7FF', '#FFF4E5', '#F0FFF4', '#FFF5F5', '#FAF5FF', '#F9F5F1'
  ],
  questions: [
    '#FFF0F0', '#E0F7F4', '#E8F4F8', '#FFE8E0', '#E6F4EA', '#FEF9E7'
  ]
};

// 状态管理
const searchQuery = ref('');
const sortType = ref('default');
const hoverIndex = ref(-1);
const favoriteResources = ref([]);

// 过滤和排序资源
const filteredResources = computed(() => {
  let result = [...props.resources];
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    );
  }
  
  // 排序处理
  if (sortType.value === 'name') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  return result;
});

// 获取资源主色
const getResourceColor = (index) => {
  const colors = colorGroups[props.type] || colorGroups.expression;
  return colors[index % colors.length];
};

// 获取资源背景色
const getResourceBgColor = (index) => {
  const bgColors = bgColorGroups[props.type] || bgColorGroups.expression;
  return bgColors[index % bgColors.length];
};

// 处理排序变更
const handleSortChange = (value) => {
  sortType.value = value;
};

// 处理资源点击 - 实现跳转逻辑
const handleResourceClick = (resource) => {
  if (!resource.link) {
    ElMessage.warning('该资源暂无链接');
    return;
  }
  
  try {
    // 检查是否为外部链接
    if (resource.link.startsWith('http://') || resource.link.startsWith('https://')) {
      // 外部链接：在新窗口打开
      window.open(resource.link, '_blank');
      ElMessage.success(`正在打开：${resource.title}`);
    } else {
      // 内部链接：使用路由跳转
      router.push(resource.link);
    }
  } catch (error) {
    ElMessage.error('链接打开失败，请稍后重试');
    console.error('链接跳转错误:', error);
  }
};

// 处理收藏点击
const handleFavoriteClick = (resource, index) => {
  const isFavorite = favoriteResources.value.includes(index);
  
  if (isFavorite) {
    favoriteResources.value = favoriteResources.value.filter(i => i !== index);
    ElMessage.info(`已取消收藏：${resource.title}`);
  } else {
    favoriteResources.value.push(index);
    ElMessage.success(`已收藏：${resource.title}`);
  }
};

// 重置筛选条件
const resetFilter = () => {
  searchQuery.value = '';
  sortType.value = 'default';
};

// 监听资源变化，重置收藏状态
watch(() => props.resources, () => {
  favoriteResources.value = [];
});
</script>

<style scoped lang="scss">
/* 样式部分与之前保持一致 */
$text-color: #303133;
$text-color-secondary: #606266;
$spacing-xs: 5px;
$spacing-sm: 10px;
$spacing-md: 15px;
$spacing-lg: 20px;

.resource-grid {
  padding: $spacing-sm 0;
}

.resource-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: 0 $spacing-xs;
  
  .search-input {
    width: 280px;
    transition: width 0.3s ease;
    
    &:focus {
      width: 320px;
    }
  }
  
  .sort-select {
    width: 160px;
  }
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-lg;
  margin-top: $spacing-md;
}

.resource-card {
  border-radius: 8px;
  padding: $spacing-lg;
  display: flex;
  gap: $spacing-md;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  }
}

.resource-icon {
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .icon-transition {
    font-size: 32px;
    transition: transform 0.3s ease;
  }
}

.resource-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.resource-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 $spacing-sm 0;
  transition: transform 0.3s ease;
  
  .resource-card:hover & {
    transform: translateX(3px);
  }
}

.resource-description {
  font-size: 14px;
  color: $text-color-secondary;
  line-height: 1.6;
  margin: 0 0 $spacing-md 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.resource-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-xs;
  
  .action-icon {
    font-size: 14px;
    margin-left: 5px;
    transition: transform 0.2s ease;
  }
  
  .el-button:hover .action-icon {
    transform: translateX(3px);
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  
  .reset-filter {
    margin-top: 15px;
    color: #3182CE;
  }
}

@media (max-width: 768px) {
  .resource-filter {
    flex-direction: column;
    gap: $spacing-sm;
    align-items: stretch;
    
    .search-input, .sort-select {
      width: 100%;
    }
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>