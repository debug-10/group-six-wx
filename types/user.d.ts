// 用户信息VO
interface UserVO {
  id: number
  username?: string
  nickname: string
  mobile: string
  avatar: string
  avatarUrl?: string
  phone?: string
  gender?: number
  createTime?: string
  role?: number
  tenantId?: number
}

// 用户信息DTO
interface UserDTO {
  username?: string
  password?: string
  nickname?: string
  avatar?: string
}

// 手机号登录DTO
interface MobileLoginDTO {
  mobile: string
  code: string
}

// 手机号登录VO
interface MobileLoginVO {
  accessToken: string
  user: UserVO
}

// 账号密码登录DTO
interface AccountLoginDTO {
  username: string
  password: string
}

// 账号密码登录VO
interface AccountLoginVO {
  accessToken: string
  user: UserVO
}

// 微信登录DTO
interface WechatLoginDTO {
  code: string
}
