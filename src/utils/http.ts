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

// 基础URL配置
const BASE_URL = 'http://121.4.51.19:8080'

type Data<T> = {
  code: number
  msg: string
  data: T
}

export const http = <T>(config: RequestConfig): Promise<RequestResponse<T>> => {
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
    requestParams.header.Authorization = `Bearer ${token}`
  }

  return chain.proceed(requestParams).then(res => {
    // 处理响应
    if (res.statusCode === 401) {
      // 未授权，跳转到登录页
      Taro.navigateTo({ url: '/pages/login/index' })
      return Promise.reject(new Error('未授权'))
    }
    return res
  })
}

Taro.addInterceptor(httpInterceptor)
