import { goAIService, goService } from "@/utils/request"

export const resumeApi = {
  // 原有的AI生成简历接口
  generateResumeAPI: (data) => {
    return goAIService({
      url: "/select_of_resume/resume",
      method: "post",
      data: data,
      timeout: 60000, // 60秒超时，因为AI处理可能需要较长时间
    })
  },

  // 保存简历到 Go 后端接口
  saveResumeAPI: (data) => {
    return goService({
      url: "/resume/save",
      method: "post",
      data: data,
      timeout: 30000,
    })
  },

  // 新增：获取历史简历列表接口
  getResumeListAPI: (data) => {
    console.log("获取简历列表，参数：", JSON.stringify(data))
    return goService({
      url: "/resume/page",
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: {
        page: data.page ?? data.pageNum ?? 1,
        pageSize: data.pageSize ?? 10,
      },
      timeout: 30000,
    })
  },

  // 新增：获取简历详情接口
  getResumeDetailAPI: (personalId) => {
    console.log("获取简历详情，ID：", personalId)
    return goService({
      url: `/resume/${personalId}`,
      method: "get",
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    })
  },

  // 新增：删除简历接口
  deleteResumeAPI: (personalId) => {
    console.log("删除简历，ID：", personalId)
    return goService({
      url: `/resume/delete/${personalId}`,
      method: "delete",
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    })
  },
}
