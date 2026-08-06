import { goAIService, goService } from "@/utils/request"

export const interviewApi = {
  /**
   * 结束面试接口 - 改进版本，支持更完整的数据格式
   */
  endInterview: (data, options = {}) => {
    console.log("生成报告，发送数据给后端：", JSON.stringify(data, null, 2))

    if (!data.interviewRecords || !Array.isArray(data.interviewRecords)) {
      console.error("面试记录数据格式错误:", data)
      throw new Error("面试记录数据格式错误")
    }

    if (!data.majorDirection) {
      console.warn("缺少大方向数据:", data.majorDirection)
    }

    if (!data.minorDirection || !Array.isArray(data.minorDirection)) {
      console.warn("小方向数据格式异常:", data.minorDirection)
    }

    if (!data.position) {
      console.warn("缺少岗位数据:", data.position)
    }

    const validatedRecords = data.interviewRecords.map((record, index) => {
      const validatedRecord = {
        roundIndex: record.roundIndex || index + 1,
        currentQuestionData: record.currentQuestionData || "",
        userAnswerText: record.userAnswerText || "",
        avgFacialData: record.avgFacialData || {
          angry: "0%",
          disgusted: "0%",
          fearful: "0%",
          happy: "0%",
          sad: "0%",
          surprised: "0%",
          neutral: "100%",
        },
        questionAnswerDuration: record.questionAnswerDuration || 0,
      }

      // 验证每条记录的必要字段
      if (!validatedRecord.currentQuestionData) {
        console.warn(`第${index + 1}轮面试缺少问题数据`)
      }
      if (!validatedRecord.userAnswerText) {
        console.warn(`第${index + 1}轮面试缺少回答数据`)
      }

      return validatedRecord
    })

    const requestData = {
      interviewRecords: validatedRecords,
      majorDirection: data.majorDirection,
      minorDirection: data.minorDirection, // 保持数组格式
      position: data.position,
    }

    console.log("验证后的请求数据:", JSON.stringify(requestData, null, 2))
    console.log("请求数据统计:")
    console.log("- 面试轮次数:", validatedRecords.length)
    console.log("- 大方向:", requestData.majorDirection)
    console.log("- 小方向数量:", requestData.minorDirection?.length || 0)
    console.log("- 岗位:", requestData.position)

    return goAIService({
      url: "/interview/report",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: requestData,
      timeout: options.timeout || 240000, // 增加默认超时时间到240秒
      signal: options.signal,
    }).then((response) => {
      console.log("后端原始返回数据:", response)

      // 检查是否有嵌套的data.response结构
      if (response?.data?.response) {
        console.log("检测到data.response结构，提取数据")
        return {
          ...response,
          data: response.data.response,
        }
      }

      return response
    })
  },

  /**
   * 保存报告到后端接口
   */
  saveReport: (reportPayload, options = {}) => {
    console.log("正在发送报告到后端:", JSON.stringify(reportPayload, null, 2))
    const payload = { ...reportPayload }
    delete payload.username
    return goService({
      url: "/report/save",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: payload,
      timeout: options.timeout || 15000, // 默认15秒超时
      signal: options.signal,
    })
  },

  /**
   * 获取面试报告列表接口
   */
  getInterviewList: (params, options = {}) => {
    console.log("获取面试报告列表，参数：", JSON.stringify(params))
    return goService({
      url: "/report/interviewList",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: {
        page: params.page ?? params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10,
      },
      timeout: options.timeout || 10000,
      signal: options.signal,
    })
  },

  /**
   * 删除面试报告接口
   */
  deleteReport: (reportId, options = {}) => {
    console.log("删除面试报告，ID：", reportId)
    return goService({
      url: `/report/delete/${reportId}`,
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      timeout: options.timeout || 10000,
      signal: options.signal,
    })
  },

  /**
   * 获取详细报告接口
   */
  getDetailReport: (reportId, options = {}) => {
    console.log("获取详细报告，ID：", reportId)
    return goService({
      url: `/report/getReport/${reportId}`,
      method: "GET",
      headers: { "Content-Type": "application/json" },
      timeout: options.timeout || 10000,
      signal: options.signal,
    })
  },
}
