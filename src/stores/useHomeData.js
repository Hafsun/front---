import { ref } from 'vue'
import { 
  VideoPlay, TrendCharts, Setting, 
  DataAnalysis, Document, Reading, Cpu, Cloud, Monitor
} from '@element-plus/icons-vue'

export function useHomeData() {
  const quickNavItems = ref([
    {
      title: 'AI面试配置',
      description: '个性化配置面试参数',
      icon: Setting,
      color: '#409EFF',
      buttonText: '立即配置',
      route: '/home/interviews',
      type: 'route'
    },
    {
      title: '开始面试',
      description: '进入智能模拟面试',
      icon: VideoPlay,
      color: '#67C23A',
      buttonText: '开始面试',
      route: '/home/interviews',
      type: 'route'
    },
    {
      title: '报告分析',
      description: '查看面试表现分析',
      icon: TrendCharts,
      color: '#E6A23C',
      buttonText: '查看报告',
      route: '/home/reports',
      type: 'route'
    },
    {
      title: '学习资源',
      description: '提升面试技能资源',
      icon: Reading,
      color: '#F56C6C',
      buttonText: '开始学习',
      route: '/home/learning-resources',
      type: 'route'
    }
  ])

  const coreFeatures = ref([
    {
      title: '多场景覆盖',
      description: '支持人工智能、大数据、物联网、智能系统等多个技术领域的典型岗位面试场景',
      icon: Setting,
      color: '#409EFF',
      tags: ['技术岗', '运维测试岗', '产品岗'],
      action: 'scroll',
      target: 'domains-section'
    },
    {
      title: '多模态评测',
      description: '整合语音、视频、文本数据，构建动态量化评测体系，全方位分析面试表现',
      icon: DataAnalysis,
      color: '#67C23A',
      tags: ['语音分析', '视频识别', '文本理解'],
      action: 'route',
      target: '/home/interviews'
    },
    {
      title: '智能反馈',
      description: '生成可视化评测报告，包含能力雷达图、关键问题定位及个性化改进建议',
      icon: Document,
      color: '#E6A23C',
      tags: ['雷达图', '问题定位', '改进建议'],
      action: 'route',
      target: '/home/reports'
    }
  ])

  const techDomains = ref([
    {
      name: '人工智能',
      description: '机器学习、深度学习、算法优化',
      icon: Cpu,
      positions: ['算法工程师', 'AI研究员', '机器学习工程师']
    },
    {
      name: '大数据',
      description: 'Hadoop、Spark、数据仓库',
      icon: Cloud,
      positions: ['数据工程师', '大数据开发', '数据分析师']
    },
    {
      name: '物联网',
      description: '嵌入式系统、传感器网络',
      icon: Monitor,
      positions: ['IoT工程师', '嵌入式开发', '硬件工程师']
    },
    {
      name: '智能系统',
      description: '系统架构、智能控制',
      icon: Setting,
      positions: ['系统架构师', '智能控制工程师', '系统集成工程师']
    }
  ])

  const processSteps = ref([
    {
      title: '选择面试场景',
      description: '根据专业和目标岗位选择合适的面试场景'
    },
    {
      title: '开始模拟面试',
      description: '进入沉浸式面试环境，回答AI面试官问题'
    },
    {
      title: '多模态数据采集',
      description: '系统实时采集语音、视频、文本等多维数据'
    },
    {
      title: '智能分析评测',
      description: '基于讯飞星火大模型进行深度分析和评测'
    },
    {
      title: '生成评测报告',
      description: '获得详细的能力雷达图和个性化改进建议'
    },
    {
      title: '个性化学习',
      description: '根据评测结果获得定制化学习资源推荐'
    }
  ])

  return {
    quickNavItems,
    coreFeatures,
    techDomains,
    processSteps
  }
}