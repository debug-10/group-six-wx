// ... existing code ...

// 微信登录DTO
interface WechatLoginDTO {
  code: string
}

// 微信登录VO
interface WechatLoginVO {
  id: number
  accessToken: string
  openid?: string
  unionid?: string
}

// ... existing code ...
