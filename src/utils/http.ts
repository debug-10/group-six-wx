import Taro from '@tarojs/taro'

interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

interface RequestResponse<T = any> {
  data: T
  statusCode: number
  header: Record<string, string>
  errMsg: string
}

// 基础URL配置 - 更新为你的后端网关地址
const BASE_URL = 'http://localhost:8080/user' // 开发环境
// const BASE_URL = 'http://121.4.51.19:8080' // 生产环境

type Data<T> = {
  code: number
  msg: string
  data: T
}

export const http = <T>(config: RequestConfig): Promise<RequestResponse<Data<T>>> => {
  return Taro.request({
    ...config,
    url: `${BASE_URL}${config.url}`,
    header: {
      'Content-Type': 'application/json',
      ...config.header,
    },
  })
}

// 请求拦截器
const httpInterceptor = function (chain) {
  const requestParams = chain.requestParams
  const { url } = requestParams

  // 如果不是完整的URL，添加基础URL
  if (!url.startsWith('http')) {
    requestParams.url = BASE_URL + url
  }

  // 添加通用header
  requestParams.header = {
    'Content-Type': 'application/json',
    ...requestParams.header,
  }

  // 添加token
  const token = Taro.getStorageSync('token')
  if (token) {
    requestParams.header.Authorization = token // 直接使用token，后端已经是JWT格式
  }

  return chain
    .proceed(requestParams)
    .then(res => {
      // 处理响应
      if (res.statusCode === 401) {
        // 未授权，清除token并跳转到登录页
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('user')
        Taro.navigateTo({ url: '/pages/login/index' })
        return Promise.reject(new Error('未授权'))
      }

      if (res.statusCode !== 200) {
        return Promise.reject(new Error(`请求失败: ${res.statusCode}`))
      }

      return res
    })
    .catch(error => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    })
}

Taro.addInterceptor(httpInterceptor)
