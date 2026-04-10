import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { resumeApi } from "@/api/resume"
import { ElMessage } from "element-plus"

export const useResumeStore = defineStore("resume", () => {
  // 状态数据
  const resumeForm = ref({
    // 个人信息
    name: "",
    gender: "",
    age: null,
    phone: "",
    email: "",
    currentLocation: "",

    // 求职意向
    jobIntention: "",
    expectedSalary: "",
    desiredCity: "",
    availableTime: "一个月内到岗",

    // 教育背景
    educations: [
      {
        school: "",
        period: "",
        degree: "",
        major: "",
        gpa: "",
        courses: "",
      },
    ],

    // 工作经历
    experiences: [
      {
        company: "",
        period: "",
        position: "",
        department: "",
        responsibilities: "",
        achievements: "",
      },
    ],

    // 项目经验
    projects: [
      {
        name: "",
        period: "",
        role: "",
        description: "",
        responsibilities: "",
        achievements: "",
      },
    ],

    // 技能专长
    skills: "",
    languages: "",
    otherSkills: "",

    // 荣誉证书
    certificates: "",
    awards: "",

    // 自我评价
    selfEvaluation: "",

    // 兴趣爱好
    hobbies: "",
  })

  // 生成状态
  const generatedResume = ref("")
  const isAIGenerated = ref(false)
  const generating = ref(false)
  const saving = ref(false) // 新增：保存状态

  // 计算属性
  const isFormValid = computed(() => {
    return (
      resumeForm.value.name &&
      resumeForm.value.phone &&
      resumeForm.value.email &&
      resumeForm.value.jobIntention &&
      resumeForm.value.educations.some((edu) => edu.school && edu.degree && edu.major) &&
      resumeForm.value.experiences.some((exp) => exp.company && exp.position)
    )
  })

  const resumeSummary = computed(() => {
    return {
      name: resumeForm.value.name,
      jobIntention: resumeForm.value.jobIntention,
      experience: resumeForm.value.experiences.length,
      education: resumeForm.value.educations[0]?.degree || "",
      skills: resumeForm.value.skills ? resumeForm.value.skills.split("、").slice(0, 3) : [],
    }
  })

  // 数据类型转换辅助函数
  const convertToInteger = (value) => {
    if (value === null || value === undefined || value === "" || value === "无") {
      return null
    }
    const num = Number.parseInt(value, 10)
    return isNaN(num) ? null : num
  }

  const convertToString = (value) => {
    if (value === null || value === undefined) {
      return ""
    }
    return String(value).trim()
  }

  // 修改：构建保存到Java后端的数据格式 - 添加数据类型转换
  const buildSaveResumeData = () => {
    return {
      personal_info: {
        name: convertToString(resumeForm.value.name),
        gender: convertToString(resumeForm.value.gender),
        age: convertToInteger(resumeForm.value.age), // 确保age是Integer或null
        phone: convertToString(resumeForm.value.phone),
        email: convertToString(resumeForm.value.email),
        current_location: convertToString(resumeForm.value.currentLocation),
      },
      job_intention: {
        position: convertToString(resumeForm.value.jobIntention),
        expected_salary: convertToString(resumeForm.value.expectedSalary),
        desired_city: convertToString(resumeForm.value.desiredCity),
        available_time: convertToString(resumeForm.value.availableTime),
      },
      educations: resumeForm.value.educations
        .filter((edu) => edu.school || edu.major)
        .map((edu) => ({
          school: convertToString(edu.school),
          period: convertToString(edu.period),
          degree: convertToString(edu.degree),
          major: convertToString(edu.major),
          gpa: convertToString(edu.gpa),
          courses: convertToString(edu.courses),
        })),
      experiences: resumeForm.value.experiences
        .filter((exp) => exp.company || exp.position)
        .map((exp) => ({
          company: convertToString(exp.company),
          period: convertToString(exp.period),
          position: convertToString(exp.position),
          department: convertToString(exp.department),
          responsibilities: convertToString(exp.responsibilities),
          achievements: convertToString(exp.achievements),
        })),
      projects: resumeForm.value.projects
        .filter((project) => project.name)
        .map((project) => ({
          name: convertToString(project.name),
          period: convertToString(project.period),
          role: convertToString(project.role),
          description: convertToString(project.description),
          responsibilities: convertToString(project.responsibilities),
          achievements: convertToString(project.achievements),
        })),
      skills: {
        professional_skills: convertToString(resumeForm.value.skills),
        languages: convertToString(resumeForm.value.languages),
        other_skills: convertToString(resumeForm.value.otherSkills),
      },
      honors: {
        certificates: convertToString(resumeForm.value.certificates),
        awards: convertToString(resumeForm.value.awards),
      },
      self_evaluation: convertToString(resumeForm.value.selfEvaluation),
      hobbies: convertToString(resumeForm.value.hobbies),
    }
  }

  // 新增：保存简历到Java后端
  const saveResumeToBackend = async () => {
    try {
      saving.value = true

      // 检查是否已经AI生成
      if (!isAIGenerated.value) {
        ElMessage.warning("请先使用AI生成简历后再保存")
        return false
      }

      // 表单验证
      if (!isFormValid.value) {
        ElMessage.warning("请完善必填信息：姓名、电话、邮箱、求职意向、至少一条教育经历和工作经历")
        return false
      }

      // 构建保存数据
      const saveData = buildSaveResumeData()
      console.log("🚀 发送给Java后端的数据:", saveData)

      ElMessage.info("正在保存简历，请稍候...")

      // 调用Java后端API
      console.log("正在调用后端api")

      const response = await resumeApi.saveResumeAPI(saveData)
      console.log("📥 Java后端响应:", response)

      // 处理响应数据
      if (response && response.data) {
        const responseData = response.data
        console.log("📋 保存响应数据:", responseData)

        // 检查响应状态
        if (responseData.code === 1) {
          console.log("✅ 简历保存成功")
          ElMessage.success(responseData.msg || "简历保存成功！")
          return true
        } else {
          throw new Error(responseData.msg || "简历保存失败")
        }
      } else {
        throw new Error("响应数据格式错误")
      }
    } catch (error) {
      console.error("❌ 保存简历失败:", error)

      // 详细的错误处理
      let errorMessage = "保存简历失败，请重试"

      if (error.response) {
        // HTTP错误响应
        const status = error.response.status
        const data = error.response.data

        console.error("HTTP错误状态:", status)
        console.error("错误响应数据:", data)

        if (status === 400) {
          errorMessage = data?.msg || data?.message || "请求参数错误，请检查填写的信息"
        } else if (status === 401) {
          errorMessage = "认证失败，请重新登录"
        } else if (status === 404) {
          errorMessage = "接口不存在，请联系管理员"
        } else if (status === 500) {
          errorMessage = "服务器内部错误，请稍后重试"
        } else if (status === 502 || status === 503) {
          errorMessage = "服务暂时不可用，请稍后重试"
        } else {
          errorMessage = data?.msg || data?.message || `请求失败 (${status})`
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "请求超时，请稍后重试"
      } else if (error.message) {
        errorMessage = error.message
      }

      ElMessage.error(errorMessage)
      return false
    } finally {
      saving.value = false
    }
  }

  // 构建发送给后端的数据字符串
  const buildResumeDataString = () => {
    const parts = []

    // 个人信息
    if (resumeForm.value.name) parts.push(`姓名：${resumeForm.value.name}`)
    if (resumeForm.value.gender) parts.push(`性别：${resumeForm.value.gender}`)
    if (resumeForm.value.age) parts.push(`年龄：${resumeForm.value.age}岁`)
    if (resumeForm.value.phone) parts.push(`联系电话：${resumeForm.value.phone}`)
    if (resumeForm.value.email) parts.push(`电子邮箱：${resumeForm.value.email}`)
    if (resumeForm.value.currentLocation) parts.push(`现居地：${resumeForm.value.currentLocation}`)

    // 求职意向
    if (resumeForm.value.jobIntention) parts.push(`求职意向：${resumeForm.value.jobIntention}`)
    if (resumeForm.value.expectedSalary) parts.push(`期望薪资：${resumeForm.value.expectedSalary}`)
    if (resumeForm.value.desiredCity) parts.push(`意向城市：${resumeForm.value.desiredCity}`)
    if (resumeForm.value.availableTime) parts.push(`入职时间：${resumeForm.value.availableTime}`)

    // 教育背景
    resumeForm.value.educations.forEach((edu, index) => {
      if (edu.school && edu.degree && edu.major) {
        parts.push(`教育经历${index + 1}：${edu.period || ""} ${edu.school} ${edu.degree} ${edu.major}`)
        if (edu.gpa) parts.push(`专业成绩：${edu.gpa}`)
        if (edu.courses) parts.push(`主修课程：${edu.courses}`)
      }
    })

    // 工作经历
    resumeForm.value.experiences.forEach((exp, index) => {
      if (exp.company && exp.position) {
        parts.push(`工作经历${index + 1}：${exp.period || ""} ${exp.company} ${exp.position}`)
        if (exp.department) parts.push(`部门：${exp.department}`)
        if (exp.responsibilities) parts.push(`工作内容：${exp.responsibilities}`)
        if (exp.achievements) parts.push(`工作业绩：${exp.achievements}`)
      }
    })

    // 项目经验
    resumeForm.value.projects.forEach((project, index) => {
      if (project.name) {
        parts.push(`项目经验${index + 1}：${project.period || ""} ${project.name}`)
        if (project.role) parts.push(`担任角色：${project.role}`)
        if (project.description) parts.push(`项目描述：${project.description}`)
        if (project.responsibilities) parts.push(`项目职责：${project.responsibilities}`)
        if (project.achievements) parts.push(`项目成果：${project.achievements}`)
      }
    })

    // 技能专长
    if (resumeForm.value.skills) parts.push(`专业技能：${resumeForm.value.skills}`)
    if (resumeForm.value.languages) parts.push(`语言能力：${resumeForm.value.languages}`)
    if (resumeForm.value.otherSkills) parts.push(`其他技能：${resumeForm.value.otherSkills}`)

    // 荣誉证书
    if (resumeForm.value.certificates) parts.push(`证书：${resumeForm.value.certificates}`)
    if (resumeForm.value.awards) parts.push(`获奖情况：${resumeForm.value.awards}`)

    // 自我评价
    if (resumeForm.value.selfEvaluation) parts.push(`自我评价：${resumeForm.value.selfEvaluation}`)

    // 兴趣爱好
    if (resumeForm.value.hobbies) parts.push(`兴趣爱好：${resumeForm.value.hobbies}`)

    return parts.join("，")
  }

  // 使用AI返回的数据更新表单
  const updateFormWithAIData = (aiData) => {
    try {
      console.log("AI返回的数据:", aiData)

      // 更新个人信息
      if (aiData.personal_info) {
        const personal = aiData.personal_info
        if (personal.name) resumeForm.value.name = personal.name
        if (personal.gender) resumeForm.value.gender = personal.gender
        if (personal.age) resumeForm.value.age = convertToInteger(personal.age) // 确保age是数字或null
        if (personal.phone) resumeForm.value.phone = personal.phone
        if (personal.email) resumeForm.value.email = personal.email
        if (personal.current_location) resumeForm.value.currentLocation = personal.current_location
      }

      // 更新求职意向
      if (aiData.job_intention) {
        const job = aiData.job_intention
        if (job.position) resumeForm.value.jobIntention = job.position
        if (job.expected_salary) resumeForm.value.expectedSalary = job.expected_salary
        if (job.desired_city) resumeForm.value.desiredCity = job.desired_city
        if (job.available_time) resumeForm.value.availableTime = job.available_time
      }

      // 更新教育背景
      if (aiData.educations && Array.isArray(aiData.educations) && aiData.educations.length > 0) {
        resumeForm.value.educations = aiData.educations.map((edu) => ({
          school: edu.school || "",
          period: edu.period || "",
          degree: edu.degree || "",
          major: edu.major || "",
          gpa: edu.gpa || "",
          courses: edu.courses || "",
        }))
      }

      // 更新工作经历
      if (aiData.experiences && Array.isArray(aiData.experiences) && aiData.experiences.length > 0) {
        resumeForm.value.experiences = aiData.experiences.map((exp) => ({
          company: exp.company || "",
          period: exp.period || "",
          position: exp.position || "",
          department: exp.department || "",
          responsibilities: exp.responsibilities || "",
          achievements: exp.achievements || "",
        }))
      }

      // 更新项目经验
      if (aiData.projects && Array.isArray(aiData.projects) && aiData.projects.length > 0) {
        resumeForm.value.projects = aiData.projects.map((project) => ({
          name: project.name || "",
          period: project.period || "",
          role: project.role || "",
          description: project.description || "",
          responsibilities: project.responsibilities || "",
          achievements: project.achievements || "",
        }))
      }

      // 更新技能专长
      if (aiData.skills) {
        if (aiData.skills.professional_skills) resumeForm.value.skills = aiData.skills.professional_skills
        if (aiData.skills.languages) resumeForm.value.languages = aiData.skills.languages
        if (aiData.skills.other_skills) resumeForm.value.otherSkills = aiData.skills.other_skills
      }

      // 更新荣誉证书
      if (aiData.honors) {
        if (aiData.honors.certificates) resumeForm.value.certificates = aiData.honors.certificates
        if (aiData.honors.awards) resumeForm.value.awards = aiData.honors.awards
      }

      // 更新自我评价
      if (aiData.self_evaluation) {
        resumeForm.value.selfEvaluation = aiData.self_evaluation
      }

      // 更新兴趣爱好
      if (aiData.hobbies) {
        resumeForm.value.hobbies = aiData.hobbies
      }

      console.log("表单数据更新完成:", resumeForm.value)
    } catch (error) {
      console.error("更新表单数据失败:", error)
      ElMessage.warning("AI数据解析部分失败，请检查生成结果")
    }
  }

  // Actions - AI生成简历的核心方法
  const generateResumeWithAI = async () => {
    try {
      generating.value = true

      // 表单验证
      if (!isFormValid.value) {
        ElMessage.warning("请完善必填信息：姓名、电话、邮箱、求职意向、至少一条教育经历和工作经历")
        return false
      }

      // 构建数据字符串
      const resumeDataString = buildResumeDataString()
      console.log("🚀 发送给AI的数据字符串:", resumeDataString)

      // 构建请求参数
      const requestData = {
        resume_data: resumeDataString,
        job_intention: resumeForm.value.jobIntention,
      }
      console.log("📤 请求参数:", requestData)

      ElMessage.info("正在使用AI优化您的简历，请稍候...")

      // 🔥 调用后端API
      const response = await resumeApi.generateResumeAPI(requestData)
      console.log("📥 API完整响应:", response)

      // 处理响应数据 - 根据您提供的响应格式
      if (response && response.data) {
        const responseData = response.data
        console.log("📋 响应数据:", responseData)

        // 检查响应状态
        if (responseData.statusCode === 1) {
          console.log("✅ AI生成成功，开始更新表单数据")

          // 更新表单数据
          updateFormWithAIData(responseData.response)

          isAIGenerated.value = true
          ElMessage.success("AI简历生成成功！")
          return true
        } else {
          throw new Error("AI生成失败")
        }
      } else {
        throw new Error("响应数据格式错误")
      }
    } catch (error) {
      console.error("❌ AI生成简历失败:", error)

      // 详细的错误处理
      let errorMessage = "AI生成简历失败，请重试"

      if (error.response) {
        // HTTP错误响应
        const status = error.response.status
        const data = error.response.data

        console.error("HTTP错误状态:", status)
        console.error("错误响应数据:", data)

        if (status === 400) {
          errorMessage = data?.message || "请求参数错误，请检查填写的信息"
        } else if (status === 401) {
          errorMessage = "认证失败，请重新登录"
        } else if (status === 404) {
          errorMessage = "接口不存在，请联系管理员"
        } else if (status === 500) {
          errorMessage = "服务器内部错误，请稍后重试"
        } else if (status === 502 || status === 503) {
          errorMessage = "服务暂时不可用，请稍后重试"
        } else {
          errorMessage = data?.message || `请求失败 (${status})`
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "请求超时，AI处理时间较长，请稍后重试"
      } else if (error.message) {
        errorMessage = error.message
      }

      ElMessage.error(errorMessage)
      return false
    } finally {
      generating.value = false
    }
  }

  // 其他方法保持不变
  const addEducation = () => {
    resumeForm.value.educations.push({
      school: "",
      period: "",
      degree: "",
      major: "",
      gpa: "",
      courses: "",
    })
  }

  const removeEducation = (index) => {
    if (resumeForm.value.educations.length > 1) {
      resumeForm.value.educations.splice(index, 1)
    }
  }

  const addExperience = () => {
    resumeForm.value.experiences.push({
      company: "",
      period: "",
      position: "",
      department: "",
      responsibilities: "",
      achievements: "",
    })
  }

  const removeExperience = (index) => {
    if (resumeForm.value.experiences.length > 1) {
      resumeForm.value.experiences.splice(index, 1)
    }
  }

  const addProject = () => {
    resumeForm.value.projects.push({
      name: "",
      period: "",
      role: "",
      description: "",
      responsibilities: "",
      achievements: "",
    })
  }

  const removeProject = (index) => {
    if (resumeForm.value.projects.length > 1) {
      resumeForm.value.projects.splice(index, 1)
    }
  }

  const resetForm = () => {
    resumeForm.value = {
      name: "",
      gender: "",
      age: null,
      phone: "",
      email: "",
      currentLocation: "",
      jobIntention: "",
      expectedSalary: "",
      desiredCity: "",
      availableTime: "一个月内到岗",
      educations: [
        {
          school: "",
          period: "",
          degree: "",
          major: "",
          gpa: "",
          courses: "",
        },
      ],
      experiences: [
        {
          company: "",
          period: "",
          position: "",
          department: "",
          responsibilities: "",
          achievements: "",
        },
      ],
      projects: [
        {
          name: "",
          period: "",
          role: "",
          description: "",
          responsibilities: "",
          achievements: "",
        },
      ],
      skills: "",
      languages: "",
      otherSkills: "",
      certificates: "",
      awards: "",
      selfEvaluation: "",
      hobbies: "",
    }
    generatedResume.value = ""
    isAIGenerated.value = false
  }

  // 保存到本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem("resumeForm", JSON.stringify(resumeForm.value))
      localStorage.setItem("isAIGenerated", JSON.stringify(isAIGenerated.value))
      ElMessage.success("简历数据已保存到本地")
    } catch (error) {
      console.error("保存失败:", error)
      ElMessage.error("保存失败")
    }
  }

  // 从本地存储加载
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem("resumeForm")
      const savedAIStatus = localStorage.getItem("isAIGenerated")

      if (saved) {
        resumeForm.value = JSON.parse(saved)
        if (savedAIStatus) {
          isAIGenerated.value = JSON.parse(savedAIStatus)
        }
        ElMessage.success("已加载本地保存的简历数据")
        return true
      }
      return false
    } catch (error) {
      console.error("加载失败:", error)
      ElMessage.error("加载本地数据失败")
      return false
    }
  }

  return {
    // 状态
    resumeForm,
    generatedResume,
    isAIGenerated,
    generating,
    saving, // 新增：导出保存状态

    // 计算属性
    isFormValid,
    resumeSummary,

    // 方法
    buildResumeDataString,
    buildSaveResumeData, // 新增：导出构建保存数据方法
    updateFormWithAIData,
    generateResumeWithAI,
    saveResumeToBackend, // 新增：导出保存简历方法
    addEducation,
    removeEducation,
    addExperience,
    removeExperience,
    addProject,
    removeProject,
    resetForm,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
})
