import { http } from '@/utils/http'

export const sendCode = (mobile: string) => {
  return http<null>({
    method: 'POST',
    url: `/api/auth/send/code?mobile=${mobile}`,
  })
}

// 恢复为正确的手机号登录接口路径
export const mobileLogin = (data: MobileLoginDTO) => {
  return http<MobileLoginVO>({
    method: 'POST',
    url: `/api/auth/mobile`, // 这个路径是正确的
    data,
  })
}

export const accountLogin = (data: AccountLoginDTO) => {
  return http<AccountLoginVO>({
    method: 'POST',
    url: `/api/auth/login`,
    data,
  })
}

// 新增微信登录接口
export const wechatLogin = (code: string) => {
  return http<AccountLoginVO>({
    method: 'POST',
    url: `/api/auth/wechat`,
    data: { code },
  })
}

export const getUserInfo = () => {
  return http<UserVO>({
    method: 'GET',
    url: `/api/user/info`,
  })
}

export const logout = () => {
  return http<null>({
    method: 'POST',
    url: `/api/auth/logout`,
  })
}

export const updateUser = (data: UserDTO) => {
  return http<string>({
    method: 'PUT',
    url: `/api/user/update`,
    data,
  })
}
