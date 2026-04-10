// user.js
import { javaService } from "@/utils/request"

// 登录接口（不需要Token）
export const login = (data) => {
  return javaService.post("/login", data)
}

// 注册接口（不需要Token）
export const register = (data) => {
  return javaService.post("/register", data)
}



// 获取密保问题接口（不需要Token）
export const getPassProtect = (data) => {
  return javaService.post("/getPassProtect", { username: data.username })
}

// 忘记密码接口（不需要Token）
export const forgotPassword = (data) => {
  return javaService.post("/forgotPassword", {
    username: data.username,
    passProtectAnswer: data.passProtectAnswer,
    newPassword: data.newPassword,
  })
}

// 获取用户信息接口（需要Token）
export const getUserInfo = () => {
  return javaService.get("/user/getUserInfo") // 实际后端接口
}


// 更新用户信息接口（需要Token）
export const updateUserInfo = (data) => {
  console.log("开始发送请求：" + JSON.stringify(data, null, 2))

  return javaService.post("/user/updateUserInfo", data) // 实际后端接口
}

// 🔥 修复：上传头像接口（需要Token）
export const uploadAvatar = (file) => {
  console.log("准备上传头像文件:", file)
  console.log("文件类型:", file.type)
  console.log("文件大小:", file.size)

  const formData = new FormData()
  formData.append("picture", file)

  // 调试：检查 FormData 内容
  for (const [key, value] of formData.entries()) {
    console.log("FormData 内容:", key, value)
  }

  // 🔥 关键修复：不要手动设置 Content-Type，让 axios 和浏览器自动处理
  return javaService
    .post("/user/updateUserPicture", formData)
    .then((response) => {
      console.log("头像上传成功响应:", response)
      return response
    })
    .catch((error) => {
      console.error("头像上传失败:", error)
      console.error("错误详情:", error.response?.data)
      throw error
    })
}

// 获取智能学习资源接口（需要Token）
export const getSmartLearningResources = (data) => {
  return javaService.post("/me/suggestion", {
    problem: data.interviewDefects,
  })
}

// 修改密码接口（真实实现）
export const changePassword = (data) => {
  return javaService.post("/user/updatePassword", {
    username: data.username,
    oldPassword: data.oldPassword,
    newPassword: data.newPassword,
  })
}

// 修改密保问题和答案接口（真实实现）
export const changeSecurityQuestion = (data) => {
  return javaService.post("/user/updateUserPasswordProtect", {
    username: data.username,
    password: data.accountPassword,
    passProtect: data.newQuestion,
    passProtectAnswer: data.newAnswer,
  })
}


// 获取详细报告
export const getDetailReport = (data) => {
  return javaService.post(`/report/getReport/${data.reportId}`)
}

// 获取面试信息列表接口（新增）
export const getReportList = (data) => {
  return javaService.post("/report/interviewList", {
    username: data.username,
    page: data.page || 1,
    pageSize: data.pageSize || 10,
  })
}


// 删除面试记录接口（新增）
export const deleteInterviewRecord = (data) => {
  return javaService.delete(`/report/delete/${data.interviewId}`)
}
