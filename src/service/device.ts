import { http } from '@/utils/http'

// 创建设备
export const createDevice = (data: DeviceCreateDTO) => {
  return http<number>({
    method: 'POST',
    url: '/share-admin-api/api/devices',
    data,
  })
}

// 分页查询设备
export const getDevicePage = (query: DeviceQuery) => {
  return http<Result<PageResult<DeviceVO>>>({
    method: 'POST',
    url: '/share-admin-api/api/devices/page',
    data: query,
    header: {
      'Content-Type': 'application/json',
    },
  })
}

// 更新设备
export const updateDevice = (data: DeviceUpdateDTO) => {
  return http<Result<string>>({
    method: 'PUT',
    url: '/share-admin-api/api/devices',
    data,
  })
}

// 导出设备
export const exportDevices = (query: DeviceQuery) => {
  return http<Blob>({
    method: 'POST',
    url: '/share-admin-api/api/devices/export',
    data: query,
    header: {
      'Content-Type': 'application/json',
      Accept: 'application/octet-stream',
    },
  })
}

// 更新设备状态
export const updateDeviceStatus = (data: DeviceStatusDTO) => {
  return http<Result<string>>({
    method: 'PUT',
    url: '/share-admin-api/api/devices/status',
    data,
  })
}

// 删除设备
export const deleteDevice = (id: number) => {
  return http<Result<string>>({
    method: 'DELETE',
    url: `/share-admin-api/api/devices/${id}`,
  })
}

export const getDevice = (deviceId: number) => {
  return http<DeviceVO>({
    method: 'GET',
    url: `/api/device/get/${deviceId}`,
  })
}

export const sendCommand = (deviceId: string, command: string) => {
  return http<string>({
    method: 'POST',
    url: `/iot/api/device/control?deviceId=${deviceId}&command=${command}`, // 修改为URL参数形式
  })
}
