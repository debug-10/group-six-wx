import { http } from '@/utils/http'

// 获取天气信息
export const getWeather = (city: string) => {
  return http<any>({
    method: 'GET',
    url: `/user/weather?city=${city}`,
  })
}
