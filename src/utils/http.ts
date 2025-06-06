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
const BASE_URL = 'http://10.20.74.2:8080' // 开发环境
const BASE_URL = 'http://localhost:8080' // 开发环境
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

// 文件上传接口
export const uploadFile = <T>(config: {
  url: string
  filePath: string
  name?: string
  formData?: Record<string, any>
  header?: Record<string, string>
}): Promise<Data<T>> => {
  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: `${BASE_URL}${config.url}`,
      filePath: config.filePath,
      name: config.name || 'file',
      formData: config.formData,
      header: {
        Authorization: Taro.getStorageSync('token'),
        ...config.header,
      },
      success: res => {
        try {
          const result = JSON.parse(res.data)
          if (result.code === 0) {
            resolve(result)
          } else {
            reject(new Error(result.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      },
      fail: error => {
        reject(error)
      },
    })
  })
}
