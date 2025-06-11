import { http } from '@/utils/http'

// 告警信息接口
export interface AlarmInfo {
  id: number
  deviceId: string
  type: string
  level: number
  message: string
  status: number
  createTime: string
  updateTime: string
}

// 告警查询参数
export interface AlarmQueryParams {
  page?: number
  limit?: number
  status?: number
  level?: number
}

// 根据设备ID查询告警
export const getAlarmsByDeviceId = (deviceId: string) => {
  return http({
    method: 'GET',
    url: `/share-admin-api/alarms/${deviceId}`,
  })
}
// 更新告警状态
export const updateAlarmStatus = (alarmId: number, status: number) => {
  return http({
    method: 'PUT',
    url: `/share-admin-api/alarms/${alarmId}`,
    data: {
      status,
    },
  })
}
