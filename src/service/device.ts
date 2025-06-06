import { http } from '@/utils/http'

// 获取用户设备列表
export const getUserDevices = () => {
  return http<Result<UserDeviceVO[]>>({
    method: 'GET',
    url: '/user/api/device/list',
  })
}

// 添加设备到用户
export const addDeviceToUser = (data: { deviceMac: string }) => {
  return http<Result<string>>({
    method: 'POST',
    url: '/user/api/device/add',
    data,
  })
}
