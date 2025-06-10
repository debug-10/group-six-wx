import { View, Text, Image, Input } from '@tarojs/components'
import React, { useEffect, useState } from 'react'
import { AtIcon, AtMessage } from 'taro-ui'
import Taro, { useRouter } from '@tarojs/taro'
// 导入风扇控制相关函数
import {
  getFanStatus,
  startFanNormalMode,
  startFanPowerfulMode,
  turnFanOff,
  setFanTimer,
} from '@/service/device'
import './index.scss'

// 风扇状态枚举
enum FanMode {
  OFF = 'off',
  NORMAL = 'normal',
  POWERFUL = 'powerful',
}

// 定时选项（分钟）
const TIMER_OPTIONS = [0, 30, 60]

const FanControl: React.FC = () => {
  const [deviceId, setDeviceId] = useState<number | null>(null)
  const [status, setStatus] = useState<number>(0) // 0: 离线, 1: 在线
  const [currentMode, setCurrentMode] = useState<FanMode>(FanMode.OFF)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedTimer, setSelectedTimer] = useState<number>(0) // 默认不定时
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>('')
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false)

  const router = useRouter()

  // 初始化设备ID
  useEffect(() => {
    const { id } = router.params
    if (id) {
      setDeviceId(Number(id))
      // 获取风扇状态
      fetchFanStatus(Number(id))
    } else {
      Taro.showToast({
        title: '设备ID不存在',
        icon: 'none',
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }, [router.params])

  // 获取风扇状态
  const fetchFanStatus = async (id: number) => {
    try {
      const res = await getFanStatus(id)

      if (res.statusCode === 200) {
        const { code, data } = res.data
        if (code === 0 && data) {
          // 设置设备状态
          setStatus(data === '在线' ? 1 : 0)
        } else {
          Taro.showToast({
            title: '获取设备状态失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('获取风扇状态失败:', error)
      Taro.showToast({
        title: '获取设备状态失败',
        icon: 'none',
      })
    }
  }

  // 控制风扇 - 普通模式
  const startNormalMode = async () => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await startFanNormalMode()

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setCurrentMode(FanMode.NORMAL)
          Taro.showToast({
            title: '已开启普通模式',
            icon: 'success',
          })
        } else {
          Taro.showToast({
            title: '操作失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('控制风扇失败:', error)
      Taro.showToast({
        title: '控制风扇失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 控制风扇 - 强劲模式
  const startPowerfulMode = async () => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await startFanPowerfulMode()

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setCurrentMode(FanMode.POWERFUL)
          Taro.showToast({
            title: '已开启强劲模式',
            icon: 'success',
          })
        } else {
          Taro.showToast({
            title: '操作失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('控制风扇失败:', error)
      Taro.showToast({
        title: '控制风扇失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 控制风扇 - 关闭
  const turnOff = async () => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await turnFanOff()

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setCurrentMode(FanMode.OFF)
          Taro.showToast({
            title: '已关闭风扇',
            icon: 'success',
          })
        } else {
          Taro.showToast({
            title: '操作失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('控制风扇失败:', error)
      Taro.showToast({
        title: '控制风扇失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 获取风扇图片类名
  const getFanImageClass = () => {
    if (currentMode === FanMode.NORMAL) {
      return 'fan-image rotating'
    } else if (currentMode === FanMode.POWERFUL) {
      return 'fan-image rotating-fast'
    } else {
      return 'fan-image'
    }
  }

  // 设置定时
  const handleSetTimer = async (minutes: number) => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await setFanTimer(minutes)

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setSelectedTimer(TIMER_OPTIONS.indexOf(minutes))
          Taro.showToast({
            title: minutes > 0 ? `已设置${minutes}分钟定时` : '已取消定时',
            icon: 'success',
          })
        } else {
          Taro.showToast({
            title: '操作失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('设置定时失败:', error)
      Taro.showToast({
        title: '设置定时失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 应用自定义时间
  const applyCustomTimer = async () => {
    if (!deviceId) {
      Taro.showToast({
        title: '设备ID不存在',
        icon: 'none',
      })
      return
    }

    if (status !== 1) {
      Taro.showToast({
        title: '设备离线',
        icon: 'none',
      })
      return
    }

    const minutes = parseInt(customTimerMinutes)
    if (isNaN(minutes) || minutes <= 0) {
      Taro.showToast({
        title: '请输入有效的分钟数',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await setFanTimer(minutes)

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setSelectedTimer(-1) // 清除预设选项的选中状态
          Taro.showToast({
            title: `已设置${minutes}分钟定时`,
            icon: 'success',
          })
        } else {
          Taro.showToast({
            title: '操作失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('设置定时失败:', error)
      Taro.showToast({
        title: '设置定时失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="fan-control">
      <AtMessage />

      {/* 头部标题和状态 */}
      <View className="header">
        <Text className="title">风扇控制</Text>
        <View className="status">
          <Text className={`status-dot status-${status}`} />
          <Text className="status-text">{status === 1 ? '在线' : '离线'}</Text>
        </View>
      </View>

      {/* 风扇图片 */}
      <Image className={getFanImageClass()} src="https://img.icons8.com/ios/452/fan.png" />

      {/* 控制面板 */}
      <View className="control-panel">
        <Text className="panel-title">控制面板</Text>
        <View className="button-group">
          <View
            className={`control-button normal ${currentMode === FanMode.NORMAL ? 'active' : ''}`}
            onClick={startNormalMode}
          >
            <AtIcon
              value="reload"
              size="24"
              color={currentMode === FanMode.NORMAL ? '#fff' : '#1890ff'}
              className="button-icon"
            />
            <Text className="button-text">普通模式</Text>
          </View>

          <View
            className={`control-button powerful ${
              currentMode === FanMode.POWERFUL ? 'active' : ''
            }`}
            onClick={startPowerfulMode}
          >
            <AtIcon
              value="lightning-bolt"
              size="24"
              color={currentMode === FanMode.POWERFUL ? '#fff' : '#ff4d4f'}
              className="button-icon"
            />
            <Text className="button-text">强劲模式</Text>
          </View>

          <View
            className={`control-button off ${currentMode === FanMode.OFF ? 'active' : ''}`}
            onClick={turnOff}
          >
            <AtIcon
              value="close"
              size="24"
              color={currentMode === FanMode.OFF ? '#fff' : '#666'}
              className="button-icon"
            />
            <Text className="button-text">关闭</Text>
          </View>
        </View>

        {/* 定时设置 */}
        <View className="timer-panel">
          <Text className="timer-title">定时设置</Text>

          {/* 预设定时选项 */}
          <View className="timer-options">
            {TIMER_OPTIONS.map((minutes, index) => (
              <View
                key={index}
                className={`timer-option ${selectedTimer === index ? 'active' : ''}`}
                onClick={() => handleSetTimer(minutes)}
              >
                {minutes === 0 ? '关闭' : `${minutes}分钟`}
              </View>
            ))}
            <View className="timer-option custom" onClick={() => setShowTimerModal(true)}>
              自定义
            </View>
          </View>
        </View>
      </View>

      {/* 自定义时间弹窗 */}
      {showTimerModal && (
        <View className="modal-overlay" onClick={() => setShowTimerModal(false)}>
          <View className="modal-content" onClick={e => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">自定义时间</Text>
              <View className="modal-close" onClick={() => setShowTimerModal(false)}>
                <AtIcon value="close" size="20" color="#999" />
              </View>
            </View>

            <View className="modal-body">
              <View className="custom-timer-input">
                <Input
                  className="timer-input"
                  type="number"
                  placeholder="请输入分钟数"
                  value={customTimerMinutes}
                  onInput={e => setCustomTimerMinutes(e.detail.value)}
                />
                <Text className="timer-unit">分钟</Text>
              </View>
            </View>

            <View className="modal-footer">
              <View className="modal-btn cancel" onClick={() => setShowTimerModal(false)}>
                取消
              </View>
              <View
                className="modal-btn confirm"
                onClick={() => {
                  applyCustomTimer()
                  setShowTimerModal(false)
                }}
              >
                应用
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default FanControl
