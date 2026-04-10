import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { resumeApi } from "@/api/resume"
import { ElMessage } from "element-plus"

export const useResumeHistoryStore = defineStore("resumeHistory", () => {
  // 状态数据
  const resumeList = ref([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)
  const totalPage = ref(0)

  // 当前查看的简历详情
  const currentResumeDetail = ref(null)
  const detailLoading = ref(false)

  // 计算属性
  const hasData = computed(() => resumeList.value.length > 0)
  const hasPrevPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPage.value)

  // 获取简历列表
  const fetchResumeList = async (username = "admin", page = 1, size = 10) => {
    try {
      loading.value = true

      const requestData = {
        username: username,
        page: page,
        pageSize: size,
      }

      console.log("🚀 请求简历列表:", requestData)

      const response = await resumeApi.getResumeListAPI(requestData)
      console.log("📥 简历列表响应:", response)

      if (response && response.data && response.data.code === 1) {
        const data = response.data.data

        // 为每个简历项添加序号（从1开始）
        resumeList.value = data.dataList.map((item, index) => ({
          ...item,
          serialNumber: (page - 1) * size + index + 1, // 计算全局序号
          originalPersonalId: item.personalId, // 保存原始ID用于后续操作
        }))

        currentPage.value = data.currentPage
        pageSize.value = data.pageSize
        totalCount.value = data.totalCount
        totalPage.value = data.totalPage

        console.log("✅ 简历列表加载成功，共", totalCount.value, "条记录")

        if (resumeList.value.length === 0 && page === 1) {
          ElMessage.info("暂无简历记录")
        }

        return true
      } else {
        throw new Error(response?.data?.msg || "获取简历列表失败")
      }
    } catch (error) {
      console.error("❌ 获取简历列表失败:", error)

      let errorMessage = "获取简历列表失败"
      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        if (status === 400) {
          errorMessage = data?.msg || "请求参数错误"
        } else if (status === 401) {
          errorMessage = "认证失败，请重新登录"
        } else if (status === 500) {
          errorMessage = "服务器内部错误"
        } else {
          errorMessage = data?.msg || `请求失败 (${status})`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      ElMessage.error(errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取简历详情
  const fetchResumeDetail = async (personalId) => {
    try {
      detailLoading.value = true

      console.log("🚀 请求简历详情:", personalId)

      const response = await resumeApi.getResumeDetailAPI(personalId)
      console.log("📥 简历详情响应:", response)

      if (response && response.data && response.data.code === 1) {
        currentResumeDetail.value = response.data.data
        console.log("✅ 简历详情加载成功")
        return currentResumeDetail.value
      } else {
        throw new Error(response?.data?.msg || "获取简历详情失败")
      }
    } catch (error) {
      console.error("❌ 获取简历详情失败:", error)

      let errorMessage = "获取简历详情失败"
      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        if (status === 404) {
          errorMessage = "简历不存在"
        } else if (status === 401) {
          errorMessage = "认证失败，请重新登录"
        } else if (status === 500) {
          errorMessage = "服务器内部错误"
        } else {
          errorMessage = data?.msg || `请求失败 (${status})`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      ElMessage.error(errorMessage)
      return null
    } finally {
      detailLoading.value = false
    }
  }

  // 删除简历
  const deleteResume = async (personalId) => {
    try {
      console.log("🚀 删除简历:", personalId)

      const response = await resumeApi.deleteResumeAPI(personalId)
      console.log("📥 删除简历响应:", response)

      if (response && response.data && response.data.code === 1) {
        console.log("✅ 简历删除成功")
        ElMessage.success("简历删除成功")

        // 重新加载当前页数据
        await fetchResumeList("admin", currentPage.value, pageSize.value)

        return true
      } else {
        throw new Error(response?.data?.msg || "删除简历失败")
      }
    } catch (error) {
      console.error("❌ 删除简历失败:", error)

      let errorMessage = "删除简历失败"
      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        if (status === 404) {
          errorMessage = "简历不存在"
        } else if (status === 401) {
          errorMessage = "认证失败，请重新登录"
        } else if (status === 500) {
          errorMessage = "服务器内部错误"
        } else {
          errorMessage = data?.msg || `请求失败 (${status})`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      ElMessage.error(errorMessage)
      return false
    }
  }

  // 切换页码
  const changePage = async (page) => {
    if (page < 1 || page > totalPage.value) return
    await fetchResumeList("admin", page, pageSize.value)
  }

  // 切换页面大小
  const changePageSize = async (size) => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一页
    await fetchResumeList("admin", 1, size)
  }

  // 刷新列表
  const refreshList = async () => {
    await fetchResumeList("admin", currentPage.value, pageSize.value)
  }

  // 重置状态
  const resetState = () => {
    resumeList.value = []
    currentPage.value = 1
    pageSize.value = 10
    totalCount.value = 0
    totalPage.value = 0
    currentResumeDetail.value = null
  }

  return {
    // 状态
    resumeList,
    loading,
    currentPage,
    pageSize,
    totalCount,
    totalPage,
    currentResumeDetail,
    detailLoading,

    // 计算属性
    hasData,
    hasPrevPage,
    hasNextPage,

    // 方法
    fetchResumeList,
    fetchResumeDetail,
    deleteResume,
    changePage,
    changePageSize,
    refreshList,
    resetState,
  }
})
