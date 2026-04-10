import axios from "axios"
import router from "@/router" // 确保导入了路由实例

// 后端服务配置
const serviceConfig = {
  java: {
    //baseURL: "https://47.96.177.180:18444/api/",
    baseURL: "http://localhost:18080/api/",
    timeout: 6000000,
  },
  python: {
    //baseURL: "https://47.96.177.180:18443/",
    baseURL: "http://localhost:18081/",
    timeout: 720000000,
  },
}

// // 服务器环境的WebSocket配置
// const websocketConfig = {
//   baseURL: process.env.VUE_APP_WEBSOCKET_URL || "wss://47.96.177.180:18445/ws/chat",
//   reconnectInterval: 3000,
//   maxReconnectAttempts: 5,
// }


// // 后端服务配置
// const serviceConfig = {
//   java: {
//     baseURL: "http://localhost:18080/api/",
//     timeout: 60000,
//   },
//   python: {
//     baseURL: "http://127.0.0.1:5000/",
//     timeout: 720000,
//   },
// }

// WebSocket服务配置
const websocketConfig = {
  baseURL: process.env.VUE_APP_WEBSOCKET_URL || "ws://localhost:18083/ws/chat",
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
}

// 不需要Token的接口白名单（支持正则表达式）
const noTokenRoutes = [/login/, /register/, /forgot-password/, /reset-password/]

// 检查是否需要添加Token
function shouldAddToken(url) {
  // 移除baseURL，只检查相对路径
  const relativeUrl = url.replace(new RegExp(`^(${serviceConfig.java.baseURL}|${serviceConfig.python.baseURL})`), "")
  return !noTokenRoutes.some((pattern) => pattern.test(relativeUrl))
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
  const config = serviceConfig[type] || serviceConfig.java
  const service = axios.create(config)

  // 请求拦截器
  service.interceptors.request.use(
    (config) => {
      const token = window.localStorage.getItem("token")

      console.log("=== 请求拦截器调试信息 ===")
      console.log("请求URL:", config.url)
      console.log("请求方法:", config.method)
      console.log("Token存在:", !!token)
      console.log("Token内容:", token ? `${token.substring(0, 30)}...` : "null")

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

      console.log("最终请求头:", config.headers)
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
  }

  // 连接WebSocket
  connect(onMessage, onError, onClose) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log("WebSocket已连接或正在连接中")
      return Promise.resolve()
    }

    this.isConnecting = true
    this.isManualClose = false

    const wsUrl = `${websocketConfig.baseURL}`
    console.log("正在连接WebSocket:", wsUrl)

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log("WebSocket连接成功")
          this.isConnecting = false
          this.reconnectAttempts = 0
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
          }
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("收到WebSocket消息:", data)
            if (data && typeof data === "object") {
              if (onMessage) onMessage(data)
            } else {
              console.error("收到无效的WebSocket消息格式:", data)
            }
          } catch (error) {
            console.error("解析WebSocket消息失败:", error, "原始数据:", event.data)
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
  scheduleReconnect(sessionId, onMessage, onError, onClose) {
    this.reconnectAttempts++
    console.log(`准备第${this.reconnectAttempts}次重连...`)

    this.reconnectTimer = setTimeout(() => {
      this.connect(sessionId, onMessage, onError, onClose).catch((error) => {
        console.error(`第${this.reconnectAttempts}次重连失败:`, error)
      })
    }, websocketConfig.reconnectInterval)
  }

  // 发送消息
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === "string" ? message : JSON.stringify(message)
      console.log("发送WebSocket消息:", messageStr)
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

// 创建不同后端的axios实例
const javaService = createService("java")
const pythonService = createService("python")

const websocketManager = new WebSocketManager()

export { javaService, pythonService, websocketManager, websocketConfig }
