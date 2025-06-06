import { View, Text, Button } from '@tarojs/components'
import React from 'react'
import { useEffect, useState } from 'react'
import {
  AtCard,
  AtIcon,
  AtMessage,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtInput,
} from 'taro-ui'
import Taro, { useDidShow } from '@tarojs/taro'
import { getUserDevices, addDeviceToUser } from '@/service/device'
import { getLatestNews } from '@/service/news'
import './index.scss'

// 场景类型映射
const SceneTypeMap = {
  1: { name: '温湿度', icon: 'lightning' },
  2: { name: '智能灯', icon: 'alert-circle' },
  3: { name: '风扇', icon: 'refresh' },
  4: { name: '门铃', icon: 'bell' },
}

// 设备状态映射
const DeviceStatusMap = {
  0: { text: '离线', color: '#999999' },
  1: { text: '在线', color: '#52c41a' },
}

const Index: React.FC = () => {
  const [userDevices, setUserDevices] = useState<UserDeviceVO[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deviceMac, setDeviceMac] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  // 新增公告相关状态
  const [latestNews, setLatestNews] = useState<NewsVO | null>(null)
  const [newsLoading, setNewsLoading] = useState(false)

  // 检查登录状态
  const checkLoginStatus = () => {
    const token = Taro.getStorageSync('token')
    return !!token
  }

  // 获取场景整体状态（如果有任何设备离线，整个场景就是离线）
  const getSceneStatus = (devices: any[]) => {
    if (!devices || devices.length === 0) return 0
    // 如果有任何一个设备离线（状态为0），整个场景就是离线
    const hasOfflineDevice = devices.some(device => device.status === 0)
    return hasOfflineDevice ? 0 : 1
  }

  // 获取用户设备列表
  const fetchUserDevices = async () => {
    // 检查是否有token
    if (!checkLoginStatus()) {
      console.log('用户未登录，跳过获取设备列表')
      return
    }

    setLoading(true)
    try {
      console.log('开始获取用户设备列表')
      const res = await getUserDevices()
      console.log('API响应:', res)

      if (res.statusCode === 200) {
        const { code, msg, data } = res.data
        console.log('响应数据:', { code, msg, data })

        if (code === 0 && data) {
          setUserDevices(data)
          console.log('设备列表更新成功:', data)
        } else {
          console.log('获取设备失败:', msg)
          Taro.atMessage({
            message: msg || '获取设备失败',
            type: 'error',
          })
        }
      } else {
        console.log('HTTP状态码错误:', res.statusCode)
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

  // 添加设备
  const handleAddDevice = async () => {
    if (!deviceMac.trim()) {
      Taro.atMessage({
        message: '请输入设备MAC地址',
        type: 'warning',
      })
      return
    }

    setAddLoading(true)
    try {
      const res = await addDeviceToUser({
        deviceMac: deviceMac.trim(),
      })
      if (res.statusCode === 200) {
        const { code, msg } = res.data
        if (code === 0) {
          Taro.atMessage({
            message: '设备添加成功',
            type: 'success',
          })
          setShowAddModal(false)
          setDeviceMac('')
          // 重新获取设备列表
          fetchUserDevices()
        } else {
          Taro.atMessage({
            message: msg || '设备添加失败',
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
      console.error('添加设备失败:', error)
      Taro.atMessage({
        message: '添加设备失败，请稍后重试',
        type: 'error',
      })
    } finally {
      setAddLoading(false)
    }
  }

  // 新增获取最新公告的函数
  const fetchLatestNews = async () => {
    setNewsLoading(true)
    try {
      const res = await getLatestNews()
      if (res.statusCode === 200) {
        const { code, data } = res.data
        if (code === 0 && data && data.length > 0) {
          // 获取最新的公告（第一条）
          setLatestNews(data[0])
        } else {
          setLatestNews(null)
        }
      }
    } catch (error) {
      console.error('获取公告失败:', error)
      // 静默失败，不显示错误提示
    } finally {
      setNewsLoading(false)
    }
  }

  // 组件挂载时检查登录状态并获取公告
  useEffect(() => {
    const token = checkLoginStatus()
    setHasToken(token)

    // 获取最新公告（无论是否登录都显示）
    fetchLatestNews()

    if (token) {
      setTimeout(() => {
        fetchUserDevices()
      }, 100)
    }
  }, [])

  // 页面显示时刷新数据
  useDidShow(() => {
    const token = checkLoginStatus()
    setHasToken(token)

    // 刷新公告
    fetchLatestNews()

    if (token && !hasToken) {
      setTimeout(() => {
        fetchUserDevices()
      }, 100)
    }
  })

  return (
    <View className="index">
      <AtMessage />

      {/* 头部标题和添加按钮 */}
      <View className="header">
        <Text className="title">我的设备</Text>
        <View className="add-btn" onClick={() => setShowAddModal(true)}>
          <AtIcon value="add" size="24" color="#007aff" />
        </View>
      </View>

      {/* 系统公告 - 修改为动态获取 */}
      <View className="notice">
        <Text className="notice-icon">【公告】</Text>
        {newsLoading ? (
          <Text className="notice-text">加载中...</Text>
        ) : latestNews ? (
          <Text className="notice-text">{latestNews.title}</Text>
        ) : (
          <Text className="notice-text">暂无公告</Text>
        )}
      </View>

      {/* 用户设备列表 - 场景卡片显示 */}
      <View className="device-list">
        {!hasToken ? (
          <View className="empty">
            <Text>请先登录后查看设备</Text>
          </View>
        ) : loading ? (
          <View className="loading">加载中...</View>
        ) : userDevices.length === 0 ? (
          <View className="empty">
            <Text>暂无设备，点击右上角+号添加设备</Text>
          </View>
        ) : (
          <View className="scene-grid">
            {userDevices.map(userDevice => {
              const sceneStatus = getSceneStatus(userDevice.devices)
              return (
                <View key={userDevice.id} className="scene-card">
                  {/* 场景标题 */}
                  <View className="scene-title">
                    <Text className="title-text">
                      {SceneTypeMap[userDevice.type]?.name || '未知场景'}
                    </Text>
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

                  {/* 右箭头 */}
                  <View className="arrow">
                    <AtIcon value="chevron-right" size="16" color="#ccc" />
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>

      {/* 添加设备弹窗 */}
      <AtModal isOpened={showAddModal} onClose={() => setShowAddModal(false)}>
        <AtModalHeader>添加设备</AtModalHeader>
        <AtModalContent>
          <View className="add-device-form">
            <AtInput
              name="deviceMac"
              title="设备MAC"
              type="text"
              placeholder="请输入设备MAC地址"
              value={deviceMac}
              onChange={value => setDeviceMac(value as string)}
            />
          </View>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={() => setShowAddModal(false)}>取消</Button>
          <Button type="primary" onClick={handleAddDevice} loading={addLoading}>
            添加
          </Button>
        </AtModalAction>
      </AtModal>
    </View>
  )
}

export default Index
