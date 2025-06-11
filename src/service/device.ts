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

// 解绑用户设备
export const unbindUserDevice = (data: { type: number }) => {
  return http<Result<string>>({
    method: 'POST',
    url: '/user/api/device/unbind',
    data,
  })
}

// 风扇控制 - 开启普通模式
export const startFanNormalMode = () => {
  return http<Result<any>>({
    method: 'POST',
    url: '/iot/efan/normal',
  })
}

// 风扇控制 - 开启强劲模式
export const startFanPowerfulMode = () => {
  return http<Result<any>>({
    method: 'POST',
    url: '/iot/efan/powerful',
  })
}

export const setFanTimer = (minutes: number) => {
  return http<Result<any>>({
    method: 'POST',
    url: `/iot/efan/timer/${minutes}`,
  })
}

// 风扇控制 - 关闭设备
export const turnFanOff = () => {
  return http<Result<any>>({
    method: 'POST',
    url: '/iot/efan/off',
  })
}

// 风扇控制 - 查询风扇状态
export const getFanStatus = (deviceId: number) => {
  return http<Result<string>>({
    method: 'GET',
    url: `/iot/efan/status/${deviceId}`,
  })
}

// 夜灯控制 - 开灯
export const turnNightLightOn = () => {
  return http<Result<any>>({
    method: 'POST',
    url: '/iot/nightlight/on',
  })
}

// 夜灯控制 - 关灯
export const turnNightLightOff = () => {
  return http<Result<any>>({
    method: 'POST',
    url: '/iot/nightlight/off',
  })
}

// 夜灯控制 - 设置颜色
export const setNightLightColor = (r: number, g: number, b: number) => {
  return http<Result<any>>({
    method: 'POST',
    url: `/iot/nightlight/color?r=${r}&g=${g}&b=${b}`,
  })
}

// 夜灯控制 - 设置自动模式
export const setNightLightAutoMode = (auto: boolean) => {
  return http<Result<any>>({
    method: 'POST',
    url: `/iot/nightlight/auto?auto=${auto}`,
  })
}

// 夜灯控制 - 设置常亮模式
export const setNightLightAlwaysOnMode = (alwaysOn: boolean) => {
  return http<Result<any>>({
    method: 'POST',
    url: `/iot/nightlight/always-on?alwaysOn=${alwaysOn}`,
  })
}

// 夜灯控制 - 设置定时
export const setNightLightTimer = (minutes: number) => {
  return http<Result<any>>({
    method: 'POST',
    url: `/iot/nightlight/timer?minutes=${minutes}`,
  })
}

// 夜灯控制 - 查询夜灯状态
export const getNightLightStatus = (deviceId: number) => {
  return http<Result<string>>({
    method: 'GET',
    url: `/iot/nightlight/status/${deviceId}`,
  })
}
