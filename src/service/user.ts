import { http, uploadFile } from '@/utils/http'

export const sendCode = (mobile: string) => {
  return http<null>({
    method: 'POST',
    url: `/user/api/auth/send/code?mobile=${mobile}`,
  })
}

// 恢复为正确的手机号登录接口路径
export const mobileLogin = (data: MobileLoginDTO) => {
  return http<MobileLoginVO>({
    method: 'POST',
    url: `/user/api/auth/mobile`, // 这个路径是正确的
    data,
  })
}

export const accountLogin = (data: AccountLoginDTO) => {
  return http<AccountLoginVO>({
    method: 'POST',
    url: `/user/api/auth/login`,
    data,
  })
}

export const getUserInfo = () => {
  return http<UserVO>({
    method: 'GET',
    url: `/user/api/user/info`,
  })
}

export const logout = () => {
  return http<null>({
    method: 'POST',
    url: `/user/api/auth/logout`,
  })
}

export const updateUser = (data: UserDTO) => {
  return http<string>({
    method: 'PUT',
    url: `/user/api/user/update`,
    data,
  })
}

// 头像上传接口 - 使用统一的工具函数
export const uploadAvatar = (filePath: string) => {
  return uploadFile<string>({
    url: '/user/api/file/upload/avatar', // 修改为专用的头像上传接口
    filePath,
    name: 'file',
  }).then(result => result.data)
}
