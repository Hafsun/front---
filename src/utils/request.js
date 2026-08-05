import axios from "axios"
import router from "@/router" // 确保导入了路由实例

// 后端服务配置
const serviceConfig = {
  go: {
    baseURL: process.env.VUE_APP_GO_API_URL || "http://localhost:18082/api/",
    timeout: 60000,
  },
  goAI: {
    // 阶段 6 保留旧 Python REST 的无 /api URL 契约。
    baseURL: process.env.VUE_APP_GO_AI_URL || "http://localhost:18082/",
    timeout: 240000,
  },
}

// WebSocket服务配置
const websocketConfig = {
  baseURL: process.env.VUE_APP_WEBSOCKET_URL || "ws://localhost:18082/ws/chat",
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
}

// 不需要 Token 的接口使用精确路径，避免相似路径绕过认证。
const noTokenRoutes = new Set([
  "/login",
  "/register",
  "/getPassProtect",
  "/forgotPassword",
  "/select_of_resume/resume",
  "/interview/report",
  "/me/suggestion",
])

function normalizeRequestPath(url) {
  let path = String(url || "").split(/[?#]/)[0]
  for (const config of Object.values(serviceConfig)) {
    if (path.startsWith(config.baseURL)) {
      path = path.slice(config.baseURL.length)
      break
    }
  }
  return `/${path.replace(/^\/+/, "")}`
}

// 检查是否需要添加Token
function shouldAddToken(url) {
  return !noTokenRoutes.has(normalizeRequestPath(url))
}

// 检查token是否有效
function isTokenValid(token) {
  if (!token) return false

  try {
    // 如果是JWT token，可以检查是否过期
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch (error) {
    // 如果不是JWT或解析失败，简单检查是否存在
    return token.length > 0
  }
}

// 处理认证失败的函数
function handleAuthFailure() {
  console.log("认证失败，清除用户数据并跳转到登录页")

  // 清除本地存储
  localStorage.removeItem("token")
  localStorage.removeItem("userInfo")

  import("@/stores/user")
    .then(({ useUserStore }) => {
      const userStore = useUserStore()
      userStore.logout()
    })
    .catch((error) => {
      console.error("Failed to load user store:", error)
    })

  // 跳转到登录页
  const currentRoute = router.currentRoute.value.path
  if (currentRoute !== "/login") {
    router.push("/login")
  }
}

// 创建axios实例的工厂函数
function createService(type) {
  const config = serviceConfig[type] || serviceConfig.go
  const service = axios.create(config)

  // 请求拦截器
  service.interceptors.request.use(
    (config) => {
      const token = window.localStorage.getItem("token")

      console.log("=== 请求拦截器调试信息 ===")
      console.log("请求URL:", config.url)
      console.log("请求方法:", config.method)
      console.log("Token存在:", !!token)

      // 检查是否需要token的接口
      const needsToken = shouldAddToken(config.url)
      console.log("是否需要token:", needsToken)

      if (needsToken) {
        if (!token) {
          console.error("❌ 需要token的接口但未找到token")
          handleAuthFailure()
          return Promise.reject(new Error("未找到认证令牌"))
        }

        if (!isTokenValid(token)) {
          console.error("❌ token已过期")
          handleAuthFailure()
          return Promise.reject(new Error("认证令牌已过期"))
        }

        // 添加Authorization头
        config.headers["Authorization"] = `${token}`
        console.log("✅ 已添加Authorization头")
      } else {
        console.log("ℹ️ 该接口不需要token")
      }

      // 🔥 修复：对于 FormData，不要设置 Content-Type，让浏览器自动设置
      if (config.data instanceof FormData) {
        console.log("🔧 检测到 FormData，删除 Content-Type 让浏览器自动设置")
        delete config.headers["Content-Type"]
      }

      console.log("=== 请求拦截器调试结束 ===")
      return config
    },
    (error) => {
      console.error("请求拦截器错误:", error)
      return Promise.reject(error)
    },
  )

  // 响应拦截器
  service.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // 处理网络错误
      if (!error.response) {
        console.error("网络错误:", error.message)
        return Promise.reject(error)
      }

      const { status, data } = error.response

      // 处理认证相关错误
      if (status === 401) {
        console.log("收到401响应，处理认证失败")
        handleAuthFailure()
        return Promise.reject(new Error("认证失败，请重新登录"))
      }

      // 处理其他HTTP错误
      if (status === 403) {
        console.error("权限不足")
        return Promise.reject(new Error("权限不足"))
      }

      if (status === 415) {
        console.error("不支持的媒体类型")
        return Promise.reject(new Error("不支持的媒体类型，请检查文件格式"))
      }

      if (status === 500) {
        console.error("服务器内部错误")
        return Promise.reject(new Error("服务器内部错误"))
      }

      // 返回后端的错误信息
      const errorMessage = data?.msg || data?.message || `请求失败 (${status})`
      return Promise.reject(new Error(errorMessage))
    },
  )

  return service
}

// WebSocket连接管理类
class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.reconnectTimer = null
    this.messageHandlers = new Map()
    this.isConnecting = false
    this.isManualClose = false
    this.initializationMessage = null
  }

  // 连接WebSocket
  connect(onMessage, onError, onClose) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log("WebSocket已连接或正在连接中")
      return Promise.resolve()
    }

    this.isConnecting = true
    this.isManualClose = false

    const token = window.localStorage.getItem("token")
    if (!isTokenValid(token)) {
      this.isConnecting = false
      handleAuthFailure()
      return Promise.reject(new Error("WebSocket 认证令牌无效"))
    }
    const wsUrl = new URL(websocketConfig.baseURL)
    wsUrl.searchParams.set("access_token", token)
    console.log("正在连接WebSocket:", websocketConfig.baseURL)

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl.toString())

        this.ws.onopen = () => {
          console.log("WebSocket连接成功")
          const reconnected = this.reconnectAttempts > 0
          this.isConnecting = false
          this.reconnectAttempts = 0
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
          }
          if (reconnected && this.initializationMessage) {
            this.ws.send(this.initializationMessage)
          }
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("收到WebSocket事件:", data?.type || "unknown")
            if (data && typeof data === "object") {
              if (onMessage) onMessage(data)
            } else {
              console.error("收到无效的WebSocket消息格式:", data)
            }
          } catch (error) {
            console.error("解析WebSocket消息失败:", error)
            if (onMessage) {
              onMessage({
                type: "error",
                data: { message: "消息格式错误", raw: event.data },
              })
            }
          }
        }

        this.ws.onerror = (error) => {
          console.error("WebSocket错误:", error)
          this.isConnecting = false
          if (onError) onError(error)
          reject(error)
        }

        this.ws.onclose = (event) => {
          console.log("WebSocket连接关闭:", event.code, event.reason)
          this.isConnecting = false

          if (onClose) onClose(event)

          // 如果不是手动关闭且重连次数未达到上限，则自动重连
          if (!this.isManualClose && this.reconnectAttempts < websocketConfig.maxReconnectAttempts) {
            this.scheduleReconnect(onMessage, onError, onClose)
          }
        }
      } catch (error) {
        console.error("创建WebSocket连接失败:", error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // 安排重连
  scheduleReconnect(onMessage, onError, onClose) {
    this.reconnectAttempts++
    console.log(`准备第${this.reconnectAttempts}次重连...`)

    this.reconnectTimer = setTimeout(() => {
      this.connect(onMessage, onError, onClose).catch((error) => {
        console.error(`第${this.reconnectAttempts}次重连失败:`, error)
      })
    }, websocketConfig.reconnectInterval)
  }

  // 发送消息
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === "string" ? message : JSON.stringify(message)
      if (message && typeof message === "object" && message.action === "init_system") {
        this.initializationMessage = messageStr
      }
      const messageBytes = new Blob([messageStr]).size
      console.log("发送WebSocket消息，字节数:", messageBytes)
      this.ws.send(messageStr)
      return true
    } else {
      console.error("WebSocket未连接，无法发送消息")
      return false
    }
  }

  // 关闭连接
  close() {
    this.isManualClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.reconnectAttempts = 0
    this.initializationMessage = null
    console.log("WebSocket连接已手动关闭")
  }

  // 获取连接状态
  getReadyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED
  }

  // 检查是否已连接
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// HTTP 与 WebSocket 统一由 Go 后端承载。
const goService = createService("go")
const goAIService = createService("goAI")

const websocketManager = new WebSocketManager()

export { goService, goAIService, websocketManager, websocketConfig }
