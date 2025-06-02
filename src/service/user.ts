import { http } from '@/utils/http'
export const sendCode = (mobile: string) => {
  return http<null>({
    method: 'POST',
    url: `/api/auth/send/code?mobile=${mobile}`,
  })
}
export const mobileLogin = (data: MobileLoginDTO) => {
  return http<MobileLoginVO>({
    method: 'POST',
    url: `/api/auth/mobile`,
    data,
  })
}


// ... existing code ...
export const accountLogin = (data: AccountLoginDTO) => {
  return http<AccountLoginVO>({
    method: 'POST',
    url: `/api/auth/login`,
    data,
  })
}
// ... existing code ...
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
    url: '/api/user/update',
    data,
  })
}
