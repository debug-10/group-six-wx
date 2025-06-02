import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { AtCard, AtIcon, AtMessage } from 'taro-ui'
import Taro from '@tarojs/taro'
import { getDevicePage } from '@/service/device'
import './index.scss'

// 设备类型映射
const DeviceTypeMap = {
  1: { name: '智能灯', icon: 'lightning' },
  2: { name: '温湿度传感器', icon: 'analytics' },
  3: { name: '蜂鸣器', icon: 'volume-plus' },
  4: { name: '红外传感器', icon: 'eye' },
}

// 设备状态映射
const DeviceStatusMap = {
  0: { text: '离线', color: '#999999' },
  1: { text: '在线', color: '#52c41a' },
}

const Index: React.FC = () => {
  const [devices, setDevices] = useState<DeviceVO[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // 获取设备列表
  const fetchDevices = async () => {
    setLoading(true)
    try {
      const res = await getDevicePage({
        page: pagination.page,
        limit: pagination.limit,
      })

      if (res.statusCode === 200) {
        const { code, msg, data } = res.data
        if (code === 0 && data) {
          setDevices(data.records || [])
          setPagination(prev => ({
            ...prev,
            total: data.total,
          }))
        } else {
          Taro.atMessage({
            message: msg || '获取设备列表失败',
            type: 'error',
          })
        }
      } else {
        Taro.atMessage({
          message: '网络请求失败，请稍后重试',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('获取设备列表失败:', error)
      Taro.atMessage({
        message: '获取设备列表失败，请稍后重试',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [pagination.page, pagination.limit])

  return (
    <View className="index">
      <AtMessage />
      {/* 系统公告 */}
      <View className="notice">
        <Text className="notice-icon">【公告】</Text>
        <Text className="notice-text">系统将于今晚23:00-24:00维护</Text>
      </View>

      {/* 设备列表 */}
      <View className="device-list">
        {loading ? (
          <View className="loading">加载中...</View>
        ) : devices.length === 0 ? (
          <View className="empty">暂无设备</View>
        ) : (
          devices.map(device => (
            <View key={device.id} className="device-card">
              <AtCard
                title={device.name}
                className={`device-type-${device.type}`}
                extra={device.location}
              >
                <View className="device-info">
                  <View className="device-status">
                    <Text className={`status-dot status-${device.status}`} />
                    <Text className="status-text">{DeviceStatusMap[device.status].text}</Text>
                  </View>
                  <View className="device-type">
                    <AtIcon value={DeviceTypeMap[device.type].icon} size="16" />
                    <Text className="type-text">{DeviceTypeMap[device.type].name}</Text>
                  </View>
                  {device.type === 2 && (
                    <View className="device-data">
                      <Text className="data-item">温度: {device.temperature}°C</Text>
                      <Text className="data-item">湿度: {device.humidity}%</Text>
                    </View>
                  )}
                  <Text className="device-mac">MAC: {device.deviceMac}</Text>
                </View>
              </AtCard>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

export default Index
