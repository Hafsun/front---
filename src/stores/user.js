import { defineStore } from "pinia"
import {
  login as apiLogin,
  getUserInfo,
  updateUserInfo as apiUpdateUserInfo,
  uploadAvatar as apiUploadAvatar,
} from "@/api/user"

export const useUserStore = defineStore("user", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    userInfo: (() => {
      try {
        const storedInfo = localStorage.getItem("userInfo")
        return storedInfo ? JSON.parse(storedInfo) : null
      } catch (e) {
        console.error("Failed to parse userInfo from localStorage:", e)
        localStorage.removeItem("userInfo")
        return null
      }
    })(),
    lastFetchTime: 0, // 添加最后获取时间
    fetchPromise: null, // 添加请求Promise，避免重复请求
  }),

  getters: {
    isAuthenticated: (state) => {
      const hasToken = !!state.token
      console.log("getter检查认证状态:", hasToken)
      return hasToken
    },
    // 保持你原有的参数名称
    welcomeInfo: (state) => ({
      username: state.userInfo?.username || "访客",
      name: state.userInfo?.name || "666",
      sex: state.userInfo?.sex || "男",
      email: state.userInfo?.email || "N/A",
      phone: state.userInfo?.phone || "110",
      major: state.userInfo?.major || "计算机",
      pictureUrl: state.userInfo?.pictureUrl || "/placeholder.svg?height=50&width=50",
      interviewCount: state.userInfo?.interviewCount || 0,
      comprehensiveScore: state.userInfo?.comprehensiveScore || 0
    }),
  },

  actions: {
    // 登录
    async login({ username, password }) {
      const { data } = await apiLogin({
        username: username.trim(),
        password: password.trim(),
      })

      if (data.code !== 1) throw new Error(data.msg || "登录失败")

      this.token = data.data.jwt
      this.userInfo = data.data
      this.lastFetchTime = Date.now() // 更新获取时间
      
      localStorage.setItem("token", this.token)
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo))

      console.log("登录成功，设置的用户信息:", this.userInfo)
      return this.userInfo
    },

    // 登出
    async logout() {
      this.token = ""
      this.userInfo = null
      this.lastFetchTime = 0
      this.fetchPromise = null
      localStorage.removeItem("token")
      localStorage.removeItem("userInfo")
    },

    // 获取用户基本信息（带缓存和防重复请求）
    async fetchUserInfo(forceRefresh = false) {
      if (!this.token) {
        console.warn("No token available, cannot fetch user info.")
        this.userInfo = null
        localStorage.removeItem("userInfo")
        return
      }

      // 检查是否需要刷新（5分钟内不重复请求，除非强制刷新）
      const now = Date.now()
      const cacheTime = 5 * 60 * 1000 // 5分钟缓存
      if (!forceRefresh && this.userInfo && (now - this.lastFetchTime) < cacheTime) {
        console.log("用户信息仍在缓存期内，跳过请求")
        return this.userInfo
      }

      // 如果已有请求在进行中，返回该Promise
      if (this.fetchPromise) {
        console.log("用户信息请求已在进行中，等待结果")
        return this.fetchPromise
      }

      // 创建新的请求Promise
      this.fetchPromise = this._doFetchUserInfo()
      
      try {
        const result = await this.fetchPromise
        return result
      } finally {
        this.fetchPromise = null
      }
    },

    // 实际执行获取用户信息的方法
    async _doFetchUserInfo() {
      try {
        console.log("开始获取用户信息...")
        const { data } = await getUserInfo()
        console.log("data:" + JSON.stringify(data, null, 2));
        
        if (data.code === 1) {
          
          this.userInfo = data.data
          this.lastFetchTime = Date.now()
          localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
          console.log("用户基本信息已更新:", this.userInfo)
          return this.userInfo
        } else {
          console.error("获取用户信息失败:", data.msg)
          throw new Error(data.msg || "获取用户信息失败")
        }
      } catch (error) {
        console.error("获取用户信息时发生错误:", error)
        
        // 如果是401错误，清除用户信息
        if (error.response?.status === 401) {
          this.userInfo = null
          localStorage.removeItem("userInfo")
        }
        
        throw error
      }
    },

    // 强制刷新用户信息
    async refreshUserInfo() {
      return this.fetchUserInfo(true)
    },

    // 更新用户基本信息
    async updateBasicInfo(updatedFields) {
      if (!this.userInfo) {
        console.error("User info not loaded, cannot update.")
        throw new Error("用户信息未加载，无法更新。")
      }
      try {

        console.log("开始调用updateBasicInfo" + JSON.stringify(updatedFields, null, 2));
        
        const { data } = await apiUpdateUserInfo(updatedFields)

        console.log("updateBasicInfo:data" + JSON.stringify(data, null, 2));
        

        if (data.code === 1) {
          console.log("code为1");
          
          this.userInfo = { ...this.userInfo, ...updatedFields }
          this.lastFetchTime = Date.now()
          localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
          return true
        } else {
          throw new Error(data.msg || "更新失败")
        }
      } catch (error) {
        console.error("更新用户信息失败:", error)
        throw error
      }
    },

    // 上传用户头像
    async uploadUserAvatar(file) {
      if (!this.userInfo || !this.userInfo.username) {
        console.error("User info or username not available, cannot upload avatar.")
        throw new Error("用户信息不可用，无法上传头像。")
      }
      try {
        console.log("开始调用上传图片接口");
        
        const { data } = await apiUploadAvatar(file)
        if (data.code === 1 && data.data) {
          this.userInfo.pictureUrl = data.data
          this.lastFetchTime = Date.now()
          localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
          return true
        } else {
          throw new Error(data.msg || "头像上传失败")
        }
      } catch (error) {
        console.error("上传头像失败:", error)
        throw error
      }
    },
  },
})

export default useUserStore
