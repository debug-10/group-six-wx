import { View, Text, Button } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import { getUserDevices, unbindUserDevice } from '@/service/device'
import './index.scss'

// 场景类型映射
const SceneTypeMap = {
  1: { name: '智能夜灯', icon: 'lightning' },
  2: { name: '智能火警', icon: 'alert-circle' },
  3: { name: '智能风扇', icon: 'refresh' },
  4: { name: '智能门铃', icon: 'bell' },
}

// 设备状态映射
const DeviceStatusMap = {
  0: { text: '离线', color: '#999999' },
  1: { text: '在线', color: '#52c41a' },
}

export default function Unbind() {
  const [userDevices, setUserDevices] = useState<UserDeviceVO[]>([])
  const [loading, setLoading] = useState(false)
  const [unbindLoading, setUnbindLoading] = useState(false)

  // 获取场景整体状态（如果有任何设备离线，整个场景就是离线）
  const getSceneStatus = (devices: any[]) => {
    if (!devices || devices.length === 0) return 0
    // 如果有任何一个设备离线（状态为0），整个场景就是离线
    const hasOfflineDevice = devices.some(device => device.status === 0)
    return hasOfflineDevice ? 0 : 1
  }

  // 获取用户设备列表
  const fetchUserDevices = async () => {
    setLoading(true)
    try {
      const res = await getUserDevices()
      if (res.statusCode === 200) {
        const { code, data } = res.data
        if (code === 0 && data) {
          setUserDevices(data)
        } else {
          Taro.showToast({
            title: '获取设备失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('获取设备列表失败:', error)
      Taro.showToast({
        title: '获取设备列表失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 解绑设备
  const handleUnbind = async (type: number) => {
    Taro.showModal({
      title: '提示',
      content: '确定要解绑此设备吗？',
      success: async res => {
        if (res.confirm) {
          setUnbindLoading(true)
          try {
            const response = await unbindUserDevice({ type })
            if (response.statusCode === 200) {
              const { code, msg } = response.data
              if (code === 0) {
                Taro.showToast({
                  title: '解绑成功',
                  icon: 'success',
                })
                // 重新获取设备列表
                fetchUserDevices()
              } else {
                Taro.showToast({
                  title: msg || '解绑失败',
                  icon: 'none',
                })
              }
            }
          } catch (error) {
            console.error('解绑设备失败:', error)
            Taro.showToast({
              title: '解绑设备失败',
              icon: 'none',
            })
          } finally {
            setUnbindLoading(false)
          }
        }
      },
    })
  }

  useEffect(() => {
    fetchUserDevices()
  }, [])

  return (
    <View className="unbind">
      <View className="header">
        <Text className="title">解绑设备</Text>
        <Text className="subtitle">您可以解绑不再使用的设备场景</Text>
      </View>

      {/* 用户设备列表 - 场景卡片显示 */}
      <View className="device-list">
        {loading ? (
          <View className="loading">加载中...</View>
        ) : userDevices.length === 0 ? (
          <View className="empty">
            <Text>暂无设备</Text>
          </View>
        ) : (
          <View className="scene-grid">
            {userDevices.map(userDevice => {
              const sceneStatus = getSceneStatus(userDevice.devices)
              return (
                <View key={userDevice.id} className="scene-card">
                  {/* 场景标题和解绑按钮并排 */}
                  <View className="scene-header">
                    <Text className="title-text">
                      {SceneTypeMap[userDevice.type]?.name || '未知场景'}
                    </Text>
                    <Button
                      className="unbind-btn"
                      onClick={() => handleUnbind(userDevice.type)}
                      loading={unbindLoading}
                    >
                      解绑
                    </Button>
                  </View>

                  {/* 场景状态 */}
                  <View className="scene-status">
                    <View className="status-info">
                      <Text className={`status-dot status-${sceneStatus}`} />
                      <Text className="status-text">
                        {DeviceStatusMap[sceneStatus]?.text || '未知'}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}
