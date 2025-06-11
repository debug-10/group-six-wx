import React, { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { getUserDevices } from '@/service/device'
import { getAlarmsByDeviceId, updateAlarmStatus, AlarmInfo } from '@/service/alarm'
import './index.scss'

// 设备类型定义
interface DeviceVO {
  id: number
  deviceMac: string
  name: string
  type: number
  status: number
  temperature?: number
  humidity?: number
  location?: string
}

interface UserDeviceVO {
  id: number
  userId: number
  type: number
  groupName: string
  devices: DeviceVO[]
}

// 场景类型映射
const SceneTypeMap = {
  1: { name: '智能夜灯', icon: 'lightning' },
  2: { name: '智能火警', icon: 'alert-circle' },
  3: { name: '智能风扇', icon: 'refresh' },
  4: { name: '智能门铃', icon: 'bell' },
}

const Notice: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [userDeviceTypes, setUserDeviceTypes] = useState<number[]>([])
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [deviceMap, setDeviceMap] = useState<Map<string, string>>(new Map())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 自动刷新相关状态
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  // 小程序页面生命周期钩子
  useDidShow(() => {
    console.log('页面显示，启动自动刷新')
    // 延迟启动自动刷新，避免与初始加载冲突
    setTimeout(() => {
      startAutoRefresh()
    }, 3000) // 延迟3秒启动
  })

  useDidHide(() => {
    console.log('页面隐藏，停止自动刷新')
    stopAutoRefresh()
  })

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopAutoRefresh()
    }
  }, [])

  // 初始数据加载
  useEffect(() => {
    fetchUserAlarmsData()
  }, [])

  // 启动自动刷新
  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      console.log('自动刷新已在运行，跳过启动')
      return
    }

    console.log('启动自动刷新，间隔30秒')
    refreshIntervalRef.current = setInterval(() => {
      if (!isRefreshingRef.current) {
        console.log('执行自动刷新')
        refreshAlarms()
      } else {
        console.log('跳过自动刷新：正在刷新中')
      }
    }, 10000) // 修正为30秒间隔
  }

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      console.log('停止自动刷新')
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }

  // 自动刷新函数（静默刷新）
  const refreshAlarms = async () => {
    if (isRefreshingRef.current) {
      console.log('正在刷新中，跳过本次自动刷新')
      return
    }

    try {
      isRefreshingRef.current = true
      console.log('开始自动刷新告警数据')
      await fetchUserAlarmsData(false) // 静默刷新，不显示loading
      console.log('自动刷新完成')
    } catch (error) {
      console.error('自动刷新失败:', error)
    } finally {
      isRefreshingRef.current = false
    }
  }

  const fetchUserAlarmsData = async (showLoading = true) => {
    try {
      if (showLoading) {
        console.log('显示loading状态')
        setLoading(true)
      } else {
        console.log('静默刷新，不显示loading')
      }

      console.log('开始获取告警数据...')
      let debugMsg = ''
      let allAlarms: AlarmInfo[] = []
      const deviceNameMap = new Map<string, string>()

      // 1. 获取用户设备列表
      console.log('正在获取用户设备列表...')
      const deviceResponse = await getUserDevices()
      console.log('设备响应:', deviceResponse)

      debugMsg += `完整设备响应: ${JSON.stringify(deviceResponse)}\n`
      debugMsg += `设备响应数据: ${JSON.stringify(deviceResponse.data)}\n`

      const apiResponse = deviceResponse.data
      if (apiResponse.code === 0 && apiResponse.data && apiResponse.data.length > 0) {
        const userTypes: number[] = []
        const deviceIds: string[] = []

        apiResponse.data.forEach((userDevice: UserDeviceVO) => {
          if (!userTypes.includes(userDevice.type)) {
            userTypes.push(userDevice.type)
          }

          userDevice.devices.forEach(device => {
            const deviceId = String(device.id)
            if (!deviceIds.includes(deviceId)) {
              deviceIds.push(deviceId)
              deviceNameMap.set(deviceId, device.name)
            }
          })
        })

        debugMsg += `用户设备类型: ${userTypes.join(', ')}\n`
        debugMsg += `设备ID列表: ${deviceIds.join(', ')}\n`
        console.log('设备ID列表:', deviceIds)

        setUserDeviceTypes(userTypes)
        setDeviceMap(deviceNameMap)

        if (deviceIds.length > 0) {
          // 3. 为每个设备ID查询告警
          for (const deviceId of deviceIds) {
            try {
              console.log(`正在查询设备${deviceId}的告警...`)
              const alarmResponse = await getAlarmsByDeviceId(deviceId)
              console.log(`设备${deviceId}告警响应:`, alarmResponse)

              debugMsg += `设备${deviceId}告警响应: ${JSON.stringify(alarmResponse)}\n`

              const alarmApiResponse = alarmResponse.data
              if (
                alarmApiResponse.code === 200 &&
                alarmApiResponse.data &&
                alarmApiResponse.data.alarms
              ) {
                const unprocessedAlarms = alarmApiResponse.data.alarms.filter(
                  (alarm: AlarmInfo) => alarm.status === 0
                )
                allAlarms.push(...unprocessedAlarms)
                debugMsg += `设备${deviceId}未处理告警数: ${unprocessedAlarms.length}\n`
              } else {
                debugMsg += `设备${deviceId}告警响应失败: code=${alarmApiResponse?.code}, message=${alarmApiResponse?.message}\n`
              }
            } catch (error) {
              console.error(`查询设备${deviceId}告警失败:`, error)
              debugMsg += `查询设备${deviceId}告警失败: ${error.message}\n`
            }
          }

          allAlarms.sort(
            (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
          )

          debugMsg += `总告警数: ${allAlarms.length}\n`
          console.log('最终告警数据:', allAlarms)
          setAlarms(allAlarms)
        } else {
          debugMsg += '用户没有绑定设备\n'
          console.log('用户没有绑定设备')
        }
      } else {
        debugMsg += `获取用户设备列表失败: code=${apiResponse?.code}, data=${JSON.stringify(
          apiResponse?.data
        )}\n`
        console.log('获取用户设备列表失败:', apiResponse)
      }

      setDebugInfo(debugMsg)
      console.log('调试信息:', debugMsg)
      console.log('数据加载完成')
    } catch (error) {
      console.error('获取告警数据失败:', error)
      setDebugInfo(`错误: ${error.message}`)
      if (showLoading) {
        Taro.showToast({
          title: '获取告警数据失败',
          icon: 'error',
        })
      }
    } finally {
      if (showLoading) {
        console.log('设置loading为false')
        setLoading(false)
      }
    }
  }

  // 手动刷新功能
  const handleManualRefresh = async () => {
    if (isRefreshingRef.current) {
      console.log('正在刷新中，跳过手动刷新')
      return
    }

    setIsRefreshing(true)
    isRefreshingRef.current = true
    try {
      console.log('开始手动刷新')
      await fetchUserAlarmsData(false)
      Taro.showToast({
        title: '刷新完成',
        icon: 'success',
      })
    } catch (error) {
      Taro.showToast({
        title: '刷新失败',
        icon: 'error',
      })
    } finally {
      setIsRefreshing(false)
      isRefreshingRef.current = false
    }
  }

  const handleMarkAsProcessed = async (alarmId: number) => {
    try {
      await updateAlarmStatus(alarmId, 1) // 1表示已处理

      // 更新本地状态
      setAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== alarmId))

      Taro.showToast({
        title: '告警已标记为已处理',
        icon: 'success',
      })
    } catch (error) {
      console.error('更新告警状态失败:', error)
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
      })
    }
  }

  if (loading) {
    return (
      <View className="notice-container">
        <View className="loading">加载中...</View>
      </View>
    )
  }

  return (
    <View className="notice-container">
      <View className="notice-header">
        <Text className="notice-title">设备告警通知</Text>
        <View className="refresh-section">
          <View
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleManualRefresh}
          ></View>
        </View>
      </View>

      {alarms.length === 0 ? (
        <View className="no-alarms">
          <Text>暂无告警信息</Text>
        </View>
      ) : (
        <View className="alarm-list">
          {alarms.map(alarm => (
            <View key={alarm.id} className={`alarm-item level-${alarm.level}`}>
              <View className="alarm-header">
                <View className="alarm-info">
                  <Text className="device-name">
                    {deviceMap.get(alarm.deviceId) || `设备${alarm.deviceId}`}
                  </Text>
                  <Text className="alarm-time">{alarm.createTime}</Text>
                </View>
                <View
                  className="mark-processed-btn"
                  onClick={() => handleMarkAsProcessed(alarm.id)}
                >
                  <Text>✓</Text>
                </View>
              </View>

              <View className="alarm-content">
                <Text className="alarm-message">{alarm.message}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default Notice
