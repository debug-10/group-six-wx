// 1. 修改导入语句，添加Input组件
import { View, Text, Image, Slider, Input } from '@tarojs/components'
import React, { useEffect, useState } from 'react'
import { AtIcon, AtMessage } from 'taro-ui'
import Taro, { useRouter } from '@tarojs/taro'
// 导入夜灯控制相关函数
import {
  getNightLightStatus,
  turnNightLightOn,
  turnNightLightOff,
  setNightLightColor,
  setNightLightAutoMode,
  setNightLightAlwaysOnMode,
  setNightLightTimer,
} from '@/service/device'
import './index.scss'

// 预定义颜色
const COLORS = [
  { name: '暖白', r: 255, g: 255, b: 255 },
  { name: '红色', r: 255, g: 0, b: 0 },
  { name: '绿色', r: 0, g: 255, b: 0 },
  { name: '蓝色', r: 0, g: 0, b: 255 },
  { name: '黄色', r: 255, g: 255, b: 0 },
  { name: '紫色', r: 255, g: 0, b: 255 },
  { name: '青色', r: 0, g: 255, b: 255 },
  { name: '橙色', r: 255, g: 165, b: 0 },
]

// 定时选项（分钟）
const TIMER_OPTIONS = [0, 30, 60]

const LightControl: React.FC = () => {
  const [deviceId, setDeviceId] = useState<number | null>(null)
  const [status, setStatus] = useState<number>(0) // 0: 离线, 1: 在线
  const [power, setPower] = useState<boolean>(false) // false: 关, true: 开
  const [autoMode, setAutoMode] = useState<boolean>(false)
  const [alwaysOnMode, setAlwaysOnMode] = useState<boolean>(false)
  const [selectedColor, setSelectedColor] = useState<number>(0) // 默认暖白色
  const [selectedTimer, setSelectedTimer] = useState<number>(0) // 默认不定时
  const [loading, setLoading] = useState<boolean>(false)
  const [customRed, setCustomRed] = useState<number>(255)
  const [customGreen, setCustomGreen] = useState<number>(255)
  const [customBlue, setCustomBlue] = useState<number>(255)
  // 2. 添加自定义定时状态变量
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>('')
  const [showColorModal, setShowColorModal] = useState<boolean>(false)
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false)

  const router = useRouter()

  // 初始化设备ID
  useEffect(() => {
    const { id } = router.params
    if (id) {
      setDeviceId(Number(id))
      // 获取夜灯状态
      fetchLightStatus(Number(id))
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

  // 获取夜灯状态
  const fetchLightStatus = async (id: number) => {
    try {
      const res = await getNightLightStatus(id)

      if (res.statusCode === 200) {
        const { code, data } = res.data
        if (code === 0 && data) {
          // 设置设备状态
          setStatus(data === '开启' ? 1 : 0)
          setPower(data === '开启')
        } else {
          Taro.showToast({
            title: '获取设备状态失败',
            icon: 'none',
          })
        }
      }
    } catch (error) {
      console.error('获取夜灯状态失败:', error)
      Taro.showToast({
        title: '获取设备状态失败',
        icon: 'none',
      })
    }
  }

  // 控制夜灯 - 开灯
  const handleTurnOn = async () => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await turnNightLightOn()

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setPower(true)
          Taro.showToast({
            title: '已开灯',
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
      console.error('控制夜灯失败:', error)
      Taro.showToast({
        title: '控制夜灯失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 控制夜灯 - 关灯
  const handleTurnOff = async () => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await turnNightLightOff()

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setPower(false)
          Taro.showToast({
            title: '已关灯',
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
      console.error('控制夜灯失败:', error)
      Taro.showToast({
        title: '控制夜灯失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 设置颜色
  const handleSetColor = async (index: number) => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    const color = COLORS[index]
    setLoading(true)
    try {
      const res = await setNightLightColor(color.r, color.g, color.b)

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setSelectedColor(index)
          setPower(true) // 设置颜色时自动开灯
          Taro.showToast({
            title: `已设置为${color.name}`,
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
      console.error('设置颜色失败:', error)
      Taro.showToast({
        title: '设置颜色失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 设置自动模式
  const handleSetAutoMode = async (auto: boolean) => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await setNightLightAutoMode(auto)

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setAutoMode(auto)
          if (auto) {
            setAlwaysOnMode(false) // 自动模式和常亮模式互斥
          }
          Taro.showToast({
            title: auto ? '已开启自动模式' : '已关闭自动模式',
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
      console.error('设置自动模式失败:', error)
      Taro.showToast({
        title: '设置自动模式失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 设置常亮模式
  const handleSetAlwaysOnMode = async (alwaysOn: boolean) => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await setNightLightAlwaysOnMode(alwaysOn)

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setAlwaysOnMode(alwaysOn)
          if (alwaysOn) {
            setAutoMode(false) // 自动模式和常亮模式互斥
          }
          Taro.showToast({
            title: alwaysOn ? '已开启常亮模式' : '已关闭常亮模式',
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
      console.error('设置常亮模式失败:', error)
      Taro.showToast({
        title: '设置常亮模式失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
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
      const res = await setNightLightTimer(minutes)

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

  // 获取灯泡图片类名
  const getLightImageUrl = () => {
    if (!power) {
      return 'https://img.icons8.com/ios/452/light-off.png'
    }

    // 不再根据RGB值判断颜色，只显示开灯状态
    return 'https://img.icons8.com/ios/452/light-on.png'
  }

  // 处理颜色变化
  const handleColorChange = (color: string) => {
    // 将十六进制颜色转换为RGB
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    setCustomRed(r)
    setCustomGreen(g)
    setCustomBlue(b)
  }

  // 应用自定义颜色
  const applyCustomColor = async () => {
    if (status === 0) {
      Taro.showToast({
        title: '设备离线，无法控制',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      const res = await setNightLightColor(customRed, customGreen, customBlue)

      if (res.statusCode === 200) {
        const { code } = res.data
        if (code === 0) {
          setPower(true) // 设置颜色时自动开灯
          Taro.showToast({
            title: `已设置自定义颜色`,
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
      console.error('设置颜色失败:', error)
      Taro.showToast({
        title: '设置颜色失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 添加应用自定义时间的函数
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
      const res = await setNightLightTimer(minutes)

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
    <View className="light-control">
      <AtMessage />

      {/* 头部标题和状态 */}
      <View className="header">
        <Text className="title">夜灯控制</Text>
        <View className="status">
          <Text className={`status-dot status-${status}`} />
          <Text className="status-text">{status === 1 ? '在线' : '离线'}</Text>
        </View>
      </View>

      {/* 灯泡图片 */}
      <Image className="light-image" src={getLightImageUrl()} />

      {/* 控制面板 */}
      <View className="control-panel">
        <Text className="panel-title">控制面板</Text>

        {/* 开关按钮 */}
        <View className="button-group">
          <View className={`control-button on ${power ? 'active' : ''}`} onClick={handleTurnOn}>
            <AtIcon
              value="lightning-bolt"
              size="24"
              color={power ? '#fff' : '#1890ff'}
              className="button-icon"
            />
            <Text className="button-text">开灯</Text>
          </View>

          <View className={`control-button off ${!power ? 'active' : ''}`} onClick={handleTurnOff}>
            <AtIcon
              value="close"
              size="24"
              color={!power ? '#fff' : '#666'}
              className="button-icon"
            />
            <Text className="button-text">关灯</Text>
          </View>
        </View>

        {/* 模式控制 */}
        <View className="mode-group">
          <View
            className={`mode-button auto ${autoMode ? 'active' : ''}`}
            onClick={() => handleSetAutoMode(!autoMode)}
          >
            <AtIcon
              value="eye"
              size="24"
              color={autoMode ? '#fff' : '#2f54eb'}
              className="button-icon"
            />
            <Text className="button-text">自动模式</Text>
          </View>

          <View
            className={`mode-button always-on ${alwaysOnMode ? 'active' : ''}`}
            onClick={() => handleSetAlwaysOnMode(!alwaysOnMode)}
          >
            <AtIcon
              value="clock"
              size="24"
              color={alwaysOnMode ? '#fff' : '#fa8c16'}
              className="button-icon"
            />
            <Text className="button-text">常亮模式</Text>
          </View>
        </View>

        {/* 颜色控制 */}
        <View className="color-panel">
          <Text className="color-title">颜色控制</Text>
          <View className="color-summary">
            <View
              className="color-preview"
              style={{
                backgroundColor: `rgb(${customRed}, ${customGreen}, ${customBlue})`,
              }}
            />
            <View className="edit-color-btn" onClick={() => setShowColorModal(true)}>
              <AtIcon value="edit" size="18" color="#1890ff" />
              <Text>修改颜色</Text>
            </View>
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
      {/* 颜色控制弹窗 */}
      {showColorModal && (
        <View className="modal-overlay" onClick={() => setShowColorModal(false)}>
          <View className="modal-content" onClick={e => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">自定义颜色</Text>
              <View className="modal-close" onClick={() => setShowColorModal(false)}>
                <AtIcon value="close" size="20" color="#999" />
              </View>
            </View>

            <View className="modal-body">
              <View
                className="color-preview-large"
                style={{
                  backgroundColor: `rgb(${customRed}, ${customGreen}, ${customBlue})`,
                }}
              />

              <View className="rgb-sliders">
                <View className="slider-item">
                  <Text className="slider-label">R: {customRed}</Text>
                  <Slider
                    value={customRed}
                    min={0}
                    max={255}
                    activeColor="#ff0000"
                    blockSize={24}
                    onChange={e => setCustomRed(e.detail.value)}
                  />
                </View>

                <View className="slider-item">
                  <Text className="slider-label">G: {customGreen}</Text>
                  <Slider
                    value={customGreen}
                    min={0}
                    max={255}
                    activeColor="#00ff00"
                    blockSize={24}
                    onChange={e => setCustomGreen(e.detail.value)}
                  />
                </View>

                <View className="slider-item">
                  <Text className="slider-label">B: {customBlue}</Text>
                  <Slider
                    value={customBlue}
                    min={0}
                    max={255}
                    activeColor="#0000ff"
                    blockSize={24}
                    onChange={e => setCustomBlue(e.detail.value)}
                  />
                </View>
              </View>
            </View>

            <View className="modal-footer">
              <View className="modal-btn cancel" onClick={() => setShowColorModal(false)}>
                取消
              </View>
              <View
                className="modal-btn confirm"
                onClick={() => {
                  applyCustomColor()
                  setShowColorModal(false)
                }}
              >
                应用
              </View>
            </View>
          </View>
        </View>
      )}

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

export default LightControl
